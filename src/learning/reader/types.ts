import type { PublicCard, CardState } from "../cards/types";
export interface Anchor { version: string; paragraphId: string; exact: string; prefix: string; suffix: string }
export interface ReaderNote { id: string; anchor: Anchor; color: string; text: string }
export interface Thread {
  id: string; anchor?: Anchor | null; text: string; authorName: string; endorsed: boolean; cardId?: string; peerId?: string;
  replies: {id:string; text:string; authorName:string}[];
}
export interface ReaderState {
  lesson: {
    id:string; version:string; title:string; courseCode:string; unit:string;
    blocks:{id:string;type:"paragraph"|"heading"|"card"|"math";text?:string}[];
    paragraphs:{id:string;text:string}[]; glossary:{term:string;definition:string;paragraphId?:string}[];
    cards:PublicCard[];
  };
  cards:Record<string,CardState>; notes:ReaderNote[]; threads:Thread[]; scratchpad:string; activeSeconds:number;
  role:string; mastery:number; unmet:string[]; revision:number; nextUnlocked:boolean; nextReading?:{title:string;text:string};
  bookings:{id:string; preferredAt:string; timeZone:string; status:string; studentName:string}[];
  errorDistribution?:Record<string,Record<string,number>>;
}
export type Send = (payload:Record<string,unknown>) => Promise<ReaderState>;
export interface ReaderConnection {
  endpoint:string; csrf:()=>string; returnHref:string; nextHref?:string; fallbackHref?:string; integrityHref?:string;
}
