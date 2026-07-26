# AB Electronics

A responsive React + Vite storefront concept for **AB Electronics**, focused on Haier home appliances in Pakistan.

## What is already included

- Responsive desktop / tablet / mobile design
- Non-generic hero: practical store messaging + layered product presentation
- Lightweight 3D-style mouse movement in the hero
- Scroll reveal animation with reduced-motion support
- Haier Pakistan catalog product starter data
- Product category filtering
- Real showroom photo layout with placeholders
- Contact / WhatsApp area
- Product source links to Haier Pakistan

## Important: product prices

The official Haier Pakistan product pages do **not** display a PKR price directly. Their “Shop Now” links route to Haier Mall.

Because the brief requires authentic pricing, the starter data leaves prices as `null` rather than guessing.

Update prices here:

`src/data/products.js`

Example:

```js
price: 173000,
```

The site will automatically show:

`PKR 173,000`

Only enter a price after it has been verified from the official Haier Pakistan / Haier Mall channel.

## Add your shop photos

Put the actual files inside:

`public/shop/`

Recommended names:

- `shop-front.jpg`
- `shop-inside-1.jpg`
- `shop-inside-2.jpg`

Then update the three image paths in `src/App.jsx` from `.svg` to `.jpg`.

## Add WhatsApp

Open `src/App.jsx` and set:

```js
const whatsappNumber = '923001234567'
```

Use country code, no `+`, spaces or dashes.

## Local setup

```bash
npm install
npm run dev
```

## Production test

```bash
npm run build
npm run preview
```

## GitHub

Create a repository named `ab-electronics`, then:

```bash
git init
git add .
git commit -m "Initial AB Electronics storefront"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Deploy

For the easiest React/Vite deployment, import the GitHub repo into Vercel or Netlify.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```
