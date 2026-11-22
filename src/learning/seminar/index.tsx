import { useCallback, useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./seminar.css";

export interface SeminarProps {
  courseCode: string; endpoint: string; csrf: string | (() => string); role: string; returnHref: string;
}
type Stage = "prepared" | "board" | "blind" | "discussion" | "finished";
type Block = {text:string;prompt?:string};
type Entry = {cursor:number;at:string;kind:string;payload:{text?:string;responses?:string[];speaker?:string;stepIndex?:number}};
type Room = {id:string;title:string;stage:Stage;stepIndex:number;cursor:number};
type FullRoom = Room & {events:Entry[];board?:Block[];pool?:{id:string;text:string;author:string}[];ownResponse?:string|null};
type Api = <T>(suffix:string, body?:Record<string,unknown>)=>Promise<T>;
const labels:Record<Stage,string> = {prepared:"Prepared",board:"Board open",blind:"Blind responses open",discussion:"Discussion open",finished:"Finished"};

function MathText({value,display}:{value:string;display?:boolean}) {
  const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    if (!ref.current) return;
    try {katex.render(value,ref.current,{displayMode:display,trust:false,strict:"ignore",throwOnError:false,maxExpand:100,maxSize:10});}
    catch {ref.current.textContent=value;}
  },[value,display]);
  return <span ref={ref} aria-label={value}>{value}</span>;
}

function inline(source:string) {
  return source.split(/(\$[^$\n]+\$|\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g).map((part,i)=>{
    if(part.startsWith("$") && part.endsWith("$") && part.length>2) return <MathText key={i} value={part.slice(1,-1)} />;
    if(part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if(part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1,-1)}</em>;
    if(part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1,-1)}</code>;
    return part;
  });
}

function BoardText({text}:{text:string}) {
  return <div className="seminar-prose">{text.split(/(\$\$[\s\S]*?\$\$)/g).map((block,i)=>{
    if(block.startsWith("$$") && block.endsWith("$$")) return <MathText key={i} value={block.slice(2,-2)} display />;
    return block.split(/\n\s*\n/).filter(Boolean).map((part,j)=>{
      const key=i+"-"+j;
      if(/^#{1,3} /.test(part)) return <h4 key={key}>{inline(part.replace(/^#{1,3} /,""))}</h4>;
      const lines=part.split("\n");
      if(lines.every(line=>/^[-*] /.test(line))) return <ul key={key}>{lines.map((line,n)=><li key={n}>{inline(line.slice(2))}</li>)}</ul>;
      return <p key={key}>{inline(part)}</p>;
    });
  })}</div>;
}

function Preparation({create,busy}:{create:(title:string,board:Block[])=>Promise<void>;busy:boolean}) {
  const [title,setTitle]=useState("");
  const [blocks,setBlocks]=useState<Block[]>([{text:""}]);
  function edit(i:number,field:"text"|"prompt",value:string) {
    setBlocks(items=>items.map((item,index)=>i===index ? {...item,[field]:value} : item));
  }
  return <details className="seminar-panel"><summary>Prepare a seminar</summary>
    <form onSubmit={async e=>{e.preventDefault();await create(title,blocks.map(b=>b.prompt?.trim() ? b : {text:b.text}));}}>
      <label>Seminar title<input required maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} /></label>
      {blocks.map((b,i)=><fieldset key={i}><legend>Board step {i+1}</legend>
        <label>Board text<textarea required maxLength={6000} placeholder="Use paragraphs, **emphasis**, lists or $math$." value={b.text} onChange={e=>edit(i,"text",e.target.value)} /></label>
        <label>Blind prompt (optional)<textarea maxLength={1000} value={b.prompt||""} onChange={e=>edit(i,"prompt",e.target.value)} /></label>
        {blocks.length>1 && <button type="button" onClick={()=>setBlocks(blocks.filter((_,n)=>n!==i))}>Remove step</button>}
      </fieldset>)}
      <button type="button" disabled={blocks.length>=30} onClick={()=>setBlocks([...blocks,{text:""}])}>Add board step</button>
      <button className="primary" disabled={busy}>Save prepared seminar</button>
    </form></details>;
}

function Activity({entry}:{entry:Entry}) {
  const p=entry.payload;
  if(entry.kind==="finished") return <li><strong>Seminar finished</strong></li>;
  if(entry.kind==="spotlight") return <li><h3>Selected perspectives</h3>{p.responses?.map((s,i)=><blockquote key={i}><strong>Perspective {i+1}</strong><p>{s}</p></blockquote>)}</li>;
  const label=entry.kind==="board" ? "Board step "+Number((p.stepIndex??0)+1) : entry.kind==="blind" ? "Blind prompt" : p.speaker ?? "Discussion";
  return <li><h3>{label}</h3>{entry.kind==="board" ? <BoardText text={p.text||""}/> : <p>{p.text}</p>}</li>;
}

function RoomView({id,api,url,staff,onBack}:{id:string;api:Api;url:string;staff:boolean;onBack:()=>void}) {
  const [room,setRoom]=useState<FullRoom>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [live,setLive]=useState(false);
  const [draft,setDraft]=useState("");
  const [comment,setComment]=useState("");
  const [choices,setChoices]=useState<string[]>([]);
  const requestSerial=useRef(0),lastRequest=useRef<{key:string;id:string}|undefined>(undefined);
  const base="/"+id;
  const refresh=useCallback(async()=>{
    const serial=++requestSerial.current;
    try {
      const result=await api<FullRoom>(base);
      if(serial===requestSerial.current) {setRoom(result);setError("");}
    } catch(e) {if(serial===requestSerial.current) setError((e as Error).message);}
  },[api,base]);
  useEffect(()=>{void refresh();return ()=>{requestSerial.current++;};},[refresh]);
  const phase=room?.stage;
  const startCursor=useRef(0);
  if(room) startCursor.current=room.cursor;
  useEffect(()=>{
    if(!phase || phase==="prepared" || phase==="finished") return;
    const source=new EventSource(url+base+"/stream?after="+startCursor.current,{withCredentials:true});
    source.onopen=()=>setLive(true);
    source.onerror=()=>setLive(false);
    source.addEventListener("board",()=>{void refresh();});
    source.addEventListener("reconnect",()=>{setLive(false);void refresh();});
    return ()=>{source.close();};
  },[base,url,refresh,phase]);
  useEffect(()=>{
    if(phase==="finished") return;
    const timer=window.setInterval(()=>{if(!document.hidden && (!live || (staff && phase==="blind"))) void refresh();},4000);
    return ()=>window.clearInterval(timer);
  },[refresh,live,staff,phase]);
  useEffect(()=>{
    if(staff || !phase || phase==="prepared" || phase==="finished") return;
    let last=0,lastInput=Date.now(),pending=false;
    function active(){lastInput=Date.now();}
    function visibility(){last=0;if(!document.hidden) active();}
    for(const type of ["pointerdown","keydown","scroll","input"]) document.addEventListener(type,active,{capture:true,passive:true});
    document.addEventListener("visibilitychange",visibility);
    async function beat(){
      const now=Date.now();
      if(document.hidden || now-lastInput>180000 || !navigator.onLine){last=0;return;}
      if(pending) return;
      const elapsed=last ? Math.min(30,Math.floor((now-last)/1000)) : 0;
      last=now;pending=true;
      try {await api(base+"/actions",{type:"heartbeat",requestId:crypto.randomUUID(),seconds:elapsed});}catch{last=0;}finally{pending=false;}
    }
    void beat();
    const timer=window.setInterval(()=>void beat(),15000);
    return ()=>{clearInterval(timer);document.removeEventListener("visibilitychange",visibility);for(const type of ["pointerdown","keydown","scroll","input"]) document.removeEventListener(type,active,true);};
  },[phase,staff,api,base]);
  useEffect(()=>{setDraft("");setChoices([]);},[room?.stepIndex]);
  async function send(type:string,fields:Record<string,unknown>={}){
    if(!room || busy) return false;
    const body={type,...fields};
    const key=JSON.stringify(body);
    const requestId=lastRequest.current?.key===key ? lastRequest.current.id : crypto.randomUUID();
    lastRequest.current={key,id:requestId};setBusy(true);setError("");
    try {
      const next=await api<FullRoom>(base+"/actions",{...body,requestId});
      requestSerial.current++;setRoom(next);lastRequest.current=undefined;return true;
    }catch(e){setError((e as Error).message);return false;}finally{setBusy(false);}
  }
  const canRelease=staff && room?.board && room.stepIndex+1<room.board.length && (phase==="prepared" || phase==="discussion" || (phase==="board" && !room.board[room.stepIndex]?.prompt));
  return <><button type="button" onClick={onBack}>All seminars</button>
    {error && <p role="alert">{error} <button onClick={()=>void refresh()}>Reconnect</button></p>}
    {!room ? <p role="status">Loading seminar…</p> : <>
      <h1>{room.title}</h1><p className="seminar-status">{labels[room.stage]}{phase!=="finished" && phase!=="prepared" && " · "+(live ? "Live" : "Reconnecting")}</p>
      <div className="seminar-grid"><section className="seminar-panel" aria-label="Class board"><h2>Class board</h2>
        {room.events.length ? <ol className="seminar-events">{room.events.map(event=><Activity key={event.cursor} entry={event}/>)}</ol> : <p>Released board steps will appear here.</p>}
        {phase==="finished" && <a className="seminar-download" href={url+base+"/transcript"}>Download class transcript (JSON)</a>}
      </section><aside className="seminar-panel">
      {staff && <><h2>Instructor controls</h2><details><summary>Prepared board ({room.board?.length} steps)</summary><ol>{room.board?.map((b,i)=><li key={i}><BoardText text={b.text}/>{b.prompt&&<p>Blind prompt · {b.prompt}</p>}</li>)}</ol></details>
        {canRelease && <button disabled={busy} onClick={()=>void send("release",{cursor:room.cursor})}>Release board step {room.stepIndex+2}</button>}
        {phase==="board" && room.board?.[room.stepIndex]?.prompt && <button disabled={busy} onClick={()=>void send("open",{cursor:room.cursor})}>Open blind responses</button>}
        {phase==="blind" && <fieldset><legend>Private response pool</legend><p>Select one to three responses to share anonymously with the class.</p>
          {!room.pool?.length && <p>Waiting for responses.</p>}
          {room.pool?.map(r=><label className="seminar-choice" key={r.id}><input type="checkbox" checked={choices.includes(r.id)} disabled={!choices.includes(r.id)&&choices.length===3} onChange={e=>setChoices(e.target.checked ? [...choices,r.id] : choices.filter(id=>id!==r.id))}/><span><b>{r.author}</b><br/>{r.text}</span></label>)}
          <button disabled={busy || !choices.length} onClick={()=>void send("spotlight",{cursor:room.cursor,ids:choices})}>Share selected responses</button></fieldset>}
        {phase!=="prepared" && phase!=="finished" && <button disabled={busy} onClick={()=>void send("finish",{cursor:room.cursor})}>Finish seminar</button>}
      </>}
      {!staff && <><h2>Your response</h2>
        {room.ownResponse && <blockquote><strong>Submitted privately</strong><p>{room.ownResponse}</p></blockquote>}
        {phase==="blind" && !room.ownResponse && <form onSubmit={async e=>{e.preventDefault();if(await send("respond",{stepIndex:room.stepIndex,text:draft})) setDraft("");}}><label>Private response for your teacher<textarea required maxLength={3000} value={draft} onChange={e=>setDraft(e.target.value)}/></label><button className="primary" disabled={busy || !draft.trim()}>Submit blind response</button></form>}
        {phase==="board" && !room.ownResponse && <p>Watch the board for the next prompt.</p>}
      </>}
      {phase==="discussion" && <form onSubmit={async e=>{e.preventDefault();if(await send("comment",{stepIndex:room.stepIndex,text:comment})) setComment("");}}><label>Comment visible to the class<textarea required maxLength={3000} value={comment} onChange={e=>setComment(e.target.value)}/></label><button disabled={busy || !comment.trim()}>Post class comment</button></form>}
      </aside></div>
    </>}</>;
}

function SeminarList(props:SeminarProps) {
  const [rooms,setRooms]=useState<Room[]>([]),[roomId,setRoomId]=useState("");
  const [error,setError]=useState(""),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
  const [section,setSection]=useState("");
  const createKey=useRef<{body:string;id:string}|undefined>(undefined);
  const url=props.endpoint.replace(/\/$/,"")+"/v1/courses/"+encodeURIComponent(props.courseCode)+"/seminars";
  const csrf=useRef(props.csrf);csrf.current=props.csrf;
  const api:Api=useCallback(async<T,>(path:string,body?:Record<string,unknown>)=>{
    const token=typeof csrf.current==="function" ? csrf.current() : csrf.current;
    const res=await fetch(url+path,{credentials:"include",method:body ? "POST" : "GET",headers:body ? {"Content-Type":"application/json","X-CSRF-Token":token} : {},...(body&&{body:JSON.stringify(body)})});
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error?.message || "Seminar connection unavailable.");
    return res.json() as Promise<T>;
  },[url]);
  const refresh=useCallback(async()=>{
    try {const d=await api<{rooms:Room[];section:string}>("");setRooms(d.rooms);setSection(d.section);setLoaded(true);setError("");}
    catch(e){setError((e as Error).message);}
  },[api]);
  useEffect(()=>{if(roomId)return;void refresh();const timer=window.setInterval(()=>{if(!document.hidden)void refresh();},6000);return()=>clearInterval(timer);},[refresh,roomId]);
  async function create(title:string,board:Block[]) {
    setBusy(true);setError("");
    const body=JSON.stringify({title,board});
    const id=createKey.current?.body===body ? createKey.current.id : crypto.randomUUID();
    createKey.current={body,id};
    try {const room=await api<FullRoom>("",{id,title,board});setRoomId(room.id);createKey.current=undefined;}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  const staff=["teacher","teacher_admin"].includes(props.role);
  return <main className="lfa-seminar"><header><a href={props.returnHref}>Return to course</a><span>{props.courseCode}{section==="TEST"&&" · TEST section"}</span></header>
    {roomId ? <RoomView key={roomId} id={roomId} api={api} url={url} staff={staff} onBack={()=>setRoomId("")}/> :
    <><h1>Text seminars</h1>{error&&<p role="alert">{error} <button onClick={()=>void refresh()}>Retry</button></p>}
      {staff&&<Preparation busy={busy} create={create}/>}
      {rooms.length ? <ul className="seminar-rooms">{rooms.map(r=><li key={r.id}><button onClick={()=>setRoomId(r.id)}>{r.title}</button><span>{labels[r.stage]}</span></li>)}</ul> : <p role="status">{loaded ? "No seminars are available in this section." : "Loading seminars…"}</p>}
    </>}</main>;
}

export function SeminarWorkspace(props:SeminarProps) {
  return <SeminarList key={props.courseCode+props.role+props.endpoint} {...props}/>;
}
