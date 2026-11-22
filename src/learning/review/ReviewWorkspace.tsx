import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, words } from "../cards/controls";
import "./review.css";

type Props = {
  courseCode: string;
  endpoint: string;
  csrf: () => string | Promise<string>;
  role: string;
  returnHref: string;
};
type Anchor = { version: number; start: number; exact: string };
type Version = { version: number; text: string; at: string; explanation?: string };
type Thread = {
  id: string;
  anchor: Anchor;
  text: string;
  author: string;
  resolvedAt?: string;
  reopenedVersion?: number;
};
type Defense = {
  id: string;
  minutes: number;
  assignedAt: string;
  startedAt?: string;
  expiresAt?: string;
  supersededAt?: string;
  answeredAt?: string;
  acceptedAt?: string;
  questions?: { anchor: Anchor; prompt: string }[];
  answers?: string[];
};
type Patch = { version: number; createdAt: string; diff: { from: number; removed: number; inserted: string } };
type Evidence = {
  history: Patch[];
  pasteEvents: { cardId: string; wordCount: number | null }[];
  revisions?: { version: number; history: Patch[] }[];
};
type Summary = {
  id: string;
  title: string;
  studentName: string;
  revision: number;
  version: number;
  kind: "file" | "synthesis";
  releasedAt: string | null;
  published: boolean;
  submittedAt: string;
  waitingSince: string | null;
  dueAt: string | null;
  gradeHref: string | null;
};
type Work = Summary & {
  versions: Version[];
  threads: Thread[];
  defenses: Defense[];
  evidence?: Evidence;
  draft?: { text: string };
  releaseFeedback?: string;
  formativeGrade?: { score: number; feedback: string };
};
type Policy = { startHour: number; endHour: number; weekdays: number[]; closures: string[] };
type Candidate = {
  kind: string;
  submissionId?: string;
  fileId?: string;
  readerId?: string;
  cardId?: string;
  title: string;
  studentName: string;
  submittedAt: string;
};
type Inbox = {
  section: string;
  role: string;
  enabled: boolean;
  policy: Policy | null;
  queue: Summary[];
  candidates: Candidate[];
};
type Write = (a: Record<string, unknown>) => Promise<Work>;
const stamp = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
  policy,
  save,
}: {
  policy: Policy;
  save: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [start, setStart] = useState(policy.startHour),
    [end, setEnd] = useState(policy.endHour);
  const [days, setDays] = useState(policy.weekdays),
    [closures, setClosures] = useState(policy.closures.join("\n"));
  const action = useAction();
  return (
    <details>
      <summary>Configure trial working hours</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() =>
            save({
              type: "calendar",
              startHour: start,
              endHour: end,
              weekdays: days,
              closures: closures.trim().split(/\s+/u).filter(Boolean),
            }),
          );
        }}
      >
        <label>
          Opening hour
          <input
            type="number"
            min="0"
            max="22"
            value={start}
            onChange={(e) => setStart(e.target.valueAsNumber)}
          />
        </label>
        <label>
          Closing hour
          <input type="number" min="1" max="23" value={end} onChange={(e) => setEnd(e.target.valueAsNumber)} />
        </label>
        <fieldset>
          <legend>Working days</legend>
          {weekdays.map((day, index) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={days.includes(index)}
                onChange={() =>
                  setDays(days.includes(index) ? days.filter((v) => v !== index) : [...days, index])
                }
              />
              {day}
            </label>
          ))}
        </fieldset>
        <label>
          Closure dates, one YYYY-MM-DD per line
          <textarea rows={3} value={closures} onChange={(e) => setClosures(e.target.value)} />
        </label>
        <button disabled={action.busy || end <= start || !days.length}>Save working hours</button>
        {action.error && <p role="alert">{action.error}</p>}
      </form>
    </details>
  );
}

function Timeline({ patches, initial = "" }: { patches: Patch[]; initial?: string }) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => setStep((p) => Math.min(p + 1, patches.length)), 900);
    return () => window.clearInterval(interval);
  }, [playing, patches.length]);
  useEffect(() => {
    if (step >= patches.length) setPlaying(false);
  }, [step, patches.length]);
  let value = initial;
  for (const { diff } of patches.slice(0, step))
    value = value.slice(0, diff.from) + diff.inserted + value.slice(diff.from + diff.removed);
  return (
    <div>
      <label>
        Edit snapshot {step} of {patches.length}
        <input
          type="range"
          min="0"
          max={patches.length}
          value={step}
          onChange={(e) => {
            setStep(e.target.valueAsNumber);
            setPlaying(false);
          }}
        />
      </label>
      <button
        type="button"
        disabled={!patches.length}
        onClick={() => {
          if (step >= patches.length) setStep(0);
          setPlaying(!playing);
        }}
      >
        {playing ? "Pause playback" : "Play edit history"}
      </button>
      {step > 0 && <small>{stamp(patches[step - 1].createdAt)} Toronto</small>}
      <pre>{value}</pre>
    </div>
  );
}

function EvidencePanel({ work }: { work: Work }) {
  const e = work.evidence;
  if (!e) return null;
  return (
    <details>
      <summary>Faculty process evidence</summary>
      <h4>Paste flags for manual review</h4>
      {e.pasteEvents.length ? (
        <ul>
          {e.pasteEvents.map((p, i) => (
            <li key={i}>
              {p.cardId} · {p.wordCount ?? "30+"} words in an external paste
            </li>
          ))}
        </ul>
      ) : (
        <p>No flagged paste events.</p>
      )}
      {e.history.length > 0 && (
        <>
          <h4>Synthesis draft history</h4>
          <Timeline patches={e.history} />
        </>
      )}
      {e.revisions?.map((r) => (
        <section key={r.version}>
          <h4>Edits to version {r.version}</h4>
          <Timeline patches={r.history} initial={work.versions[r.version - 1]?.text} />
        </section>
      ))}
      {!e.history.length && !e.revisions?.length && <p>No editor snapshots are available.</p>}
    </details>
  );
}

function TextAnchor({ version, select }: { version: Version; select: (a: Anchor | null) => void }) {
  function captureSelection(el: HTMLTextAreaElement) {
    const part = el.value.slice(el.selectionStart, el.selectionEnd);
    const exact = part.trim();
    select(exact ? { version: version.version, start: el.selectionStart + part.indexOf(exact), exact } : null);
  }
  return (
    <label>
      Select words from version {version.version} to anchor a comment or question
      <textarea
        readOnly
        rows={5}
        value={version.text}
        onSelect={(event) => captureSelection(event.currentTarget)}
        onKeyUp={(event) => captureSelection(event.currentTarget)}
        onPointerUp={(event) => captureSelection(event.currentTarget)}
      />
    </label>
  );
}

function FacultyTools({
  work,
  write,
  busy,
}: {
  work: Work;
  write: (a: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
}) {
  const latest = work.versions.at(-1)!;
  const [anchor, setAnchor] = useState<Anchor | null>(null),
    [comment, setComment] = useState(""),
    [feedback, setFeedback] = useState(""),
    [score, setScore] = useState("");
  const [q1, setQ1] = useState(""),
    [q2, setQ2] = useState(""),
    [minutes, setMinutes] = useState(10);
  const [qAnchor1, setQAnchor1] = useState<Anchor | null>(null),
    [qAnchor2, setQAnchor2] = useState<Anchor | null>(null);
  const active = work.defenses.at(-1);
  const canRelease =
    work.threads.length > 0 &&
    work.threads.every((t) => t.resolvedAt) &&
    (!active || Boolean(active.acceptedAt && !active.supersededAt));
  return (
    <>
      <TextAnchor version={latest} select={setAnchor} />
      {anchor && <blockquote>{anchor.exact}</blockquote>}
      <label>
        Revision request
        <textarea rows={2} value={comment} maxLength={4000} onChange={(e) => setComment(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={!anchor || !comment.trim() || busy}
        onClick={async () => {
          if (await write({ type: "comment", anchor, text: comment })) {
            setComment("");
            setAnchor(null);
          }
        }}
      >
        Request revision of passage
      </button>
      <details>
        <summary>Assign two timed defense questions</summary>
        {[
          { i: 1, value: q1, set: setQ1, a: qAnchor1, bind: setQAnchor1 },
          { i: 2, value: q2, set: setQ2, a: qAnchor2, bind: setQAnchor2 },
        ].map((q) => (
          <div key={q.i}>
            <label>
              Question {q.i}
              <textarea rows={2} maxLength={2000} value={q.value} onChange={(e) => q.set(e.target.value)} />
            </label>
            <button type="button" disabled={!anchor} onClick={() => q.bind(anchor)}>
              Use selected passage for question {q.i}
            </button>
            {q.a && <blockquote>{q.a.exact}</blockquote>}
          </div>
        ))}
        <label>
          Response window in minutes
          <input
            type="number"
            min="1"
            max="120"
            value={minutes}
            onChange={(e) => setMinutes(e.target.valueAsNumber)}
          />
        </label>
        <button
          type="button"
          disabled={
            busy || !q1.trim() || !q2.trim() || !qAnchor1 || !qAnchor2 || !(minutes >= 1 && minutes <= 120)
          }
          onClick={async () => {
            if (
              await write({
                type: "defense",
                minutes,
                questions: [
                  { prompt: q1, anchor: qAnchor1 },
                  { prompt: q2, anchor: qAnchor2 },
                ],
              })
            ) {
              setQ1("");
              setQ2("");
              setQAnchor1(null);
              setQAnchor2(null);
            }
          }}
        >
          Assign defense
        </button>
      </details>
      {active?.answeredAt && !active.acceptedAt && !active.supersededAt && (
        <button disabled={busy} onClick={() => void write({ type: "acceptDefense" })}>
          Accept defense answers
        </button>
      )}
      {canRelease && (
        <section>
          <h4>Release reviewed work</h4>
          <label>
            Final feedback
            <textarea rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </label>
          {work.kind === "synthesis" && (
            <label>
              Formative synthesis score (%)
              <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
            </label>
          )}
          <button
            disabled={
              busy ||
              !feedback.trim() ||
              (work.kind === "synthesis" && (!score || Number(score) < 0 || Number(score) > 100))
            }
            onClick={() =>
              void write({
                type: "release",
                feedback,
                ...(work.kind === "synthesis" ? { score: Number(score) } : {}),
              })
            }
          >
            {work.kind === "file" ? "Release for official grading" : "Publish formative result"}
          </button>
        </section>
      )}
    </>
  );
}

function StudentRevision({ work, write }: { work: Work; write: Write }) {
  const latest = work.versions.at(-1)!;
  const [text, setText] = useState(work.draft?.text ?? latest.text),
    [explanation, setExplanation] = useState("");
  const [message, setMessage] = useState(""),
    [sending, setSending] = useState(false);
  const live = useRef(text),
    accepted = useRef(text),
    paste = useRef(0),
    origin = useRef(crypto.randomUUID()),
    lock = useRef(false);
  const inFlight = useRef<Promise<void> | null>(null),
    send = useRef(write);
  send.current = write;
  const save = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    const value = live.current,
      count = paste.current;
    if (value === accepted.current && !count) return;
    paste.current = 0;
    const op = send
      .current({ type: "revisionDraft", text: value, pasteWords: count })
      .then(() => {
        accepted.current = value;
        setMessage(value === live.current ? "Draft saved" : "Unsaved changes");
      })
      .catch((e: Error) => {
        paste.current = Math.max(paste.current, count);
        setMessage(e.message);
        throw e;
      })
      .finally(() => {
        inFlight.current = null;
      });
    inFlight.current = op;
    return op;
  }, []);
  useEffect(() => {
    const flush = () => void save().catch(() => {});
    const timer = window.setInterval(flush, 10000);
    const hidden = () => {
      if (document.hidden) flush();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
      if (!lock.current) flush();
    };
  }, [save]);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        lock.current = true;
        setSending(true);
        try {
          await save();
          await save();
          await send.current({ type: "revise", text: live.current, explanation });
          setMessage("Revision submitted");
        } catch (err) {
          setMessage(err instanceof Error ? err.message : "Please try again.");
        } finally {
          lock.current = false;
          setSending(false);
        }
      }}
    >
      <label>
        Revised text
        <textarea
          rows={7}
          maxLength={16000}
          value={text}
          disabled={sending}
          onChange={(e) => {
            live.current = e.target.value;
            setText(live.current);
            setMessage("Unsaved changes");
          }}
          onCopy={(e) => {
            const el = e.currentTarget;
            e.clipboardData.setData("text/plain", el.value.slice(el.selectionStart, el.selectionEnd));
            e.clipboardData.setData("application/x-review-origin", origin.current);
            e.preventDefault();
          }}
          onPaste={(e) => {
            if (e.clipboardData.getData("application/x-review-origin") !== origin.current) {
              const n = words(e.clipboardData.getData("text/plain"));
              if (n >= 30) paste.current = Math.max(paste.current, n);
            }
          }}
        />
      </label>
      <label>
        Explain what you changed and why
        <textarea
          rows={2}
          maxLength={4000}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </label>
      <button disabled={sending || !explanation.trim() || !text.trim() || text.trim() === latest.text}>
        Submit revised version
      </button>
      <small role="status">{message}</small>
    </form>
  );
}

function DefensePanel({
  work,
  staff,
  busy,
  act,
}: {
  work: Work;
  staff: boolean;
  busy: boolean;
  act: (a: Record<string, unknown>) => Promise<boolean>;
}) {
  const [one, setOne] = useState(""),
    [two, setTwo] = useState(""),
    [now, setNow] = useState(Date.now);
  const current = work.defenses.at(-1);
  useEffect(() => {
    if (!current?.expiresAt || current.answeredAt || current.supersededAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [current?.expiresAt, current?.answeredAt, current?.supersededAt]);
  return (
    <>
      {work.defenses.map((d) => {
        const remaining = d.expiresAt ? Math.max(0, Math.ceil((Date.parse(d.expiresAt) - now) / 1000)) : null;
        return (
          <section key={d.id} className="review-defense">
            <h4>Contextual defense · {d.minutes} minutes</h4>
            <p>
              {d.supersededAt
                ? "Superseded"
                : d.acceptedAt
                  ? "Accepted by faculty"
                  : d.answeredAt
                    ? "Answers submitted"
                    : d.startedAt
                      ? "In progress"
                      : "Ready to begin"}
            </p>
            {d.startedAt && (
              <small>
                Started {stamp(d.startedAt)} Toronto.{" "}
                {d.answeredAt ? `Submitted ${stamp(d.answeredAt)}.` : `Deadline ${stamp(d.expiresAt!)}.`}
              </small>
            )}
            {d.questions?.map((q, i) => (
              <div key={i}>
                <blockquote>{q.anchor.exact}</blockquote>
                <p>{q.prompt}</p>
                {d.answers && (
                  <p>
                    <strong>Answer</strong> {d.answers[i]}
                  </p>
                )}
              </div>
            ))}
            {!staff && !d.supersededAt && !d.startedAt && (
              <button disabled={busy} onClick={() => void act({ type: "startDefense" })}>
                Start timed defense
              </button>
            )}
            {!staff && d.startedAt && !d.answeredAt && !d.supersededAt && (
              <>
                {remaining === 0 ? (
                  <p>The time window has ended. Contact your teacher for another attempt.</p>
                ) : (
                  <>
                    <p>
                      Time remaining {Math.floor(remaining! / 60)}m {remaining! % 60}s
                    </p>
                    <label>
                      Answer 1<textarea value={one} onChange={(e) => setOne(e.target.value)} maxLength={4000} />
                    </label>
                    <label>
                      Answer 2<textarea value={two} onChange={(e) => setTwo(e.target.value)} maxLength={4000} />
                    </label>
                    <button
                      disabled={busy || !one.trim() || !two.trim()}
                      onClick={() => void act({ type: "answerDefense", answers: [one, two] })}
                    >
                      Submit defense answers
                    </button>
                  </>
                )}
              </>
            )}
          </section>
        );
      })}
    </>
  );
}
function MarkedVersion({ version, threads }: { version: Version; threads: Thread[] }) {
  const related = threads.filter((t) => t.anchor.version === version.version);
  const cuts = [
    ...new Set([
      0,
      version.text.length,
      ...related.flatMap((t) => [t.anchor.start, t.anchor.start + t.anchor.exact.length]),
    ]),
  ].sort((a, b) => a - b);
  return (
    <pre>
      {cuts.slice(0, -1).map((start, i) => {
        const text = version.text.slice(start, cuts[i + 1]),
          active = related.filter(
            (t) => t.anchor.start <= start && t.anchor.start + t.anchor.exact.length > start,
          );
        if (!active.length) return <span key={start}>{text}</span>;
        return (
          <span key={start}>
            <mark>{text}</mark>
            {active
              .filter((t) => t.anchor.start + t.anchor.exact.length === cuts[i + 1])
              .map((t) => (
                <button
                  key={t.id}
                  aria-label={`Read revision thread ${threads.indexOf(t) + 1}`}
                  onClick={() => document.getElementById("review-thread-" + t.id)?.focus()}
                >
                  [{threads.indexOf(t) + 1}]
                </button>
              ))}
          </span>
        );
      })}
    </pre>
  );
}

function Detail({
  work,
  write,
  staff,
  close,
}: {
  work: Work;
  write: Write;
  staff: boolean;
  close: () => void;
}) {
  const action = useAction();
  const act = async (a: Record<string, unknown>) =>
    action.run(async () => {
      await write(a);
    });
  return (
    <section>
      <button onClick={close}>Back to review list</button>
      <h2>{work.title}</h2>
      <p>
        {work.studentName} · Version {work.version}
      </p>
      <h3>Submitted versions</h3>
      {work.versions.map((v) => (
        <details key={v.version} open={v.version === work.version}>
          <summary>
            Version {v.version} · {stamp(v.at)} Toronto
          </summary>
          <MarkedVersion version={v} threads={work.threads} />
          {v.explanation && (
            <p>
              <strong>Revision explanation</strong> {v.explanation}
            </p>
          )}
        </details>
      ))}
      <h3>Revision threads</h3>
      {!work.threads.length && <p>No revision requests yet.</p>}
      {work.threads.map((t, i) => (
        <section id={"review-thread-" + t.id} tabIndex={-1} key={t.id}>
          <h4>Thread {i + 1}</h4>
          <blockquote>{t.anchor.exact}</blockquote>
          <p>
            {t.author} · Version {t.anchor.version}
          </p>
          <p>{t.text}</p>
          <strong>{t.resolvedAt ? "Resolved" : "Open"}</strong>
          {staff &&
            !work.published &&
            !work.formativeGrade &&
            (t.resolvedAt ? (
              <button disabled={action.busy} onClick={() => void act({ type: "reopen", threadId: t.id })}>
                Reopen thread
              </button>
            ) : (
              <button
                disabled={action.busy || work.version <= (t.reopenedVersion ?? t.anchor.version)}
                onClick={() => void act({ type: "resolve", threadId: t.id })}
              >
                Resolve thread
              </button>
            ))}
        </section>
      ))}
      <DefensePanel
        key={work.defenses.at(-1)?.id ?? "none"}
        work={work}
        staff={staff}
        busy={action.busy}
        act={act}
      />
      {staff && <EvidencePanel work={work} />}
      {!work.releasedAt && staff && (
        <FacultyTools key={work.version} work={work} write={act} busy={action.busy} />
      )}
      {!work.releasedAt && !staff && work.threads.some((t) => !t.resolvedAt) && (
        <StudentRevision key={work.version} work={work} write={write} />
      )}
      {work.releasedAt && (
        <section>
          <h3>
            {work.formativeGrade
              ? `Formative synthesis result · ${work.formativeGrade.score}%`
              : "Released for grading"}
          </h3>
          <p>{work.releaseFeedback}</p>
          {staff && work.gradeHref && <a href={work.gradeHref}>Open official submission grade</a>}
        </section>
      )}
      {action.error && <p role="alert">{action.error}</p>}
    </section>
  );
}

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function ReviewWorkspace(props: Props) {
  return <ConnectedReviewWorkspace key={JSON.stringify([props.endpoint, props.courseCode, props.role])} {...props} />;
}

function ConnectedReviewWorkspace({ courseCode, endpoint, csrf, role, returnHref }: Props) {
  const [inbox, setInbox] = useState<Inbox | null>(null),
    [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  const [busy, setBusy] = useState(false),
    lock = useRef(false),
    workRef = useRef<Work | null>(null),
    courseRef = useRef(courseCode);
  const pendingKey = useRef(new Map<string, string>());
  const latestWork = useRef(new Map<string, Work>());
  const base =
    endpoint.replace(/\/$/u, "") + "/v1/courses/" + encodeURIComponent(courseCode) + "/review-workspace";
  const token = useRef(csrf);
  token.current = csrf;
  courseRef.current = courseCode;
  const call = useCallback(
    async (suffix: string, a?: Record<string, unknown>) => {
      const resp = await fetch(base + suffix, {
        method: a ? "POST" : "GET",
        credentials: "include",
        cache: "no-store",
        headers: a
          ? {
              "Content-Type": "application/json",
              "X-CSRF-Token": await token.current(),
            }
          : undefined,
        body: a ? JSON.stringify(a) : undefined,
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error?.message || "Unable to load this review.");
      return result;
    },
    [base],
  );
  const refresh = useCallback(async () => {
    const data = await call("");
    if (courseRef.current === courseCode) setInbox(data);
  }, [call, courseCode]);
  useEffect(() => {
    setError("");
    setInbox(null);
    setWork(null);
    workRef.current = null;
    void refresh().catch((e) => setError(e.message));
  }, [refresh]);
  const display = (w: Work) => {
    latestWork.current.set(w.id, w);
    workRef.current = w;
    setWork(w);
  };
  async function perform(a: Record<string, unknown>) {
    const keyed = !["enable", "calendar"].includes(String(a.type));
    const k = JSON.stringify(a);
    if (keyed && !pendingKey.current.has(k)) pendingKey.current.set(k, crypto.randomUUID());
    const result = await call("/actions", keyed ? { ...a, requestId: pendingKey.current.get(k) } : a);
    pendingKey.current.delete(k);
    return result;
  }
  async function write(a: Record<string, unknown>): Promise<Work> {
    const current = work && latestWork.current.get(work.id);
    if (!current) throw new Error("Choose the review again.");
    const result = await perform({ ...a, workId: current.id, expectedRevision: current.revision });
    latestWork.current.set(current.id, result);
    if (courseRef.current === courseCode && workRef.current?.id === current.id) display(result);
    return result;
  }
  async function choose(task: () => Promise<Work>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await task();
      if (courseRef.current === courseCode) display(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const staff = ["teacher", "teacher_admin"].includes(inbox?.role ?? role);
  const calendar = inbox?.policy && loopbackHosts.has(window.location.hostname) &&
    loopbackHosts.has(new URL(base, window.location.href).hostname) ? inbox.policy : null;
  return (
    <main className="review-workspace">
      <a href={returnHref}>Return to course</a>
      <h1>Text review</h1>
      {error && <p role="alert">{error}</p>}
      {work ? (
        <>
          <button onClick={() => void choose(() => call("/works/" + work.id))}>Refresh review</button>
          <Detail
            work={work}
            write={write}
            staff={staff}
            close={() => {
              workRef.current = null;
              setWork(null);
              void refresh().catch((e) => setError(e.message));
            }}
          />
        </>
      ) : !inbox ? (
        <p role="status">Loading reviews…</p>
      ) : (
        <>
          <p>
            {courseCode} · {inbox.section} section
          </p>
          {inbox.enabled ? (
            <>
              {calendar && (
                <>
                  <p>
                    Local trial feedback target · 48 working hours from submission or return to the faculty queue.
                    Toronto time, {calendar.weekdays.map((d) => weekdays[d]).join(", ")} {calendar.startHour}:00–
                    {calendar.endHour}:00.{" "}
                    {calendar.closures.length
                      ? `Trial closure dates: ${calendar.closures.join(", ")}.`
                      : "No local trial closure dates configured."}
                  </p>
                  {inbox.role === "teacher_admin" && (
                    <Calendar policy={calendar} save={async (patch) => setInbox(await perform(patch))} />
                  )}
                </>
              )}
              <h2>{staff ? "Review queue" : "My reviews"}</h2>
              {inbox.queue.length ? (
                <ul>
                  {inbox.queue.map((w) => (
                    <li key={w.id}>
                      <button disabled={busy} onClick={() => void choose(() => call("/works/" + w.id))}>
                        {w.title} · {w.studentName}
                      </button>
                      <span>
                        {w.releasedAt
                          ? "Released"
                          : calendar && w.dueAt
                            ? `Faculty response due ${stamp(w.dueAt)} Toronto`
                            : w.waitingSince ? "Waiting for faculty" : "Waiting for student"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No work is in review.</p>
              )}
              {staff && (
                <>
                  <h2>Eligible submissions</h2>
                  {inbox.candidates.length ? (
                    <ul>
                      {inbox.candidates.map((c) => (
                        <li key={c.fileId ?? String(c.readerId) + c.cardId}>
                          <span>
                            {c.title} · {c.studentName} · {stamp(c.submittedAt)} Toronto
                          </span>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void choose(() =>
                                perform(
                                  c.kind === "file"
                                    ? { type: "openFile", submissionId: c.submissionId, fileId: c.fileId }
                                    : { type: "openSynthesis", readerId: c.readerId, cardId: c.cardId },
                                ),
                              )
                            }
                          >
                            Open text review
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No eligible new synthesis or plain-text submissions.</p>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <p>The text review pilot is closed for this section.</p>
              {inbox.role === "teacher_admin" && (
                <button
                  onClick={() =>
                    void perform({ type: "enable" })
                      .then(setInbox)
                      .catch((e) => setError(e.message))
                  }
                >
                  Enable for future work in this section
                </button>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
