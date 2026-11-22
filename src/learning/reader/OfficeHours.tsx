import { useState } from "react";
import type { ReaderState, Send } from "./types";

export function utcForLocal(value:string,zone:string) {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const guess=Date.parse(value+":00Z");
  const fmt=new Intl.DateTimeFormat("sv-SE",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  const local=(n:number)=>fmt.format(n).replace(" ","T");
  const offsets=new Set([-86400000,0,86400000].map(d=>Date.parse(local(guess+d)+":00Z")-(guess+d)));
  const candidates=[...offsets].map(o=>guess-o).filter(n=>local(n)===value);
  return candidates.length===1?new Date(candidates[0]).toISOString():null;
}
export function OfficeHours({state,send,close}:{state:ReaderState;send:Send;close:()=>void}) {
  const local=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC";
  const [zone,setZone]=useState(local),[time,setTime]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  async function act(payload:Record<string,unknown>){setBusy(true);setError("");try{await send(payload);setTime("");}catch(e){setError(e instanceof Error?e.message:"Unable to save.");}finally{setBusy(false);}}
  return <section className="reader-bookings" aria-label="Office hours">
    <div className="reader-panel-title"><h2>Office hours</h2><button onClick={close} aria-label="Close office hours">Close</button></div>
    {state.role==="student" && <form onSubmit={e=>{e.preventDefault();const preferredAt=utcForLocal(time,zone);
      if(!preferredAt || Date.parse(preferredAt)<=Date.now()){setError("Choose a future time that is unambiguous in this time zone.");return;}
      void act({type:"booking",preferredAt,timeZone:zone});}}>
      <p>Request a one-to-one meeting. Your teacher will confirm the time here.</p>
      <label>Time zone<select value={zone} onChange={e=>setZone(e.target.value)}>{[...new Set([local,"America/Toronto","Asia/Singapore","UTC"])].map(z=><option key={z}>{z}</option>)}</select></label>
      <label>Preferred date and time<input type="datetime-local" required value={time} onChange={e=>setTime(e.target.value)}/></label>
      <button disabled={busy}>Request meeting</button></form>}
    {state.bookings.map(b=><article key={b.id}><strong>{b.studentName}</strong><p>{new Date(b.preferredAt).toLocaleString("en-CA",{timeZone:b.timeZone})} · {b.timeZone} · {b.status}</p>
      {state.role!=="student" && b.status==="requested" && ["confirmed","declined"].map(status=><button key={status} disabled={busy} onClick={()=>void act({type:"bookingReview",bookingId:b.id,status})}>{status==="confirmed"?"Confirm":"Decline"}</button>)}</article>)}
    {error && <p role="alert">{error}</p>}
  </section>;
}
