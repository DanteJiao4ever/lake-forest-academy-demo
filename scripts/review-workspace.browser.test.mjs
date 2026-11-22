import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { chromium } from "playwright-core";
import { createServer } from "vite";
import { transition } from "../backend/src/services/review-workflow.js";

test("phone faculty and student review screens support anchored requests, evidence, student revision and release", async () => {
  const began = new Date().toISOString();
  const text = "Two points on the same graph.";
  const raw = {
    id: randomUUID(),
    contents: {
      versions: [{ version: 1, text, at: began }],
      threads: [],
      defenses: [],
      evidence: {
        history: [
          {
            version: 1,
            diff: { from: 0, removed: 0, inserted: text },
            createdAt: began,
          },
        ],
        pasteEvents: [{ cardId: "Blind post", wordCount: 31 }],
      },
    },
    submission_id: null,
    revision: 1,
    released_at: null,
    waiting_since: began,
  };
  const id = raw.id;
  let published = false;
  const summary = () => ({
    id,
    title: "Review a graph",
    studentName: "Casey",
    revision: raw.revision,
    version: raw.contents.versions.length,
    kind: "synthesis",
    published: false,
    waitingSince: raw.waiting_since,
    releasedAt: raw.released_at,
    dueAt: raw.waiting_since,
    submittedAt: began,
    gradeHref: null,
  });
  const result = (role) => ({
    ...summary(),
    ...raw.contents,
    ...(role === "student" ? { evidence: undefined } : {}),
  });
  const harness = `import React from "react";import {createRoot} from "react-dom/client";import {ReviewWorkspace} from "/src/learning/review/ReviewWorkspace.tsx";
    const role=location.search.slice(1), root=createRoot(document.getElementById("root"));
    window.connectReview=(endpoint)=>root.render(React.createElement(ReviewWorkspace,{courseCode:"MCV4U",role,csrf:()=>role,endpoint,returnHref:"#/course"}));
    window.connectReview("/"+role);`;
  const server = await createServer({
    configFile: false,
    cacheDir: "node_modules/.vite-review-workspace-test",
    optimizeDeps: {include: ["react", "react-dom/client"]},
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0 },
    plugins: [
      {
        name: "review-fixture",
        resolveId(id) {
          if (id === "/__review-test.js") return "\0__review-test.js";
        },
        load(id) {
          if (id === "\0__review-test.js") return harness;
        },
        configureServer(s) {
          s.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith("/review-test?")) {
              res.setHeader("Content-Type", "text/html");
              res.end(
                '<meta name="viewport" content="width=device-width"><div id="root"></div><script type="module" src="/__review-test.js"></script>',
              );
              return;
            }
            const hit = req.url?.match(/^\/(teacher|student|teacher_admin)\/v1\/courses\/MCV4U\/review-workspace(.*)$/u);
            if (!hit) return next();
            res.setHeader("Content-Type", "application/json");
            const [, role, path] = hit;
            const staff = role === "teacher";
            if (req.method === "GET" && !path)
              res.end(
                JSON.stringify({
                  section: "TEST",
                  role,
                  enabled: true,
                  policy: role === "teacher_admin" ? { weekdays: [1, 2, 3, 4, 5], startHour: 9, endHour: 17, closures: [] } : null,
                  queue: [summary()],
                  candidates: [],
                }),
              );
            else if (req.method === "GET") res.end(JSON.stringify(result(role)));
            else {
              try {
                let body = "";
                for await (const part of req) body += part;
                const a = JSON.parse(body);
                assert.equal(req.headers["x-csrf-token"], role);
                const change = transition(raw, a, {
                  staff,
                  user: { displayName: staff ? "Professor Lee" : "Casey" },
                });
                raw.contents = change.contents;
                raw.released_at = change.release;
                raw.waiting_since = change.waiting;
                raw.revision++;
                if (a.type === "release") published = true;
                res.end(JSON.stringify(result(role)));
              } catch (e) {
                res.statusCode = e.statusCode || 500;
                res.end(JSON.stringify({ error: { message: e.message } }));
              }
            }
          });
        },
      },
    ],
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ executablePath: process.env.LFA_TEST_BROWSER_EXECUTABLE });
    const admin = await browser.newPage();
    await admin.goto(server.resolvedUrls.local[0] + "review-test?teacher_admin");
    await admin.getByText(/Local trial feedback target/).waitFor();
    await admin.getByText("Configure trial working hours").waitFor();
    await admin.getByText(/Faculty response due/).waitFor();
    // Even an outdated remote endpoint returning a trial policy must not display a local clock.
    await admin.route("https://school.example/**", (route) => route.fulfill({
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": new URL(server.resolvedUrls.local[0]).origin,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        enabled: true, section: "TEST", role: "teacher_admin",
        policy: { weekdays: [1], startHour: 9, endHour: 17, closures: [] },
        queue: [summary()], candidates: [],
      }),
    }));
    await admin.evaluate(() => window.connectReview("https://school.example"));
    await admin.getByText("Waiting for faculty").waitFor();
    assert.equal(await admin.getByText(/trial feedback|trial working hours|faculty response due/i).count(), 0);
    await admin.close();
    const pages = await Promise.all(
      ["teacher", "student"].map(async (role) => {
        const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
        p.setDefaultTimeout(6000);
        await p.goto(server.resolvedUrls.local[0] + "review-test?" + role);
        await p.getByText("Waiting for faculty").waitFor();
        assert.equal(await p.getByText(/trial feedback|trial working hours|faculty response due/i).count(), 0);
        await p.getByRole("button", { name: "Review a graph · Casey" }).click();
        return p;
      }),
    );
    const [teacher, student] = pages;
    const passage = teacher.getByRole("textbox", { name: /Select words from version 1/ });
    await teacher.bringToFront();
    // Double-click the first rendered word, as a reviewer selecting a passage would.
    const firstWord = await passage.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        x: element.clientLeft + parseFloat(style.paddingLeft) + parseFloat(style.fontSize) / 2,
        y: element.clientTop + parseFloat(style.paddingTop) + parseFloat(style.fontSize) / 2,
      };
    });
    await passage.dblclick({ position: firstWord });
    const selection = await passage.evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd).trim());
    assert.equal(selection, "Two", "the reviewer must select the intended word in the native text control");
    await teacher.getByRole("blockquote").filter({ hasText: /^Two$/ }).waitFor();
    await teacher.getByRole("textbox", { name: "Revision request" }).fill("Identify what stayed fixed.");
    await teacher.getByRole("button", { name: "Request revision of passage" }).click();
    await teacher.getByRole("heading", { name: "Thread 1" }).waitFor();
    await teacher.getByRole("button", { name: "Read revision thread 1" }).click();
    assert.equal(await teacher.evaluate(() => document.activeElement.id.startsWith("review-thread-")), true);
    await teacher.getByText("Faculty process evidence", { exact: true }).click();
    await teacher.getByText(/31 words in an external paste/).waitFor();
    await teacher.getByRole("slider", { name: /Edit snapshot/ }).press("End");
    await teacher.getByText("Edit snapshot 1 of 1").waitFor();
    await student.getByRole("button", { name: "Refresh review" }).click();
    assert.equal(await student.getByText("Faculty process evidence", { exact: true }).count(), 0);
    await student.getByRole("textbox", { name: "Revised text" }).fill("Two points on a fixed demand curve.");
    await student
      .getByRole("textbox", { name: "Explain what you changed and why" })
      .fill("Named the fixed schedule.");
    await student.getByRole("button", { name: "Submit revised version" }).click();
    await student.getByText("Version 2 ·", { exact: false }).first().waitFor();
    await teacher.getByRole("button", { name: "Refresh review" }).click();
    await teacher.getByRole("button", { name: "Resolve thread" }).click();
    await teacher.getByRole("textbox", { name: "Final feedback" }).fill("A clear distinction.");
    await teacher.getByRole("spinbutton", { name: "Formative synthesis score (%)" }).fill("82");
    await teacher.getByRole("button", { name: "Publish formative result" }).click();
    await teacher.getByRole("heading", { name: /Formative synthesis result/ }).waitFor();
    assert.equal(published, true);
    for (const p of pages)
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  } finally {
    await browser?.close();
    await server.close();
  }
});
