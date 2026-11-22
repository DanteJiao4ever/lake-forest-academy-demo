import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "vite";
import {chromium} from "playwright-core";

test("reading clock pauses on idle and hidden tabs, and selections relocate only to an identifiable passage",async()=>{
  const harness = `
          import React from "react";import {createRoot} from "react-dom/client";
          import {useActiveTime} from "/src/learning/reader/useActiveTime.ts";
          import {quoteAt,locateQuote} from "/src/learning/reader/anchors.ts";
          window.anchors={quoteAt,locateQuote};window.samples=[];
          function record(sample){window.samples.push(sample);return Promise.resolve({});}
          function Reader(){const active=useActiveTime(record,true);return React.createElement("p",{},active?"Reading":"Paused");}
          createRoot(document.querySelector("main")).render(React.createElement(Reader));
  `;
  const server=await createServer({configFile:false,cacheDir:"node_modules/.vite-reader-state-test",logLevel:"error",
    server:{host:"127.0.0.1",port:0},optimizeDeps:{include:["react","react-dom/client"]},plugins:[{name:"reader-state-fixture",
      resolveId(id){if(id==="/__reader-test.js")return id;},
      load(id){if(id==="/__reader-test.js")return harness;},
      configureServer(vite){
      vite.middlewares.use((req,res,next)=>{
        if(req.url!=="/reader-state")return next();
        res.setHeader("Content-Type","text/html");res.end('<main id="root"></main><script type="module" src="/__reader-test.js"></script>');
      });}}]});
  let browser;
  try {
    await server.listen();browser=await chromium.launch({executablePath:process.env.LFA_TEST_BROWSER_EXECUTABLE});
    const page=await browser.newPage();page.setDefaultTimeout(5500);await page.clock.install();
    await page.goto(new URL("/reader-state",server.resolvedUrls.local[0]).href);
    await page.getByText("Reading",{exact:true}).waitFor();
    await page.clock.runFor(181000);await page.getByText("Paused",{exact:true}).waitFor();
    const total=()=>page.evaluate(()=>window.samples.reduce((a,b)=>a+b.seconds,0));
    const idleTotal=await total();assert(idleTotal>=179 && idleTotal<=180);await page.clock.runFor(45000);assert.equal(await total(),idleTotal);
    await page.locator("p").click();await page.clock.runFor(15000);const resumed=await total();assert(resumed>idleTotal && resumed<=idleTotal+15);
    const visibility=(hidden)=>page.evaluate(hidden=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>hidden});document.dispatchEvent(new Event("visibilitychange"));},hidden);
    await visibility(true);const hiddenTotal=await total();await page.clock.runFor(90000);assert.equal(await total(),hiddenTotal);
    await visibility(false);await page.clock.runFor(15000);const visibleTotal=await total();assert(visibleTotal>hiddenTotal && visibleTotal<=hiddenTotal+15);
    const result=await page.evaluate(()=>{
      const {quoteAt,locateQuote}=window.anchors;const sample="At first the fare fell.";const anchor=quoteAt(sample,13,17,"paragraph","v1");
      return [anchor.exact,locateQuote("Later the fare rose.",anchor),locateQuote("fare then fare",anchor),locateQuote("Only bus prices remained.",anchor),locateQuote("fare elsewhere. "+sample,anchor)];
    });
    assert.deepEqual(result,["fare",10,null,null,29]);
  } finally{await browser?.close();await server.close();}
});
