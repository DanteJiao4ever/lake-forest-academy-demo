import { useState, type FormEvent } from "react";
import { FormulaText } from "./FormulaText";
import { request, useResource, type Exercise, type PackModule } from "./api";

function Answer({ exercise, name, value, change }: { exercise: Exercise; name: string; value: string; change: (v: string) => void }) {
  if (exercise.choices?.length) return <select aria-label={name} value={value} onChange={e => change(e.target.value)} required>
    <option value="">Select an answer</option>{exercise.choices.map(x => <option key={x}>{x}</option>)}</select>;
  return <textarea aria-label={name} value={value} onChange={e => change(e.target.value)} required rows={exercise.type === "numeric" ? 1 : 3}
    maxLength={1500} inputMode={exercise.type === "numeric" ? "decimal" : "text"}/>;
}

function Practice({ exercise, worksheet, save }: { exercise: Exercise; worksheet: string | null; save: (fields: object) => Promise<void> }) {
  const [itemText,setItemText]=useState("");
  async function showWorksheet() {
    if (!worksheet || !exercise.worksheetRef) return;
    try {
      const response = await fetch(worksheet,{credentials:"include",cache:"no-store"});
      if (!response.ok) throw Error("Unable to open this worksheet.");
      const lines=(await response.text()).split(/\r?\n/);
      const index=lines.findIndex(line=>line.startsWith(exercise.worksheetRef + " "));
      if(index < 0) throw Error("The referenced worksheet question is unavailable.");
      const end=lines.findIndex((line,i)=>i>index && line.trim()==="");
      setItemText(lines.slice(index,end<0?lines.length:end).join("\n"));
    }catch(e){setItemText((e as Error).message);}
  }
  const [answer, setAnswer] = useState(""), [reasoning, setReasoning] = useState("");
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); if (busy) return;
    setBusy(true);
    try {
      await save({ exerciseId: exercise.id, answer: answer.trim(), reasoning: reasoning.trim(), baseAttempt: exercise.attempts.length });
      setAnswer(""); setReasoning(""); setNotice("Your practice record has been saved.");
    } catch (err) { setNotice((err as Error).message); } finally { setBusy(false); }
  }
  return <details><summary>{exercise.title}</summary>
    {exercise.targetDate && <p>Practice target · <time dateTime={exercise.targetDate}>{exercise.targetDate}</time></p>}
    <p><FormulaText text={exercise.prompt}/></p>
    {exercise.attempts.length > 0 && <><ol aria-label="Saved responses">{exercise.attempts.map(a => <li key={a.id}>
      <strong>{a.answer}</strong><p>{a.reasoning}</p><p><FormulaText text={a.feedback}/></p>{a.teacherFeedback && <p>Teacher feedback · {a.teacherFeedback}</p>}</li>)}</ol>
      {exercise.hints?.length ? exercise.hints.map((hint,i)=><details key={hint}><summary>Hint {i+1}</summary><FormulaText text={hint}/></details>)
        : exercise.hint && <details><summary>Hint</summary><FormulaText text={exercise.hint}/></details>}
      {exercise.solution && <details><summary>Worked solution</summary><FormulaText text={exercise.solution}/></details>}</>}
    <form onSubmit={submit}><label>Your {exercise.attempts.length ? "revised " : ""}answer<Answer exercise={exercise} name={exercise.title + " answer"} value={answer} change={setAnswer}/></label>
      <label>{exercise.reasonPrompt || "Explain your reasoning"}<textarea value={reasoning} onChange={e=>setReasoning(e.target.value)} required maxLength={1500}/></label>
      <button disabled={busy || !answer.trim() || !reasoning.trim()}>{exercise.attempts.length ? "Save revision" : "Save answer"}</button>
    </form>{notice && <p role="status">{notice}</p>}
    {exercise.worksheetRef && worksheet && <button type="button" onClick={showWorksheet}>Worksheet · {exercise.worksheetRef}</button>}
    {itemText && <p role="status"><FormulaText text={itemText}/></p>}</details>;
}

function sameOriginLink(value: string, endpoint: string) {
  try {
    const target = new URL(value, endpoint);
    return target.origin === new URL(endpoint).origin ? target.href : null;
  } catch {
    return null;
  }
}

function goToReading(id: string) {
  const node = document.getElementById("pack-reading-" + id);
  if (node instanceof HTMLDetailsElement) { node.open = true; node.scrollIntoView({ block: "start" }); node.querySelector("summary")?.focus(); }
}

export function ModuleWorkspace({ endpoint, moduleNumber }: { endpoint: string; moduleNumber: number }) {
  const url = endpoint + "/modules/" + moduleNumber;
  const { data, setData, error, reload, unavailable } = useResource<PackModule>(url);
  const [answers, setAnswers] = useState<Record<string,string>>({}), [notice, setNotice] = useState(""), [saving, setSaving] = useState(false);
  if (unavailable) return <p role="status">These resources are unavailable for this account.</p>;
  if (error) return <p role="alert">{error} <button onClick={reload}>Retry</button></p>;
  if (!data) return <p role="status">Loading self-study resources…</p>;
  const module = data;
  const checkpoint = module.checkpoint;
  const questions = checkpoint.exerciseIds.map(id => module.exercises.find(item => item.id === id)).filter((x): x is Exercise => Boolean(x));
  const latest = checkpoint.attempts.at(-1);
  async function save(route: string, fields: object) {
    const updated = await request<PackModule>(url + route, "POST", { version: module.version, requestId: crypto.randomUUID(), ...fields });
    setData(updated);
  }
  async function check(e: FormEvent) {
    e.preventDefault(); if (saving) return; setSaving(true);
    try { await save("/checkpoint", { baseAttempt: checkpoint.attempts.length, answers }); setAnswers({}); setNotice("Checkpoint saved."); }
    catch (err) { setNotice((err as Error).message); } finally { setSaving(false); }
  }
  const worksheet = module.worksheetUrl && new URL(module.worksheetUrl, endpoint);
  return <>
    <section className="lfa-pace" aria-label="Paced guided reading"><h3>Guided reading</h3>
      {module.readings.map(r => <details key={r.id} id={"pack-reading-" + r.id}><summary>{r.title}</summary>
        {r.targetDate && <p>Reading target · <time dateTime={r.targetDate}>{r.targetDate}</time></p>}
        {r.paragraphs.map((p,i) => <p key={i}><FormulaText text={p}/></p>)}<h4>Worked example</h4><p><FormulaText text={r.workedExample}/></p><p><strong>Concept check</strong> · <FormulaText text={r.cue}/></p>
        {module.expectations?.filter(e=>e.readingId===r.id).map(e=><details key={e.id}><summary>{e.id} · {e.goal}</summary>
          <p><FormulaText text={e.teaching}/></p><h4>Try it</h4><p><FormulaText text={e.practice}/></p>
          <h4>Evidence for your worksheet</h4><p><FormulaText text={e.assignment}/></p></details>)}</details>)}
      {module.sources?.some(source => sameOriginLink(source.url, endpoint)) && <nav aria-label="Data and source files">
        <h4>Data and source files</h4>
        <ul>{module.sources.map(source => {
          const link = sameOriginLink(source.url, endpoint);
          return link ? <li key={link}><a href={link} target="_blank" rel="noreferrer">{source.title}</a></li> : null;
        })}</ul>
      </nav>}
    </section>
    <section className="lfa-pace" aria-label="Paced independent practice"><h3>Independent practice</h3>
      {module.exercises.filter(ex=>!ex.checkpointOnly).map(ex => <Practice key={ex.id} exercise={ex} worksheet={worksheet && worksheet.origin===new URL(endpoint).origin ? worksheet.href : null} save={fields=>save("/attempts", fields)}/>)}
    </section>
    <section className="lfa-pace" aria-label="Paced module checkpoint"><h3>Module checkpoint</h3>
      <p>Target <time dateTime={checkpoint.targetDate}>{checkpoint.targetDate}</time> · Mastery threshold {Math.round(checkpoint.threshold * 100)}%</p>
      {latest && <p role="status">Last result · {latest.correctCount}/{latest.total} · {latest.passed ? "Mastery met" : "Review and retry"}</p>}
      {latest?.itemFeedback && <ol aria-label="Checkpoint feedback">{latest.itemFeedback.map(item=><li key={item.exerciseId}>
        <strong>{item.ktca} · {item.correct ? "Met" : "Review"}</strong> <FormulaText text={item.feedback}/></li>)}</ol>}
      {latest?.missedReadingIds.map(id => <button key={id} className="pace-link" onClick={()=>goToReading(id)}>Revisit {module.readings.find(r => r.id === id)?.title || "guided reading"}</button>)}
      <form onSubmit={check}>{questions.map((q,i) => <label key={q.id}>{i + 1}. {q.ktca && "("+q.ktca+") "}<FormulaText text={q.prompt}/><Answer exercise={q} name={"Checkpoint question " + (i + 1)} value={answers[q.id] || ""} change={v=>setAnswers({...answers, [q.id]: v})}/></label>)}
        <button disabled={saving || !questions.length || questions.some(q=>!answers[q.id]?.trim())}>Submit checkpoint</button></form>
      {notice && <p role="status">{notice}</p>}
      {module.unitAssignment && <section aria-label="Unit assignment"><h4>{module.unitAssignment.title}</h4>
        <p><FormulaText text={module.unitAssignment.instructions}/></p>
        <ol>{module.unitAssignment.steps.map((step,i)=><li key={i}><FormulaText text={step}/></li>)}</ol>
        <p>{module.unitAssignment.remoteAlternative}</p><p>Assignment target · {module.unitAssignment.targetDate}</p></section>}
      {worksheet && worksheet.origin === new URL(endpoint).origin && <a href={worksheet.href} target="_blank" rel="noreferrer">Open unit worksheet</a>}
      {module.assignmentId && <a href={"#/assignment/" + encodeURIComponent(module.assignmentId)}>Submit work or view teacher feedback →</a>}
    </section>
  </>;
}
