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
