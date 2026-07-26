(() => {
  const CATALOG = Array.isArray(window.AB_CATALOG) ? window.AB_CATALOG : [];
  const WARRANTY = window.AB_WARRANTY || {};
  const CATEGORY_VISUALS = window.AB_CATEGORY_VISUALS || {};
  const WHATSAPP = "923077568769";

  const categories = [...new Set(CATALOG.map(p => p.category))];
  let activeCategory = "All";
  let searchTerm = "";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const productGrid = $("#productGrid");
  const catalogCount = $("#catalogCount");
  const emptyState = $("#emptyState");
  const filterPills = $("#filterPills");
  const categoryCards = $("#categoryCards");
  const headerCategory = $("#headerCategory");
  const headerSearch = $("#headerSearch");
  const catalogSearch = $("#catalogSearch");

  const normalize = (value = "") => value.toLowerCase().replace(/\s+/g, " ").trim();
  const esc = (value = "") => value.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));

  function whatsappFor(product) {
    const text = product
      ? `Hi AB Electronics, please share the current price and availability of ${product.model} (${product.series}).`
      : "Hi AB Electronics, please share current Haier product prices and availability.";
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  }

  function countForCategory(category) {
    return CATALOG.filter(p => p.category === category).length;
  }

  function renderCategoryUI() {
    headerCategory.innerHTML = [
      `<option value="All">All Categories</option>`,
      ...categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    ].join("");

    const categoryMenu = $("#categoryMenu");
    categoryMenu.innerHTML = categories.map(c =>
      `<button type="button" data-category="${esc(c)}">${esc(c)} <small>(${countForCategory(c)})</small></button>`
    ).join("");

    filterPills.innerHTML = [
      `<button class="filter-pill active" type="button" data-filter="All">All <span>${CATALOG.length}</span></button>`,
      ...categories.map(c => `<button class="filter-pill" type="button" data-filter="${esc(c)}">${esc(c)} <span>${countForCategory(c)}</span></button>`)
    ].join("");

    categoryCards.innerHTML = categories.map(c => `
      <button class="category-card" type="button" data-category-card="${esc(c)}">
        <img src="${esc(CATEGORY_VISUALS[c] || "assets/shop/showroom-wide.webp")}" alt="${esc(c)} display at AB Electronics" loading="lazy">
        <span class="category-count">${countForCategory(c)} models</span>
        <span class="category-card-content">
          <strong>${esc(c)}</strong>
          <span>View current catalog models →</span>
        </span>
      </button>
    `).join("");
  }

  function getFiltered() {
    const q = normalize(searchTerm);
    return CATALOG.filter(p => {
      const categoryMatches = activeCategory === "All" || p.category === activeCategory;
      if (!categoryMatches) return false;
      if (!q) return true;
      return normalize(`${p.model} ${p.series} ${p.category} ${(p.features || []).join(" ")}`).includes(q);
    });
  }

  function renderProducts() {
    const list = getFiltered();
    catalogCount.textContent = `${list.length} model${list.length === 1 ? "" : "s"} shown`;
    emptyState.hidden = list.length !== 0;

    productGrid.innerHTML = list.map(p => {
      const image = p.image || p.fallback || CATEGORY_VISUALS[p.category] || "assets/shop/showroom-wide.webp";
      const featureTags = (p.features || []).filter(x => !/official haier/i.test(x)).slice(0, 3);
      return `
        <article class="product-card" data-id="${esc(p.id)}">
          <button class="product-open" type="button" data-open-product="${esc(p.id)}">
            <div class="product-image">
              <img src="${esc(image)}" alt="${esc(p.category)} showroom display for ${esc(p.model)}" loading="lazy">
              <span class="product-badge">Haier Pakistan</span>
              <span class="visual-label">${p.image ? "Product image" : "Category display"}</span>
            </div>
            <div class="product-body">
              <span class="product-category">${esc(p.category)}</span>
              <h3>${esc(p.model)}</h3>
              <p class="product-series">${esc(p.series)}</p>
              <div class="mini-features">
                ${featureTags.map(f => `<span>${esc(f)}</span>`).join("")}
              </div>
              <div class="product-card-footer">
                <span class="view-details">View Details</span>
                <span class="ask-price">Ask current price →</span>
              </div>
            </div>
          </button>
          <a class="product-whatsapp" href="${whatsappFor(p)}" target="_blank" rel="noreferrer">Ask Price on WhatsApp</a>
        </article>
      `;
    }).join("");

    $$(".filter-pill").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === activeCategory));
    if (headerCategory) headerCategory.value = activeCategory;
  }

  function setCategory(category, scroll = true) {
    activeCategory = categories.includes(category) ? category : "All";
    renderProducts();
    $("#categoryMenu")?.classList.remove("open");
    if (scroll) $("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openProduct(id, updateHash = true) {
    const p = CATALOG.find(item => item.id === id);
    if (!p) return;
    const image = p.image || p.fallback || CATEGORY_VISUALS[p.category] || "assets/shop/showroom-wide.webp";

    $("#modalImage").src = image;
    $("#modalImage").alt = `${p.category} display for ${p.model}`;
    $("#modalVisualLabel").textContent = p.image ? "Product image" : "Showroom category display";
    $("#modalCategory").textContent = p.category;
    $("#modalModel").textContent = p.model;
    $("#modalSeries").textContent = p.series;
    $("#modalFeatures").innerHTML = (p.features?.length ? p.features : ["Current Haier Pakistan catalog model"])
      .map(f => `<div class="modal-feature">${esc(f)}</div>`).join("");
    $("#modalWarranty").textContent = WARRANTY[p.category] || "Confirm warranty terms with the warranty card / Haier Pakistan at purchase.";
    $("#modalWhatsapp").href = whatsappFor(p);

    const wrap = $("#productModalWrap");
    wrap.classList.add("open");
    wrap.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (updateHash) history.replaceState(null, "", `#product=${encodeURIComponent(p.id)}`);
  }

  function closeProduct(clearHash = true) {
    const wrap = $("#productModalWrap");
    wrap.classList.remove("open");
    wrap.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (clearHash && location.hash.startsWith("#product=")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function applyHeaderSearch() {
    searchTerm = headerSearch.value;
    catalogSearch.value = headerSearch.value;
    activeCategory = headerCategory.value || "All";
    renderProducts();
    $("#products")?.scrollIntoView({ behavior: "smooth" });
  }

  renderCategoryUI();
  renderProducts();
  $("#modelStat").textContent = CATALOG.length;

  document.addEventListener("click", e => {
    const categoryButton = e.target.closest("[data-category]");
    if (categoryButton) {
      setCategory(categoryButton.dataset.category);
      return;
    }
    const categoryCard = e.target.closest("[data-category-card]");
    if (categoryCard) {
      setCategory(categoryCard.dataset.categoryCard);
      return;
    }
    const filter = e.target.closest("[data-filter]");
    if (filter) {
      setCategory(filter.dataset.filter, false);
      return;
    }
    const product = e.target.closest("[data-open-product]");
    if (product) {
      openProduct(product.dataset.openProduct);
      return;
    }
    if (e.target.closest("[data-close-modal]")) {
      closeProduct();
      return;
    }
    const footerCategory = e.target.closest("[data-footer-category]");
    if (footerCategory) {
      setCategory(footerCategory.dataset.footerCategory);
    }
  });

  headerCategory.addEventListener("change", () => {
    activeCategory = headerCategory.value;
    renderProducts();
  });

  $("#headerSearchButton").addEventListener("click", applyHeaderSearch);
  headerSearch.addEventListener("keydown", e => {
    if (e.key === "Enter") applyHeaderSearch();
  });

  catalogSearch.addEventListener("input", e => {
    searchTerm = e.target.value;
    headerSearch.value = e.target.value;
    renderProducts();
  });

  $("#allCategoriesButton").addEventListener("click", () => {
    $("#categoryMenu").classList.toggle("open");
  });

  $("#navToggle").addEventListener("click", () => {
    $("#navLinks").classList.toggle("open");
  });

  $$("#navLinks a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));

  $$(".gallery-item").forEach(btn => {
    btn.addEventListener("click", () => {
      $("#lightboxImage").src = btn.dataset.image;
      $("#lightboxImage").alt = btn.querySelector("img")?.alt || "AB Electronics showroom";
      $("#lightbox").classList.add("open");
      $("#lightbox").setAttribute("aria-hidden", "false");
    });
  });

  function closeLightbox() {
    $("#lightbox").classList.remove("open");
    $("#lightbox").setAttribute("aria-hidden", "true");
  }

  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#lightbox").addEventListener("click", e => {
    if (e.target.id === "lightbox") closeLightbox();
  });

  const back = $("#backToTop");
  window.addEventListener("scroll", () => {
    back.classList.toggle("visible", scrollY > 700);
  }, { passive: true });
  back.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeProduct();
      closeLightbox();
    }
  });

  // Shareable product hash
  if (location.hash.startsWith("#product=")) {
    const id = decodeURIComponent(location.hash.replace("#product=", ""));
    requestAnimationFrame(() => openProduct(id, false));
  }
})();