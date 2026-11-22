import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const harness = `
import React from "react";
import {createRoot} from "react-dom/client";
import {LessonCard} from "/src/learning/cards/LessonCard.tsx";
const mount = document.getElementById("root");
let root = createRoot(mount);
let props;
const submissions = window.submissions = [], writes = window.writes = [], replies = window.replies = [];
window.setup = (card, state = {}, extras = {}) => {
  props = {
    card, state, scratchpad: "", ...extras,
    submit: async (answer) => { submissions.push(answer); await window.onSubmit?.(answer); },
    reply: async (peerId, text) => { replies.push({peerId,text}); },
    saveDraft: async (draft) => {
      writes.push(draft);
      await window.onSave?.(draft);
      const version = draft.baseVersion + 1;
      const history = [...(props.state.history ?? []), {version, diff:draft.diff, createdAt: "now"}];
      window.update({state: {...props.state, draft:{...draft,version}, history}});
      return {version};
    }
  };
  root.render(React.createElement(LessonCard,props));
};
window.update = patch => {
  props = {...props, ...patch};
  root.render(React.createElement(LessonCard,props));
};
window.remount = () => { root.unmount(); root=createRoot(mount); root.render(React.createElement(LessonCard, props)); };
`;
let server, browser, url;
before(async () => {
  server = await createServer({
    configFile: false,
    cacheDir: "node_modules/.vite-lesson-cards-test",
    optimizeDeps: {include: ["react", "react-dom/client", "prosemirror-view", "prosemirror-state", "prosemirror-schema-basic", "prosemirror-commands", "prosemirror-keymap", "prosemirror-history"]},
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0 },
    plugins: [
      {
        name: "lesson-card-test-harness",
        configureServer(vite) {
          vite.middlewares.use((req, res, next) => {
            if (req.url !== "/cards-test/") return next();
            res.setHeader("Content-Type", "text/html");
            res.end(
              '<meta name="viewport" content="width=device-width"><div id="root"></div><script type="module" src="/__card-test.js"></script>',
            );
          });
        },
        resolveId(id) {
          if (id === "/__card-test.js") return "\0__card-test.js";
        },
        load(id) {
          if (id === "\0__card-test.js") return harness;
        },
      },
    ],
  });
  await server.listen();
  url = server.resolvedUrls.local[0] + "cards-test/";
  browser = await chromium.launch({ executablePath: process.env.LFA_TEST_BROWSER_EXECUTABLE });
});
after(async () => {
  try {
    await browser?.close();
  } finally {
    await server?.close();
  }
});
function activity(type, specific) {
  return { id: type, type, title: type, prompt: "Read the task.", ktca: [], required: true, ...specific };
}
function option(id) {
  return { id, label: id };
}
async function setup(page, card, state, extras) {
  await page.evaluate((args) => window.setup(...args), [card, state, extras]);
  await page.getByRole("heading", { name: card.title, exact: true }).waitFor();
}
async function testPage(t) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  t.after(async () => {
    try {
      assert.deepEqual(errors, []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    } finally {
      await page.close();
    }
  });
  await page.goto(url);
  await page.waitForFunction(() => typeof window.setup === "function");
  return page;
}
async function last(page, list = "submissions") {
  await page.waitForFunction((name) => window[name].length > 0, list);
  return page.evaluate((name) => window[name].at(-1), list);
}
test("prediction and blind discussion use server releases, track one external paste, and retain failed submissions", async (t) => {
  const p = await testPage(t);
  const card = activity("SocraticReveal", {
    mode: "predict",
    minWords: 15,
    teacherReasoning: "Compare the two observations.",
  });
  await setup(p, card);
  const reveal = p.getByRole("button", { name: "Reveal the reasoning" });
  assert(await reveal.isDisabled());
  assert.equal(await p.getByText(card.teacherReasoning).count(), 0);
  await p.getByRole("textbox").fill("evidence ".repeat(15));
  await reveal.click();
  assert.equal((await last(p)).prediction.trim().split(/\s+/).length, 15);
  await p.evaluate(() => window.update({ state: { completed: true } }));
  await p.getByText(card.teacherReasoning).waitFor();
  const post = activity("PostFirstPrompt", {
    minWords: 3,
    peers: [{ id: "a", label: "Peer A", text: "Released perspective" }],
    teacherModel: "Released model",
  });
  await setup(p, post);
  assert.equal(await p.getByText("Released perspective").count(), 0);
  await p.getByRole("textbox").fill("My written response");
  await p.locator("textarea").evaluate((el) => {
    const data = new DataTransfer();
    data.setData("text/plain", "paste ".repeat(30));
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    window.onSubmit = async () => {
      throw new Error("Could not reach class");
    };
  });
  await p.getByRole("button", { name: "Post to unlock discussion" }).click();
  await p.getByRole("alert").filter({ hasText: "Could not reach class" }).waitFor();
  assert.deepEqual(await last(p), { text: "My written response", pasteWords: 30 });
  await p.evaluate(() => {
    window.onSubmit = async () => window.update({ state: { completed: true, feedback: "Posted" } });
  });
  await p.getByRole("button", { name: "Post to unlock discussion" }).click();
  await p.getByText("Released model").waitFor();
  await p.getByRole("textbox", { name: "Reply to Peer A" }).fill("One comparison.");
  await p.getByRole("button", { name: "Send reply" }).click();
  assert.deepEqual(await last(p, "replies"), { peerId: "a", text: "One comparison." });
});

test("single, multiple, numeric and tap interactions send only the selected answer and expose retry feedback", async (t) => {
  const p = await testPage(t);
  for (const mode of ["single", "multiple", "numeric"]) {
    await setup(p, activity("ConceptCheck", { id: mode, mode, options: ["A", "B"].map(option) }));
    if (mode === "numeric") await p.getByRole("spinbutton").fill("2.5");
    else if (mode === "single") await p.getByRole("radio", { name: "B" }).check();
    else for (const opt of ["A", "B"]) await p.getByRole("checkbox", { name: opt }).check();
    await p.getByRole("button", { name: "Check answer" }).click();
    assert.deepEqual(
      await last(p),
      mode === "numeric" ? { value: "2.5" } : { choices: mode === "single" ? ["B"] : ["A", "B"] },
    );
    await p.evaluate(() =>
      window.update({ state: { completed: false, feedback: "Review the price comparison." } }),
    );
    await p.getByText("Review the price comparison.").waitFor();
  }
  await setup(p, activity("SocraticReveal", { mode: "tap", minWords: 0 }));
  await p.getByRole("button", { name: "Reveal the reasoning" }).click();
  assert.deepEqual(await last(p), { reveal: true });
});

test("numbered annotations persist coverage and the model records keyboard changes and a conclusion", async (t) => {
  const p = await testPage(t);
  await setup(
    p,
    activity("AnnotatedExcerpt", {
      segments: [
        { id: "a", text: "Extract.", note: "First note" },
        { id: "b", text: "Second.", note: "Second note" },
      ],
    }),
  );
  await p.evaluate(() => {
    window.onSubmit = async (answer) => window.update({ state: { visited: answer.visited } });
  });
  await p.getByRole("button", { name: "Open note 1" }).click();
  await p.getByText("1 of 2 notes reviewed").waitFor();
  await p.getByRole("radio", { name: "All annotations" }).check();
  await p.getByRole("button", { name: "Mark note 2 as reviewed" }).click();
  await p.getByText("2 of 2 notes reviewed").waitFor();
  await p.evaluate(() => {
    delete window.onSubmit;
  });
  await setup(
    p,
    activity("InteractiveModel", {
      base: 30,
      slope: 2,
      question: "Read the output",
      parameters: [
        { id: "price", label: "Price", min: 1, max: 10, step: 1, initial: 3 },
        { id: "shift", label: "Shift", min: 0, max: 12, step: 2, initial: 0 },
      ],
    }),
  );
  await p.getByRole("slider", { name: "Shift" }).press("ArrowRight");
  await p.getByRole("img", { name: /quantity is 26/ }).waitFor();
  await p.getByRole("spinbutton").fill("26");
  await p.getByRole("button", { name: "Verify model result" }).click();
  assert.deepEqual(await last(p), {
    parameters: { price: 3, shift: 2 },
    history: [
      { price: 3, shift: 0 },
      { price: 3, shift: 2 },
    ],
    value: "26",
  });
});

test("released steps, reasoning and drag or keyboard classifications submit to the same decision path", async (t) => {
  const p = await testPage(t);
  const first = activity("StepwiseDerivation", {
    id: "fill",
    mode: "fill",
    steps: [{ id: "a", prompt: "Calculate A" }],
    totalSteps: 2,
  });
  await setup(p, first);
  await p.getByRole("textbox").fill("2");
  await p.getByRole("button", { name: "Check step" }).click();
  assert.deepEqual(await last(p), { stepId: "a", value: "2" });
  await p.evaluate((card) => window.update({ card, state: { stepIndex: 1 } }), {
    ...first,
    steps: [...first.steps, { id: "b", prompt: "Calculate B" }],
  });
  assert.equal(await p.getByRole("textbox", { name: /Calculate B/ }).inputValue(), "");
  await setup(
    p,
    activity("StepwiseDerivation", {
      id: "fallacy",
      mode: "fallacy",
      lines: [{ id: "i", text: "Observation" }],
      reasons: [option("Units")],
    }),
  );
  await p.getByRole("radio").check();
  await p.getByRole("combobox").selectOption("Units");
  await p.getByRole("button", { name: "Check reasoning" }).click();
  assert.deepEqual(await last(p), { lineId: "i", reasonId: "Units" });
  await setup(
    p,
    activity("ContrastMatrix", {
      items: [
        { id: "one", text: "First case" },
        { id: "two", text: "Second case" },
      ],
      buckets: ["Here", "There"].map(option),
      threshold: 0.8,
    }),
  );
  await p.locator(".lc-drag-handle").first().dragTo(p.locator(".lc-buckets section").first());
  await p.getByRole("combobox").nth(1).selectOption("There");
  await p.getByRole("button", { name: "Check classifications" }).click();
  assert.deepEqual(await last(p), { placements: { one: "Here", two: "There" } });
});

test("ProseMirror captures multiline text, quotes, skills, timed deltas, restored drafts and final submission", async (t) => {
  const p = await testPage(t);
  await p.clock.install();
  await setup(
    p,
    activity("SynthesisGate", {
      minWords: 3,
      skills: ["organization", "initiative", "responsibility"].map(option),
    }),
    {},
    { scratchpad: "A source observation" },
  );
  const editor = p.getByRole("textbox", { name: "Your synthesis" });
  await editor.fill("First paragraph.");
  await editor.press("End");
  await editor.press("Enter");
  await editor.press("M");
  await editor.evaluate((el) => {
    const data = new DataTransfer();
    data.setData("text/plain", "ore text\nThird line");
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });
  assert.match(await editor.textContent(), /Third line/);
  await p.getByRole("button", { name: "Quote from my scratchpad" }).click();
  assert.match(await editor.locator("blockquote").innerText(), /A source observation/);
  await p.getByRole("checkbox", { name: "organization" }).check();
  await p.getByRole("checkbox", { name: "initiative" }).check();
  assert(await p.getByRole("checkbox", { name: "responsibility" }).isDisabled());
  await p.clock.fastForward("00:11");
  await p.getByText("Saved version 1", { exact: true }).waitFor();
  const first = await last(p, "writes");
  assert.equal(first.baseVersion, 0);
  assert.equal(first.text, first.diff.inserted);
  assert.deepEqual(first.skills, ["organization", "initiative"]);
  assert.equal(first.doc.type, "doc");
  await p.evaluate(() => window.remount());
  assert.equal(await editor.locator("blockquote").innerText(), "A source observation");
  await editor.fill("A changed final draft");
  await p.clock.fastForward("00:11");
  await p.getByText("Saved version 2", { exact: true }).waitFor();
  await p.getByText("Draft history (2)").click();
  await p.getByRole("combobox", { name: "Version" }).selectOption("1");
  await p.getByRole("button", { name: "Restore this text" }).click();
  await p.getByText("Saved version 3", { exact: true }).waitFor();
  await p.getByRole("button", { name: "Submit synthesis" }).click();
  const answer = await last(p);
  assert.equal(answer.text, first.text);
  assert.deepEqual(answer.skills, first.skills);
  assert.equal(await p.evaluate(() => window.writes.length), 3);
});
