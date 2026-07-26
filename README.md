# AB Electronics Haier Store

Complete static website for **AB Electronics Haier Store, Multan**.

## Store details

- **Address:** Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan
- **Phone / WhatsApp:** 0307 7568769
- **Live URL:** https://waleed-code360.github.io/ab-electronics/

## What this version changes

- Rebuilds the site in the same general **Electro / TCL Center 01 layout style**:
  - top information bar
  - dark header
  - search + category controls
  - category navigation
  - real-store hero
  - overlapping trust cards
  - product catalog
  - dark about section
  - gallery
  - map/contact
  - footer
- Uses **Haier blue**, not TCL red.
- Uses the real AB Electronics showroom photos.
- Removes fixed product prices.
- Every product opens **inside AB Electronics** in a detail modal.
- Every product has **Ask Price on WhatsApp**.
- No customer-facing product link redirects to Haier's website.
- Includes **86 current models** from the currently exposed Haier Pakistan category listings snapshot (2026-07-26).

## Important catalog note

Haier Pakistan category pages currently use a **Load more** control. The 86-model catalog included here is the current catalog snapshot directly exposed across the eight household categories during preparation.

An optional scraper is included:

```bash
npm install
npx playwright install chromium
npm run sync:haier
```

It clicks **Load more** and saves a fresh review scan to:

```text
data/haier-scan.json
```

The script does **not** automatically overwrite the published catalog, so new/removed products can be reviewed before the live site changes.

## Replace the old Vite site

This project is now static HTML/CSS/JS. You do not need Vite.

In your existing `ab-electronics` repository:

1. Keep the hidden `.git` folder.
2. Remove the old visible project files/folders, especially:
   - `src/`
   - `public/`
   - `vite.config.js`
   - old `index.html`
   - old workflow
   - `node_modules/`
   - `package-lock.json`
3. Copy **everything from this package** into the repository root.
4. Test by opening with VS Code Live Server, or simply push and let GitHub Pages deploy.
5. Run:

```bash
git add .
git commit -m "Rebuild AB Electronics in TCL-style Haier theme"
git push
```

GitHub Pages **Source must remain `GitHub Actions`**.

## Product images

The included snapshot deliberately uses **real category showroom photos** as safe fallbacks rather than pretending one model is another model.

The optional Haier sync scan tries to identify the official product image for each product. After verification, those can be downloaded locally and assigned in `catalog.js`.

## Data sources

Catalog structure and model names were prepared from Haier Pakistan household/category pages. Warranty summaries are based on Haier Pakistan's warranty declaration applicable to purchases from January 1, 2026.

Always verify model availability, current stock, warranty card and final terms before selling.
