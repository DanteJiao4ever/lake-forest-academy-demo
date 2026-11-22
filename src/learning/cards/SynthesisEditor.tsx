import { useCallback, useEffect, useId, useRef, useState } from "react";
import { baseKeymap } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { schema } from "prosemirror-schema-basic";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";
import { Count, toggle, words } from "./controls";
import type { ActivityProps } from "./controls";
import { editorText, initialSnapshot, plainDoc, readDoc, sameSnapshot, textDiff, versions } from "./draft";
import type { Snapshot } from "./draft";
import type { LessonCardProps, Synthesis } from "./types";

type Props = ActivityProps &
  Pick<LessonCardProps, "scratchpad" | "saveDraft" | "readOnly"> & { card: Synthesis };

export function SynthesisEditor({ card, state, send, disabled, scratchpad, saveDraft, readOnly }: Props) {
  const [snapshot, setSnapshot] = useState(() => initialSnapshot(state));
  const [status, setStatus] = useState(state.draft ? `Saved version ${state.draft.version}` : "");
  const [saveError, setSaveError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [sending, setSending] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState("");
  const [citation, setCitation] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const latest = useRef(snapshot);
  const acknowledged = useRef({ version: state.draft?.version ?? 0, snapshot });
  const pending = useRef<Promise<boolean> | null>(null);
  const submissionLock = useRef(false);
  const conflicted = useRef(false);
  const context = useRef({ saveDraft, readOnly, completed: state.completed });
  context.current = { saveDraft, readOnly, completed: state.completed };
  const locked = disabled || sending;
  const label = useId();
  const citedLines = scratchpad
    .split(/\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const savedVersions = versions(state.history);
  const changed = useCallback((next: Snapshot) => {
    latest.current = next;
    setSnapshot(next);
    setStatus("Unsaved changes");
    setSaveError("");
  }, []);

  // Capture a snapshot before each request. Edits made while saving remain dirty for the next write.
  const save = useCallback(async function save(): Promise<boolean> {
    const { saveDraft: write, readOnly: preview, completed } = context.current;
    if (!write || preview || completed) return true;
    if (conflicted.current) return false;
    if (pending.current) return pending.current;
    const base = acknowledged.current;
    const current = latest.current;
    if (sameSnapshot(base.snapshot, current)) return true;
    setStatus("Saving…");
    const request = Promise.resolve().then(async () => {
      try {
        const { version } = await write({
          ...current,
          baseVersion: base.version,
          diff: textDiff(base.snapshot.text, current.text),
        });
        acknowledged.current = { version, snapshot: current };
        setStatus(sameSnapshot(current, latest.current) ? `Saved version ${version}` : "Unsaved changes");
        setSaveError("");
        return true;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Could not save this draft. Try again.");
        setStatus("Unsaved changes");
        return false;
      } finally {
        pending.current = null;
      }
    });
    pending.current = request;
    return request;
  }, []);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const initial = latest.current;
    const editor = new EditorView(node, {
      state: EditorState.create({
        doc: readDoc(initial.doc, initial.text),
        plugins: [history(), keymap({ "Mod-z": undo, "Mod-y": redo, "Shift-Mod-z": redo }), keymap(baseKeymap)],
      }),
      editable: () => !context.current.readOnly && !context.current.completed,
      attributes: { role: "textbox", "aria-multiline": "true", "aria-labelledby": label },
      // Only text from the clipboard enters this student's document.
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          const pasted = plainDoc(text);
          const slice = pasted.slice(1, pasted.content.size - 1, true);
          view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
        }
        return true;
      },
      handleDrop: () => true,
      dispatchTransaction(transaction) {
        const next = editor.state.apply(transaction);
        editor.updateState(next);
        if (transaction.docChanged)
          changed({ ...latest.current, text: editorText(next.doc), doc: next.doc.toJSON() });
      },
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [changed, label]);

  useEffect(() => {
    view.current?.setProps({
      editable: () => !locked,
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": label,
        "aria-readonly": String(locked),
      },
    });
  }, [locked, label]);

  function install(next: Snapshot) {
    const editor = view.current;
    if (editor) {
      const doc = readDoc(next.doc, next.text);
      editor.dispatch(editor.state.tr.replaceWith(0, editor.state.doc.content.size, doc.content));
    }
    changed(next);
  }

  useEffect(() => {
    const remote = state.draft;
    if (!remote || remote.version <= acknowledged.current.version || state.completed) return;
    const fresh = initialSnapshot(state);
    if (pending.current && sameSnapshot(latest.current, fresh)) return;
    if (!sameSnapshot(acknowledged.current.snapshot, latest.current)) {
      // A response to our own in-flight write may arrive after another keystroke.
      if (pending.current) return;
      conflicted.current = true;
      setConflict(true);
      return;
    }
    install(fresh);
    acknowledged.current = { version: remote.version, snapshot: fresh };
    setStatus(`Saved version ${remote.version}`);
  }, [state.draft, state.completed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void save();
    }, 10000);
    const hidden = () => {
      if (document.hidden) void save();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
      // Also save a final edit if navigating away during the previous write.
      void save().then((ok) => {
        if (ok) void save();
      });
    };
  }, [save]);

  async function submit() {
    if (submissionLock.current || locked) return;
    submissionLock.current = true;
    setSending(true);
    try {
      if (!(await save()) || !(await save())) return;
      const { text, skills, doc } = latest.current;
      await send({ text, skills, doc });
    } finally {
      submissionLock.current = false;
      setSending(false);
    }
  }

  function cite() {
    const editor = view.current;
    const quote = citedLines.includes(citation) ? citation : citedLines[0];
    if (!quote || !editor || locked) return;
    const block = schema.nodes.blockquote.create(null, schema.nodes.paragraph.create(null, schema.text(quote)));
    editor.dispatch(editor.state.tr.replaceSelectionWith(block).scrollIntoView());
    editor.focus();
  }

  function resolve(keepLocal: boolean) {
    if (!state.draft) return;
    const remote = initialSnapshot(state);
    acknowledged.current = { version: state.draft.version, snapshot: remote };
    conflicted.current = false;
    setConflict(false);
    if (keepLocal) void save();
    else {
      install(remote);
      setStatus(`Saved version ${state.draft.version}`);
    }
  }
  return (
    <div
      className="lc-synthesis"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) void save();
      }}
    >
      <span className="lc-label" id={label}>
        Your synthesis
      </span>
      <div className="lc-editor" ref={container} />
      <Count text={snapshot.text} minimum={card.minWords} />
      {!state.completed && (
        <div className="lc-citations">
          {citedLines.length > 1 && (
            <label>
              Scratchpad excerpt
              <select
                value={citedLines.includes(citation) ? citation : citedLines[0]}
                disabled={locked}
                onChange={(e) => setCitation(e.target.value)}
              >
                {[...new Set(citedLines)].map((line) => (
                  <option value={line} key={line}>
                    {line}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" disabled={locked || !citedLines.length} onClick={cite}>
            Quote from my scratchpad
          </button>
          {!citedLines.length && (
            <span className="lc-meta">Add a note to your scratchpad to quote it here.</span>
          )}
        </div>
      )}
      <fieldset disabled={locked}>
        <legend>Choose two learning skills</legend>
        {card.skills.map((skill) => (
          <label key={skill.id} className="lc-choice">
            <input
              type="checkbox"
              checked={snapshot.skills.includes(skill.id)}
              disabled={!snapshot.skills.includes(skill.id) && snapshot.skills.length >= 2}
              onChange={() => changed({ ...latest.current, skills: toggle(latest.current.skills, skill.id) })}
            />
            {skill.label}
          </label>
        ))}
      </fieldset>
      {saveDraft && !state.completed && (
        <div className="lc-draft-status">
          <small role="status">{status}</small>
          {saveError && (
            <>
              <p role="alert">{saveError}</p>
              <button disabled={locked} type="button" onClick={() => void save()}>
                Retry saving draft
              </button>
            </>
          )}
          {conflict && (
            <div role="alert">
              <p>A newer draft was saved in another window.</p>
              <button disabled={locked} type="button" onClick={() => resolve(false)}>
                Load saved draft
              </button>
              <button disabled={locked} type="button" onClick={() => resolve(true)}>
                Keep my edits
              </button>
            </div>
          )}
        </div>
      )}
      {savedVersions.length > 0 && (
        <details>
          <summary>Draft history ({savedVersions.length})</summary>
          <label>
            Version
            <select value={restoreVersion} onChange={(e) => setRestoreVersion(e.target.value)}>
              <option value="">Choose a version</option>
              {[...savedVersions].reverse().map((v) => (
                <option value={v.version} key={v.version}>
                  Version {v.version}
                </option>
              ))}
            </select>
          </label>
          {restoreVersion && (
            <>
              <blockquote>{savedVersions.find((v) => v.version === Number(restoreVersion))?.text}</blockquote>
              {!state.completed && (
                <button
                  disabled={locked || conflict}
                  type="button"
                  onClick={() => {
                    const selected = savedVersions.find((v) => v.version === Number(restoreVersion));
                    if (selected) {
                      install({
                        ...latest.current,
                        text: selected.text,
                        doc: plainDoc(selected.text).toJSON(),
                      });
                      void save();
                    }
                  }}
                >
                  Restore this text
                </button>
              )}
            </>
          )}
        </details>
      )}
      {!state.completed && (
        <button
          type="button"
          disabled={locked || conflict || words(snapshot.text) < card.minWords || snapshot.skills.length !== 2}
          onClick={() => void submit()}
        >
          {sending ? "Submitting…" : "Submit synthesis"}
        </button>
      )}
    </div>
  );
}
