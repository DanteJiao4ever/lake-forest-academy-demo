import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Only the API image receives the compiled lessons. The browser receives publicLesson output.
const privateMount = '/opt/lfa/teaching/interactive-lessons';
const localDirectory = fileURLToPath(new URL('./compiled/', import.meta.url));
const directory = process.env.LFA_LESSON_CONTENT_DIR ||
  (process.env.NODE_ENV === 'production' || existsSync(privateMount) ? privateMount : localDirectory);
const lessons = new Map();
if (existsSync(directory)) {
  for (const file of readdirSync(directory).filter(name => name.endsWith('.json'))) {
    const document = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    if (file !== document.id + '.json') throw new Error('Lesson filename and ID disagree');
    lessons.set(document.id, document);
  }
}

export function privateLessonReadiness() {
  const expected = ['cia4u-demand-2-3', 'mcv4u-derivative-graphs'];
  const available = expected.filter(id => lessons.get(id)?.version === '1.0').length;
  return { ready: available === expected.length, expected: expected.length, available };
}

export function assertPrivateLessonsReady() {
  if (!privateLessonReadiness().ready) throw new Error('Private interactive lesson pack is incomplete.');
}

export function getLesson(id) {
  return lessons.get(id) ?? null;
}

function pick(source, keys) {
  return Object.fromEntries(keys.filter(key => Object.hasOwn(source, key)).map(key => [key, source[key]]));
}

function rows(source, keys) {
  return source.map(row => pick(row, keys));
}

function releasedCard(card, state) {
  const base = pick(card, ['id', 'type', 'ktca', 'title', 'prompt', 'required']);
  const complete = state.completed === true;
  switch (card.type) {
    case 'SocraticReveal':
      return { ...base, ...pick(card, ['mode', 'minWords']), ...(complete && { teacherReasoning: card.private.teacherReasoning }) };
    case 'ConceptCheck':
      return { ...base, ...pick(card, ['mode', 'unit']), ...(card.options && { options: rows(card.options, ['id', 'label']) }) };
    case 'PostFirstPrompt':
      return { ...base, minWords: card.minWords, ...(complete && { peers: rows(card.private.peers, ['id', 'label', 'text']), teacherModel: card.private.teacherModel }) };
    case 'AnnotatedExcerpt':
      return { ...base, segments: rows(card.segments, ['id', 'text', 'note']) };
    case 'InteractiveModel':
      return { ...base, ...pick(card, ['base', 'slope', 'question']), parameters: rows(card.parameters, ['id', 'label', 'min', 'max', 'step', 'initial']) };
    case 'StepwiseDerivation':
      if (card.mode === 'fallacy') return { ...base, mode: card.mode, lines: rows(card.lines, ['id', 'text']), reasons: rows(card.reasons, ['id', 'label']) };
      return { ...base, mode: card.mode, totalSteps: card.steps.length, steps: rows(card.steps.slice(0, (state.stepIndex ?? 0) + 1), ['id', 'prompt']) };
    case 'ContrastMatrix':
      return {
        ...base, buckets: rows(card.buckets, ['id', 'label']), items: rows(card.items, ['id', 'text']), threshold: card.threshold,
        ...(complete && { reference: card.items.map(({ id, text }) => ({ id, text, bucketId: card.private.answers[id] })) })
      };
    case 'SynthesisGate':
      return { ...base, minWords: card.minWords, skills: rows(card.skills, ['id', 'label']) };
    default:
      throw new Error('Unknown compiled card type');
  }
}

export function publicLesson(lesson, cardStates = {}) {
  return {
    ...pick(lesson, ['id', 'version', 'title', 'courseCode', 'unit']),
    paragraphs: rows(lesson.paragraphs, ['id', 'text']),
    blocks: rows(lesson.blocks, ['id', 'type', 'text']),
    glossary: rows(lesson.glossary, ['term', 'definition', 'paragraphId']),
    cards: lesson.cards.map(card => releasedCard(card, cardStates[card.id] ?? {}))
  };
}

export function wordCount(text) {
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function ensure(condition, message) {
  if (!condition) throw new RangeError(message);
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function textField(value) {
  ensure(typeof value === 'string' && value.length <= 30000, 'Expected a bounded text response.');
  return value.trim();
}

// Canonical decimal coefficient and exponent. Avoid rounding an arbitrarily precise
// student string to a nearby answer through binary floating-point conversion.
function decimal(value) {
  ensure(typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)), 'Enter a finite number.');
  const source = String(value).trim();
  const parts = source.length <= 100 && /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d{1,3}))?$/i.exec(source);
  ensure(parts && (parts[2] || parts[3]), 'Enter a decimal number.');
  const digits = (parts[2] + (parts[3] || '')).replace(/^0+/, '');
  if (!digits) return '0';
  const coefficient = digits.replace(/0+$/, '');
  const exponent = Number(parts[4] || 0) - (parts[3]?.length || 0) + digits.length - coefficient.length;
  return (parts[1] === '-' ? '-' : '') + coefficient + 'e' + exponent;
}

function select(ids, options, label) {
  ensure(Array.isArray(ids) && ids.length <= options.length && new Set(ids).size === ids.length, 'Invalid ' + label + ' list.');
  const allowed = new Set(options.map(option => option.id));
  ensure(ids.every(id => allowed.has(id)), 'Unknown ' + label + '.');
  return ids;
}

function result(completed, feedback, extra = {}) {
  return { completed, feedback, mistakes: [], ...extra };
}

function checkConcept(card, answer) {
  const key = card.private;
  if (card.mode === 'numeric') {
    const value = decimal(answer.value);
    if (value === decimal(key.value)) return result(true, key.success);
    const error = key.errors.find(error => value === decimal(error.value)) ?? key.fallback;
    return result(false, error.hint, { mistakes: [error.name] });
  }
  const chosen = select(answer.choices, card.options, 'choice');
  ensure(card.mode !== 'single' || chosen.length === 1, 'Choose one option.');
  const errors = chosen.filter(id => !key.correct.includes(id)).map(id => key.feedback[id]);
  const missing = key.correct.some(id => !chosen.includes(id));
  if (!errors.length && !missing) return result(true, key.success);
  const hints = errors.map(error => error.hint);
  if (!errors.length) hints.push(key.missingHint);
  return result(false, hints.join(' '), { mistakes: errors.length ? errors.map(error => error.name) : ['Incomplete selection'] });
}

function model(card, answer) {
  function settings(values) {
    ensure(record(values), 'Provide both model parameters.');
    for (const param of card.parameters) {
      const value = values[param.id];
      ensure(typeof value === 'number' && Number.isFinite(value) && value >= param.min && value <= param.max
        && Number.isInteger((value - param.min) / param.step), 'Model parameter outside its slider range.');
    }
    return { price: values.price, shift: values.shift };
  }
  const current = settings(answer.parameters);
  ensure(Array.isArray(answer.history) && answer.history.length >= 1 && answer.history.length <= 256, 'Provide a bounded slider history.');
  const history = answer.history.map(settings);
  const last = history.at(-1);
  ensure(last.price === current.price && last.shift === current.shift, 'Final settings must match the last observation.');
  const fixedFare = history.some((setting, index) => index > 0 && setting.price === history[index - 1].price && setting.shift !== history[index - 1].shift);
  if (!fixedFare) return result(false, 'Keep fare fixed and change the shift to compare demand at a matched price.', { mistakes: ['No fixed-fare experiment'] });
  const quantity = card.base - card.slope * current.price + current.shift;
  if (decimal(answer.value) !== decimal(quantity)) {
    return result(false, 'Use your final fare and shift. Subtract the price term from the intercept, then add the shift.', { mistakes: ['Model substitution'] });
  }
  return result(true, 'Your conclusion matches the final slider settings and your log includes a fixed-fare comparison.');
}

function derivation(card, answer, previous) {
  const key = card.private;
  if (card.mode === 'fallacy') {
    select([answer.lineId], card.lines, 'line');
    select([answer.reasonId], card.reasons, 'reason');
    if (answer.lineId !== key.lineId) return result(false, key.lineHint, { mistakes: ['Unsupported line misidentified'] });
    if (answer.reasonId !== key.reasonId) return result(false, key.reasonFeedback[answer.reasonId], { mistakes: ['Reason: ' + answer.reasonId] });
    return result(true, key.success);
  }
  const index = previous.stepIndex ?? 0;
  if (index >= card.steps.length) return result(true, 'You have completed each step.', { stepIndex: card.steps.length });
  const step = card.steps[index];
  ensure(answer.stepId === step.id, 'Submit the currently released step.');
  if (decimal(answer.value) !== decimal(key.answers[step.id])) return result(false, key.feedback[step.id], { stepIndex: index, mistakes: ['Step: ' + step.id] });
  const next = index + 1;
  return result(next === card.steps.length, next === card.steps.length ? 'All steps are complete.' : 'Step recorded. The next line is available.', { stepIndex: next });
}

function matrix(card, answer) {
  ensure(record(answer.placements) && Object.keys(answer.placements).length === card.items.length, 'Classify every scenario.');
  const misses = card.items.filter(item => {
    const placement = answer.placements[item.id];
    select([placement], card.buckets, 'bucket');
    return placement !== card.private.answers[item.id];
  });
  const score = (card.items.length - misses.length) / card.items.length;
  const feedback = misses.map(({ id }) => card.private.feedback[id]).join(' ');
  return result(score >= card.threshold, feedback || 'Every scenario is correctly classified.', {
    score, mistakes: misses.map(item => item.id)
  });
}

export function evaluateCard(lesson, cardId, answer, previous = {}) {
  const card = lesson.cards.find(card => card.id === cardId);
  ensure(card && record(answer), 'Unknown card or malformed answer.');
  switch (card.type) {
    case 'SocraticReveal': {
      if (card.mode === 'tap') {
        ensure(answer.reveal === true, 'Select reveal to open the comparison.');
        return result(true, 'The teacher comparison is available.');
      }
      const count = wordCount(textField(answer.prediction));
      return result(count >= card.minWords, count >= card.minWords ? 'Compare your prediction with the teacher’s reasoning.' : 'Add detail to reach ' + card.minWords + ' words.');
    }
    case 'ConceptCheck': return checkConcept(card, answer);
    case 'PostFirstPrompt': {
      const count = wordCount(textField(answer.text));
      const paste = answer.pasteWords ?? 0;
      ensure(Number.isInteger(paste) && paste >= 0 && paste <= 1000000, 'Invalid paste length.');
      return result(count >= card.minWords, count >= card.minWords ? 'Your response is recorded. Read the sample perspectives.' : 'Develop your own analysis to at least ' + card.minWords + ' words.', {
        pasteFlag: previous.pasteFlag === true || paste >= 30
      });
    }
    case 'AnnotatedExcerpt': {
      const visited = [...new Set([...(previous.visited ?? []), ...select(answer.visited, card.segments, 'annotation')])];
      const coverage = visited.length / card.segments.length;
      return result(coverage === 1, visited.length + ' of ' + card.segments.length + ' annotations visited.', { visited, coverage });
    }
    case 'InteractiveModel': return model(card, answer);
    case 'StepwiseDerivation': return derivation(card, answer, previous);
    case 'ContrastMatrix': return matrix(card, answer);
    case 'SynthesisGate': {
      const count = wordCount(textField(answer.text));
      const skills = select(answer.skills, card.skills, 'learning skill');
      const complete = count >= card.minWords && skills.length === 2;
      return result(complete, complete ? 'Your memo and two learning skills are recorded.' : 'Write at least ' + card.minWords + ' words and choose two different learning skills.');
    }
    default: throw new RangeError('Unknown card type.');
  }
}
