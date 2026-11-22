import { useRef, useState } from "react";
import type { CardState } from "./types";

export const words = (text: string) => text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
export const stringValue = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";
export const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export function toggle(values: string[], id: string) {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

// Lock synchronously as a second submit can arrive before React disables a button.
export function useAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(action: () => Promise<void>) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your work. Please try again.");
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { run, busy, error };
}

export interface ActivityProps {
  state: CardState;
  send: (answer: Record<string, unknown>) => Promise<boolean>;
  disabled: boolean;
}

export function Count({ text, minimum, id }: { text: string; minimum: number; id?: string }) {
  return (
    <small id={id} className="lc-meta">
      {words(text)} words · {minimum} required
    </small>
  );
}
