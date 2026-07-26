# AB Electronics — Full Live Haier Catalog

This keeps the current multi-page store design and upgrades the catalog so GitHub Pages builds from the **current Haier Pakistan category listings**.

## What happens on every GitHub Pages deployment

The workflow opens the official Haier Pakistan household category pages:

- Refrigerators
- Freezers
- Washing Machines
- Air Conditioners
- LED TVs
- Small Appliances
- Kitchen Appliances
- Microwave Ovens

It repeatedly clicks **Load more**, captures every current product link, uses the **exact title from the official product card**, finds the **exact official card image**, downloads that image locally into `assets/products/`, and regenerates `assets/js/data.js` before deployment.

The deployment refuses to publish if the live scrape finds fewer than 80 products or if a product is missing an image. That prevents a partial/bad catalog from silently going live.

## Replace your current project

Keep your hidden `.git` folder. Replace the visible site files with this package, then:

```bash
git add -A
git commit -m "Sync full Haier Pakistan product catalog"
git push
```

Then open GitHub **Actions**. The workflow is:

`Deploy AB Electronics with Live Haier Catalog`

When it is green, the live `products.html` catalog has been generated from Haier Pakistan's current listings.

## Local catalog sync (optional)

If you want the generated catalog on your PC before pushing:

```bash
npm install
npx playwright install chromium
npm run sync:haier
```

Then open `haier-sync-summary.json` to see exact category counts.

## Prices

No fixed prices are published. Every product keeps the AB Electronics WhatsApp price enquiry flow.
