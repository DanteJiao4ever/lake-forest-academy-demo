import {dimensions,dimensionNames,skills,skillNames,type Metric,type Report} from "./types";

export const round=(value:number|null|undefined)=>value==null ? "No evidence" : Number(value.toFixed(1))+"%";
const flag=(value:boolean|null)=>value===null?"Insufficient evidence":value?"Follow up":"Within threshold";

function observedDuration(seconds:number) {
  if (!seconds) return "No platform activity recorded";
  const hours=Math.floor(seconds/3600), minutes=Math.floor(seconds%3600/60);
  return [hours && hours+"h", minutes && minutes+"m", seconds%60 && seconds%60+"s"].filter(Boolean).join(" ");
}

function Radar({values}:{values:Metric}) {
  const axes=[[90,14],[166,90],[90,166],[14,90]] as const;
  const points=dimensions.map((key,i)=>{
    const v=values[key]; if(v===null)return null;
    return [90+(axes[i][0]-90)*v/100,90+(axes[i][1]-90)*v/100];
  });
  return <figure className="ins-radar"><svg viewBox="-5 -5 190 190" role="img" aria-label="KTCA evidence radar; exact values in the adjacent table">
    {[.25,.5,.75,1].map(scale=><polygon key={scale} points={axes.map(([x,y])=>[90+(x-90)*scale,90+(y-90)*scale].join(",")).join(" ")} fill="none" stroke="#a3b3b8"/>)}
    {axes.map(([x,y],i)=><g key={i}><line x1="90" y1="90" x2={x} y2={y} stroke="#b3c0c4"/><text x={90+(x-90)*1.12} y={94+(y-90)*1.12} textAnchor="middle">{dimensions[i]}</text></g>)}
    {points.every(Boolean)&&<polygon points={points.map(p=>p!.join(",")).join(" ")} fill="rgba(30,107,93,.2)" stroke="#17695c"/>}
    {points.map((p,i)=>p&&<circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#17695c"/>)}
  </svg><table><caption>Task evidence by category</caption><tbody>{dimensions.map(k=><tr key={k}><th>{dimensionNames[k]}</th><td>{round(values[k])}</td></tr>)}</tbody></table></figure>;
}

export function ReportView({data}:{data:Report}) {
  const {risk,learningTime}=data;
  return <>
    <h2>{data.studentName} · {data.courseCode}</h2>
    <section><h3>Learning progress</h3><div>{data.progress.completed} of {data.progress.total} modules completed</div>
      <dl className="ins-risk">
        <div><dt>More than five days without activity</dt><dd><strong>{flag(risk.inactivity.flag)}</strong>{risk.inactivity.lastActivity ? " · Last activity "+new Date(risk.inactivity.lastActivity).toLocaleString() : " · No course activity recorded"}</dd></div>
        <div><dt>Two most recent published scores below 70%</dt><dd><strong>{flag(risk.scores.flag)}</strong>{risk.scores.recent.length>0 && " · "+risk.scores.recent.map(r=>r.title+" "+round(r.percent)).join(" / ")}</dd></div>
        <div><dt>More than 15 percentage points behind plan</dt><dd><strong>{flag(risk.progress.flag)}</strong>{risk.progress.plan ? " · "+round(risk.progress.actual)+" complete, "+round(risk.progress.plan.percent)+" planned by "+risk.progress.plan.date : " · No current dated target"}</dd></div>
      </dl>
    </section>
    <section><h3>Learning time</h3>
      {learningTime ? <><dl className="ins-risk">
        <div><dt>Planned instruction</dt><dd>{learningTime.plannedHours===null ? "Plan unavailable" : learningTime.plannedHours+" hours in published modules"}</dd></div>
        <div><dt>Observed platform activity</dt><dd>{observedDuration(learningTime.observedSeconds)}</dd></div>
        <div><dt>Teacher-verified learning</dt><dd>{learningTime.verifiedMinutes ? learningTime.verifiedMinutes+" min" : "No verified time recorded"}</dd></div>
      </dl>
      <p>Overlapping platform activity counts once. Teacher-verified time is reported separately.</p></> : <p>Learning time is unavailable.</p>}
    </section>
    <section><h3>Published grades</h3><p>{data.publishedAverage===null ? "No published scores yet." : "Average on published tasks: "+round(data.publishedAverage)+" across "+round(data.gradedWeight)+" of course weight."}</p>
      <p>Course policy {data.policyVersion || "awaiting assignment"} · {Object.entries(data.courseWeights).map(([name,w])=>name.replaceAll("_"," ")+" "+round(w)).join(" · ")}</p>
      <details><summary>Task scores and course weights</summary><table><thead><tr><th>Task</th><th>Course weight</th><th>Published score</th></tr></thead><tbody>{data.tasks.map(t=><tr key={t.id}><th>{t.title}</th><td>{round(t.weight)}</td><td>{t.percent===null?"Awaiting grade":round(Number(t.percent))}</td></tr>)}</tbody></table></details>
    </section>
    <section><h3>KTCA evidence</h3><Radar values={data.ktca}/>
      {Object.values(data.records.evidence).map(r=><div key={r.id}><b>{data.tasks.find(t=>t.id===r.key)?.title}</b><p>{r.data.note}</p><small>Weighted task evidence {round(r.data.taskScore)} · Rubric v{r.data.rubricVersion} · {r.data.policyVersion}</small></div>)}
    </section>
    <section><h3>Learning skills</h3><p>E · Excellent, G · Good, S · Satisfactory, N · Needs improvement</p>
      <table><thead><tr><th>Skill</th><th>Midterm</th><th>Final</th></tr></thead><tbody>{skills.map(k=><tr key={k}><th>{skillNames[k]}</th>{["midterm","final"].map(p=><td key={p}>{data.records.skills[p]?.data.ratings?.[k] || "Awaiting assessment"}</td>)}</tr>)}</tbody></table>
      {Object.values(data.records.skills).map(r=><p key={r.id}><strong>{r.key} feedback</strong> · {r.data.comment}</p>)}
    </section>
  </>;
}
