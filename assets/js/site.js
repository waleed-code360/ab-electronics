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

function normalizeProductImageFrames(root=document){
  $qa(".product-img img, .detail-image img, .category-showcase-media img", root).forEach(img=>{
    const apply=()=>{
      const w=img.naturalWidth||1, h=img.naturalHeight||1;
      img.classList.toggle("product-portrait", h/w > 1.25);
      img.classList.toggle("product-landscape", w/h > 1.35);
      img.classList.toggle("product-squareish", h/w <= 1.25 && w/h <= 1.35);
    };
    if(img.complete) apply();
    else img.addEventListener("load",apply,{once:true});
  });
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
  const setMenu=(open)=>{
    if(!btn||!links)return;
    links.classList.toggle("open",open);
    btn.setAttribute("aria-expanded",String(open));
    const icon=$q(".mobile-toggle-icon",btn);
    if(icon) icon.textContent=open?"×":"☰";
  };
  if(btn&&links){
    btn.addEventListener("click",()=>setMenu(!links.classList.contains("open")));
    $qa("a",links).forEach(a=>a.addEventListener("click",()=>setMenu(false)));
    document.addEventListener("click",e=>{
      if(!links.classList.contains("open"))return;
      if(!e.target.closest(".navbar"))setMenu(false);
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
  }

  // Highlight the current page.
  const file=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  $qa("#navLinks a").forEach(a=>{
    const href=(a.getAttribute("href")||"").split("?")[0].toLowerCase();
    if((file==="index.html"&&href==="index.html") || href===file) a.classList.add("active");
  });

  const hs=$q("#siteSearch"), hb=$q("#siteSearchButton");
  const go=()=>{if(hs&&hs.value.trim()) location.href=`products.html?q=${encodeURIComponent(hs.value.trim())}`};
  hb?.addEventListener("click",go);
  hs?.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
}
function initHome(){
  const featured=$q("#featuredProducts");
  if(featured){
    featured.innerHTML=PRODUCTS.slice(0,8).map(productCard).join(""); normalizeProductImageFrames(featured);
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
    normalizeProductImageFrames(categoryGrid); $qa("[data-category]",categoryGrid).forEach(el=>el.addEventListener("click",()=>location.href=`products.html?category=${encodeURIComponent(el.dataset.category)}`));
  }

  // HERO RULE:
  // Only AB Electronics showroom/store photos supplied by the user.
  // Product cutout images remain reserved for catalog/product cards.
  const slides=[
    {
      kicker:"AB Electronics Haier Store",
      title:"Visit our Haier showroom in Multan",
      description:"See the real AB Electronics store on Old Shuja Abad Road and explore Haier appliances in person.",
      image:"assets/shop/storefront-main.webp",
      label:"AB Electronics · Haier Store",
      primaryText:"See Showroom",
      primaryHref:"about.html",
      secondaryText:"Get Directions",
      secondaryHref:"https://www.google.com/maps/search/?api=1&query=AB%20ELECTRONICS%20HAIER%20STORE&query_place_id=ChIJx29E74wxOzkR9unHZnPTohE",
      fit:"cover", position:"center 52%"
    },
    {
      kicker:"Haier Air Conditioners",
      title:"See the AC range on display",
      description:"Compare Haier inverter and T3 air conditioners in the showroom, then ask us for today's price and stock.",
      image:"assets/shop/ac-wall.webp",
      label:"Haier AC Display · AB Electronics",
      primaryText:"Browse ACs",
      primaryHref:"products.html?category=Air%20Conditioners",
      secondaryText:"Ask on WhatsApp",
      secondaryHref:"https://wa.me/923077568769?text=Hi%20AB%20Electronics%2C%20please%20share%20current%20Haier%20AC%20prices%20and%20availability.",
      fit:"cover", position:"center 24%"
    },
    {
      kicker:"Haier Refrigerators",
      title:"Compare refrigerators in-store",
      description:"See different Haier refrigerator sizes and finishes together before choosing the model that suits your home.",
      image:"assets/shop/fridge-row.webp",
      label:"Haier Refrigerator Range · Showroom",
      primaryText:"Browse Refrigerators",
      primaryHref:"products.html?category=Refrigerators",
      secondaryText:"Ask on WhatsApp",
      secondaryHref:"https://wa.me/923077568769?text=Hi%20AB%20Electronics%2C%20please%20share%20current%20Haier%20refrigerator%20prices%20and%20availability.",
      fit:"cover", position:"center 36%"
    },
    {
      kicker:"Haier Washing Machines",
      title:"Explore the laundry range",
      description:"View Haier washing machines in the showroom and compare top-load, front-load and everyday laundry options.",
      image:"assets/shop/washer-row.webp",
      label:"Haier Washing Machines · Showroom",
      primaryText:"Browse Laundry",
      primaryHref:"products.html?category=Washing%20Machines",
      secondaryText:"Ask on WhatsApp",
      secondaryHref:"https://wa.me/923077568769?text=Hi%20AB%20Electronics%2C%20please%20share%20current%20Haier%20washing%20machine%20prices%20and%20availability.",
      fit:"cover", position:"center 45%"
    },
    {
      kicker:"Haier LED TVs",
      title:"See TV sizes before you decide",
      description:"Visit the TV display wall, compare screen sizes in person and then explore current Haier TV models online.",
      image:"assets/shop/tv-wall.webp",
      label:"Haier LED TV Display · Showroom",
      primaryText:"Browse TVs",
      primaryHref:"products.html?category=LED%20TVs",
      secondaryText:"Ask on WhatsApp",
      secondaryHref:"https://wa.me/923077568769?text=Hi%20AB%20Electronics%2C%20please%20share%20current%20Haier%20TV%20prices%20and%20availability.",
      fit:"cover", position:"center 38%"
    },
    {
      kicker:"Haier Kitchen Appliances",
      title:"Microwaves and kitchen appliances",
      description:"See Haier microwaves and kitchen appliances on display and contact the store for the latest availability.",
      image:"assets/shop/microwave-wall.webp",
      label:"Haier Kitchen Display · AB Electronics",
      primaryText:"Browse Microwaves",
      primaryHref:"products.html?category=Microwave%20Ovens",
      secondaryText:"Ask on WhatsApp",
      secondaryHref:"https://wa.me/923077568769?text=Hi%20AB%20Electronics%2C%20please%20share%20current%20Haier%20microwave%20and%20kitchen%20appliance%20prices.",
      fit:"cover", position:"center 42%"
    }
  ];
  const image=$q("#heroSlideImage"), kicker=$q("#heroKicker"), title=$q("#heroTitle"), desc=$q("#heroDescription"), label=$q("#heroMediaLabel"), primary=$q("#heroPrimary"), secondary=$q("#heroSecondary"), media=$q("#heroSlideMedia"), dots=$q("#heroDots"), status=$q("#heroSlideStatus"), shell=$q(".hero-slider-shell");
  if(image&&slides.length){
    let current=0,timer=null,touchStartX=0,touchStartY=0;
    dots.innerHTML=slides.map((_,i)=>`<button class="hero-dot${i===0?' active':''}" type="button" data-slide="${i}" aria-label="Go to slide ${i+1}"></button>`).join("");

    const show=i=>{
      current=(i+slides.length)%slides.length;
      const s=slides[current];
      media.classList.add("changing");
      setTimeout(()=>{
        image.src=s.image;
        image.alt=s.title;
        image.className=s.fit||"cover"; image.style.objectPosition=s.position||"center";
        kicker.textContent=s.kicker;
        title.textContent=s.title;
        desc.textContent=s.description;
        label.textContent=s.label;
        primary.textContent=s.primaryText;
        primary.href=s.primaryHref;
        secondary.textContent=s.secondaryText||"WhatsApp";
        secondary.href=s.secondaryHref||"https://wa.me/923077568769";
        secondary.target=secondary.href.startsWith("http")?"_blank":"_self";
        secondary.rel=secondary.target==="_blank"?"noreferrer":"";
        $qa(".hero-dot",dots).forEach((d,idx)=>d.classList.toggle("active",idx===current));
        if(status) status.textContent=`${current+1} / ${slides.length}`;
        media.classList.remove("changing");
      },180);
    };

    const stop=()=>{if(timer){clearInterval(timer);timer=null}};
    const start=()=>{
      stop();
      if(!document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        timer=setInterval(()=>show(current+1),5000);
      }
    };
    const next=()=>{show(current+1);start()};
    const prev=()=>{show(current-1);start()};

    $q("#heroPrev")?.addEventListener("click",prev);
    $q("#heroNext")?.addEventListener("click",next);
    dots.addEventListener("click",e=>{
      const b=e.target.closest("[data-slide]");
      if(!b)return;
      show(Number(b.dataset.slide));
      start();
    });

    // Touch swipe for iOS + Android.
    media.addEventListener("touchstart",e=>{
      const t=e.changedTouches[0];
      touchStartX=t.clientX;
      touchStartY=t.clientY;
      stop();
    },{passive:true});
    media.addEventListener("touchend",e=>{
      const t=e.changedTouches[0];
      const dx=t.clientX-touchStartX;
      const dy=t.clientY-touchStartY;
      if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.25){
        dx<0?next():prev();
      }else{
        start();
      }
    },{passive:true});

    // Pause while a desktop user is interacting.
    shell?.addEventListener("mouseenter",stop);
    shell?.addEventListener("mouseleave",start);
    document.addEventListener("visibilitychange",()=>document.hidden?stop():start());

    show(0);
    start();
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
    grid.innerHTML=items.map(productCard).join(""); normalizeProductImageFrames(grid);
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
  normalizeProductImageFrames(root); const related=$q("#relatedProducts");if(related){ related.innerHTML=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(productCard).join(""); normalizeProductImageFrames(related); }
}
document.addEventListener("DOMContentLoaded",()=>{navSetup();initHome();initProducts();initProduct()});
