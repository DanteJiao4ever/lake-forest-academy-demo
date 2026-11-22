import { useEffect, useId, useRef, useState } from "react";

type Anchor = { start: number; exact: string; prefix: string; suffix: string };
type Note = { anchor: Anchor; question: string };

function makeAnchor(text: string, start: number, end: number): Anchor {
  return { start, exact: text.slice(start, end), prefix: text.slice(Math.max(0, start - 25), start), suffix: text.slice(end, end + 25) };
}

export function AnnotatedPassage({ sentences }: { sentences: readonly string[] }) {
  const text = sentences.join(" ");
  const id = useId();
  const paragraph = useRef<HTMLParagraphElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<Anchor | null>(null);
  const [draft, setDraft] = useState<Anchor | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [question, setQuestion] = useState("");
  const [focus, setFocus] = useState<Anchor | null>(null);

  useEffect(() => {
    function capture() {
      const selected = window.getSelection();
      const node = paragraph.current;
      if (!node || !selected?.rangeCount || selected.isCollapsed) return;
      const range = selected.getRangeAt(0);
      if (!node.contains(range.startContainer) || !node.contains(range.endContainer)) return;
      const exact = range.toString();
      if (!exact.trim()) return;
      const before = range.cloneRange();
      before.selectNodeContents(node);
      before.setEnd(range.startContainer, range.startOffset);
      const start = before.toString().length;
      setSelection(makeAnchor(text, start, start + exact.length));
    }
    document.addEventListener("selectionchange", capture);
    return () => document.removeEventListener("selectionchange", capture);
  }, [text]);

  useEffect(() => { if (draft) editor.current?.focus(); }, [draft]);

  const anchors = notes.map((note) => note.anchor);
  if (draft) anchors.push(draft);
  if (focus) anchors.push(focus);
  const boundaries = [...new Set([0, text.length, ...anchors.flatMap((a) => [a.start, a.start + a.exact.length])])].sort((a, b) => a - b);
  function returnToQuote(anchor: Anchor) {
    setFocus(anchor);
    requestAnimationFrame(() => {
      const target = paragraph.current?.querySelector<HTMLElement>(`[data-start="${anchor.start}"]`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "nearest" });
    });
  }
  function startQuestion(anchor: Anchor | null) {
    if (!anchor) return;
    setDraft(anchor);
    setQuestion("");
  }

  return (
    <div className="lfa-sample-passage">
      <div className="lfa-sample-text">
        <h3>Read the case</h3>
        <p className="lfa-prose" ref={paragraph}>{boundaries.slice(0, -1).map((start, i) => {
          const part = text.slice(start, boundaries[i + 1]);
          const marked = anchors.some((a) => start >= a.start && start < a.start + a.exact.length);
          return marked ? <mark tabIndex={-1} data-start={start} key={start}>{part}</mark> : <span key={start}>{part}</span>;
        })}</p>
        <div className="lfa-sample-tools">
          <label htmlFor={id + "-line"}>Select text or choose a sentence to annotate.</label>
          <select id={id + "-line"} defaultValue="" onChange={(e) => {
            const sentence = e.target.value;
            if (!sentence) return;
            const start = text.indexOf(sentence);
            startQuestion(makeAnchor(text, start, start + sentence.length));
            e.target.value = "";
          }}>
            <option value="">Choose a sentence</option>
            {sentences.map((sentence, i) => <option value={sentence} key={sentence}>{i + 1}. {sentence}</option>)}
          </select>
          {selection && <button type="button" onClick={() => startQuestion(selection)}>Ask about selected text</button>}
        </div>
      </div>
      <aside className="lfa-sample-margin" aria-label="Reading notes">
        <h3>Margin notes</h3>
        {!notes.length && !draft && <p>Your questions will appear beside the passage.</p>}
        {draft && <form onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim()) return;
          setNotes([...notes, { anchor: draft, question: question.trim() }]);
          setDraft(null); setQuestion(""); setSelection(null);
        }}>
          <blockquote>{draft.exact}</blockquote>
          <label htmlFor={id + "-question"}>Your question</label>
          <textarea ref={editor} id={id + "-question"} value={question} rows={2} maxLength={600} onChange={(e) => setQuestion(e.target.value)} />
          <button disabled={!question.trim()}>Save question</button>
          <button className="lfa-sample-quiet" type="button" onClick={() => setDraft(null)}>Cancel</button>
        </form>}
        <ol aria-live="polite">{notes.map((note, i) => <li key={i}>
          <q>{note.anchor.exact}</q><p>{note.question}</p>
          <button type="button" className="lfa-sample-quiet" onClick={() => returnToQuote(note.anchor)}>Return to text</button>
        </li>)}</ol>
      </aside>
    </div>
  );
}
