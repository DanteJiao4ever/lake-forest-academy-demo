import { useId, useState } from "react";

type Props = {
  prompt: string;
  reasoning: string;
  minimumWords?: number;
};

export function SocraticReveal({ prompt, reasoning, minimumWords = 0 }: Props) {
  const id = useId();
  const [prediction, setPrediction] = useState("");
  const [revealed, setRevealed] = useState(false);
  const count = prediction.trim().split(/\s+/u).filter(Boolean).length;
  return (
    <article className="lfa-sample-card">
      <h3>Make a prediction</h3>
      <label htmlFor={id}>{prompt}</label>
      <textarea id={id} value={prediction} onChange={(e) => setPrediction(e.target.value)}
        readOnly={revealed} rows={2} maxLength={1400} aria-describedby={minimumWords ? id + "-count" : undefined} />
      {minimumWords > 0 && <small id={id + "-count"}>{count} of {minimumWords} words required</small>}
      {revealed
        ? <div role="status" className="lfa-sample-feedback"><strong>Teacher’s reasoning</strong><p>{reasoning}</p></div>
        : <button type="button" disabled={count < minimumWords} onClick={() => setRevealed(true)}>Reveal the reasoning</button>}
    </article>
  );
}
