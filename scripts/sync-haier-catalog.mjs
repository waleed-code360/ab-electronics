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
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({
  viewport:{width:1440,height:1050},
  userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36'
});
const categoryPage = await context.newPage();
const detailPage = await context.newPage();
const collected = [];

async function dismiss(page){
  for(const text of ['Accept','I Agree','OK']){
    const b=page.getByRole('button',{name:new RegExp(`^${text}$`,'i')}).first();
    if(await b.count() && await b.isVisible().catch(()=>false)) await b.click({timeout:1500}).catch(()=>{});
  }
}

async function exhaustLoadMore(page, pathname, category){
  const productAnchors=()=>page.locator('a[href$=".shtml"]');
  let stagnant=0, previous=0;
  for(let i=0;i<45;i++){
    const before=await productAnchors().evaluateAll((els,basePath)=>els.filter(a=>{
      try{const u=new URL(a.href);return u.pathname.startsWith(basePath)&&u.pathname!==basePath&&u.pathname.endsWith('.shtml')}catch{return false}
    }).length, pathname);

    const load=page.getByText(/^Load more$/i).first();
    const visible=await load.count() && await load.isVisible().catch(()=>false);
    if(!visible) break;

    await load.scrollIntoViewIfNeeded().catch(()=>{});
    await load.evaluate(el=>el.click()).catch(()=>{});
    await page.waitForTimeout(1100);

    const after=await productAnchors().evaluateAll((els,basePath)=>els.filter(a=>{
      try{const u=new URL(a.href);return u.pathname.startsWith(basePath)&&u.pathname!==basePath&&u.pathname.endsWith('.shtml')}catch{return false}
    }).length, pathname);

    if(after<=before && before===previous) stagnant++; else stagnant=0;
    previous=before;
    if(stagnant>=2) break;
  }

  const remaining=page.getByText(/^Load more$/i).first();
  if(await remaining.count() && await remaining.isVisible().catch(()=>false)){
    throw new Error(`Could not exhaust Load more for ${category}; refusing to publish an incomplete catalog.`);
  }
}

async function readCleanProductMeta(page){
  return await page.evaluate(() => {
    const clean = s => (s||'').replace(/\s+/g,' ').trim();
    const h1 = document.querySelector('h1');
    const name = clean(h1?.textContent || '');
    const browserTitle = clean(document.title || '');

    // Haier Pakistan title pattern is normally:
    // "Haier {MODEL}-{PRODUCT NAME}-Haier Pakistan"
    // Removing the known h1 suffix keeps hyphens/slashes/parentheses in the model intact.
    let model = '';
    if(name && browserTitle){
      let core = browserTitle.replace(/\s*-\s*Haier Pakistan.*$/i,'').replace(/^Haier\s+/i,'').trim();
      const suffix = `-${name}`;
      if(core.toLowerCase().endsWith(suffix.toLowerCase())){
        model = core.slice(0, core.length - suffix.length).trim();
      }
    }

    const lines = (document.body.innerText || '').split('\n').map(clean).filter(Boolean);
    const nameIndex = lines.findIndex(x => x.toLowerCase() === name.toLowerCase());

    if(!model && nameIndex >= 0){
      model = lines.slice(nameIndex + 1, nameIndex + 7).find(x =>
        /\d/.test(x) && x.length <= 110 && !/buy now|compare|dealer|feature|specification/i.test(x)
      ) || '';
    }

    // The first three lines after name/model and before BUY NOW are the official headline feature labels.
    let highlights = [];
    if(nameIndex >= 0){
      const after = lines.slice(nameIndex + 1);
      const stop = after.findIndex(x => /^BUY NOW$/i.test(x));
      const block = (stop >= 0 ? after.slice(0,stop) : after.slice(0,10));
      const banned = new Set([name.toLowerCase(), model.toLowerCase(), 'features', 'specifications']);
      highlights = block.filter(x =>
        x && !banned.has(x.toLowerCase()) &&
        !/add to compare|hot new|find the nearest dealer/i.test(x) &&
        x.length <= 80
      );
      highlights = [...new Set(highlights)].slice(0,3);
    }

    return {name,model,highlights,browserTitle};
  });
}

for(const [category,url] of categories){
  console.log(`\n=== ${category} ===`);
  await categoryPage.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await categoryPage.waitForTimeout(1200);
  await dismiss(categoryPage);

  const pathname=new URL(url).pathname;
  await exhaustLoadMore(categoryPage,pathname,category);

  // Trigger lazy-loaded thumbnails.
  await categoryPage.evaluate(async()=>{
    const step=700;
    for(let y=0;y<document.body.scrollHeight;y+=step){
      window.scrollTo(0,y);
      await new Promise(r=>setTimeout(r,35));
    }
    window.scrollTo(0,0);
  });
  await categoryPage.waitForTimeout(400);

  const rows=await categoryPage.locator('a[href$=".shtml"]').evaluateAll((anchors,basePath)=>{
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
        if(localImgs.length && links.length<=2){imgs=localImgs;break;}
      }
      if(!imgs.length) imgs=[...a.querySelectorAll('img')];
      imgs=[...new Set(imgs)];
      const ranked=imgs.map(img=>({
        src:img.currentSrc||img.getAttribute('src')||img.getAttribute('data-src')||img.getAttribute('data-original')||'',
        area:(img.naturalWidth||0)*(img.naturalHeight||0)
      })).filter(x=>x.src&&!/logo|icon/i.test(x.src)).sort((x,y)=>y.area-x.area);
      out.push({href:u.href,image:ranked[0]?.src||''});
    }
    return out;
  },pathname);

  const unique=[...new Map(rows.map(x=>[x.href,x])).values()];
  console.log(`Found ${unique.length} product links after Load more.`);

  for(const item of unique){
    await detailPage.goto(item.href,{waitUntil:'domcontentloaded',timeout:50000});
    await detailPage.waitForTimeout(330);
    await dismiss(detailPage);

    const meta=await readCleanProductMeta(detailPage);
    const name=clean(meta.name);
    const model=clean(meta.model);
    const highlights=(meta.highlights||[]).map(clean).filter(Boolean);

    if(!name || !model){
      throw new Error(`Could not read clean product name/model for ${item.href}. h1="${name}" model="${model}" title="${meta.browserTitle}"`);
    }

    let imageUrl=item.image;
    if(!imageUrl){
      imageUrl=await detailPage.locator('img').evaluateAll(imgs=>{
        const c=imgs.map(img=>({src:img.currentSrc||img.src||'',area:(img.naturalWidth||0)*(img.naturalHeight||0)}))
          .filter(x=>x.src&&/image\.haier\.com/i.test(x.src)&&!/logo|icon/i.test(x.src)).sort((a,b)=>b.area-a.area);
        return c[0]?.src||'';
      }).catch(()=> '');
    }
    if(!imageUrl) throw new Error(`No official product image found for ${category}: ${name} ${model}`);

    const idBase=slug(new URL(item.href).pathname.split('/').filter(Boolean).pop().replace(/\.shtml$/,''))||slug(model);
    const hash=crypto.createHash('sha1').update(item.href).digest('hex').slice(0,8);
    const id=`${idBase}-${hash}`;

    const response=await context.request.get(imageUrl,{headers:{Referer:url},timeout:45000});
    if(!response.ok()) throw new Error(`Image download failed ${response.status()} for ${model}: ${imageUrl}`);
    const type=response.headers()['content-type']||'';
    const ext=extFromType(type);
    const fileName=`${id}${ext}`;
    await fs.writeFile(path.join(productsDir,fileName),await response.body());

    collected.push({
      id,
      category,
      name,
      model,
      officialTitle:`${name} — ${model}`,
      image:`assets/products/${fileName}`,
      highlights,
      specs:{},
      source:item.href
    });
    console.log(`  ✓ ${name} | ${model}`);
  }
}

await browser.close();

const deduped=[...new Map(collected.map(p=>[p.source,p])).values()];
const perCategory=Object.fromEntries(categories.map(([c])=>[c,deduped.filter(p=>p.category===c).length]));
console.log('\nCatalog summary:',perCategory,'TOTAL',deduped.length);

if(deduped.length < 80) throw new Error(`Catalog looks incomplete: only ${deduped.length} products found.`);
for(const [cat,count] of Object.entries(perCategory)) if(count===0) throw new Error(`No products found for ${cat}.`);
if(deduped.some(p=>!p.name||!p.model||!p.image)) throw new Error('At least one product is missing a clean name, model or image.');

const js=`// AUTO-GENERATED FROM HAIER PAKISTAN LIVE CATEGORY + PRODUCT PAGES\n// Generated: ${new Date().toISOString()}\nwindow.AB_PRODUCTS = ${JSON.stringify(deduped,null,2)};\n`;
await fs.writeFile(dataFile,js,'utf8');
await fs.writeFile(path.join(root,'haier-sync-summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),total:deduped.length,perCategory},null,2));
console.log(`\nSaved ${deduped.length} clean current products to assets/js/data.js`);
