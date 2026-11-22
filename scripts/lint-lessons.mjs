import { readFileSync, readdirSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { basename, resolve } from 'node:path';
import Ajv from 'ajv';
import katex from 'katex';

const schemaDir = new URL('../schemas/lesson-cards/', import.meta.url);
const fixtureDir = new URL('./fixtures/lesson-authoring/', import.meta.url);
const read = url => readFileSync(url, 'utf8');
const fileNames = directory => readdirSync(directory).sort();
const ajv = new Ajv({ allErrors: true });
const validators = new Map();
for (const name of fileNames(schemaDir).filter(file => file.endsWith('.json'))) {
  const schema = JSON.parse(read(new URL(name, schemaDir)));
  ajv.addSchema(schema);
  if (name !== 'common.json') validators.set(basename(name, '.json'), schema.$id);
}

function demand(condition, message) {
  if (!condition) throw new Error(message);
}

const idSchema = { type: 'string', pattern: '^[a-z][a-z0-9-]{0,63}$' };
const nonempty = { type: 'string', pattern: '\\S' };
const metadataKeys = ['id', 'version', 'courseCode', 'unit', 'title', 'glossary'];
const validMeta = ajv.compile({
  type: 'object', additionalProperties: false, required: metadataKeys,
  properties: {
    nextReading: { type: 'object', required: ['title','text'], additionalProperties: false, properties: {title: nonempty, text: nonempty} },
    id: idSchema, version: { type: 'string', pattern: '^[0-9]+(?:\\.[0-9]+)*$' },
    courseCode: { type: 'string', pattern: '^[A-Z0-9]{5}$' }, unit: nonempty, title: nonempty,
    glossary: {
      type: 'array', items: {
        type: 'object', required: ['term', 'definition', 'paragraphId'], additionalProperties: false,
        properties: { term: nonempty, definition: nonempty, paragraphId: idSchema }
      }
    }
  }
});

function exactKeys(keys, object, description) {
  demand(keys.length === Object.keys(object).length && keys.every(key => Object.hasOwn(object, key)), description);
}

const learningSkills = ['responsibility', 'organization', 'independent-work', 'collaboration', 'initiative', 'self-regulation'];
function validateCard(card) {
  const schema = validators.get(card?.type);
  demand(schema && ajv.validate(schema, card), 'Invalid ' + (card?.id ?? 'card') + ': ' + (schema ? ajv.errorsText(ajv.errors) : 'unknown card type'));
  for (const list of [card.options, card.segments, card.steps, card.lines, card.reasons, card.buckets, card.items, card.skills, card.parameters, card.private?.peers]) {
    if (list) demand(new Set(list.map(item => item.id)).size === list.length, card.id + ': duplicate option or item ID');
  }
  const key = card.private;
  if (card.type === 'ConceptCheck' && card.options) {
    const ids = card.options.map(option => option.id);
    demand(key.correct.every(id => ids.includes(id)), card.id + ': unknown correct choice');
    const wrong = ids.filter(id => !key.correct.includes(id));
    demand(wrong.length > 0, card.id + ': provide a distractor');
    exactKeys(wrong, key.feedback, card.id + ': every distractor needs its own feedback');
  }
  if (card.type === 'ConceptCheck' && card.mode === 'numeric') {
    const values = [key.value, ...key.errors.map(error => error.value)];
    demand(new Set(values).size === values.length, card.id + ': conflicting numeric feedback');
  }
  if (card.type === 'StepwiseDerivation' && card.mode === 'fill') {
    const ids = card.steps.map(step => step.id);
    exactKeys(ids, key.answers, card.id + ': missing or unused step answer');
    exactKeys(ids, key.feedback, card.id + ': missing or unused step hint');
  }
  if (card.type === 'StepwiseDerivation' && card.mode === 'fallacy') {
    demand(card.lines.some(line => line.id === key.lineId) && card.reasons.some(reason => reason.id === key.reasonId), card.id + ': invalid fallacy key');
    exactKeys(card.reasons.map(reason => reason.id).filter(id => id !== key.reasonId), key.reasonFeedback, card.id + ': missing or unused reason hint');
  }
  if (card.type === 'ContrastMatrix') {
    const ids = card.items.map(item => item.id);
    exactKeys(ids, key.answers, card.id + ': provide an answer for each scenario');
    exactKeys(ids, key.feedback, card.id + ': provide feedback for each scenario');
    demand(Object.values(key.answers).every(id => card.buckets.some(bucket => bucket.id === id)), card.id + ': unknown destination bucket');
  }
  if (card.type === 'InteractiveModel') {
    for (const p of card.parameters) {
      demand(p.min < p.max && p.initial >= p.min && p.initial <= p.max && (p.max - p.min) % p.step === 0 && (p.initial - p.min) % p.step === 0, card.id + ': invalid slider settings');
    }
  }
  if (card.type === 'SynthesisGate') demand(learningSkills.every(id => card.skills.some(skill => skill.id === id)), card.id + ': unknown learning skill');
  const expectedRequired = !['AnnotatedExcerpt', 'SocraticReveal'].includes(card.type);
  demand(card.required === expectedRequired, card.id + ': gate setting conflicts with the card type');
}

// A restricted, data-only MDX grammar: JSON front matter, Markdown headings, anchored
// paragraphs, display math and self-closing registered components with a literal id.
// No MDX source is imported, evaluated, or turned into JavaScript.
export function compileLesson(source, definitions) {
  const frontMatter = /^---\n([\s\S]+?)\n---(?:\n|$)/.exec(source.replaceAll('\r\n', '\n'));
  demand(frontMatter, 'Expected JSON front matter');
  const meta = JSON.parse(frontMatter[1]);
  demand(validMeta(meta), 'Invalid lesson metadata: ' + ajv.errorsText(validMeta.errors));
  demand(Array.isArray(definitions), 'Expected an array of card definitions');
  definitions.forEach(validateCard);
  const cardsById = new Map(definitions.map(card => [card.id, card]));
  demand(cardsById.size === definitions.length, 'Duplicate card definition');
  const paragraphs = [], cards = [], blocks = [], warnings = [];
  const ids = new Set();
  function block(type, id, text) {
    demand(!ids.has(id), 'Duplicate block ID: ' + id);
    ids.add(id);
    blocks.push(text === undefined ? { type, id } : { type, id, text });
  }
  const sections = source.replaceAll('\r\n', '\n').slice(frontMatter[0].length).trim().split(/\n[ \t]*\n/);
  let words = 0, characters = 0, anchor = null, equation = 0;
  function checkProseLength() {
    if (words > 250 || characters > 400) warnings.push('Continuous prose has ' + words + ' English words and ' + characters + ' Han characters before ' + (blocks.at(-1)?.id ?? 'the first card') + '.');
    words = 0;
    characters = 0;
  }
  for (const raw of sections) {
    const part = raw.trim();
    if (!part) continue;
    const tag = /^<([A-Za-z]+) id="([a-z][a-z0-9-]{0,63})"\s*\/>$/.exec(part);
    if (tag) {
      demand(!anchor, 'Anchor must precede a prose paragraph');
      const [, type, id] = tag;
      if (type === 'Anchor') {
        anchor = id;
      } else {
        const card = cardsById.get(id);
        demand(card && card.type === type, 'Unknown or mismatched component ' + part);
        checkProseLength();
        block('card', id);
        cards.push(card);
      }
      continue;
    }
    if (/^\$\$\n/.test(part)) {
      demand(!anchor && /^\$\$\n[^$]+\n\$\$$/.test(part), 'Use a complete display math block');
      const tex = part.slice(3, -3).trim();
      const allowed = new Set(['frac', 'sqrt', 'cdot', 'times', 'left', 'right', 'le', 'ge', 'neq', 'pm', 'Delta', 'alpha', 'beta', 'pi', 'to', 'infty', 'lim', 'sum', 'sin', 'cos', 'ln', 'log']);
      demand(tex.length <= 2000 && [...tex.matchAll(/\\([a-zA-Z]+|.)/g)].every(match => allowed.has(match[1])), 'Unsupported math command');
      katex.renderToString(tex, { displayMode: true, strict: 'error', trust: false, throwOnError: true, maxExpand: 100 });
      block('math', 'equation-' + ++equation, tex);
      continue;
    }
    demand(!/[<>{}`]/.test(part) && !/^\s*(?:import|export)\b/m.test(part), 'Unsupported executable or markup content');
    if (/^## /.test(part)) {
      demand(!anchor && !part.includes('\n'), 'Invalid heading');
      const text = part.slice(3).trim();
      const slug = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
      demand(slug, 'Heading must contain text');
      block('heading', 'section-' + slug, text);
      continue;
    }
    demand(anchor && part && !/^\s*(?:#|\$\$)/m.test(part), 'Each prose paragraph needs a literal Anchor component');
    const text = part.replace(/\s+/g, ' ');
    paragraphs.push({ id: anchor, text });
    block('paragraph', anchor, text);
    words += text.match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)?.length ?? 0;
    characters += text.match(/\p{Script=Han}/gu)?.length ?? 0;
    anchor = null;
  }
  demand(!anchor, 'Unattached final anchor');
  checkProseLength();
  demand(cards.length === definitions.length, 'A card definition is unused in the MDX');
  demand(cards.filter(card => card.type === 'ConceptCheck').length >= 2, 'Standard lessons require at least two ConceptCheck cards');
  demand(cards.some(card => card.type === 'PostFirstPrompt'), 'Standard lessons require a PostFirstPrompt');
  demand(cards.filter(card => card.type === 'SynthesisGate').length === 1 && cards.at(-1)?.type === 'SynthesisGate' && blocks.at(-1)?.type === 'card', 'A single final SynthesisGate is required');
  demand(paragraphs.length && meta.glossary.every(entry => paragraphs.some(p => p.id === entry.paragraphId)), 'Each glossary anchor must name an existing paragraph');
  return { lesson: { ...meta, paragraphs, blocks, cards }, warnings };
}

export function buildLessons(checkOnly = false, { authored = new URL('authored/', fixtureDir), compiled = new URL('compiled/', fixtureDir), privatePack = false } = {}) {
  const files = fileNames(authored);
  const names = files.filter(name => name.endsWith('.mdx')).map(name => basename(name, '.mdx'));
  demand(names.length, 'No authored lessons found');
  if (privatePack) demand(['cia4u-demand-2-3','mcv4u-derivative-graphs'].every(name => names.includes(name)), 'Missing expected private teaching lesson');
  const results = names.map(name => {
    const source = read(new URL(name + '.mdx', authored));
    const { lesson, warnings } = compileLesson(source, JSON.parse(read(new URL(name + '.cards.json', authored))));
    demand(lesson.id === name, 'MDX filename must match the lesson id');
    for (const warning of warnings) console.warn(name + ': ' + warning);
    return { name, serialized: JSON.stringify(lesson, null, 2) + '\n' };
  });
  demand(files.every(file => !file.endsWith('.cards.json') || names.includes(basename(file, '.cards.json'))), 'Orphan authored card definitions');
  if (!checkOnly) mkdirSync(compiled, { recursive: true });
  for (const { name, serialized } of results) {
    const file = new URL(name + '.json', compiled);
    if (checkOnly) demand(read(file) === serialized, 'Stale compiled lesson: ' + name);
    else {
      const temp = new URL(name + '.' + process.pid + '.tmp', compiled);
      writeFileSync(temp, serialized);
      renameSync(temp, file);
    }
  }
  for (const file of fileNames(compiled).filter(name => name.endsWith('.json'))) {
    if (!names.includes(basename(file, '.json'))) {
      demand(!checkOnly, 'Orphan compiled lesson: ' + file);
      unlinkSync(new URL(file, compiled));
    }
  }
  return names;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const privatePack = args.includes('--private');
    if (args.some(arg => !['--private', '--check'].includes(arg))) throw new Error('Usage: node ' + fileURLToPath(import.meta.url) + ' [--private] [--check]');
    const asDirectory = dir => pathToFileURL(resolve(dir) + '/');
    const options = privatePack ? {
      privatePack: true,
      authored: process.env.LFA_LESSON_SOURCE_DIR ? asDirectory(process.env.LFA_LESSON_SOURCE_DIR) : new URL('../backend/src/lessons/authored/', import.meta.url),
      compiled: process.env.LFA_LESSON_CONTENT_DIR ? asDirectory(process.env.LFA_LESSON_CONTENT_DIR) : new URL('../backend/src/lessons/compiled/', import.meta.url)
    } : {};
    const names = buildLessons(args.includes('--check'), options);
    console.log('Validated ' + (privatePack ? 'private teaching pack' : 'public synthetic fixtures') + ': ' + names.join(', '));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
