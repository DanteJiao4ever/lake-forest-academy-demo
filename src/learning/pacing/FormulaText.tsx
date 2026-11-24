import katex from "katex";
import "katex/dist/katex.min.css";

export function FormulaText({text}: {text: string}) {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
  return <>{parts.map((part,i)=>{
    if (part.length < 3 || !part.startsWith("$") || !part.endsWith("$")) return part;
    const display = part.startsWith("$$"), delimiter=display?2:1;
    const html=katex.renderToString(part.slice(delimiter,-delimiter),{displayMode:display,output:"htmlAndMathml",throwOnError:false,trust:false,maxExpand:100,maxSize:10});
    return <span key={i} dangerouslySetInnerHTML={{__html:html}}/>;
  })}</>;
}
