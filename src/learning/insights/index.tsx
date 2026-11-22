import {useEffect,useRef,useState} from "react";
import {ReportView} from "./Report";
import {Faculty} from "./Faculty";
import type {Report,Risk,Scope} from "./types";
import "./insights.css";

type Props={role:string;csrf:()=>string;apiBase?:string;courseCode?:string};
type Notice={studentId:string;studentName:string;courseCode:string;risk:Risk};
async function json(url:string,options:RequestInit={}) {
  const res=await fetch(url,{credentials:"include",cache:"no-store",...options});
  const body=await res.json();
  if(!res.ok) throw new Error(body.error?.message || "This record is unavailable.");
  return body;
}
const key=(s:{studentId:string;courseCode:string})=>s.courseCode+"/"+s.studentId;
export function InsightsWorkspace({role,csrf,apiBase="",courseCode}:Props) {
  const [scopes,setScopes]=useState<Scope[]|null>(null),[selected,setSelected]=useState("");
  const [report,setReport]=useState<Report|null>(null),[error,setError]=useState(""),[status,setStatus]=useState("");
  const [refresh,setRefresh]=useState(0),[offset,setOffset]=useState(0),[next,setNext]=useState<number|null>(null);
  const [alerts,setAlerts]=useState<Notice[]>([]),[saving,setSaving]=useState(false);
  const selection=useRef(selected); selection.current=selected;
  const base=apiBase.replace(/\/$/,"")+"/v1/insights";
  useEffect(()=>{
    const controller=new AbortController();setScopes(null);setError("");
    json(base+"/scopes",{signal:controller.signal}).then(body=>{
      const rows=(body.scopes as Scope[]).filter(s=>!courseCode || s.courseCode===courseCode);
      const preferred = new URLSearchParams(window.location.hash.split("?")[1]).get("student");
      const initial = rows.find(s=>s.studentId===preferred) || rows[0];
      setScopes(rows);setSelected(old=>rows.some(s=>key(s)===old)?old:initial?key(initial):"");
    }).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return ()=>controller.abort();
  },[base,courseCode,refresh]);
  useEffect(()=>{
    const controller=new AbortController();setReport(null);setStatus("");
    if(selected) json(base+"/"+selected,{signal:controller.signal}).then(setReport).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return ()=>controller.abort();
  },[base,selected,refresh]);
  useEffect(()=>{
    if(role==="observer") return;
    const controller=new AbortController();
    const query=new URLSearchParams({offset:String(offset)});
    if(courseCode)query.set("courseCode",courseCode);
    json(base+"/alerts?"+query,{signal:controller.signal}).then(body=>{setAlerts(body.students);setNext(body.nextOffset);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return ()=>controller.abort();
  },[role,base,courseCode,offset,refresh,saving]);
  async function write(payload:Record<string,unknown>,grant=false) {
    if(saving || !report) return false;
    setSaving(true);setError("");setStatus("");
    try {
      const result=await json(grant?base+"/grants":base+"/"+selected+"/actions",{
        method:"POST",headers:{"content-type":"application/json","x-csrf-token":csrf()},
        body:JSON.stringify(grant?{...payload,studentId:report.studentId,courseCode:report.courseCode}:{...payload,requestId:crypto.randomUUID()})});
      if(selection.current===selected){setReport(result);setStatus(grant?"Observer access updated.":"Version saved.");}return true;
    }catch(e){setError(e instanceof Error?e.message:"Could not save changes.");return false;}
    finally{setSaving(false);}
  }
  return <main className="insights"><header><h1>{role==="observer"?"Observer report":"Student insights"}</h1><button onClick={()=>setRefresh(n=>n+1)}>Refresh</button></header>
    {error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}
    {role!=="observer"&&<details className="ins-queue"><summary>At-risk roster</summary>
      {alerts.map(s=>{const flags=[s.risk.inactivity.flag,s.risk.scores.flag,s.risk.progress.flag];
        const reasons=["Inactivity","Recent grades","Behind plan"].filter((_,i)=>flags[i]===true);
        return <div key={key(s)}><button onClick={()=>setSelected(key(s))}>{s.studentName} · {s.courseCode}</button><span>{reasons.length?reasons.join(" · "):flags.includes(null)?"Insufficient evidence for one or more checks":"Within thresholds"}</span></div>;})}
      {!alerts.length&&<p>No students in this scope.</p>}
      {offset>0&&<button onClick={()=>setOffset(n=>Math.max(0,n-25))}>Previous 25</button>}{next!==null&&<button onClick={()=>setOffset(next)}>Next 25</button>}
    </details>}
    {scopes===null ? (!error&&<p role="status">Loading authorized students…</p>) : scopes.length ? <label className="ins-select">Student and course<select value={selected} onChange={e=>{setError("");setSelected(e.target.value);}}>{scopes.map(s=><option key={key(s)} value={key(s)}>{s.studentName} · {s.courseCode}{s.testSection?" · TEST":""}</option>)}</select></label> : <p>No student reports are available to this account.</p>}
    {report&&key(report)===selected&&<><ReportView data={report}/>{role!=="observer"&&<fieldset className="ins-editor" disabled={saving}><Faculty key={selected} data={report} write={write} admin={role==="teacher_admin"}/></fieldset>}</>}
  </main>;
}
