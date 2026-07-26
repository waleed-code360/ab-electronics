# AB Electronics — Polished Haier Catalog V2

Full multi-page GitHub Pages website for AB Electronics Haier Store, Multan.

## What changed in this version

- Product names are no longer taken from the entire category-card text.
- During deployment, every Haier product page is opened and the site reads:
  - the product family/name from the official H1,
  - the exact model from the official Haier Pakistan page title,
  - the first official headline feature labels,
  - the exact official product image.
- Deployment refuses to publish if a product is missing a clean name/model/image.
- Homepage hero is now an auto-changing slider:
  - AB Electronics storefront,
  - Air Conditioners,
  - Refrigerators,
  - Washing Machines,
  - LED TVs.
- Hero copy changes with each slide.
- Removed the old 4-item service strip completely.
- Upgraded Shop by Category to product-image cards with live model counts.
- Added TCL-inspired left/right/fade-up entrance animations and staggered card reveals.
- Full catalog sync still exhausts Haier Pakistan's Load more controls at deployment.

## Deploy

Keep the hidden `.git` directory in your existing repo, replace the visible project files with this package, then:

```bash
git add -A
git commit -m "Polish AB Electronics hero categories and product names"
git push
```

GitHub Pages Source should remain **GitHub Actions**.

The deployment workflow builds a fresh Haier Pakistan catalog, downloads product images locally, cache-busts the generated JS, and deploys the final static site.
