# AB Electronics — Client Ready Mobile V5

Full website package.

## V5 fixes

### Mobile hero
The slider no longer places image above text and then changes document height.
On phones, the hero is one fixed-size photo card with the text over the bottom gradient.

That means:
- no vertical jump when slides change
- no image moving up/down
- consistent button position
- showroom photo remains the hero
- swipe still works on iOS/Android

### Exact location
Google Maps now uses the verified Google business place ID:

`ChIJx29E74wxOzkR9unHZnPTohE`

Business:
**AB ELECTRONICS HAIER STORE**
Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan
0307 7568769

The home page now also has a full location section with:
- storefront photo
- full address
- Call
- WhatsApp
- Get Directions
- embedded Google map
- fallback "Open in Google Maps" link

### Mobile polish
- compact two-row mobile header
- sticky mobile navigation
- fixed hero height
- equal category card heights
- equal product image/card heights
- consistent gallery heights
- horizontal catalog category pills
- clean product detail spacing
- iOS safe-area support
- 16px search inputs to prevent Safari zoom
- reduced-motion support preserved

## Deployment

Keep your hidden `.git` directory.
Replace the other project files with this package.

```powershell
git add -A
git commit -m "Fix mobile UX and exact store location"
git push
```

GitHub Pages:
**Settings → Pages → Source = GitHub Actions**
