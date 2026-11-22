import { useId, useState } from "react";

type Choice = { label: string; correct: boolean; feedback: string };

export function ConceptCheck({ prompt, choices }: { prompt: string; choices: readonly Choice[] }) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<number | null>(null);
  const result = checked === null ? undefined : choices[checked];
  return (
    <article className="lfa-sample-card">
      <h3>Check your understanding</h3>
      <fieldset>
        <legend>{prompt}</legend>
        {choices.map((choice, index) => (
          <label key={choice.label} className="lfa-sample-choice">
            <input type="radio" name={id} checked={selected === index} onChange={() => { setSelected(index); setChecked(null); }} />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <button type="button" disabled={selected === null} onClick={() => setChecked(selected)}>Check answer</button>
      <div aria-live="polite">
        {result && <div className="lfa-sample-feedback" data-result={result.correct ? "correct" : "retry"}>
          <strong>{result.correct ? "Correct" : "Try again"}</strong><p>{result.feedback}</p>
        </div>}
      </div>
    </article>
  );
}
