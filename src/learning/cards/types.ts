export interface Option {
  id: string;
  label: string;
}
export interface PassageLine {
  id: string;
  text: string;
}
interface BaseCard {
  id: string;
  title: string;
  prompt: string;
  required: boolean;
  ktca: string[];
}

export interface Reveal extends BaseCard {
  type: "SocraticReveal";
  mode: "predict" | "tap";
  minWords: number;
  teacherReasoning?: string;
}
export interface Check extends BaseCard {
  type: "ConceptCheck";
  mode: "single" | "multiple" | "numeric";
  options?: Option[];
  unit?: string;
}
export interface Post extends BaseCard {
  type: "PostFirstPrompt";
  minWords: number;
  peers?: (Option & { text: string })[];
  teacherModel?: string;
}
export interface Excerpt extends BaseCard {
  type: "AnnotatedExcerpt";
  segments: (PassageLine & { note: string })[];
}
export interface Parameter extends Option {
  min: number;
  max: number;
  step: number;
  initial: number;
}
export interface Model extends BaseCard {
  type: "InteractiveModel";
  parameters: Parameter[];
  base: number;
  slope: number;
  question: string;
}
export interface Fill extends BaseCard {
  type: "StepwiseDerivation";
  mode: "fill";
  steps: { id: string; prompt: string }[];
  totalSteps: number;
}
export interface Fallacy extends BaseCard {
  type: "StepwiseDerivation";
  mode: "fallacy";
  lines: PassageLine[];
  reasons: Option[];
}
export interface Matrix extends BaseCard {
  type: "ContrastMatrix";
  items: PassageLine[];
  buckets: Option[];
  threshold: number;
  reference?: (PassageLine & { bucketId: string })[];
}
export interface Synthesis extends BaseCard {
  type: "SynthesisGate";
  skills: Option[];
  minWords: number;
}

export type PublicCard = Reveal | Check | Post | Excerpt | Model | Fill | Fallacy | Matrix | Synthesis;

export type TextDiff = { from: number; removed: number; inserted: string };
export type EditorDocument = Record<string, unknown>;
export interface SynthesisDraft {
  version: number;
  text: string;
  skills: string[];
  doc?: EditorDocument;
  diff?: TextDiff;
}
export interface SynthesisDraftWrite {
  baseVersion: number;
  text: string;
  skills: string[];
  doc: EditorDocument;
  diff: TextDiff;
}
export interface CardState {
  completed?: boolean;
  feedback?: string;
  mistakes?: string[];
  stepIndex?: number;
  visited?: string[];
  coverage?: number;
  score?: number;
  pasteFlag?: boolean;
  attempts?: number;
  answer?: Record<string, unknown>;
  draft?: SynthesisDraft;
  history?: { version: number; diff: TextDiff; createdAt: string }[];
}
export interface PeerReply {
  id: string;
  peerId: string;
  text: string;
  authorName?: string;
}
export interface LessonCardProps {
  card: PublicCard;
  state?: CardState;
  submit: (answer: Record<string, unknown>) => Promise<void>;
  scratchpad: string;
  saveDraft?: (write: SynthesisDraftWrite) => Promise<{ version: number }>;
  reply?: (peerId: string, text: string) => Promise<void>;
  peerReplies?: PeerReply[];
  readOnly?: boolean;
}
