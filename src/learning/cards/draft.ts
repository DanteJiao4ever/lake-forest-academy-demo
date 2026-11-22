import { schema } from "prosemirror-schema-basic";
import { isRecord, stringList, stringValue } from "./controls";
import type { CardState, EditorDocument, TextDiff } from "./types";

export function textDiff(oldText: string, newText: string): TextDiff {
  let from = 0;
  while (from < oldText.length && from < newText.length && oldText[from] === newText[from]) from++;
  let endOld = oldText.length;
  let endNew = newText.length;
  while (endOld > from && endNew > from && oldText[endOld - 1] === newText[endNew - 1]) {
    endOld--;
    endNew--;
  }
  return { from, removed: endOld - from, inserted: newText.slice(from, endNew) };
}

export function versions(history: CardState["history"]) {
  const result: { version: number; text: string }[] = [];
  let text = "";
  for (const record of history ?? []) {
    const { version, diff } = record;
    if (
      version !== result.length + 1 ||
      !diff ||
      diff.from < 0 ||
      diff.removed < 0 ||
      diff.from + diff.removed > text.length
    )
      break;
    text = text.slice(0, diff.from) + diff.inserted + text.slice(diff.from + diff.removed);
    result.push({ version, text });
  }
  return result;
}

export function plainDoc(text: string) {
  return schema.nodes.doc.create(
    null,
    text
      .split(/\r?\n/u)
      .map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line) : undefined)),
  );
}

// The writing task supports plain paragraphs and citations. Pasted links, images and embeds have no place in its saved document.
function safeNode(node: unknown): boolean {
  if (
    !isRecord(node) ||
    typeof node.type !== "string" ||
    !["doc", "paragraph", "blockquote", "text", "hard_break"].includes(node.type)
  )
    return false;
  return !node.marks && (!node.content || (Array.isArray(node.content) && node.content.every(safeNode)));
}
export function readDoc(value: unknown, fallback: string) {
  if (safeNode(value) && isRecord(value) && value.type === "doc") {
    try {
      const doc = schema.nodeFromJSON(value);
      doc.check();
      return doc;
    } catch {
      /* Restore the saved text when the rich document cannot be opened. */
    }
  }
  return plainDoc(fallback);
}
export const editorText = (doc: ReturnType<typeof plainDoc>) =>
  doc.textBetween(0, doc.content.size, "\n", "\n");
export interface Snapshot {
  text: string;
  skills: string[];
  doc: EditorDocument;
}
export function initialSnapshot(state: CardState): Snapshot {
  const stored = (state.completed ? state.answer : state.draft) ?? state.answer ?? {};
  const doc = readDoc(stored.doc, stringValue(stored.text));
  return { text: editorText(doc), doc: doc.toJSON(), skills: stringList(stored.skills) };
}
export function sameSnapshot(a: Snapshot, b: Snapshot) {
  return (
    a.text === b.text &&
    JSON.stringify(a.skills) === JSON.stringify(b.skills) &&
    JSON.stringify(a.doc) === JSON.stringify(b.doc)
  );
}
