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
  const featured=$q("#featuredProducts");if(featured) featured.innerHTML=PRODUCTS.slice(0,8).map(productCard).join("");
  $qa("[data-category]").forEach(el=>el.addEventListener("click",()=>location.href=`products.html?category=${encodeURIComponent(el.dataset.category)}`));
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
