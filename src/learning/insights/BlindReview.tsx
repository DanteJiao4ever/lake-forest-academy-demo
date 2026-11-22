import {useState} from "react";
import type {ReaderState,Send} from "../reader/types";
type Candidate={readerId:string;cardId:string;studentName:string;text:string;featured:boolean};
type ReviewState=ReaderState & {peerCandidates?:Candidate[];pasteReviews?:{cardId:string;studentName:string;text:string}[]};
export function BlindReview({state,send}:{state:ReviewState;send:Send}){
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  if(state.role==="student")return null;
  async function feature(p:Candidate){
    if(busy)return;
    setBusy(true);setError("");
    try{await send({type:"featurePeer",readerId:p.readerId,cardId:p.cardId});}catch(e){setError(e instanceof Error?e.message:"Could not feature the response.");}finally{setBusy(false);}
  }
  return <section><h2>Post-first responses</h2>
    {state.peerCandidates?.length ? state.peerCandidates.map(p=><details key={p.readerId+p.cardId}><summary>{p.studentName} · {state.lesson.cards.find(c=>c.id===p.cardId)?.title}</summary>
      <p>{p.text}</p>{p.featured?<p>Featured anonymously in this section.</p>:<button disabled={busy} onClick={()=>void feature(p)}>Feature anonymously</button>}</details>):<p>No class responses submitted yet.</p>}
    {Boolean(state.pasteReviews?.length)&&<details><summary>Responses marked for paste review ({state.pasteReviews?.length})</summary>
      {state.pasteReviews?.map((p,i)=><p key={i}><strong>{p.studentName}</strong> · {p.text}</p>)}</details>}
    {error&&<p role="alert">{error}</p>}
  </section>;
}
