import {useEffect,useState} from "react";
import type { Send } from "./types";
export function useActiveTime(send:Send,enabled:boolean) {
  const [active,setActive]=useState(false);
  useEffect(()=>{
    if(!enabled)return;
    let lastAction=Date.now(),since=lastAction,visible=!document.hidden, sending=false;
    let source="reading";
    const tick=()=>{
      const now=Date.now(),end=Math.min(now,lastAction+180000);
      setActive(visible && now<lastAction+180000);
      const seconds=visible ? Math.min(30, Math.floor((end-since)/1000)) : 0;
      if(sending || seconds<=0)return;
      since=end-((end-since)%1000);sending=true;void send({type:"heartbeat",seconds,source}).catch(()=>{}).finally(()=>{sending=false;});
    };
    const activity=(event:Event)=>{
      const target=event.target instanceof Element ? event.target : document.getSelection()?.anchorNode?.parentElement;
      const nextSource=target?.closest(".ProseMirror,textarea")?"writing":target?.closest("[data-card-id]")?"assessment":"reading";
      if (nextSource!==source){tick();source=nextSource;}
      const now=Date.now();if(now>=lastAction+180000)since=now;
      lastAction=now;setActive(!document.hidden);
    };
    const visibility=()=>{if(document.hidden){tick();visible=false;setActive(false);}
      else{visible=true;since=lastAction=Date.now();setActive(true);}};
    const events=["pointerdown","scroll","selectionchange","keydown","input"] as const;
    events.forEach(name=>document.addEventListener(name,activity,{capture:true,passive:true}));
    document.addEventListener("visibilitychange",visibility);setActive(visible);
    const interval=setInterval(tick,15000);
    return ()=>{clearInterval(interval);events.forEach(name=>document.removeEventListener(name,activity,true));document.removeEventListener("visibilitychange",visibility);};
  },[send,enabled]);
  return active;
}
