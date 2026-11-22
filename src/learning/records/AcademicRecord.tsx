import {useCallback, useEffect, useRef, useState, type FormEvent} from "react";
import "./records.css";

interface Policy {
  version:string; pledge:string; enabled:boolean; applies:boolean; required:boolean;
  signedAt?:string; passedAt?:string; attempts:number;
  questions:{id:string;text:string;options:string[]}[];
}
interface Evidence {
  courseCode:string; studentId:string; studentName:string; generatedAt:string; section:string;
  plannedHours:number|null; observedSeconds:Record<string,number>; events:Record<string,number>;
  verified:{date:string;minutes:number;description:string;recordedBy:string}[]; note:string;
}
interface Result {policy:Policy; students:{id:string;name:string}[]; report:Evidence|null}
interface Props {courseCode:string; endpoint:string; role:string; csrf:()=>string; returnHref:string}
const date=(value:string)=>new Date(value).toLocaleString("en-CA",{timeZone:"America/Toronto",dateStyle:"medium",timeStyle:"short"});
function download(report:Evidence) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"}));
  const link=document.createElement("a");link.href=url;link.download=report.courseCode+"-learning-record.json";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const measures:Record<string,string>={all:"Across all activities",reading:"Reading",writing:"Writing",assessment:"Interactive assessments",seminar:"Text seminars"};
const counts:Record<string,string>={annotations:"Annotations",questions:"Discussion entries",replies:"Discussion replies",cardAttempts:"Card attempts",seminarsAttended:"Seminars attended",seminarResponses:"Seminar responses"};
function InspectionReport({report}:{report:Evidence}) {
  return <section className="inspection-report"><h2>Learning evidence</h2><p>{report.studentName} · {report.courseCode} · {report.section} section</p>
    <p>Prepared {date(report.generatedAt)} Toronto time</p>
    <div className="record-actions"><button onClick={()=>download(report)}>Download JSON</button><button onClick={()=>window.print()}>Print or save PDF</button></div>
    <h3>Planned instruction</h3><p>{report.plannedHours===null?"Planned hours unavailable":report.plannedHours+" hours in published modules"}</p>
    <h3>Observed platform activity</h3><dl>{Object.entries(measures).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{report.observedSeconds[key]||0} seconds</dd></div>)}</dl>
    <h3>Recorded interactions</h3><dl>{Object.entries(counts).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{report.events[key]||0}</dd></div>)}</dl>
    <h3>Teacher-verified learning</h3>{report.verified.length?<ul>{report.verified.map((item,i)=><li key={i}>{item.date} · {item.minutes} minutes · {item.recordedBy}<p>{item.description}</p></li>)}</ul>:<p>No additional learning evidence has been recorded.</p>}
    <p>{report.note}</p></section>;
}
export function AcademicRecord({courseCode,endpoint,role,csrf,returnHref}:Props) {
  const student=role==="student",base=endpoint+"/v1/courses/"+encodeURIComponent(courseCode)+"/academic-record";
  const [selected,select]=useState(""),[state,setState]=useState<Result|null>(null),[pending,setPending]=useState(false),[error,setError]=useState(""),[status,setStatus]=useState("");
  const [accepted,accept]=useState(false),[answers,setAnswers]=useState<Record<string,number>>({});
  const key=useRef<{signature:string;id:string}|null>(null),loadCount=useRef(0);
  const load=useCallback(async()=>{
    const seq=++loadCount.current;
    const res=await fetch(base+(selected?"?studentId="+encodeURIComponent(selected):""),{credentials:"include",cache:"no-store"});
    const data=await res.json();if(!res.ok)throw new Error(data.error?.message||"Could not load this record.");
    if(seq===loadCount.current)setState(data);
  },[base,selected]);
  useEffect(()=>{setError("");setState(null);void load().catch(e=>setError(e.message));return ()=>{loadCount.current++;};},[load]);
  async function act(data:Record<string,unknown>) {
    setPending(true);setStatus("");setError("");
    try {
      const res=await fetch(base+"/actions",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","X-CSRF-Token":csrf()},body:JSON.stringify(data)});
      const body=await res.json();if(!res.ok)throw new Error(body.error?.message||"Unable to save.");
      await load();setStatus(data.type==="quiz"?(body.policy.passedAt?"Integrity quiz passed. Continue to your course learning path.":"Review your choices and try again. A correct answer is required for every question."):"Saved.");return true;
    } catch(e){setError(e instanceof Error?e.message:"Could not update this record.");return false;}
    finally{setPending(false);}
  }
  async function verify(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();const form=e.currentTarget,fields=new FormData(form);
    const payload={type:"evidence",studentId:selected,date:fields.get("date"),minutes:Number(fields.get("minutes")),description:String(fields.get("description")).trim()};
    const signature=JSON.stringify(payload);if(key.current?.signature!==signature)key.current={id:crypto.randomUUID(),signature};
    if(await act({...payload,requestId:key.current.id})){key.current=null;form.reset();}
  }
  const p=state?.policy;
  return <main className="academic-record" id="main-content"><header><a href={returnHref}>← Return to course</a><p>{courseCode}</p><h1>Academic record</h1></header>
    {error && <p role="alert">{error} <button onClick={()=>void load().catch(e=>setError(e.message))}>Reload</button></p>}
    <p role="status">{status}</p>{!state&&!error&&<p>Loading your academic record…</p>}
    {p&&<section className="record-policy"><h2>Module 0 · Academic integrity</h2>
      {student?<><p>{p.passedAt?"Completed "+date(p.passedAt):p.applies?"Read the pledge and pass all three questions to unlock Unit 1.":"Your enrolment can access its scheduled modules."}</p>
        {p.applies&&!p.passedAt&&<><blockquote>{p.pledge}</blockquote>{!p.signedAt?<form onSubmit={e=>{e.preventDefault();void act({type:"sign",accepted:true,version:p.version});}}>
          <label><input required type="checkbox" checked={accepted} onChange={e=>accept(e.target.checked)}/> I have read and agree to this pledge.</label><button disabled={pending||!accepted}>Sign pledge</button></form>:
          <form onSubmit={e=>{e.preventDefault();void act({type:"quiz",version:p.version,answers});}}>
            {p.questions.map(q=><fieldset key={q.id}><legend>{q.text}</legend>{q.options.map((o,i)=><label key={o}><input type="radio" name={q.id} required checked={answers[q.id]===i} onChange={()=>setAnswers({...answers,[q.id]:i})}/>{o}</label>)}</fieldset>)}
            <button disabled={pending}>Check integrity quiz</button></form>}</>}</>:<><p>{p.enabled?"Required for new enrolments in this section.":"Module 0 is available for a prospective cohort rollout."}</p>
        {!p.enabled&&role==="teacher_admin"&&<button disabled={pending} onClick={()=>void act({type:"enable"})}>Require Module 0 for future enrolments</button>}</>}</section>}
    {state&&!student&&<label className="record-select">Student <select aria-label="Student" value={selected} onChange={e=>{select(e.target.value);setStatus("");}}><option value="">Select a student</option>{state.students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
    {state?.report&&<InspectionReport report={state.report}/>}
    {state?.report&&!student&&<form className="record-verification" onSubmit={verify}><h2>Verify additional learning</h2>
      <label>Activity date<input name="date" type="date" required/></label><label>Minutes<input name="minutes" type="number" required min="1" max="1440"/></label>
      <label>Activity and evidence<textarea name="description" required minLength={4} maxLength={1000}/></label><button disabled={pending}>Record verified activity</button></form>}
  </main>;
}
