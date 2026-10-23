// Renders og.html to public/og.jpg with Playwright: `npm run og`.
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const server = await createServer({ root, base: "/", server: { port: 0 }, logLevel: "error" });
await server.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  await page.goto(new URL("og.html", server.resolvedUrls.local[0]).href);
  await page.waitForSelector("body[data-ready]");
  await page.screenshot({ path: `${root}public/og.jpg`, type: "jpeg", quality: 90 });
} finally {
  await browser.close();
  await server.close();
}
