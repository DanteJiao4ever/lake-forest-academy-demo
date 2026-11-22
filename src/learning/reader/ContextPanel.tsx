import {useEffect,useRef,useState} from "react";
import type {Anchor,ReaderState,Send} from "./types";
export type SideTab="Threads"|"Glossary"|"Scratchpad";
export function ContextPanel({state,send,tab,setTab,activeId,quote,setQuote,jump,pad,setPad,savePad,close}:{
  state:ReaderState;send:Send;tab:SideTab;setTab:(tab:SideTab)=>void;activeId:string;quote:Anchor|null;setQuote:(a:Anchor|null)=>void;
  jump:(a:Anchor)=>void;pad:string;setPad:(v:string)=>void;savePad:()=>Promise<void>;close:()=>void;
}) {
  const [message,setMessage]=useState(""),[text,setText]=useState(""),[replyTo,setReplyTo]=useState(""),[reply,setReply]=useState(""),[busy,setBusy]=useState(false);
  const input=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{if(quote)input.current?.focus();},[quote]);
  async function commit(action:Record<string,unknown>,after=()=>{}) {
    setBusy(true);setMessage("");
    try{await send(action);after();}catch(e){setMessage(e instanceof Error?e.message:"Could not save.");}finally{setBusy(false);}
  }
  const ordered=state.threads.filter(t=>t.anchor).slice().sort((a,b)=>Number(b.anchor?.paragraphId===activeId)-Number(a.anchor?.paragraphId===activeId));
  const activeText=state.lesson.paragraphs.find(p=>p.id===activeId)?.text.toLowerCase()||"";
  const glossary=state.lesson.glossary.slice().sort((a,b)=>Number(b.paragraphId===activeId || activeText.includes(b.term.toLowerCase()))-Number(a.paragraphId===activeId || activeText.includes(a.term.toLowerCase())));
  return <aside className="reader-context" aria-label="Reading context">
    <div className="reader-context-nav"><div role="group" aria-label="Context panel">{(["Threads","Glossary","Scratchpad"] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</div><button className="reader-close-panel" onClick={close}>Close</button></div>
    <div className="reader-context-body">
    {tab==="Threads" && <>
      {quote && <form onSubmit={e=>{e.preventDefault();if(text.trim())void commit({type:"question",anchor:quote,text:text.trim()},()=>{setText("");setQuote(null);});}}>
        <blockquote>{quote.exact}</blockquote><label>Your question<textarea ref={input} required maxLength={1800} value={text} onChange={e=>setText(e.target.value)}/></label>
        <button disabled={busy}>Post question to class</button><button type="button" onClick={()=>setQuote(null)}>Cancel</button></form>}
      {!ordered.length && !quote && <p>Select a passage to ask the first question in this section.</p>}
      {ordered.map(t=><article key={t.id} className={t.anchor?.paragraphId===activeId?"reader-current":""}>
        <button className="reader-quote" onClick={()=>t.anchor && jump(t.anchor)}>{t.anchor?.exact}</button>
        <p><strong>{t.authorName}</strong>{t.endorsed && <span> · ★ Teacher endorsed</span>}</p><p>{t.text}</p>
        {t.replies.map(r=><p key={r.id} className="reader-reply"><strong>{r.authorName}</strong> {r.text}</p>)}
        <button onClick={()=>{setReplyTo(t.id);setReply("");}}>Reply</button>
        {state.role!=="student" && !t.endorsed && <button disabled={busy} onClick={()=>void commit({type:"endorse",threadId:t.id})}>Endorse</button>}
        {replyTo===t.id && <form onSubmit={e=>{e.preventDefault();if(reply.trim())void commit({type:"reply",threadId:t.id,text:reply.trim()},()=>setReplyTo(""));}}>
          <label>Reply to {t.authorName}<textarea required maxLength={1800} value={reply} onChange={e=>setReply(e.target.value)}/></label><button disabled={busy}>Post reply</button></form>}
      </article>)}</>}
    {tab==="Glossary" && <dl>{glossary.map(g=><div key={g.term}><dt>{g.term}</dt><dd>{g.definition}</dd></div>)}</dl>}
    {tab==="Scratchpad" && <><label>Private scratchpad<textarea rows={12} maxLength={10000} value={pad} onChange={e=>setPad(e.target.value)}/></label>
      <button disabled={busy || pad===state.scratchpad} onClick={()=>{setBusy(true);setMessage("");void savePad().then(()=>setMessage("Scratchpad saved.")).catch(e=>setMessage(e.message)).finally(()=>setBusy(false));}}>Save scratchpad</button></>}
    {message && <p role="status">{message}</p>}</div></aside>;
}
