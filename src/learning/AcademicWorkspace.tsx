import {lazy,Suspense} from "react";
const RecordPage=lazy(()=>import("./records/AcademicRecord").then(m=>({default:m.AcademicRecord})));
const Review=lazy(()=>import("./review/ReviewWorkspace").then(m=>({default:m.ReviewWorkspace})));
const Seminar=lazy(()=>import("./seminar").then(m=>({default:m.SeminarWorkspace})));
const Insights=lazy(()=>import("./insights").then(m=>({default:m.InsightsWorkspace})));
export interface WorkspaceConnection {
  kind:"records"|"review"|"seminar"|"insights";
  courseCode:string; endpoint:string; csrf:()=>string; role:string; returnHref:string;
}
export function AcademicWorkspace({connection:c}:{connection:WorkspaceConnection}) {
  return <Suspense fallback={<p role="status">Opening workspace…</p>}>
    {c.kind==="records"?<RecordPage {...c}/>:c.kind==="review"?<Review {...c}/>:c.kind==="seminar"?<Seminar {...c}/>:
    <><div className="workspace-session">{c.role==="observer"?<button type="button" data-action="logout">Sign out</button>:<a href={c.returnHref}>← Return to course</a>}</div><Insights role={c.role} csrf={c.csrf} courseCode={c.courseCode||undefined} apiBase={c.endpoint}/></>}
  </Suspense>;
}
