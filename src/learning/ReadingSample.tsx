import { useId } from "react";
import { AnnotatedPassage } from "./components/AnnotatedPassage";
import { ConceptCheck } from "./components/ConceptCheck";
import { SocraticReveal } from "./components/SocraticReveal";

const passage = [
  "On Monday, the school café sells 40 cups of iced tea at $3 each.",
  "During Wednesday’s heat wave, students buy 65 cups at the same price.",
  "The café has kept its recipe, cup size and opening hours the same.",
];

const choices = [
  { label: "The café cuts the price to $2 and sells more cups.", correct: false, feedback: "Here the price of tea changes. That traces a movement along the existing demand curve. Look for a change while the price stays fixed." },
  { label: "Hotter weather increases purchases at each listed price.", correct: true, feedback: "At a given price, students want more tea. Plotting that larger quantity at each price shifts demand to the right." },
  { label: "The café prepares more cups before lunch.", correct: false, feedback: "Preparing extra cups is a decision by the seller. It tells us about supply. Look for a change in what buyers want." },
] as const;

export function ReadingSample() {
  const title = useId();
  return (
    <section id="reading-sample" className="lfa-reading-sample" aria-labelledby={title}>
      <header className="lfa-sample-head">
        <p className="lfa-sample-kicker">Economics · 60-second classroom preview</p>
        <h2 id={title}>What shifts demand?</h2>
        <p>Read a short case, try your reasoning and leave a question in the margin. Your work in this preview stays on this page.</p>
      </header>
      <AnnotatedPassage sentences={passage} />
      <div className="lfa-sample-cards">
        <SocraticReveal prompt="What might explain the extra 25 sales?" reasoning="A higher quantity sold at the same price is consistent with a change in demand. One observation gives us a clue. Checking quantities at other prices would test whether the whole curve shifted." />
        <ConceptCheck prompt="Which observation gives evidence of a rightward shift in demand?" choices={choices} />
      </div>
    </section>
  );
}
