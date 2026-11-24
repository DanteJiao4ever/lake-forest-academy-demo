import { useState } from "react";
import { pacingEndpoint, useResource, moduleHref, type Timeline, type MilestoneDetails } from "./api";
import { ModuleWorkspace } from "./Module";
import {FormulaText} from "./FormulaText";
import "./pacing.css";

function MilestonePanel({ endpoint, id }: { endpoint: string; id: string }) {
  const { data, error, reload } = useResource<MilestoneDetails>(endpoint + "/milestones/" + encodeURIComponent(id));
  if (error) return <p role="alert">{error} <button onClick={reload}>Retry</button></p>;
  if (!data) return <p role="status">Loading materials…</p>;
  return <div>{data.materials?.map((m,i)=>m.text.startsWith("Worked reasoning ") ? <details key={i}><summary>{m.text.split("\n")[0]}</summary>
    <p><FormulaText text={m.text.slice(m.text.indexOf("\n")+1)}/></p></details> : <section key={i}><h4>{m.title}</h4><p><FormulaText text={m.text}/></p></section>)}
    </div>;
}
function StudentTimeline({ endpoint, course }: { endpoint: string; course: string }) {
  const { data, error, reload } = useResource<Timeline>(endpoint);
  const [selected, setSelected] = useState("");
  if (error) return <p role="alert">{error} <button onClick={reload}>Retry timeline</button></p>;
  if (!data?.enabled) return null;
  const mid = data.milestones.find(m=>m.id==="midterm");
  const horizon = new Date(Date.parse(data.today) + 6 * 86400000).toISOString().slice(0, 10);
  const focus = data.modules.filter(m => m.status !== "completed" && m.startDate <= horizon && m.endDate >= data.today);
  return <section className="lfa-pace" aria-label="Pacing timeline"><h2>Pacing timeline</h2>
    <p>Course target · {data.endDate} · {(data.weeklyMinutes / 60).toFixed(1)} hours per week on average</p>
    <label>Mastery progress · {data.progressPercent}%<progress max={100} value={data.progressPercent}/></label>
    {mid?.remainingModules != null && <p>{mid.remainingModules} modules remaining to midterm</p>}
    {focus.length > 0 && <p><strong>This week</strong> · {focus.map(m=>m.title).join(" · ")}</p>}
    <ol className="pace-modules">{data.modules.map(m=><li key={m.number}>
      {m.status==="locked" ? <strong>{m.title}</strong> : <a href={moduleHref(course,m.number)}>{m.title}</a>}
      <small>{m.status.replaceAll("_"," ")} · Target {m.endDate}{m.reason && " · " + m.reason.replaceAll("_"," ")}</small></li>)}</ol>
    {data.milestones.map(m=><div key={m.id}><button aria-expanded={selected===m.id} onClick={()=>setSelected(selected===m.id ? "" : m.id)}>{m.title} · {m.date}</button>
      {selected===m.id && <MilestonePanel key={m.id} endpoint={endpoint} id={m.id}/>}</div>)}</section>;
}
export function PacingWorkspace({course, moduleNumber}: {course: string; moduleNumber: number | null}) {
  const endpoint = pacingEndpoint(course);
  if (!endpoint) return null;
  return moduleNumber === null
    ? <StudentTimeline course={course} endpoint={endpoint}/>
    : <ModuleWorkspace key={moduleNumber} endpoint={endpoint} moduleNumber={moduleNumber}/>;
}
