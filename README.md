# AB Electronics — Product Image Fix V7

Full project package.

## Problem fixed

On mobile, tall refrigerator/freezer product images were visually crossing the divider and overlapping product text.

V7 normalizes every dynamically synced Haier image:

- fixed product image frame
- overflow hidden
- image centered
- maximum width/height instead of stretched `width:100%; height:100%`
- product body is a separate opaque layer
- portrait products automatically use narrower sizing
- landscape products automatically use wider sizing
- homepage featured products fixed
- Products catalog fixed
- related product cards fixed
- category product images fixed
- individual Product Details image fixed

### Mobile frame sizes

- normal phone: 220px product image area
- <=390px: 205px
- <=345px: 190px

The product itself is centered inside that frame with safe whitespace.

## Deploy

Keep your hidden `.git` folder and replace all other project files with this package.

```powershell
git add -A
git commit -m "Normalize all product images on mobile"
git push
```

GitHub Pages Source remains **GitHub Actions**.
