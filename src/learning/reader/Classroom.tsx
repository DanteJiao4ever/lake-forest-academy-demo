import { useEffect, useRef, useState, type CSSProperties } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./reader.css";
import { LessonCard } from "../cards/LessonCard";
import { locateQuote, quoteAt } from "./anchors";
import { ContextPanel, type SideTab } from "./ContextPanel";
import { OfficeHours } from "./OfficeHours";
import type { Anchor, ReaderConnection, ReaderState, Send } from "./types";
import { useReader } from "./useReader";
import { BlindReview } from "../insights/BlindReview";
import { useActiveTime } from "./useActiveTime";

function Formula({value,display=false}:{value:string;display?:boolean}) {
  return <span className="reader-formula" dangerouslySetInnerHTML={{__html:katex.renderToString(value,{displayMode:display,throwOnError:false,trust:false,strict:"ignore",output:"htmlAndMathml"})}}/>;
}
export function Classroom({connection}:{connection:ReaderConnection}) {
  const {state,error,send,refresh,integrityRequired}=useReader(connection);
  return state ? <Workspace state={state} connection={connection} send={send} syncError={error}/> :
    <main className="reader-loading" id="main-content"><h1>Interactive classroom</h1><p role="status">{error || "Opening your lesson…"}</p>
    {error && <button onClick={()=>void refresh()}>Try again</button>} <a href={connection.returnHref}>Return to course</a>
    {integrityRequired && connection.integrityHref && <p><a href={connection.integrityHref}>Open Module 0</a></p>}
    {!integrityRequired && connection.fallbackHref && <p><a href={connection.fallbackHref} target="_blank" rel="noreferrer">Open course reader</a></p>}</main>;
}
function Workspace({state,send,connection,syncError}:{state:ReaderState;send:Send;connection:ReaderConnection;syncError:string}){
  const {lesson}=state;
  const [panel,setPanel]=useState<"left"|"right"|null>(null),[tab,setTab]=useState<SideTab>("Threads"),[left,setLeft]=useState("Outline");
  const [focus,setFocus]=useState(false),[appearance,setAppearance]=useState(false),[dark,setDark]=useState(false),[font,setFont]=useState(16),[width,setWidth]=useState(374);
  const [booking,setBooking]=useState(false),[showNeeds,setShowNeeds]=useState(false),[next,setNext]=useState(false);
  const [activeId,setActiveId]=useState(""),[flash,setFlash]=useState(""),[quote,setQuote]=useState<Anchor|null>(null);
  const [selected,setSelected]=useState<{a:Anchor;x:number;y:number}|null>(null),[status,setStatus]=useState("");
  const [pad,editPad]=useState(state.scratchpad), padBase=useRef(state.scratchpad),lastLocal=useRef(state.scratchpad);
  const [pending,setPending]=useState(false),[outlineHidden,setOutlineHidden]=useState(false);
  const body=useRef<HTMLElement>(null);
  const isActive=useActiveTime(send,state.role==="student");
  useEffect(()=>{if(padBase.current===lastLocal.current){editPad(state.scratchpad);lastLocal.current=padBase.current=state.scratchpad;}},[state.scratchpad]);
  function setPad(text:string){lastLocal.current=text;editPad(text);}
  async function savePad(text=pad){
    if(state.scratchpad!==padBase.current)throw new Error("Your scratchpad changed in another tab. Copy your draft before reopening this lesson.");
    await send({type:"scratchpad",text,baseRevision:state.revision});padBase.current=text;
  }
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==="\\"){e.preventDefault();setFocus(f=>!f);setPanel(null);}if(e.key==="Escape"){setSelected(null);setPanel(null);setBooking(false);setAppearance(false);setShowNeeds(false);}};
    document.addEventListener("keydown",key);return ()=>document.removeEventListener("keydown",key);
  },[]);
  useEffect(()=>{
    const target=body.current;if(!target)return;
    const visible=new Map<Element,number>();
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting)visible.set(entry.target,entry.intersectionRatio);else visible.delete(entry.target);}
      const first=[...visible.keys()].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
      if(first)setActiveId((first as HTMLElement).dataset.paragraph||"");
    },{root:null,rootMargin:"-60px 0px -48% 0px",threshold:[0,0.3]});
    target.querySelectorAll("[data-paragraph]").forEach(el=>observer.observe(el));return ()=>observer.disconnect();
  },[lesson.id,next]);
  function scrollTo(id:string){setNext(false);requestAnimationFrame(()=>{const el=document.getElementById("lr-"+id);el?.scrollIntoView({block:"center"});el?.focus({preventScroll:true});});}
  function jump(a:Anchor){const p=lesson.paragraphs.find(p=>p.id===a.paragraphId);if(!p || locateQuote(p.text,a)===null){setStatus("The source text has changed. The original quotation is preserved in your notes.");return;}
    setPanel(null);setActiveId(p.id);setFlash(p.id);scrollTo(p.id);window.setTimeout(()=>setFlash(f=>f===p.id?"":f),1600);}
  function capture(){
    const selection=window.getSelection();if(!selection?.rangeCount || selection.isCollapsed)return;
    const range=selection.getRangeAt(0);
    const el=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement) as Element|null;
    const p=el?.closest<HTMLElement>("[data-paragraph]");if(!p || !p.contains(range.endContainer))return;
    const text=lesson.paragraphs.find(v=>v.id===p.dataset.paragraph)?.text;if(!text)return;
    const exact=range.toString();const before=range.cloneRange();before.selectNodeContents(p);before.setEnd(range.startContainer,range.startOffset);
    const start=before.toString().length;if(!exact.trim() || exact.length>2000 || text.slice(start,start+exact.length)!==exact)return;
    const rect=range.getBoundingClientRect();setSelected({a:quoteAt(text,start,start+exact.length,p.dataset.paragraph!,lesson.version),x:Math.max(8,Math.min(innerWidth-310,rect.left)),y:Math.max(60,Math.min(innerHeight-125,rect.top-68))});
  }
  function toolsForParagraph(id:string,text:string,el:HTMLElement){
    const rect=el.getBoundingClientRect();setSelected({a:quoteAt(text,0,Math.min(2000,text.length),id,lesson.version),x:Math.max(8,Math.min(innerWidth-310,rect.left)),y:Math.max(60,Math.min(innerHeight-125,rect.bottom))});
  }
  async function highlight(color:string){if(!selected)return;setPending(true);try{await send({type:"annotation",anchor:selected.a,color});setSelected(null);setStatus("Highlight saved.");}catch(e){setStatus((e as Error).message);}finally{setPending(false);}}
  function markText(text:string,id:string){
    const marks=state.notes.filter(n=>n.anchor.paragraphId===id).flatMap(n=>{const pos=locateQuote(text,n.anchor);return pos===null?[]:[{pos,end:pos+n.anchor.exact.length,color:n.color}];});
    const points=[...new Set([0,text.length,...marks.flatMap(m=>[m.pos,m.end])])].sort((a,b)=>a-b);
    return points.slice(0,-1).map((a,i)=>{const m=marks.find(m=>m.pos<=a&&m.end>a);const v=text.slice(a,points[i+1]);return m?<mark key={a} data-color={m.color}>{v}</mark>:<span key={a}>{v}</span>;});
  }
  const firstUnmet=state.unmet[0];const trial=lesson.id==="cia4u-demand-2-3";
  return <main id="main-content" className="learning-reader" data-lfa-theme={dark?"dark":"light"} data-focus={focus} data-panel={panel||""} data-outline-hidden={outlineHidden} style={{"--rail-width":width+"px","--reader-size":font+"px"} as CSSProperties}>
    <header className="reader-top">
      <a href={connection.returnHref} aria-label="Return to course">← <span className="reader-long-label">Course</span></a>
      <span className="reader-crumb">{lesson.courseCode} / {lesson.unit}</span>
      {state.role==="student" && <span className="reader-time" data-active={isActive} title="Pauses after 180 seconds without activity, and when the page is hidden"><span className="reader-long-label">{isActive?"Active":"Paused"} · </span>{Math.floor(state.activeSeconds/60)}m</span>}
      <button onClick={()=>{setPanel(p=>p==="left"?null:"left");setOutlineHidden(v=>!v);}} aria-label="Toggle outline">Outline</button>
      <button aria-label="Reading appearance" aria-expanded={appearance} onClick={()=>setAppearance(!appearance)}>Aa</button>
      <button aria-pressed={focus} onClick={()=>{setFocus(!focus);setPanel(null);}}>Focus</button>
      <button aria-label="Office hours" onClick={()=>setBooking(!booking)}><span className="reader-long-label">Office hours</span><span className="reader-short-label" aria-hidden="true">1:1</span></button>
      <button onClick={()=>setPanel(p=>p==="right"?null:"right")}>Notes</button>
    </header>
    {appearance && <div className="reader-appearance"><label>Text size <input aria-label="Text size" type="range" min={15} max={23} value={font} onChange={e=>setFont(+e.target.value)}/></label>
      <button aria-pressed={dark} onClick={()=>setDark(!dark)}>Dark mode</button></div>}
    {booking && <OfficeHours state={state} send={send} close={()=>setBooking(false)}/>}
    <div className="reader-layout">
      <aside className="reader-outline" aria-label="Lesson navigation">
        <div className="reader-context-nav">{["Outline","My annotations"].map(t=><button key={t} aria-pressed={left===t} onClick={()=>setLeft(t)}>{t}</button>)}<button className="reader-close-panel" onClick={()=>setPanel(null)}>Close</button></div>
        {left==="Outline"?<nav><button onClick={()=>{window.scrollTo(0,0);setPanel(null);}}>{lesson.title}</button>
          {lesson.cards.map(c=>{const cs=state.cards[c.id];const locked=c.type==="SynthesisGate" && state.unmet.some(id=>id!==c.id);
            const label=cs?.completed?"Mastered":locked?"Locked":cs?"In progress":"Not started";return <button key={c.id} title={locked?"Complete the required checks and discussion first.":label} onClick={()=>{setPanel(null);scrollTo(c.id);}}><span aria-label={label}>{cs?.completed?"●":locked?"🔒":cs?"◐":"○"}</span>{c.title}</button>;})}</nav>:
          <div>{!state.notes.length&&<p>Highlight a passage to keep it here.</p>}{state.notes.map(n=><button key={n.id} className="reader-quote" onClick={()=>jump(n.anchor)}>{n.anchor.exact}</button>)}</div>}
      </aside>
      <section className="reader-canvas" ref={body} aria-label="Lesson content" onPointerUp={capture} onKeyUp={capture}>
        {next && state.nextUnlocked && state.nextReading ? <><p className="reader-kicker">Follow-up reading</p><h1>{state.nextReading.title}</h1><p>{state.nextReading.text}</p><button onClick={()=>setNext(false)}>Back to investigation</button></>:
        <><p className="reader-kicker">{trial?"Independent demonstration · No course credit":lesson.courseCode+" · Interactive lesson"}</p><h1>{lesson.title}</h1>
        {lesson.blocks.map(b=>{
          if(b.type==="heading")return <h2 key={b.id} id={"lr-"+b.id}>{b.text}</h2>;
          if(b.type==="math")return <div key={b.id}><Formula value={b.text||""} display/></div>;
          if(b.type==="paragraph"){const text=b.text || lesson.paragraphs.find(p=>p.id===b.id)?.text || "";return <div className="reader-passage" key={b.id}><p id={"lr-"+b.id} tabIndex={-1} data-paragraph={b.id} className={flash===b.id?"reader-flash":""}>{markText(text,b.id)}</p>
            <button title="Annotate this passage" aria-label={"Annotate passage "+b.id} onClick={e=>toolsForParagraph(b.id,text,e.currentTarget)}>¶</button></div>;}
          const c=lesson.cards.find(c=>c.id===b.id);if(!c)return null;
          const peers=state.threads.filter(t=>t.cardId===c.id && t.peerId).flatMap(t=>[{id:t.id,text:t.text,authorName:t.authorName,peerId:t.peerId!},...(t.replies||[]).map(r=>({...r,peerId:t.peerId!}))]);
          return <div key={c.id} id={"lr-"+c.id} tabIndex={-1} className="reader-card-slot"><LessonCard card={c} state={state.cards[c.id]} readOnly={state.role!=="student"} scratchpad={pad}
            submit={async answer=>{await send({type:"card",cardId:c.id,answer});}}
            saveDraft={async draft=>{const s=await send({type:"synthesisDraft",cardId:c.id,...draft});return {version:s.cards[c.id]?.draft?.version||0};}}
            reply={async(peerId,text)=>{await send({type:"reply",cardId:c.id,peerId,text});}} peerReplies={peers}/></div>;
        })}</>}
        {state.role!=="student" && state.errorDistribution && Object.keys(state.errorDistribution).length>0 && <section><h2>Class misconceptions</h2>{Object.entries(state.errorDistribution).map(([id,counts])=><p key={id}>{lesson.cards.find(c=>c.id===id)?.title || id} · {Object.entries(counts).map(([choice,count])=>choice+" ("+count+")").join(", ")}</p>)}</section>}
        {state.role!=="student" && <BlindReview state={state} send={send}/>}
        {connection.fallbackHref && <a href={connection.fallbackHref} target="_blank" rel="noreferrer">Open original course reader</a>}
      </section>
      <div className="reader-right">
        <input className="reader-resize" type="range" aria-label="Context width" min={360} max={400} value={width} onChange={e=>setWidth(+e.target.value)}/>
        <ContextPanel state={state} send={send} tab={tab} setTab={setTab} activeId={activeId} quote={quote} setQuote={setQuote} jump={jump} pad={pad} setPad={setPad} savePad={()=>savePad()} close={()=>setPanel(null)}/>
      </div>
    </div>
    {selected && <div className="reader-selection" role="group" aria-label="Selected passage" style={{top:selected.y,left:selected.x}}>
      {["yellow","green","blue","pink"].map(c=><button type="button" key={c} disabled={pending} data-color={c} aria-label={"Highlight "+c} title={"Highlight "+c} onClick={()=>void highlight(c)}>●</button>)}
      <button onClick={()=>{setQuote(selected.a);setTab("Threads");setPanel("right");setSelected(null);}}>Ask</button>
      <button onClick={()=>{const updated=[pad,selected.a.exact].filter(Boolean).join("\n\n");setPad(updated);setTab("Scratchpad");setPanel("right");setSelected(null);void savePad(updated).catch(e=>setStatus(e.message));}}>Excerpt</button>
      <button aria-label="Close selection tools" onClick={()=>setSelected(null)}>×</button></div>}
    {showNeeds && <section className="reader-gate-list"><h2>Remaining requirements</h2>{state.unmet.map(id=><button key={id} onClick={()=>{scrollTo(id);setShowNeeds(false);}}>{lesson.cards.find(c=>c.id===id)?.title||id}</button>)}</section>}
    <footer className="reader-gate"><span>{state.role==="student"?Math.round(state.mastery)+"% mastered":"Teacher view"}</span><progress value={state.mastery} max="100"/>
      {state.role==="student" && firstUnmet && <button onClick={()=>setShowNeeds(!showNeeds)}>{state.unmet.length} remaining</button>}
      {state.role==="student" && <button className="reader-next" aria-disabled={!state.nextUnlocked} onClick={()=>{if(!state.nextUnlocked){scrollTo(firstUnmet);return;} if(state.nextReading){setNext(true);window.scrollTo(0,0);}else window.location.href=connection.nextHref||connection.returnHref;}}>{state.nextUnlocked&&!state.nextReading&&!connection.nextHref?"Return to course":"Next reading"} →</button>}
    </footer>
    {(status||syncError) && <div role="status" className="reader-status">{status || syncError}<button aria-label="Dismiss notice" onClick={()=>setStatus("")}>×</button></div>}
  </main>;
}
