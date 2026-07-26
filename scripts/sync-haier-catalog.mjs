import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const categories = [
  ['Refrigerators','https://www.haier.com/pk/refrigerators/'],
  ['Freezers','https://www.haier.com/pk/freezers/'],
  ['Washing Machines','https://www.haier.com/pk/washing-machines/'],
  ['Air Conditioners','https://www.haier.com/pk/air-conditioners/'],
  ['LED TVs','https://www.haier.com/pk/tvs/'],
  ['Small Appliances','https://www.haier.com/pk/small-appliance/'],
  ['Kitchen Appliances','https://www.haier.com/pk/kitchen-appliance/'],
  ['Microwave Ovens','https://www.haier.com/pk/microwaves/'],
];

const root = process.cwd();
const productsDir = path.join(root,'assets','products');
const dataFile = path.join(root,'assets','js','data.js');
await fs.mkdir(productsDir,{recursive:true});

const clean = s => (s||'').replace(/\s+/g,' ').trim();
const slug = s => clean(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);
const extFromType = type => type?.includes('png')?'.png':type?.includes('webp')?'.webp':type?.includes('gif')?'.gif':'.jpg';

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1050},userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36'});
const page = await context.newPage();
const collected = [];

async function dismiss(page){
  for(const text of ['Accept','I Agree','OK']){
    const b=page.getByRole('button',{name:new RegExp(`^${text}$`,'i')}).first();
    if(await b.count() && await b.isVisible().catch(()=>false)) await b.click({timeout:1500}).catch(()=>{});
  }
}

for(const [category,url] of categories){
  console.log(`\n=== ${category} ===`);
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(1300);
  await dismiss(page);

  const pathname=new URL(url).pathname;
  const productAnchors=()=>page.locator(`a[href$=".shtml"]`);
  let stagnant=0, previous=0;

  for(let i=0;i<40;i++){
    const all=await productAnchors().evaluateAll((els,basePath)=>els.filter(a=>{
      try{const u=new URL(a.href);return u.pathname.startsWith(basePath)&&u.pathname!==basePath&&u.pathname.endsWith('.shtml')}catch{return false}
    }).length, pathname);

    const load=page.getByText(/^Load more$/i).first();
    const visible=await load.count() && await load.isVisible().catch(()=>false);
    if(!visible) break;

    await load.scrollIntoViewIfNeeded().catch(()=>{});
    await load.evaluate(el=>el.click()).catch(()=>{});
    await page.waitForTimeout(1300);

    const after=await productAnchors().evaluateAll((els,basePath)=>els.filter(a=>{
      try{const u=new URL(a.href);return u.pathname.startsWith(basePath)&&u.pathname!==basePath&&u.pathname.endsWith('.shtml')}catch{return false}
    }).length, pathname);

    if(after<=all && all===previous) stagnant++; else stagnant=0;
    previous=all;
    if(stagnant>=2) break;
  }

  const remainingLoad=page.getByText(/^Load more$/i).first();
  if(await remainingLoad.count() && await remainingLoad.isVisible().catch(()=>false)){
    throw new Error(`Could not exhaust Load more for ${category}; refusing to publish an incomplete catalog.`);
  }

  // Trigger lazy-loaded product thumbnails before reading card images.
  await page.evaluate(async()=>{
    const step=700;
    for(let y=0;y<document.body.scrollHeight;y+=step){
      window.scrollTo(0,y);
      await new Promise(r=>setTimeout(r,40));
    }
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(500);

  const rows=await productAnchors().evaluateAll((anchors,basePath)=>{
    const out=[];
    for(const a of anchors){
      let u;try{u=new URL(a.href)}catch{continue}
      if(!u.pathname.startsWith(basePath)||u.pathname===basePath||!u.pathname.endsWith('.shtml')) continue;
      let node=a, imgs=[];
      for(let depth=0;node&&depth<6;depth++,node=node.parentElement){
        const links=[...node.querySelectorAll('a[href$=".shtml"]')].filter(x=>{
          try{const v=new URL(x.href);return v.pathname.startsWith(basePath)&&v.pathname!==basePath}catch{return false}
        });
        const localImgs=[...node.querySelectorAll('img')];
        if(localImgs.length && links.length<=2){ imgs=localImgs; break; }
      }
      if(!imgs.length) imgs=[...a.querySelectorAll('img')];
      imgs=[...new Set(imgs)];
      const ranked=imgs.map(img=>({
        src: img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '',
        area:(img.naturalWidth||0)*(img.naturalHeight||0),
        alt:(img.getAttribute('alt')||'').trim()
      })).filter(x=>x.src && !/logo|icon/i.test(x.src)).sort((x,y)=>y.area-x.area);
      out.push({href:u.href,text:(a.textContent||'').replace(/\s+/g,' ').trim(),image:ranked[0]?.src||'',alt:ranked[0]?.alt||''});
    }
    return out;
  }, pathname);

  const unique=[...new Map(rows.map(x=>[x.href,x])).values()];
  console.log(`Found ${unique.length} product links after Load more.`);

  for(const item of unique){
    const officialTitle=clean(item.text.replace(/^Hot\s+New\s+/i,'').replace(/Add\s+to\s+Compare/ig,'')).trim();
    if(!officialTitle) continue;
    let imageUrl=item.image;

    // Fallback: open product page only when category card did not expose an image.
    if(!imageUrl){
      const p=await context.newPage();
      try{
        await p.goto(item.href,{waitUntil:'domcontentloaded',timeout:45000});
        await p.waitForTimeout(500);
        imageUrl=await p.locator('img').evaluateAll(imgs=>{
          const c=imgs.map(img=>({src:img.currentSrc||img.src||'',area:(img.naturalWidth||0)*(img.naturalHeight||0),alt:img.alt||''}))
            .filter(x=>x.src && /haier/i.test(x.src) && !/logo|icon/i.test(x.src)).sort((a,b)=>b.area-a.area);
          return c[0]?.src||'';
        }).catch(()=> '');
      }finally{await p.close()}
    }

    if(!imageUrl){
      throw new Error(`No official product image found for ${category}: ${officialTitle} (${item.href})`);
    }

    const idBase=slug(new URL(item.href).pathname.split('/').filter(Boolean).pop().replace(/\.shtml$/,'')) || slug(officialTitle);
    const hash=crypto.createHash('sha1').update(item.href).digest('hex').slice(0,8);
    const id=`${idBase}-${hash}`;

    const response=await context.request.get(imageUrl,{headers:{Referer:url},timeout:45000});
    if(!response.ok()) throw new Error(`Image download failed ${response.status()} for ${officialTitle}: ${imageUrl}`);
    const type=response.headers()['content-type']||'';
    const ext=extFromType(type);
    const fileName=`${id}${ext}`;
    await fs.writeFile(path.join(productsDir,fileName),await response.body());

    collected.push({
      id,
      category,
      officialTitle,
      name:officialTitle,
      model:'',
      image:`assets/products/${fileName}`,
      highlights:[],
      specs:{},
      source:item.href
    });
    console.log(`  ✓ ${officialTitle}`);
  }
}

await browser.close();

const deduped=[...new Map(collected.map(p=>[p.source,p])).values()];
const missingImage=deduped.filter(p=>!p.image);
const perCategory=Object.fromEntries(categories.map(([c])=>[c,deduped.filter(p=>p.category===c).length]));
console.log('\nCatalog summary:',perCategory,'TOTAL',deduped.length);

// Current Haier Pakistan first-load category pages alone expose ~86 listings across household categories.
// If live scraping returns materially less, do not publish potentially incomplete data.
if(deduped.length < 80) throw new Error(`Catalog looks incomplete: only ${deduped.length} products found.`);
if(missingImage.length) throw new Error(`${missingImage.length} products are missing exact images.`);
for(const [cat,count] of Object.entries(perCategory)){
  if(count===0) throw new Error(`No products found for ${cat}.`);
}

const js=`// AUTO-GENERATED FROM HAIER PAKISTAN LIVE CATEGORY PAGES\n// Generated: ${new Date().toISOString()}\nwindow.AB_PRODUCTS = ${JSON.stringify(deduped,null,2)};\n`;
await fs.writeFile(dataFile,js,'utf8');
await fs.writeFile(path.join(root,'haier-sync-summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),total:deduped.length,perCategory},null,2));
console.log(`\nSaved ${deduped.length} exact current products to assets/js/data.js`);
