import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright-core";
import { preview } from "vite";

let server;
let browser;
let origin;

before(async () => {
  server = await preview({ preview: { host: "127.0.0.1", port: 0 }, logLevel: "error" });
  origin = server.resolvedUrls.local[0];
  browser = await chromium.launch({ executablePath: process.env.LFA_TEST_BROWSER_EXECUTABLE });
});

after(async () => {
  try { await browser?.close(); } finally { await server?.close(); }
});

for (const [surface, route] of [["website", ""], ["learning platform", "learning/#/reading-sample"]]) {
  test(`the anonymous ${surface} sample supports prediction, retry and anchored questions on a phone`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(new URL(route, origin).href);
      const sample = page.locator("#reading-sample");
      await sample.getByRole("textbox", { name: "What might explain the extra 25 sales?" }).fill("The weather changed.");
      await sample.getByRole("button", { name: "Reveal the reasoning" }).click();
      assert(await sample.getByText("Teacher’s reasoning", { exact: true }).isVisible());
      for (const [choice, feedback] of [[0, /price of tea changes/], [2, /decision by the seller/], [1, /demand to the right/]]) {
        await sample.getByRole("radio").nth(choice).check();
        await sample.getByRole("button", { name: "Check answer" }).click();
        assert(await sample.getByText(feedback).isVisible());
      }
      await sample.getByRole("combobox").selectOption({ index: 2 });
      await sample.getByRole("textbox", { name: "Your question" }).fill("Which price stayed fixed?");
      await sample.getByRole("button", { name: "Save question" }).click();
      await sample.getByRole("button", { name: "Return to text" }).click();
      await sample.locator("mark:focus").waitFor();
      assert.match(await sample.locator("mark:focus").textContent(), /65 cups at the same price/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

test("a phone user enters their chosen guide course, signs in and selects it from the student portal", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const controls = await import("../src/data/course-guide.ts");
  const choices = controls.courseGroups.flatMap(group => group.courses.map(course => course.code));
  let session = false;
  let selection = ["MHF4U"];
  const writes = [];
  const user = { role: "student", email: "student@example.test", displayName: "Test Learner" };
  try {
    await page.route("**/learning/runtime-config.json*", route => route.fulfill({ json: { apiOrigin: new URL(origin).origin } }));
    await page.route("**/health/**", route => route.fulfill({ json: { status: "ready" } }));
    await page.route("**/v1/**", async route => {
      const path = new URL(route.request().url()).pathname;
      let payload = { data: [] };
      if (path === "/v1/auth/login") session = true;
      if (path === "/v1/auth/session" || path === "/v1/auth/login") {
        payload = session ? { authenticated: true, user, csrfToken: "local-test-token" } : { authenticated: false };
      } else if (path === "/v1/me/enrollments") {
        if (route.request().method() === "PUT") {
          const body = route.request().postDataJSON();
          writes.push(body);
          selection = body.courseCodes;
        }
        payload = { data: selection, selectableCourseCodes: choices };
      } else if (path === "/v1/courses") {
        payload = { data: selection.map(code => ({ code, title: code, status: "active", moduleCount: 1 })) };
      } else if (path === "/v1/courses/CHV2O/modules") {
        payload = { data: [{
          id: "chv2o-cb01", courseCode: "CHV2O", moduleNumber: 1, title: "Civic participation",
          lessons: [{ id: "CHV2O-U1-L1", position: 1, title: "Consultation" }], coreReadingOrder: ["Compare two submissions to a public consultation."],
        }] };
      } else if (path === "/v1/me/progress") {
        payload = { data: [{ moduleId: "chv2o-cb01", moduleNumber: 1, status: "in_progress" }] };
      }
      await route.fulfill({ json: payload });
    });
    await page.goto(new URL("courses/", origin).href);
    const links = page.locator(".course-row .course-entry");
    await links.first().waitFor();
    assert.deepEqual(await links.evaluateAll(rows => rows.map(a => new URL(a.href).hash.slice(9).toUpperCase())), choices);
    await page.getByRole("searchbox", { name: "Course name or code" }).fill("CHV2O");
    assert.equal(await links.count(), 1);
    await links.tap();
    await page.locator("#login-form #email").fill(user.email);
    await page.locator("#login-form #password").fill("test-password");
    await page.locator("#login-form button[type=submit]").tap();
    await page.getByRole("button", { name: "Select CHV2O", exact: true }).tap();
    await page.getByText("Civic participation", { exact: true }).first().waitFor();
    assert.deepEqual(writes, [{ courseCodes: ["MHF4U", "CHV2O"], catalogVersion: 2, expectedCourseCodes: ["MHF4U"] }]);
    await page.reload();
    await page.getByText("Civic participation", { exact: true }).first().tap();
    await page.getByRole("link", { name: /Consultation/ }).tap();
    await page.getByText("Compare two submissions to a public consultation.", { exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});
