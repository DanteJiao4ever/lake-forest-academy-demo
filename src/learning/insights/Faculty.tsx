import { useState } from "react";
import {dimensions,dimensionNames,skills,skillNames,type Report,type Write} from "./types";

export function Faculty({data,write,admin}:{data:Report;write:Write;admin:boolean}) {
  const [taskId,setTask]=useState(data.tasks[0]?.id??"");
  const [period,setPeriod]=useState("midterm");
  const [date,setDate]=useState("");
  const rubric=data.records.rubric[taskId],evidence=data.records.evidence[taskId],assessment=data.records.skills[period];
  const fmt=(form:HTMLFormElement)=>new FormData(form);
  return <section className="ins-faculty"><h3>Faculty records</h3>
    <details><summary>Dated progress target</summary><form onSubmit={async e=>{e.preventDefault();const f=fmt(e.currentTarget);await write({type:"plan",date,percent:Number(f.get("percent")),baseVersion:data.records.plan[date]?.version||0});}}>
      <label>Target date<input required type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
      <label>Expected module completion (%)<input key={date} name="percent" type="number" step=".1" min="0" max="100" required defaultValue={data.records.plan[date]?.data.percent}/></label>
      <button type="submit">Save target</button></form>
      {Object.values(data.records.plan).sort((a,b)=>a.key.localeCompare(b.key)).map(p=><p key={p.id}>{p.key} · {p.data.percent}%</p>)}</details>
    <details><summary>KTCA task rubric and evidence</summary>
      <label>Task<select value={taskId} onChange={e=>setTask(e.target.value)}>{data.tasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <form key={taskId+":"+rubric?.version} onSubmit={e=>{e.preventDefault();const f=fmt(e.currentTarget);void write({type:"rubric",taskId,weights:Object.fromEntries(dimensions.map(k=>[k,Number(f.get(k))])),baseVersion:rubric?.version||0});}}>
        <fieldset><legend>Task weights (%) · total 100</legend>{dimensions.map(k=><label key={k}>{dimensionNames[k]}<input name={k} required type="number" max="100" min="0" step=".1" defaultValue={rubric?.data.weights?.[k]??""}/></label>)}</fieldset>
        <button type="submit">Save rubric version</button>
      </form>
      {rubric&&<form key={"e"+taskId+":"+rubric.version+":"+evidence?.version} onSubmit={e=>{e.preventDefault();const f=fmt(e.currentTarget);void write({type:"evidence",taskId,rubricVersion:rubric.version,baseVersion:evidence?.version||0,note:f.get("note"),scores:Object.fromEntries(dimensions.map(k=>[k,f.get(k)?Number(f.get(k)):null]))});}}>
        <fieldset><legend>Student evidence · rubric v{rubric.version}</legend>{dimensions.map(k=><label key={k}>{dimensionNames[k]} score (%)<input name={k} type="number" min="0" max="100" step=".1" required={Boolean(rubric.data.weights?.[k])} defaultValue={evidence?.data.scores?.[k]??""}/></label>)}</fieldset>
        <label>Evidence supporting these scores<textarea name="note" required maxLength={1600} defaultValue={evidence?.data.note}/></label><button type="submit">Publish evidence</button>
      </form>}</details>
    <details><summary>Independent learning skills assessment</summary>
      <label>Report period<select value={period} onChange={e=>setPeriod(e.target.value)}><option value="midterm">Midterm</option><option value="final">Final</option></select></label>
      <form key={period+":"+assessment?.version} onSubmit={e=>{e.preventDefault();const f=fmt(e.currentTarget);void write({type:"skills",period,baseVersion:assessment?.version||0,ratings:Object.fromEntries(skills.map(k=>[k,f.get(k)])),comment:f.get("comment")});}}>
        {skills.map(k=><label key={k}>{skillNames[k]}<select name={k} required defaultValue={assessment?.data.ratings?.[k]||""}><option value="">Select a rating</option>{["E","G","S","N"].map(r=><option key={r}>{r}</option>)}</select></label>)}
        <label>Report comment<textarea name="comment" required maxLength={1600} defaultValue={assessment?.data.comment}/></label><button>Publish skills assessment</button>
      </form></details>
    {admin&&<details><summary>Observer access</summary><form onSubmit={e=>{e.preventDefault();const f=fmt(e.currentTarget);void write({observerEmail:f.get("email"),action:"grant"},true);}}>
      <label>Provisioned observer email<input required type="email" name="email"/></label><button>Grant read-only access</button></form>
      {data.grants?.filter(g=>g.active).map(g=><div key={g.email}>{g.email} <button onClick={()=>void write({observerEmail:g.email,action:"revoke"},true)}>Revoke</button></div>)}</details>}
    <details><summary>Version history</summary>{data.history.length ? <ol>{[...data.history].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(h=><li key={h.id}><details><summary>{h.kind} · {h.key} · v{h.version} · {new Date(h.createdAt).toLocaleString()}</summary><dl>{Object.entries(h.data).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{typeof v==="object"?Object.entries(v||{}).map(([n,x])=>n+" "+x).join(", "):String(v)}</dd></div>)}</dl></details></li>)}</ol>:<p>No saved versions.</p>}</details>
  </section>;
}
