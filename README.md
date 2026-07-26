# AB Electronics — Location Fix V6

This is the full V5 website plus a corrected store-location implementation.

## What was wrong

The previous embedded map used:

`q=place_id:ChIJx29E74wxOzkR9unHZnPTohE`

inside a normal Google Maps iframe URL. That can resolve to the world map instead of the business.

## V6 fix

The embedded map now searches the full verified business name + full address:

**AB Electronics Haier Store**  
Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan, Pakistan

The "Get Directions" / "Open exact store pin" links still use the exact Google Place ID:

`ChIJx29E74wxOzkR9unHZnPTohE`

So:
- embedded map gets an address-based close-up view
- directions button targets the exact Google business listing
- no API key is required

## Deploy

Keep the hidden `.git` folder, replace the rest with this package, then:

```powershell
git add -A
git commit -m "Fix exact AB Electronics map location"
git push
```

Keep GitHub Pages Source set to **GitHub Actions**.
