import { useId, useRef, useState } from "react";
import type { ActivityProps } from "./controls";
import { Count, stringList, stringValue, toggle, useAction, words } from "./controls";
import type { Check, Excerpt, LessonCardProps, Post, Reveal } from "./types";

export function Prediction({ card, state, send, disabled }: ActivityProps & { card: Reveal }) {
  const [prediction, setPrediction] = useState(stringValue(state.answer?.prediction));
  const id = useId();
  const writing = card.mode === "predict";
  const minimum = card.minWords ?? 15;
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(writing ? { prediction } : { reveal: true });
        }}
      >
        {writing && (
          <label>
            Your prediction
            <textarea
              value={prediction}
              rows={3}
              maxLength={6000}
              disabled={disabled}
              aria-describedby={id}
              onChange={(e) => setPrediction(e.target.value)}
            />
            <Count text={prediction} minimum={minimum} id={id} />
          </label>
        )}
        {!state.completed && (
          <button disabled={disabled || (writing && words(prediction) < minimum)}>Reveal the reasoning</button>
        )}
      </form>
      {state.completed && card.teacherReasoning && (
        <div className="lc-reading-note">
          <h4>Teacher’s reasoning</h4>
          <p>{card.teacherReasoning}</p>
        </div>
      )}
    </>
  );
}

export function MicroCheck({ card, state, send, disabled }: ActivityProps & { card: Check }) {
  const name = useId();
  const [choices, setChoices] = useState(stringList(state.answer?.choices));
  const [value, setValue] = useState(stringValue(state.answer?.value));
  const numeric = card.mode === "numeric";
  const ready = numeric ? value.trim() !== "" && Number.isFinite(Number(value)) : choices.length > 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send(numeric ? { value } : { choices });
      }}
    >
      {numeric ? (
        <label>
          Your answer{card.unit && ` (${card.unit})`}
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
          />
        </label>
      ) : (
        <fieldset disabled={disabled}>
          <legend>{card.mode === "multiple" ? "Select all that apply" : "Choose one answer"}</legend>
          {card.options?.map((option) => (
            <label className="lc-choice" key={option.id}>
              <input
                name={name}
                type={card.mode === "multiple" ? "checkbox" : "radio"}
                value={option.id}
                checked={choices.includes(option.id)}
                onChange={() =>
                  setChoices((old) => (card.mode === "multiple" ? toggle(old, option.id) : [option.id]))
                }
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      )}
      {!state.completed && <button disabled={disabled || !ready}>Check answer</button>}
    </form>
  );
}

type DiscussionProps = Pick<LessonCardProps, "reply" | "peerReplies" | "readOnly">;
function PeerView({
  peer,
  reply,
  peerReplies,
  readOnly,
}: DiscussionProps & { peer: { id: string; label: string; text: string } }) {
  const [text, setText] = useState("");
  const action = useAction();
  const replies = peerReplies?.filter((r) => r.peerId === peer.id) ?? [];
  return (
    <section className="lc-peer">
      <h5>{peer.label}</h5>
      <p>{peer.text}</p>
      {replies.length > 0 && (
        <ul aria-label={`Replies to ${peer.label}`}>
          {replies.map((r) => (
            <li key={r.id}>
              <strong>{r.authorName || "Classmate"}</strong> {r.text}
            </li>
          ))}
        </ul>
      )}
      {reply && !readOnly && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (text.trim() && (await action.run(() => reply(peer.id, text.trim())))) setText("");
          }}
        >
          <label>
            Reply to {peer.label}
            <textarea
              rows={2}
              maxLength={2000}
              disabled={action.busy}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button disabled={!text.trim() || action.busy}>{action.busy ? "Sending…" : "Send reply"}</button>
          {action.error && <p role="alert">{action.error}</p>}
        </form>
      )}
    </section>
  );
}

export function PostFirst({
  card,
  state,
  send,
  disabled,
  ...discussion
}: ActivityProps & DiscussionProps & { card: Post }) {
  const [text, setText] = useState(stringValue(state.answer?.text));
  const [pasteWords, setPasteWords] = useState(Number(state.answer?.pasteWords) || 0);
  const origin = useRef("");
  const id = useId();
  // A per-mount marker distinguishes a student's copy/cut within this answer from external material.
  function markCopy(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const selected = el.value.slice(el.selectionStart, el.selectionEnd);
    if (!selected) return;
    if (!origin.current) origin.current = crypto.randomUUID();
    e.clipboardData.setData("text/plain", selected);
    e.clipboardData.setData("application/x-lfa-draft", origin.current);
    e.preventDefault();
    if (e.type === "cut") {
      const start = el.selectionStart;
      el.setRangeText("", start, el.selectionEnd, "start");
      setText(el.value);
    }
  }
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send({ text, pasteWords });
        }}
      >
        <label>
          Your response
          <textarea
            rows={4}
            maxLength={16000}
            disabled={disabled}
            value={text}
            onCopy={markCopy}
            onCut={markCopy}
            onChange={(e) => setText(e.target.value)}
            aria-describedby={id}
            onPaste={(e) => {
              if (!origin.current || e.clipboardData.getData("application/x-lfa-draft") !== origin.current) {
                const count = words(e.clipboardData.getData("text/plain"));
                if (count >= 30) setPasteWords((previous) => Math.max(previous, count));
              }
            }}
          />
          <Count id={id} text={text} minimum={card.minWords} />
        </label>
        {!state.completed && (
          <button disabled={disabled || words(text) < card.minWords}>Post to unlock discussion</button>
        )}
      </form>
      {state.completed && (
        <>
          {card.peers?.length ? (
            <section className="lc-discussion">
              <h4>Sample peer perspectives</h4>
              {card.peers.map((peer) => (
                <PeerView key={peer.id} peer={peer} {...discussion} />
              ))}
            </section>
          ) : null}
          {card.teacherModel && (
            <div className="lc-reading-note">
              <h4>Teacher’s response</h4>
              <p>{card.teacherModel}</p>
            </div>
          )}
        </>
      )}
    </>
  );
}

export function AnnotatedText({ card, state, send, disabled }: ActivityProps & { card: Excerpt }) {
  const [annotated, setAnnotated] = useState(false);
  const [open, setOpen] = useState("");
  const visited = state.visited ?? stringList(state.answer?.visited);
  const name = useId();
  const selected = card.segments.find((s) => s.id === open);
  function review(id: string) {
    setOpen(id);
    if (!disabled && !visited.includes(id)) void send({ visited: [...new Set([...visited, id])] });
  }
  return (
    <>
      <fieldset className="lc-mode">
        <legend>Reading view</legend>
        {["Original", "All annotations"].map((mode, i) => (
          <label className="lc-choice" key={mode}>
            <input
              name={name}
              type="radio"
              checked={annotated === Boolean(i)}
              onChange={() => {
                setAnnotated(Boolean(i));
                setOpen("");
              }}
            />
            {mode}
          </label>
        ))}
      </fieldset>
      {annotated ? (
        <ol className="lc-annotations">
          {card.segments.map((segment, i) => (
            <li key={segment.id}>
              <p>{segment.text}</p>
              <div className="lc-reading-note">
                <p>{segment.note}</p>
                <button
                  type="button"
                  disabled={disabled || visited.includes(segment.id)}
                  onClick={() => review(segment.id)}
                >
                  {visited.includes(segment.id) ? `Note ${i + 1} reviewed` : `Mark note ${i + 1} as reviewed`}
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <blockquote>
            {card.segments.map((segment, i) => (
              <span key={segment.id}>
                {segment.text}{" "}
                <button
                  className="lc-cite"
                  type="button"
                  aria-label={`Open note ${i + 1}`}
                  aria-pressed={open === segment.id}
                  disabled={disabled && !state.completed && !visited.includes(segment.id)}
                  onClick={() => review(segment.id)}
                >
                  [{i + 1}]
                </button>{" "}
              </span>
            ))}
          </blockquote>
          {selected && (
            <aside className="lc-reading-note">
              <p>{selected.note}</p>
            </aside>
          )}
        </>
      )}
      <p className="lc-meta" role="status">
        {visited.length} of {card.segments.length} notes reviewed
      </p>
    </>
  );
}
