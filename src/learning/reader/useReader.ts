import { useCallback, useEffect, useRef, useState } from "react";
import type { ReaderConnection, ReaderState } from "./types";

export function useReader(connection:ReaderConnection) {
  const [state,setState]=useState<ReaderState|null>(null);
  const [error,setError]=useState("");
  const [integrityRequired,setIntegrityRequired]=useState(false);
  const current=useRef<ReaderState|null>(null);
  const alive=useRef(false);
  const pending=useRef(Promise.resolve());
  const mutation=useRef(0);
  const apply=useCallback((s:ReaderState)=>{
    if (!s.lesson?.version || !Array.isArray(s.lesson.blocks)) throw new Error("The classroom returned an incomplete lesson.");
    if (alive.current && (!current.current || s.revision >= current.current.revision)) {
      current.current=s; setState(s);
    }
    return s;
  },[]);
  const refresh=useCallback(async ()=>{
    const generation=mutation.current;
    try {
      const response=await fetch(connection.endpoint,{credentials:"include",cache:"no-store"});
      const body=await response.json();
      if (alive.current && generation===mutation.current) setIntegrityRequired(body.error?.code==="MODULE_ZERO_REQUIRED");
      if (!response.ok) {
        if (alive.current && generation===mutation.current && [401,403,404,409].includes(response.status)) {
          current.current=null;setState(null);
        }
        throw new Error(response.status===403 ? "This classroom is outside your current course access." : (body.error?.message || "The classroom could not be opened."));
      }
      if (generation===mutation.current && alive.current) { apply(body); setError(""); }
    } catch(err){if(alive.current)setError(err instanceof Error ? err.message : "The classroom is offline.");}
  },[connection.endpoint,apply]);
  useEffect(()=>{
    alive.current=true;void refresh();
    const timer=window.setInterval(()=>{if(document.visibilityState==="visible") void refresh();},25000);
    return ()=>{alive.current=false;clearInterval(timer);};
  },[refresh]);
  const send=useCallback((action:Record<string,unknown>):Promise<ReaderState>=>{
    const requestId=crypto.randomUUID();
    const run=async ()=>{
      if(!alive.current || !current.current) throw new Error("Open the lesson again.");
      const body=JSON.stringify({...action,version:current.current.lesson.version,requestId});
      const request=()=>fetch(connection.endpoint+"/actions",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","X-CSRF-Token":connection.csrf()},body});
      mutation.current++;
      let response:Response;
      try{response=await request();}catch{ if(!alive.current)throw new Error("Classroom closed."); response=await request(); }
      const result=await response.json();
      mutation.current++;
      if(!response.ok){if(response.status===409)void refresh();throw new Error(result.error?.message || "Could not save. Please try again.");}
      return apply(result);
    };
    const result=pending.current.then(run);
    pending.current=result.then(()=>{},()=>{});
    return result;
  },[connection,refresh,apply]);
  return {state,error,send,refresh,integrityRequired};
}
