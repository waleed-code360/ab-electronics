const PRODUCTS = window.AB_PRODUCTS || [];
const WHATSAPP = "923077568769";
const STORE = {
  phone: "0307 7568769",
  address: "AB Electronics Haier Store, Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan"
};
function $q(s,r=document){return r.querySelector(s)}
function $qa(s,r=document){return [...r.querySelectorAll(s)]}
function waLink(product){
  const label = product?.officialTitle || product?.model || product?.name || "Haier product";
  const text = product
    ? `Hi AB Electronics, please share the current price and availability of ${label}.`
    : `Hi AB Electronics, please share current Haier product prices and availability.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
function titleFor(p){ return p.officialTitle || [p.name,p.model].filter(Boolean).join(" — ") || "Haier product"; }
function nameFor(p){ return p.name || p.series || p.officialTitle || p.model || "Haier product"; }
function modelFor(p){
  const m=(p.model||"").trim();
  if(!m || m===p.name || m===p.officialTitle) return "";
  return m;
}
function productCard(p){
  const title=titleFor(p), name=nameFor(p), model=modelFor(p), tags=(p.highlights||[]).slice(0,3);
  return `<article class="product-card">
    <a class="product-img" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${p.image}" alt="${title.replace(/"/g,'&quot;')}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=&quot;text-align:center;color:#8995a3;font-size:13px&quot;>Product image unavailable</div>'">
    </a>
    <div class="product-body">
      <span class="product-cat">${p.category}</span>
      <h3>${name}</h3>
      ${model?`<div class="model">${model}</div>`:""}
      ${tags.length?`<div class="tags">${tags.map(x=>`<span>${x}</span>`).join("")}</div>`:""}
      <div class="card-actions">
        <a class="details-btn" href="product.html?id=${encodeURIComponent(p.id)}">View Details</a>
        <a class="ask-btn" href="${waLink(p)}" target="_blank" rel="noreferrer">Ask Price</a>
      </div>
    </div>
  </article>`;
}
function navSetup(){
  const btn=$q("#mobileToggle"), links=$q("#navLinks");
  if(btn&&links) btn.addEventListener("click",()=>links.classList.toggle("open"));
  const hs=$q("#siteSearch"), hb=$q("#siteSearchButton");
  const go=()=>{if(hs&&hs.value.trim()) location.href=`products.html?q=${encodeURIComponent(hs.value.trim())}`};
  hb?.addEventListener("click",go);hs?.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
}
function initHome(){
  const featured=$q("#featuredProducts");
  if(featured){
    featured.innerHTML=PRODUCTS.slice(0,8).map(productCard).join("");
    $qa(".product-card",featured).forEach((card,i)=>{card.classList.add("reveal-card");card.style.transitionDelay=`${Math.min(i,7)*65}ms`});
  }

  const categoryGrid=$q("#homeCategoryGrid");
  if(categoryGrid){
    const descriptions={
      "Refrigerators":"No-frost, inverter and multi-door refrigerator ranges.",
      "Air Conditioners":"Inverter, T3 and smart cooling models.",
      "Washing Machines":"Top-load, front-load and washer-dryer models.",
      "LED TVs":"Google TV, QLED and Mini LED ranges.",
      "Freezers":"Deep freezers for home and everyday storage.",
      "Microwave Ovens":"Solo, grill, convection and air-fryer microwave ranges.",
      "Kitchen Appliances":"Hoods and kitchen appliance models.",
      "Small Appliances":"Compact home appliances from Haier Pakistan."
    };
    const cats=[...new Set(PRODUCTS.map(p=>p.category))];
    categoryGrid.innerHTML=cats.map((cat,i)=>{
      const items=PRODUCTS.filter(p=>p.category===cat), first=items[0];
      return `<article class="category-showcase-card reveal-card" data-category="${cat}" style="transition-delay:${Math.min(i,7)*65}ms">
        <div class="category-showcase-media"><img src="${first?.image||''}" alt="${cat}"></div>
        <div class="category-showcase-body"><span class="category-showcase-count">${items.length} model${items.length===1?'':'s'}</span><h3>${cat}</h3><p>${descriptions[cat]||'Browse current Haier models.'}</p><b>Browse category →</b></div>
      </article>`;
    }).join("");
    $qa("[data-category]",categoryGrid).forEach(el=>el.addEventListener("click",()=>location.href=`products.html?category=${encodeURIComponent(el.dataset.category)}`));
  }

  const slideDefs=[
    {kind:"store",kicker:"AB Electronics Haier Store",title:"Visit our Haier showroom in Multan",description:"See Haier refrigerators, ACs, washing machines, TVs and more in person on Old Shuja Abad Road.",image:"assets/shop/storefront-main.webp",label:"AB Electronics · Multan",primaryText:"See Showroom",primaryHref:"about.html",secondaryText:"Get Directions",secondaryHref:"contact.html",fit:"cover"},
    {category:"Air Conditioners",kicker:"Haier Air Conditioners",title:"Cooling options for Multan summers",description:"Browse current inverter, T3 and smart Haier AC models, then ask the store for today's price and stock.",label:"Air Conditioners",primaryText:"Browse ACs",fit:"contain"},
    {category:"Refrigerators",kicker:"Haier Refrigerators",title:"Refrigerators for different homes",description:"Explore current Haier refrigerator models — from everyday inverter options to larger multi-door designs.",label:"Refrigerators",primaryText:"Browse Refrigerators",fit:"contain"},
    {category:"Washing Machines",kicker:"Haier Laundry",title:"Washing machines built for everyday use",description:"Compare top-load, front-load and washer-dryer models in the current Haier Pakistan range.",label:"Washing Machines",primaryText:"Browse Laundry",fit:"contain"},
    {category:"LED TVs",kicker:"Haier TVs",title:"Google TV, QLED and Mini LED models",description:"See current Haier television models, then open a product page for its exact model details.",label:"LED TVs",primaryText:"Browse TVs",fit:"contain"}
  ];
  const slides=slideDefs.map(def=>{
    if(def.kind==="store") return def;
    const p=PRODUCTS.find(x=>x.category===def.category);
    return {...def,image:p?.image||"assets/shop/showroom-wide.webp",primaryHref:`products.html?category=${encodeURIComponent(def.category)}`,secondaryText:"Ask Price",secondaryHref:waLink(p)};
  });
  const image=$q("#heroSlideImage"), kicker=$q("#heroKicker"), title=$q("#heroTitle"), desc=$q("#heroDescription"), label=$q("#heroMediaLabel"), primary=$q("#heroPrimary"), secondary=$q("#heroSecondary"), media=$q("#heroSlideMedia"), dots=$q("#heroDots");
  if(image&&slides.length){
    let current=0,timer;
    dots.innerHTML=slides.map((_,i)=>`<button class="hero-dot${i===0?' active':''}" type="button" data-slide="${i}" aria-label="Go to slide ${i+1}"></button>`).join("");
    const show=i=>{
      current=(i+slides.length)%slides.length;const s=slides[current];media.classList.add("changing");
      setTimeout(()=>{image.src=s.image;image.alt=s.title;image.className=s.fit||"contain";kicker.textContent=s.kicker;title.textContent=s.title;desc.textContent=s.description;label.textContent=s.label;primary.textContent=s.primaryText;primary.href=s.primaryHref;secondary.textContent=s.secondaryText||"WhatsApp";secondary.href=s.secondaryHref||"https://wa.me/923077568769";secondary.target=(secondary.href.startsWith("http")?"_blank":"_self");$qa(".hero-dot",dots).forEach((d,idx)=>d.classList.toggle("active",idx===current));media.classList.remove("changing")},230);
    };
    const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5200)};
    $q("#heroPrev")?.addEventListener("click",()=>{show(current-1);restart()});$q("#heroNext")?.addEventListener("click",()=>{show(current+1);restart()});dots.addEventListener("click",e=>{const b=e.target.closest("[data-slide]");if(!b)return;show(Number(b.dataset.slide));restart()});restart();
  }

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.12});
  $qa(".reveal,.reveal-card").forEach(el=>observer.observe(el));
}
function initProducts(){
  const grid=$q("#catalogGrid"), list=$q("#categoryFilters"), input=$q("#catalogSearch"), count=$q("#resultCount");
  if(!grid)return;
  const params=new URLSearchParams(location.search);
  let category=params.get("category")||"All", q=params.get("q")||"";
  input.value=q;
  const cats=["All",...new Set(PRODUCTS.map(p=>p.category))];
  list.innerHTML=cats.map(c=>`<button class="${c===category?"active":""}" data-cat="${c}">${c}</button>`).join("");
  function render(){
    const term=q.toLowerCase().trim();
    const items=PRODUCTS.filter(p=>{
      const hay=`${p.officialTitle||""} ${p.model||""} ${p.name||""} ${p.category||""} ${(p.highlights||[]).join(" ")}`.toLowerCase();
      return (category==="All"||p.category===category)&&(!term||hay.includes(term));
    });
    grid.innerHTML=items.map(productCard).join("");
    count.textContent=`${items.length} product${items.length===1?"":"s"}`;
    $qa("[data-cat]",list).forEach(b=>b.classList.toggle("active",b.dataset.cat===category));
  }
  list.addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;category=b.dataset.cat;render()});
  input.addEventListener("input",e=>{q=e.target.value;render()});
  render();
}
function initProduct(){
  const root=$q("#productRoot");if(!root)return;
  const id=new URLSearchParams(location.search).get("id");
  const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  if(!p){root.innerHTML="<p>Product not found.</p>";return}
  const title=titleFor(p), name=nameFor(p), model=modelFor(p), tags=p.highlights||[], specs=p.specs||{};
  document.title=`${title} | AB Electronics`;
  root.innerHTML=`<div class="product-detail">
    <div class="detail-image"><img src="${p.image}" alt="${title.replace(/"/g,'&quot;')}"></div>
    <div class="detail-copy">
      <div class="category">${p.category}</div>
      <h1>${name}</h1>
      ${model?`<div class="detail-model">${model}</div>`:""}
      ${tags.length?`<div class="detail-tags">${tags.map(x=>`<span>${x}</span>`).join("")}</div>`:""}
      <div class="price-note"><strong>Current price:</strong> Ask AB Electronics on WhatsApp. Prices can change, so the site does not publish a stale fixed price.</div>
      <div class="hero-actions">
        <a class="btn btn-green" target="_blank" rel="noreferrer" href="${waLink(p)}">Ask Price on WhatsApp</a>
        <a class="btn btn-light" href="tel:+923077568769">Call 0307 7568769</a>
      </div>
      ${Object.keys(specs).length?`<h2 style="font-size:22px;margin-top:28px">Specifications</h2><table class="spec-table">${Object.entries(specs).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`:`<h2 style="font-size:22px;margin-top:28px">Product information</h2><p class="notice">This model is currently listed on Haier Pakistan. Detailed specifications can be added after a manual verification pass; the model name and product image are synced from the official listing.</p>`}
      <p class="notice">Model name and image are based on Haier Pakistan's current catalog. Final stock, current price, warranty card and availability should be confirmed with AB Electronics before purchase.</p>
    </div>
  </div>`;
  const related=$q("#relatedProducts");if(related) related.innerHTML=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(productCard).join("");
}
document.addEventListener("DOMContentLoaded",()=>{navSetup();initHome();initProducts();initProduct()});
