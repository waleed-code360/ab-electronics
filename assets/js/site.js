const PRODUCTS = window.AB_PRODUCTS || [];
const WHATSAPP = "923077568769";

function $q(s,r=document){return r.querySelector(s)}
function $qa(s,r=document){return [...r.querySelectorAll(s)]}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function waLink(product){
  const label = product ? [product.name, product.model].filter(Boolean).join(" ") : "Haier product";
  const text = product
    ? `Hi AB Electronics, please share the current price and availability of ${label}.`
    : `Hi AB Electronics, please share current Haier product prices and availability.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function titleFor(p){return p.name || p.officialTitle || p.model || "Haier product"}
function modelFor(p){return (p.model||"").trim()}

function productCard(p,index=0){
  const title=titleFor(p), model=modelFor(p), tags=(p.highlights||[]).slice(0,3);
  const reveal=index%2===0?"left":"right";
  return `<article class="product-card reveal-card" data-reveal="${reveal}" style="--reveal-delay:${Math.min(index,7)*55}ms">
    <a class="product-img" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${esc(p.image)}" alt="${esc([title,model].filter(Boolean).join(' '))}" onerror="this.style.display='none';this.parentElement.classList.add('image-missing')">
    </a>
    <div class="product-body">
      <span class="product-cat">${esc(p.category)}</span>
      <h3>${esc(title)}</h3>
      ${model?`<div class="model">${esc(model)}</div>`:""}
      ${tags.length?`<div class="tags">${tags.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}
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
  hb?.addEventListener("click",go);
  hs?.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
}

function activateReveals(root=document){
  const nodes=$qa("[data-reveal]:not(.reveal-bound)",root);
  if(!nodes.length)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    nodes.forEach(n=>n.classList.add('reveal-bound','is-visible'));
    return;
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:"0px 0px -25px 0px"});
  nodes.forEach(n=>{n.classList.add('reveal-bound');observer.observe(n)});
}

function firstByCategory(category){return PRODUCTS.find(p=>p.category===category)}

function setupHero(){
  const title=$q('#heroTitle'), desc=$q('#heroDescription'), kicker=$q('#heroKicker'), media=$q('#heroMedia'), label=$q('#heroMediaLabel'), dots=$q('#heroDots');
  if(!title||!media)return;

  const productSlide=(category,kickerText,heading,description)=>{
    const p=firstByCategory(category);
    if(!p)return null;
    return {type:'product',category,kicker:kickerText,title:heading,description,image:p.image,label:[p.name,p.model].filter(Boolean).join(' · '),href:`products.html?category=${encodeURIComponent(category)}`,cta:`Explore ${category}`};
  };

  const slides=[
    {type:'shop',kicker:'AB Electronics · Multan',title:'Visit AB Electronics Haier Store',description:'See Haier appliances in our Multan showroom, compare models in person and ask us directly for current price and stock.',image:'assets/shop/storefront-main.webp',label:'AB Electronics Haier Store',href:'about.html',cta:'See the Showroom'},
    productSlide('Air Conditioners','Haier cooling','Current Haier AC range','Explore inverter and T3 air conditioner models for different room sizes, then confirm today’s price with AB Electronics.'),
    productSlide('Refrigerators','Haier refrigeration','Refrigerators for different homes','Browse current Haier refrigerator models, capacities and designs before choosing the right fit for your home.'),
    productSlide('Washing Machines','Haier laundry','Make laundry easier','Compare current Haier top-load and front-load washing machines with model-specific details and official product images.'),
    productSlide('LED TVs','Haier entertainment','Smart screens for your space','Explore Haier LED, QLED and Mini LED TV models, then contact the store for current availability.')
  ].filter(Boolean);

  let current=0,timer;
  dots.innerHTML=slides.map((_,i)=>`<button type="button" aria-label="Go to slide ${i+1}" data-hero-dot="${i}"></button>`).join('');

  function render(index,instant=false){
    current=(index+slides.length)%slides.length;
    const s=slides[current];
    const frame=$q('#heroMediaFrame');
    if(!instant){
      $q('.hero-copy-panel')?.classList.add('hero-changing');
      frame?.classList.add('hero-changing');
    }
    setTimeout(()=>{
      kicker.textContent=s.kicker;
      title.textContent=s.title;
      desc.textContent=s.description;
      media.src=s.image;
      media.alt=s.label;
      label.textContent=s.label;
      frame?.classList.toggle('shop-slide',s.type==='shop');
      frame?.classList.toggle('product-slide',s.type==='product');
      const action=$q('#heroActions .btn-primary');
      if(action){action.href=s.href;action.textContent=s.cta}
      $qa('[data-hero-dot]').forEach((d,i)=>d.classList.toggle('active',i===current));
      requestAnimationFrame(()=>{
        $q('.hero-copy-panel')?.classList.remove('hero-changing');
        frame?.classList.remove('hero-changing');
      });
    },instant?0:180);
  }
  function auto(){clearInterval(timer);timer=setInterval(()=>render(current+1),5200)}
  $q('#heroPrev')?.addEventListener('click',()=>{render(current-1);auto()});
  $q('#heroNext')?.addEventListener('click',()=>{render(current+1);auto()});
  dots.addEventListener('click',e=>{const b=e.target.closest('[data-hero-dot]');if(!b)return;render(Number(b.dataset.heroDot));auto()});
  $q('#heroSlider')?.addEventListener('mouseenter',()=>clearInterval(timer));
  $q('#heroSlider')?.addEventListener('mouseleave',auto);
  render(0,true);auto();
}

const categoryMeta={
  'Refrigerators':['Fresh food, flexible storage','Keep everyday essentials organized with Haier refrigerator options.'],
  'Air Conditioners':['Cooling for every room','Explore inverter, T3 and smart cooling models.'],
  'Washing Machines':['Smarter laundry days','Top-load and front-load models for different households.'],
  'LED TVs':['Big-screen entertainment','Explore Haier smart TV, QLED and Mini LED options.'],
  'Freezers':['Extra frozen storage','Deep freezer models for home and business needs.'],
  'Microwave Ovens':['Quick everyday cooking','Microwave, grill, convection and air-fryer options.'],
  'Kitchen Appliances':['Built for the kitchen','Explore current Haier kitchen appliance models.'],
  'Small Appliances':['Useful everyday appliances','Compact Haier products for daily convenience.']
};

function renderHomeCategories(){
  const root=$q('#homeCategories');if(!root)return;
  const order=['Refrigerators','Air Conditioners','Washing Machines','LED TVs','Freezers','Microwave Ovens','Kitchen Appliances','Small Appliances'];
  root.innerHTML=order.map((category,index)=>{
    const products=PRODUCTS.filter(p=>p.category===category), sample=products[0];
    if(!sample)return '';
    const [title,copy]=categoryMeta[category]||['Explore the range','Browse current Haier models.'];
    return `<a class="category-showcase-card" data-reveal="${index%2===0?'left':'right'}" style="--reveal-delay:${(index%4)*70}ms" href="products.html?category=${encodeURIComponent(category)}">
      <div class="category-visual"><img src="${esc(sample.image)}" alt="${esc(category)}"></div>
      <div class="category-info">
        <span>${products.length} model${products.length===1?'':'s'}</span>
        <h3>${esc(category)}</h3>
        <strong>${esc(title)}</strong>
        <p>${esc(copy)}</p>
        <b>Browse category →</b>
      </div>
    </a>`;
  }).join('');
  activateReveals(root);
}

function initHome(){
  setupHero();
  renderHomeCategories();
  const featured=$q("#featuredProducts");
  if(featured){
    const preferred=['Refrigerators','Air Conditioners','Washing Machines','LED TVs','Freezers','Microwave Ovens'];
    const picked=[];
    for(const c of preferred){
      const p=firstByCategory(c);if(p)picked.push(p);
    }
    PRODUCTS.forEach(p=>{if(picked.length<8&&!picked.some(x=>x.id===p.id))picked.push(p)});
    featured.innerHTML=picked.slice(0,8).map(productCard).join("");
    activateReveals(featured);
  }
  const ac=firstByCategory('Air Conditioners');
  if(ac&&$q('#promoAcImage'))$q('#promoAcImage').src=ac.image;
}

function initProducts(){
  const grid=$q("#catalogGrid"), list=$q("#categoryFilters"), input=$q("#catalogSearch"), count=$q("#resultCount");
  if(!grid)return;
  const params=new URLSearchParams(location.search);
  let category=params.get("category")||"All", q=params.get("q")||"";
  input.value=q;
  const cats=["All",...new Set(PRODUCTS.map(p=>p.category))];
  list.innerHTML=cats.map(c=>`<button class="${c===category?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  function render(){
    const term=q.toLowerCase().trim();
    const items=PRODUCTS.filter(p=>{
      const hay=`${p.name||""} ${p.model||""} ${p.category||""} ${(p.highlights||[]).join(" ")}`.toLowerCase();
      return (category==="All"||p.category===category)&&(!term||hay.includes(term));
    });
    grid.innerHTML=items.map(productCard).join("");
    count.textContent=`${items.length} product${items.length===1?"":"s"}`;
    $qa("[data-cat]",list).forEach(b=>b.classList.toggle("active",b.dataset.cat===category));
    activateReveals(grid);
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
  const title=titleFor(p), model=modelFor(p), tags=p.highlights||[], specs=p.specs||{};
  document.title=`${[title,model].filter(Boolean).join(' — ')} | AB Electronics`;
  root.innerHTML=`<div class="product-detail" data-reveal="up">
    <div class="detail-image"><img src="${esc(p.image)}" alt="${esc([title,model].filter(Boolean).join(' '))}"></div>
    <div class="detail-copy">
      <div class="category">${esc(p.category)}</div>
      <h1>${esc(title)}</h1>
      ${model?`<div class="detail-model">${esc(model)}</div>`:""}
      ${tags.length?`<div class="detail-tags">${tags.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}
      <div class="price-note"><strong>Current price:</strong> Ask AB Electronics on WhatsApp. Prices can change, so the website always directs you to the current store price.</div>
      <div class="hero-actions"><a class="btn btn-green" target="_blank" rel="noreferrer" href="${waLink(p)}">Ask Price on WhatsApp</a><a class="btn btn-light" href="tel:+923077568769">Call 0307 7568769</a></div>
      ${Object.keys(specs).length?`<h2 style="font-size:22px;margin-top:28px">Specifications</h2><table class="spec-table">${Object.entries(specs).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>`:`<h2 style="font-size:22px;margin-top:28px">Product information</h2><p class="notice">This current Haier Pakistan model is synced with its official model name, product family and image. Contact AB Electronics for stock and pricing.</p>`}
    </div>
  </div>`;
  activateReveals(root);
  const related=$q("#relatedProducts");
  if(related){related.innerHTML=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(productCard).join("");activateReveals(related)}
}

document.addEventListener("DOMContentLoaded",()=>{
  navSetup();
  activateReveals();
  initHome();
  initProducts();
  initProduct();
});
