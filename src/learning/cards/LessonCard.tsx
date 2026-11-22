import { useId } from "react";
import { useAction } from "./controls";
import { Prediction, MicroCheck, PostFirst, AnnotatedText } from "./ReadingActivities";
import { InteractiveModel, FillSteps, FindFallacy, ContrastMatrix } from "./ReasoningActivities";
import { SynthesisEditor } from "./SynthesisEditor";
import type { LessonCardProps, PublicCard } from "./types";
import "./cards.css";

export type {
  LessonCardProps,
  PublicCard,
  CardState,
  PeerReply,
  SynthesisDraft,
  SynthesisDraftWrite,
} from "./types";

const activityNames: Record<PublicCard["type"], string> = {
  SocraticReveal: "Prediction",
  ConceptCheck: "Concept check",
  PostFirstPrompt: "Post first",
  AnnotatedExcerpt: "Annotated reading",
  InteractiveModel: "Interactive model",
  StepwiseDerivation: "Derivation",
  ContrastMatrix: "Classification",
  SynthesisGate: "Synthesis",
};

function Activity({
  card,
  state = {},
  submit,
  scratchpad,
  saveDraft,
  reply,
  peerReplies,
  readOnly,
}: LessonCardProps) {
  const action = useAction();
  const id = useId();
  const busy = action.busy;
  const disabled = Boolean(readOnly || busy || state.completed);
  function send(answer: Record<string, unknown>) {
    return disabled ? Promise.resolve(false) : action.run(() => submit(answer));
  }
  const props = { state, send, disabled };
  function body() {
    switch (card.type) {
      case "SocraticReveal":
        return <Prediction card={card} {...props} />;
      case "ConceptCheck":
        return <MicroCheck card={card} {...props} />;
      case "PostFirstPrompt":
        return <PostFirst card={card} readOnly={readOnly} peerReplies={peerReplies} reply={reply} {...props} />;
      case "AnnotatedExcerpt":
        return <AnnotatedText card={card} {...props} />;
      case "InteractiveModel":
        return <InteractiveModel card={card} {...props} />;
      case "StepwiseDerivation":
        return card.mode === "fill" ? (
          <FillSteps card={card} {...props} />
        ) : (
          <FindFallacy card={card} {...props} />
        );
      case "ContrastMatrix":
        return <ContrastMatrix card={card} {...props} />;
      case "SynthesisGate":
        return (
          <SynthesisEditor
            card={card}
            scratchpad={scratchpad}
            saveDraft={saveDraft}
            readOnly={readOnly}
            {...props}
          />
        );
    }
  }
  return (
    <article
      className="lesson-card"
      data-card-id={card.id}
      data-type={card.type}
      data-completed={Boolean(state.completed)}
      aria-labelledby={id}
    >
      <div className="lc-caption">
        <span>{activityNames[card.type]}</span>
        <span>{state.completed ? "Completed" : card.required ? "Required" : "Optional"}</span>
      </div>
      <h3 id={id}>{card.title}</h3>
      <p className="lc-prompt">{card.prompt}</p>
      {body()}
      <div role="status" aria-live="polite" aria-atomic="true">
        {busy ? (
          <p className="lc-meta">Saving response…</p>
        ) : (
          state.feedback && <p className="lc-feedback">{state.feedback}</p>
        )}
      </div>
      {action.error && (
        <p role="alert" className="lc-error">
          {action.error}
        </p>
      )}
    </article>
  );
}

export function LessonCard(props: LessonCardProps) {
  return <Activity key={props.card.id} {...props} />;
}
