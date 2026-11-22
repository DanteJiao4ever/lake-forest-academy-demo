export const dimensionNames = {K:"Knowledge and understanding",T:"Thinking",C:"Communication",A:"Application"} as const;
export const skillNames = {
  responsibility:"Responsibility",organization:"Organization","independent-work":"Independent work",
  collaboration:"Collaboration",initiative:"Initiative","self-regulation":"Self-regulation",
} as const;
export type Dimension=keyof typeof dimensionNames;
export const dimensions=Object.keys(dimensionNames) as Dimension[];
export type Skill=keyof typeof skillNames;
export const skills=Object.keys(skillNames) as Skill[];
export type Scope={courseCode:string;studentId:string;studentName:string;testSection:boolean};
export type Metric=Record<Dimension,number|null>;
export type Data={weights?:Metric;scores?:Metric;note?:string;taskScore?:number;rubricVersion?:number;policyVersion?:string;date?:string;percent?:number;period?:string;comment?:string;ratings?:Record<Skill,string>};
export type Entry={id:string;kind:"rubric"|"evidence"|"plan"|"skills";key:string;version:number;createdAt:string;data:Data};
export type Risk={inactivity:{flag:boolean|null;days:number|null;lastActivity:string|null};scores:{flag:boolean|null;recent:{title:string;percent:number}[]};progress:{flag:boolean|null;actual:number|null;plan:{date:string;percent:number}|null}};
export type Report={
  courseCode:string;studentId:string;studentName:string;section:string;ktca:Metric;policyVersion:string|null;
  progress:{total:number;completed:number};gradedWeight:number;publishedAverage:number|null;
  learningTime:{plannedHours:number|null;observedSeconds:number;verifiedMinutes:number};
  risk:Risk;tasks:{id:string;title:string;weight:number;percent:number|null;category:string}[];courseWeights:Record<string,number>;
  history:Entry[];records:Record<Entry["kind"],Record<string,Entry>>;grants?:{email:string;active:boolean}[];
};
export type Write=(data:Record<string,unknown>,grants?:boolean)=>Promise<boolean>;
