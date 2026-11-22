import type { Anchor } from "./types";
export function locateQuote(text:string, anchor:Anchor):number | null {
  if (!anchor.exact) return null;
  const offsets:number[] = [];
  for (let at=text.indexOf(anchor.exact); at>=0; at=text.indexOf(anchor.exact,at+1)) offsets.push(at);
  if (offsets.length === 1) return offsets[0];
  const matches=offsets.filter(at => text.slice(0,at).endsWith(anchor.prefix) && text.slice(at+anchor.exact.length).startsWith(anchor.suffix));
  return matches.length === 1 ? matches[0] : null;
}
export function quoteAt(text:string, start:number, end:number, paragraphId:string, version:string):Anchor {
  return {paragraphId,version,exact:text.slice(start,end),prefix:text.slice(Math.max(0,start-32),start),suffix:text.slice(end,end+32)};
}
