import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { compileLesson, buildLessons } from './lint-lessons.mjs';
import { publicLesson, evaluateCard } from '../backend/src/lessons/catalog.js';

const sampleDirectory = new URL('./fixtures/lesson-authoring/', import.meta.url);
const read = path => readFileSync(new URL(path, sampleDirectory), 'utf8');
const mdx = read('authored/fixture-all-cards.mdx');
const cards = JSON.parse(read('authored/fixture-all-cards.cards.json'));
const fixture = JSON.parse(read('compiled/fixture-all-cards.json'));
const attempt = (id, answer, prev) => evaluateCard(fixture, id, answer, prev);
const get = (doc, id) => doc.cards.find(c => c.id === id);

test('public CI validates both synthetic sources and eight JSON schemas without private files', () => {
  assert.deepEqual(buildLessons(true), ['fixture-all-cards','fixture-pilot']);
  assert.deepEqual(compileLesson(mdx, cards), { lesson:fixture, warnings:[] });
  assert.equal(new Set(fixture.cards.map(c => c.type)).size, 8);
});

test('MDX parser rejects expressions, executable syntax, unregistered tags, invalid math and broken anchors', () => {
  for (const bad of [
    '<script src="test" />', '{run()}', 'import x from "course"', 'export default course', '<Wrong id="x" />',
    '<ConceptCheck id={getId()} />', '<Anchor id="fixture-intro" />\n\nOther prose.',
    '$$\n\\href{https://example.org}{x}\n$$', '$$\n\\frac{1}{\n$$'
  ]) assert.throws(() => compileLesson(mdx.replace('## Paper symbols', () => bad), cards));
  assert.throws(() => compileLesson(mdx.replace('<AnnotatedExcerpt id="read-notes" />', ''), cards), /unused/);
});

test('standard lesson requires two microchecks, a blind post, and a final synthesis', () => {
  function remove(ids) {
    let source = mdx;
    for (const id of ids) source = source.replace(new RegExp('<\\w+ id="' + id + '" \\/>'), '');
    return () => compileLesson(source, cards.filter(c => !ids.includes(c.id)));
  }
  assert.throws(remove(['one-choice','many-choices']),/two ConceptCheck/);
  assert.throws(remove(['own-post']),/PostFirstPrompt/);
  assert.throws(remove(['finish']),/SynthesisGate/);
});

test('schema and cross-reference pass rejects incomplete distractor diagnoses and invalid keys', () => {
  for (const change of [
    c => { delete c[1].private.feedback.square; },
    c => { c[1].private.feedback.triangle.hint = ' '; },
    c => { c[1].private.correct = ['unknown']; },
    c => { c[3].private.errors[0].value = c[3].private.value; },
    c => { c[0].teacherCopy = 'unregistered property'; },
    c => { c[7].steps[1].id = 'first'; }
  ]) {
    const invalid = structuredClone(cards);
    change(invalid);
    assert.throws(() => compileLesson(mdx,invalid));
  }
});

test('prose warnings count consecutive paragraphs with strict English and Han thresholds', () => {
  const sample = 'A sheet holds coloured symbols. Trace a mark to follow the exercise.';
  function warnings(a,b) {
    return compileLesson(mdx.replace(sample, a + '\n\n<Anchor id="next" />\n\n' + b),cards).warnings.length;
  }
  assert.equal(warnings('word '.repeat(100),'word '.repeat(150)),0);
  assert.equal(warnings('word '.repeat(100),'word '.repeat(151)),1);
  assert.equal(warnings('字'.repeat(200),'字'.repeat(200)),0);
  assert.equal(warnings('字'.repeat(200),'字'.repeat(201)),1);
});

test('projection withholds later steps, teacher feedback, gated reading, and blind materials by default', () => {
  const initial = publicLesson(fixture);
  const text = JSON.stringify(initial);
  assert.ok(initial.cards.every(c => !Object.hasOwn(c,'private')));
  for (const secret of [cards[0].private.teacherReasoning,cards[4].private.teacherModel,cards[4].private.peers[0].text,cards[7].steps[2].prompt,fixture.nextReading.text]) {
    assert.equal(text.includes(secret),false);
  }
  const granted = publicLesson(fixture, {predict:{completed:true},'own-post':{completed:true},sequence:{stepIndex:1},sort:{completed:true}});
  assert.equal(get(granted,'own-post').peers.length,2);
  assert.equal(get(granted,'predict').teacherReasoning,cards[0].private.teacherReasoning);
  assert.equal(get(granted,'sequence').steps.length,2);
  assert.equal(get(granted,'sort').reference.length,5);
});

test('prediction and tap reveal, single/multiple per-distractor feedback, exact numeric grading', () => {
  assert.equal(attempt('predict',{prediction:'shape '.repeat(14)}).completed,false);
  assert.equal(attempt('predict',{prediction:'shape '.repeat(15)}).completed,true);
  const tap = {cards:[{...cards[0],mode:'tap',minWords:0}]};
  assert.throws(() => evaluateCard(tap,'predict',{}),RangeError);
  assert.equal(evaluateCard(tap,'predict',{reveal:true}).completed,true);
  const wrong = attempt('one-choice',{choices:['square']});
  assert.equal(wrong.completed,false);
  assert.notDeepEqual(wrong.mistakes,attempt('one-choice',{choices:['triangle']}).mistakes);
  assert.notEqual(wrong.feedback,attempt('one-choice',{choices:['triangle']}).feedback);
  assert.equal(attempt('one-choice',{choices:['circle']},wrong).completed,true);
  assert.equal(attempt('many-choices',{choices:['circle']}).completed,false);
  assert.equal(attempt('many-choices',{choices:['circle','oval']}).completed,true);
  assert.equal(attempt('many-choices',{choices:['square','triangle']}).mistakes.length,2);
  assert.throws(() => attempt('many-choices',{choices:['oval','oval']}),RangeError);
  for (const value of [7,'7.00','.7e1','007.00000000']) assert.equal(attempt('exact-number',{value}).completed,true);
  for (const value of ['7.000000000000000000001',3,0,9]) assert.equal(attempt('exact-number',{value}).completed,false);
  for (const value of ['',null,[],true,'Infinity']) assert.throws(() => attempt('exact-number',{value}),RangeError);
});

test('post unlock, single-paste threshold and cumulative excerpt coverage', () => {
  const short = attempt('own-post',{text:'shape '.repeat(7),pasteWords:30});
  assert.equal(short.completed,false);
  assert.equal(short.pasteFlag,true);
  const pass = attempt('own-post',{text:'shape '.repeat(8),pasteWords:29});
  assert.equal(pass.completed,true);
  assert.equal(pass.pasteFlag,false);
  assert.equal(attempt('own-post',{text:'shape '.repeat(8)},short).pasteFlag,true);
  const partial = attempt('read-notes',{visited:['red']});
  assert.equal(partial.coverage,1/3);
  assert.equal(attempt('read-notes',{visited:['red']},partial).visited.length,1);
  assert.equal(attempt('read-notes',{visited:['blue','green']},partial).completed,true);
});

test('model conclusion must match submitted parameters and actual fixed-fare comparison in the log', () => {
  const start = {price:5,shift:0}, end = {price:5,shift:4};
  const answer = {parameters:end,history:[start,end],value:34};
  assert.equal(attempt('sliders',answer).completed,true);
  assert.equal(attempt('sliders',{...answer,value:30}).completed,false);
  assert.equal(attempt('sliders',{...answer,history:[end]}).completed,false);
  assert.throws(() => attempt('sliders',{...answer,parameters:start}),RangeError);
  assert.throws(() => attempt('sliders',{...answer,history:[{price:5,shift:3},end]}),RangeError);
});

test('derivation requires the released step; fallacy requires correct line and reason', () => {
  assert.throws(() => attempt('sequence',{stepId:'third',value:6}),RangeError);
  const again = attempt('sequence',{stepId:'first',value:9});
  assert.equal(again.stepIndex,0);
  const one = attempt('sequence',{stepId:'first',value:2},again);
  const two = attempt('sequence',{stepId:'second',value:4},one);
  assert.equal(attempt('sequence',{stepId:'third',value:6},two).completed,true);
  assert.equal(attempt('bad-line',{lineId:'middle',reasonId:'sum'}).completed,false);
  assert.equal(attempt('bad-line',{lineId:'top',reasonId:'typo'}).completed,false);
  assert.equal(attempt('bad-line',{lineId:'middle',reasonId:'typo'}).completed,true);
});

test('classification records individual wrong items at 80%; synthesis checks length and two different skills', () => {
  const placements = {...get(fixture,'sort').private.answers, beta:'square'};
  const pass = attempt('sort',{placements});
  assert.deepEqual(pass.mistakes,['beta']);
  assert.equal(pass.score,0.8);
  assert.equal(pass.completed,true);
  assert.equal(attempt('sort',{placements:{...placements,zeta:'square'}}).completed,false);
  const memo = {text:'shape '.repeat(12),skills:['responsibility','initiative']};
  assert.equal(attempt('finish',memo).completed,true);
  assert.equal(attempt('finish',{...memo,skills:['initiative']}).completed,false);
  assert.equal(attempt('finish',{...memo,text:'shape '.repeat(11)}).completed,false);
  assert.throws(() => attempt('finish',{...memo,skills:['initiative','initiative']}),RangeError);
});
