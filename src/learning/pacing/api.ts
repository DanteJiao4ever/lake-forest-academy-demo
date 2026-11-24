import { useCallback, useEffect, useState } from "react";

type Runtime = Window & { LFA_PLATFORM_API_CONFIG?: { coursesEndpoint?: string } };
export function pacingEndpoint(code: string) {
  const courses = (window as Runtime).LFA_PLATFORM_API_CONFIG?.coursesEndpoint;
  return courses ? courses.replace(/\/$/, "") + "/" + encodeURIComponent(code) + "/pacing" : "";
}

export class RequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function request<T>(url: string, method = "GET", body?: object, signal?: AbortSignal): Promise<T> {
  const csrf = sessionStorage.getItem("lake-forest-learning-csrf-v1");
  const response = await fetch(url, {
    method, credentials: "include", cache: "no-store", signal,
    headers: body ? { "Content-Type": "application/json", ...(csrf ? { "X-CSRF-Token": csrf } : {}) } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(result?.error?.message || "Unable to open these materials.", response.status);
  return result?.data ?? result;
}

export function useResource<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(count => count + 1), []);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setError(""); setUnavailable(false);
    void request<T>(url, "GET", undefined, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(e => {
        if (controller.signal.aborted) return;
        setData(null);
        if (e instanceof RequestError && (e.status === 403 || e.status === 404)) setUnavailable(true);
        else setError(e instanceof Error ? e.message : "Unable to load the course.");
      });
    return () => controller.abort();
  }, [url, revision]);
  return { data, setData, error, unavailable, reload };
}

export type Config = { startDate: string; endDate: string; weeks: number | null; mode: string };
export type ProgressModule = { number: number; id: string; title: string; minutes: number; startDate: string; endDate: string; releaseDate: string; status: string; reason?: string };
export type Milestone = { id: string; title: string; date: string; eligible: boolean; remainingModules?: number };
export type Timeline = { enabled: boolean; version: string; config: Config; today: string; endDate: string; weeklyMinutes: number; progressPercent: number; modules: ProgressModule[]; milestones: Milestone[] };
export type Attempt = { id: string; number: number; answer: string; reasoning: string; correct: boolean | null; feedback: string; decision?: string; teacherFeedback?: string };
export type Exercise = { id: string; type: string; title: string; prompt: string; readingId: string; worksheetRef?: string; reasonPrompt?: string; ktca?: string; checkpointOnly?: boolean; hints?: string[]; choices?: string[]; targetDate?: string; attempts: Attempt[]; hint?: string; solution?: string };
export type PackModule = {
  version: string; number: number; title: string; minutes: number;
  readings: { id: string; title: string; paragraphs: string[]; workedExample: string; cue: string; targetDate?: string }[];
  expectations?: {id:string;readingId:string;goal:string;teaching:string;practice:string;assignment:string}[];
  exercises: Exercise[];
  checkpoint: { id: string; threshold: number; exerciseIds: string[]; readingIds: string[]; targetDate: string; attempts: { number: number; correctCount: number; total: number; passed: boolean; missedReadingIds: string[]; itemFeedback?: {exerciseId:string;correct:boolean;feedback:string;readingId:string;ktca:string}[] }[] };
  sources?: { title: string; url: string }[];
  assignmentId: string | null; worksheetUrl: string | null;
  unitAssignment?: { title: string; instructions: string; steps: string[]; remoteAlternative: string; targetDate: string } | null;
};
export type MilestoneDetails = Milestone & { materials: { title: string; text: string }[]; tasks: { id: string; prompt: string; marks: number }[]; attempts: Attempt[]; requests: { preferredAt: string; status: string }[] };
export function moduleHref(code: string, number: number) {
  return "#/course/" + encodeURIComponent(code.toLowerCase()) + "/module/" + number + "/resources";
}
