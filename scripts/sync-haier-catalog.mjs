/**
 * Optional Haier Pakistan catalog synchronizer.
 *
 * Purpose:
 * - Opens official category pages.
 * - Clicks "Load more" repeatedly.
 * - Extracts currently visible product-page links/model labels.
 * - Visits each product page and tries to collect a product image.
 * - Saves a review file at data/haier-scan.json.
 *
 * IMPORTANT:
 * This intentionally does NOT overwrite catalog.js automatically.
 * Review the scan first, then merge verified products into catalog.js.
 *
 * Run:
 *   npm install
 *   npx playwright install chromium
 *   npm run sync:haier
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const categories = [
  ["Refrigerators", "https://www.haier.com/pk/refrigerators/"],
  ["Freezers", "https://www.haier.com/pk/freezers/"],
  ["Washing Machines", "https://www.haier.com/pk/washing-machines/"],
  ["Air Conditioners", "https://www.haier.com/pk/air-conditioners/"],
  ["LED TVs", "https://www.haier.com/pk/tvs/"],
  ["Small Appliances", "https://www.haier.com/pk/small-appliance/"],
  ["Kitchen Appliances", "https://www.haier.com/pk/kitchen-appliance/"],
  ["Microwave Ovens", "https://www.haier.com/pk/microwaves/"],
];

const outDir = path.resolve("data");
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const results = [];

for (const [category, url] of categories) {
  console.log(`\nScanning ${category}: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1400);

  // Keep clicking Load more while it exists and adds products.
  let previousCount = 0;
  for (let i = 0; i < 30; i++) {
    const candidateLinks = page.locator('a[href$=".shtml"]');
    const currentCount = await candidateLinks.count();
    const load = page.getByText("Load more", { exact: true }).first();
    if (!(await load.count())) break;
    if (!(await load.isVisible().catch(() => false))) break;

    await load.click().catch(() => {});
    await page.waitForTimeout(1200);

    const after = await candidateLinks.count();
    if (after <= currentCount && currentCount === previousCount) break;
    previousCount = currentCount;
  }

  const basePath = new URL(url).pathname.replace(/\/$/, "");
  const links = await page.locator('a[href$=".shtml"]').evaluateAll((anchors, basePath) => {
    const data = anchors.map(a => ({
      href: a.href,
      text: (a.textContent || "").replace(/\s+/g, " ").trim()
    }));
    return data.filter(x => {
      try {
        const u = new URL(x.href);
        return u.hostname.endsWith("haier.com") &&
          u.pathname.startsWith(basePath + "/") &&
          u.pathname.endsWith(".shtml");
      } catch {
        return false;
      }
    });
  }, basePath);

  const unique = [...new Map(links.map(x => [x.href, x])).values()];
  console.log(`Found ${unique.length} product links`);

  for (const item of unique) {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      await p.goto(item.href, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(700);

      const model = (await p.locator("h1").first().textContent().catch(() => ""))?.trim() || "";
      const title = (await p.locator("title").textContent().catch(() => ""))?.trim() || item.text;

      const og = await p.locator('meta[property="og:image"]').getAttribute("content").catch(() => "");
      let image = og || "";

      if (!image) {
        image = await p.locator('img[src*="image.haier.com"]').evaluateAll(imgs => {
          const candidates = imgs.map(img => ({
            src: img.currentSrc || img.src,
            area: (img.naturalWidth || 0) * (img.naturalHeight || 0)
          })).filter(x => x.src);
          candidates.sort((a,b) => b.area - a.area);
          return candidates[0]?.src || "";
        }).catch(() => "");
      }

      results.push({
        category,
        label: item.text,
        model,
        title,
        source: item.href,
        image
      });

      console.log(`  ✓ ${model || item.text}`);
    } catch (err) {
      console.warn(`  ! Failed ${item.href}: ${err.message}`);
    } finally {
      await p.close();
    }
  }
}

await browser.close();

const deduped = [...new Map(results.map(x => [x.source, x])).values()];
await fs.writeFile(path.join(outDir, "haier-scan.json"), JSON.stringify({
  scannedAt: new Date().toISOString(),
  count: deduped.length,
  products: deduped
}, null, 2));

console.log(`\nSaved ${deduped.length} verified links to data/haier-scan.json`);
