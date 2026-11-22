import { useId, useRef, useState } from "react";
import type { ActivityProps } from "./controls";
import { isRecord, stringValue } from "./controls";
import type { Fallacy, Fill, Matrix, Model } from "./types";

type Values = Record<string, number>;

function Chart({ card, values }: { card: Model; values: Values }) {
  const price = card.parameters.find((p) => p.id === "price");
  const shift = card.parameters.find((p) => p.id === "shift");
  if (!price || !shift) return null;
  const maxPrice = Math.max(1, price.max);
  const maxQuantity = Math.max(1, card.base - card.slope * Math.min(0, price.min) + Math.max(0, shift.max));
  const x = (q: number) => 44 + (294 * q) / maxQuantity;
  const y = (p: number) => 152 - (128 * p) / maxPrice;
  const quantity = (p: number, s: number) => card.base - card.slope * p + s;
  const point = quantity(values.price, values.shift);
  const curve = (s: number) => {
    // The curve ends where the predicted quantity first reaches zero.
    const end = card.slope > 0 ? Math.min(maxPrice, (card.base + s) / card.slope) : maxPrice;
    return `M ${x(quantity(0, s))} ${y(0)} L ${x(quantity(end, s))} ${y(end)}`;
  };
  return (
    <figure className="lc-chart">
      <svg
        viewBox="0 0 370 194"
        role="img"
        aria-label={`Demand curves with quantity on the horizontal axis and fare on the vertical axis. At a fare of ${values.price}, the current quantity is ${point}.`}
      >
        <path d="M44 20 V152 H345" fill="none" stroke="currentColor" />
        <text x="43" y="14" textAnchor="start">
          Fare ($)
        </text>
        <text x="340" y="189" textAnchor="end">
          Quantity (rides per day)
        </text>
        <text x="38" y="166" textAnchor="end">
          0
        </text>
        <text x="38" y="29" textAnchor="end">
          {maxPrice}
        </text>
        <text x="338" y="167" textAnchor="middle">
          {maxQuantity}
        </text>
        <path d={curve(0)} fill="none" stroke="currentColor" strokeDasharray="5 4" strokeWidth="2" />
        <path d={curve(values.shift)} fill="none" stroke="var(--lfa-blue)" strokeWidth="2.5" />
        <circle cx={x(point)} cy={y(values.price)} r="5" fill="var(--lfa-amber)" stroke="currentColor" />
      </svg>
      <figcaption>
        Current point · ${values.price} fare, {point} rides per day
        <br />
        Dashed line · original schedule
        <br />
        Solid line · current schedule
      </figcaption>
    </figure>
  );
}

export function InteractiveModel({ card, state, send, disabled }: ActivityProps & { card: Model }) {
  function initialValues() {
    const stored = state.answer?.parameters;
    return Object.fromEntries(
      card.parameters.map((p) => [
        p.id,
        isRecord(stored) && typeof stored[p.id] === "number" ? stored[p.id] : p.initial,
      ]),
    ) as Values;
  }
  const [values, setValues] = useState(initialValues);
  const history = useRef<Values[]>([values]);
  const [value, setValue] = useState(stringValue(state.answer?.value));
  function adjust(id: string, number: number) {
    const next = { ...values, [id]: number };
    setValues(next);
    const previous = history.current;
    if (previous.length < 256) history.current = [...previous, next];
    else {
      // Preserve the first fixed-fare comparison even in a long slider exploration.
      const witness = previous.findIndex(
        (v, i) => i > 0 && v.price === previous[i - 1].price && v.shift !== previous[i - 1].shift,
      );
      const preserved = witness > 0 ? previous.slice(witness - 1, witness + 1) : [];
      history.current = [previous[0], ...preserved, ...previous.slice(-252), next];
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send({ parameters: values, history: history.current, value });
      }}
    >
      <Chart card={card} values={values} />
      <fieldset disabled={disabled}>
        <legend>Model parameters</legend>
        {card.parameters.map((param) => (
          <label className="lc-slider" key={param.id}>
            <span>
              {param.label} <strong>{values[param.id]}</strong>
            </span>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={values[param.id]}
              aria-label={param.label}
              onChange={(e) => adjust(param.id, e.target.valueAsNumber)}
            />
          </label>
        ))}
      </fieldset>
      <label>
        {card.question}
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
      </label>
      {!state.completed && <button disabled={disabled || !value.trim()}>Verify model result</button>}
    </form>
  );
}

export function FillSteps({ card, state, send, disabled }: ActivityProps & { card: Fill }) {
  const index = state.stepIndex ?? 0;
  const current = card.steps[index];
  // Keeping each draft under its own step prevents a refresh from moving an old answer into the next blank.
  const [entries, setEntries] = useState<Record<string, string>>(() => {
    const answer = state.answer;
    return typeof answer?.stepId === "string" ? { [answer.stepId]: stringValue(answer.value) } : {};
  });
  const value = current ? entries[current.id] || "" : "";
  return (
    <>
      <p className="lc-meta">
        {state.completed ? card.totalSteps : index} of {card.totalSteps} steps complete
      </p>
      <ol className="lc-steps">
        {card.steps.slice(0, index).map((step) => (
          <li key={step.id}>
            {step.prompt}
            {entries[step.id] && <span className="lc-step-answer">{entries[step.id]}</span>}
          </li>
        ))}
      </ol>
      {!state.completed && current && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send({ stepId: current.id, value });
          }}
        >
          <label>
            Step {index + 1}. {current.prompt}
            <input
              type="text"
              maxLength={200}
              value={value}
              disabled={disabled}
              onChange={(e) => setEntries({ ...entries, [current.id]: e.target.value })}
            />
          </label>
          <button disabled={disabled || !value.trim()}>Check step</button>
        </form>
      )}
    </>
  );
}

export function FindFallacy({ card, state, send, disabled }: ActivityProps & { card: Fallacy }) {
  const name = useId();
  const [lineId, setLine] = useState(stringValue(state.answer?.lineId));
  const [reasonId, setReason] = useState(stringValue(state.answer?.reasonId));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send({ lineId, reasonId });
      }}
    >
      <fieldset disabled={disabled}>
        <legend>Which line contains the error?</legend>
        {card.lines.map((line, i) => (
          <label className="lc-choice" key={line.id}>
            <input type="radio" name={name} checked={lineId === line.id} onChange={() => setLine(line.id)} />
            <span>
              {i + 1}. {line.text}
            </span>
          </label>
        ))}
      </fieldset>
      <label>
        Why is that line incorrect?
        <select value={reasonId} disabled={disabled} onChange={(e) => setReason(e.target.value)}>
          <option value="">Choose a reason</option>
          {card.reasons.map((reason) => (
            <option key={reason.id} value={reason.id}>
              {reason.label}
            </option>
          ))}
        </select>
      </label>
      {!state.completed && <button disabled={disabled || !lineId || !reasonId}>Check reasoning</button>}
    </form>
  );
}

export function ContrastMatrix({ card, state, send, disabled }: ActivityProps & { card: Matrix }) {
  const [placements, setPlacements] = useState<Record<string, string>>(() => {
    const stored = state.answer?.placements;
    return isRecord(stored)
      ? Object.fromEntries(
          Object.entries(stored).filter((pair): pair is [string, string] => typeof pair[1] === "string"),
        )
      : {};
  });
  const [drag, setDrag] = useState("");
  const [hover, setHover] = useState("");
  function place(itemId: string, bucketId: string) {
    setPlacements((old) => ({ ...old, [itemId]: bucketId }));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send({ placements });
      }}
    >
      <p className="lc-meta">
        Choose a category for each case or drag it into a group. {Math.round(card.threshold * 100)}% is
        required.
      </p>
      <ul className="lc-cases">
        {card.items.map((item, i) => (
          <li key={item.id}>
            <span
              className="lc-drag-handle"
              draggable={!disabled}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", item.id);
                setDrag(item.id);
              }}
              onDragEnd={() => {
                setDrag("");
                setHover("");
              }}
            >
              Drag case {i + 1}
            </span>
            <label>
              <span>
                {i + 1}. {item.text}
              </span>
              <select
                disabled={disabled}
                value={placements[item.id] || ""}
                onChange={(e) => place(item.id, e.target.value)}
              >
                <option value="">Choose a category</option>
                {card.buckets.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
      <div className="lc-buckets">
        {card.buckets.map((bucket) => (
          <section
            key={bucket.id}
            data-over={hover === bucket.id}
            onDragOver={(e) => {
              if (drag && !disabled) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setHover(bucket.id);
              }
            }}
            onDragLeave={() => setHover("")}
            onDrop={(e) => {
              e.preventDefault();
              if (!disabled && drag && card.items.some((item) => item.id === drag)) place(drag, bucket.id);
              setHover("");
              setDrag("");
            }}
          >
            <h4>{bucket.label}</h4>
            <span className="lc-meta">
              {card.items
                .map((item, index) => (placements[item.id] === bucket.id ? index + 1 : null))
                .filter(Boolean)
                .join(", ") || "Empty"}
            </span>
          </section>
        ))}
      </div>
      {!state.completed && (
        <button disabled={disabled || card.items.some((item) => !placements[item.id])}>
          Check classifications
        </button>
      )}
      {typeof state.score === "number" && (
        <p className="lc-meta">Classification accuracy {Math.round(100 * state.score)}%</p>
      )}
      {state.completed && card.reference?.length ? (
        <details>
          <summary>Compare with the reference</summary>
          <ul>
            {card.reference.map((row) => (
              <li key={row.id}>
                {row.text} — {card.buckets.find((b) => b.id === row.bucketId)?.label}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </form>
  );
}
