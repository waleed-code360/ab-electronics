import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, products } from './data/products'

const whatsappNumber = '923077568769'
const displayPhone = '0307 7568769'
const telHref = 'tel:+923077568769'
const shopAddress = 'AB Electronics Haier Store, Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan'
const mapsQuery = encodeURIComponent(shopAddress)
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
const mapsEmbed = `https://www.google.com/maps?q=${mapsQuery}&output=embed`
const shopAsset = (name) => `${import.meta.env.BASE_URL}shop/${name}`

function Icon({ name, size = 20 }) {
  const icons = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    phone: <><path d="M7.2 3.8 9.4 8l-2 1.7c1.1 2.3 2.7 3.9 5 5l1.7-2 4.2 2.2c.4.2.6.6.5 1-.2 2-1.8 3.4-3.8 3.2C9 18.5 4.5 14 3.9 8c-.2-2 1.2-3.6 3.2-3.8Z"/></>,
    spark: <><path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z"/><path d="m19 15 .6 2.1 1.9.9-1.9.9L19 21l-.6-2.1-1.9-.9 1.9-.9L19 15Z"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const heroRef = useRef(null)

  const visibleProducts = useMemo(() => {
    return category === 'All' ? products : products.filter((p) => p.category === category)
  }, [category])

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const move = (e) => {
      const r = hero.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      hero.style.setProperty('--px', `${x * 18}px`)
      hero.style.setProperty('--py', `${y * 14}px`)
      hero.style.setProperty('--rx', `${-y * 6}deg`)
      hero.style.setProperty('--ry', `${x * 8}deg`)
    }

    const reset = () => {
      hero.style.setProperty('--px', '0px')
      hero.style.setProperty('--py', '0px')
      hero.style.setProperty('--rx', '0deg')
      hero.style.setProperty('--ry', '0deg')
    }

    hero.addEventListener('mousemove', move)
    hero.addEventListener('mouseleave', reset)
    return () => {
      hero.removeEventListener('mousemove', move)
      hero.removeEventListener('mouseleave', reset)
    }
  }, [])

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi AB Electronics, I want to ask about a Haier appliance.')}`
  const productWhatsApp = (product) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Hi AB Electronics, please share the current price and availability of ${product.model} (${product.title}).`
    )}`

  const heroProduct = products[0]
  const secondProduct = products[1]
  const thirdProduct = products[3]

  return (
    <div className="app">
      <div className="announcement">
        <div className="wrap announcement-inner">
          <span>AB Electronics · Haier Home Appliances</span>
          <a href="#showroom">Showroom</a>
        </div>
      </div>

      <header className="nav-shell">
        <div className="wrap nav-row">
          <a className="identity" href="#home" aria-label="AB Electronics home">
            <span className="identity-badge">AB</span>
            <span className="identity-copy">
              <strong>AB Electronics</strong>
              <small>Haier Home Appliances</small>
            </span>
          </a>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#range" onClick={() => setMenuOpen(false)}>Products</a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
            <a href="#showroom" onClick={() => setMenuOpen(false)}>Showroom</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>

          <div className="nav-end">
            <a className="nav-cta" href="#range">Explore range <Icon name="arrow" size={16}/></a>
            <button className="menu" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home" ref={heroRef}>
          <div className="hero-grid-lines" />
          <div className="hero-glow glow-a" />
          <div className="hero-glow glow-b" />

          <div className="wrap hero-layout">
            <div className="hero-info" data-reveal>
              <div className="hero-label"><span/> Official Pakistan catalog focus</div>
              <h1>
                <span>Haier appliances at</span>
                <em>AB Electronics</em>
              </h1>
              <p>
                Explore Haier appliances available through AB Electronics in Multan, then contact the store
                directly for the latest price and stock.
              </p>

              <div className="hero-actions">
                <a className="button primary" href="#range">Browse products <Icon name="arrow"/></a>
                <a className="button glass" href="#showroom">See the store</a>
              </div>

              <div className="hero-micro">
                <div><b>06</b><span>Core categories</span></div>
                <div><b>PK</b><span>Pakistan models</span></div>
                <div><b>01</b><span>Real showroom</span></div>
              </div>
            </div>

            <div className="hero-visual" data-reveal>
              <div className="visual-ring ring-one" />
              <div className="visual-ring ring-two" />
              <div className="visual-ring ring-three" />

              <div className="hero-appliance">
                <div className="appliance-aura" />
                <img src={heroProduct.image} alt={heroProduct.model} />
                <div className="appliance-shadow" />
              </div>

              <div className="orbit-card orbit-one">
                <div className="orbit-thumb"><img src={secondProduct.image} alt={secondProduct.model}/></div>
                <span>Air Conditioner</span>
                <strong>{secondProduct.model}</strong>
              </div>

              <div className="orbit-card orbit-two">
                <div className="orbit-thumb"><img src={thirdProduct.image} alt={thirdProduct.model}/></div>
                <span>Mini LED TV</span>
                <strong>{thirdProduct.model}</strong>
              </div>

              <div className="model-chip">
                <span>Featured</span>
                <strong>{heroProduct.model}</strong>
              </div>
            </div>
          </div>

          <div className="motion-rail">
            <div className="motion-track">
              {['REFRIGERATORS','AIR CONDITIONERS','WASHING MACHINES','LED TVs','FREEZERS','MICROWAVES','REFRIGERATORS','AIR CONDITIONERS','WASHING MACHINES','LED TVs','FREEZERS','MICROWAVES'].map((item, i) => (
                <span key={`${item}-${i}`}>{item}<i>•</i></span>
              ))}
            </div>
          </div>
        </section>

        <section className="section categories-section">
          <div className="wrap">
            <div className="section-top" data-reveal>
              <div>
                <p className="eyebrow">Shop by category</p>
                <h2>Find the right appliance</h2>
              </div>
              <p>
                Browse Haier appliances by category, then open a product for details and current availability.
              </p>
            </div>

            <div className="portal-grid">
              {categories.filter(c => c !== 'All').map((item, i) => {
                const p = products.find(x => x.category === item) || products[i % products.length]
                return (
                  <a className={`portal portal-${(i % 3) + 1}`} href="#range" key={item} onClick={() => setCategory(item)} data-reveal>
                    <div className="portal-number">0{i + 1}</div>
                    <div className="portal-copy">
                      <span>Explore</span>
                      <h3>{item}</h3>
                    </div>
                    <div className="portal-image"><img src={p.image} alt={item}/></div>
                    <div className="portal-arrow"><Icon name="arrow"/></div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section range-section" id="range">
          <div className="wrap">
            <div className="section-top range-heading" data-reveal>
              <div>
                <p className="eyebrow">Haier Pakistan range</p>
                <h2>Explore the Haier range</h2>
              </div>
              <p>Prices change frequently, so every product connects directly to AB Electronics for the latest price and stock.</p>
            </div>

            <div className="filters" data-reveal>
              {categories.map(item => (
                <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>

            <div className="products">
              {visibleProducts.map((p, i) => (
                <article className="product" key={p.id} data-reveal style={{'--delay': `${i * 45}ms`}}>
                  <button className="product-open" type="button" onClick={() => setSelectedProduct(p)} aria-label={`View details for ${p.model}`}>
                    <div className="product-stage">
                      <span className="product-badge">Pakistan model</span>
                      <div className="product-orb"/>
                      <img src={p.image} alt={`${p.title} ${p.model}`} loading="lazy"/>
                      <span className="details-arrow"><Icon name="arrow"/></span>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{p.category}</span>
                      <h3>{p.title}</h3>
                      <p className="product-model">{p.model}</p>
                      <div className="chips">{p.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                      <div className="product-actions-row">
                        <span className="view-details">View details</span>
                        <span className="current-price-label">Ask for current price</span>
                      </div>
                    </div>
                  </button>
                  <a className="product-whatsapp" href={productWhatsApp(p)} target="_blank" rel="noreferrer">
                    <Icon name="phone" size={17}/> Ask price on WhatsApp
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="experience" id="experience">
          <div className="experience-noise"/>
          <div className="wrap experience-layout">
            <div className="experience-copy" data-reveal>
              <p className="eyebrow light">Product experience</p>
              <h2>Depth without turning the store into a 3D demo.</h2>
              <p>
                Hover, movement and layered lighting make the products feel premium. The actual catalog remains fast,
                readable and mobile friendly.
              </p>
              <a href="#range">View current range <Icon name="arrow" size={18}/></a>
            </div>

            <div className="experience-stage" data-reveal>
              <div className="experience-disc disc-a"/>
              <div className="experience-disc disc-b"/>
              <img src={heroProduct.image} alt={heroProduct.model}/>
              <div className="feature-pin pin-1"><span>01</span><b>Twin Inverter</b></div>
              <div className="feature-pin pin-2"><span>02</span><b>Smart Control</b></div>
              <div className="feature-pin pin-3"><span>03</span><b>Precision Cooling</b></div>
            </div>
          </div>
        </section>

        <section className="section showroom" id="showroom">
          <div className="wrap">
            <div className="section-top" data-reveal>
              <div>
                <p className="eyebrow">AB Electronics showroom</p>
                <h2>Visit AB Electronics in Multan</h2>
              </div>
              <p>
                See the real showroom, browse the appliance displays and contact the store before your visit.
              </p>
            </div>

            <div className="showroom-collage" data-reveal>
              <figure className="shot shot-main">
                <img src={shopAsset("storefront-main.webp")} alt="AB Electronics storefront"/>
                <figcaption><span>01</span> AB Electronics storefront</figcaption>
              </figure>
              <figure className="shot shot-side-a">
                <img src={shopAsset("showroom-wide.webp")} alt="Inside AB Electronics showroom"/>
                <figcaption><span>02</span> Inside the showroom</figcaption>
              </figure>
              <figure className="shot shot-side-b">
                <img src={shopAsset("ac-wall.webp")} alt="Inside AB Electronics showroom"/>
                <figcaption><span>03</span> Haier AC display</figcaption>
              </figure>
              <div className="showroom-card">
                <Icon name="spark" size={26}/>
                <span>Real store.<br/>Real products.<br/>Real support.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-band">
          <div className="wrap trust-grid" data-reveal>
            <div><span>01</span><strong>Genuine model guidance</strong><p>Clear model names and key features before the customer visits.</p></div>
            <div><span>02</span><strong>Current stock support</strong><p>Phone or WhatsApp becomes the fast path for stock and pricing.</p></div>
            <div><span>03</span><strong>Haier-focused range</strong><p>Categories and models built around the Pakistan product catalog.</p></div>
            <div><span>04</span><strong>Mobile first</strong><p>Animations simplify automatically on smaller and reduced-motion devices.</p></div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="wrap contact-layout" data-reveal>
            <div className="contact-panel">
              <div className="contact-grid-lines"/>
              <div className="contact-copy">
                <p className="eyebrow light">AB Electronics Haier Store</p>
                <h2>Price, stock or model question?</h2>
                <p>Contact the store directly for the latest product price and availability.</p>

                <div className="store-details">
                  <div>
                    <span>Phone / WhatsApp</span>
                    <strong>{displayPhone}</strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>{shopAddress}</strong>
                  </div>
                </div>
              </div>

              <div className="contact-buttons">
                <a className="button white" href={whatsappHref} target="_blank" rel="noreferrer">
                  <Icon name="phone"/> WhatsApp
                </a>
                <a className="button outline" href={telHref}>
                  <Icon name="phone"/> Call store
                </a>
                <a className="button outline" href={mapsHref} target="_blank" rel="noreferrer">
                  <Icon name="pin"/> Get directions
                </a>
              </div>
            </div>

            <div className="map-card">
              <iframe
                title="AB Electronics Haier Store location"
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {selectedProduct && (
          <div className="product-modal-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
            <section className="product-modal" role="dialog" aria-modal="true" aria-label={`${selectedProduct.model} details`} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product details">
                <Icon name="close"/>
              </button>

              <div className="modal-product-image">
                <img src={selectedProduct.image} alt={`${selectedProduct.title} ${selectedProduct.model}`}/>
              </div>

              <div className="modal-product-copy">
                <span className="product-category">{selectedProduct.category}</span>
                <h2>{selectedProduct.title}</h2>
                <p className="modal-model">{selectedProduct.model}</p>

                <div className="modal-chips">
                  {selectedProduct.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>

                <div className="modal-note">
                  Current prices can change, so AB Electronics confirms the latest price and stock directly.
                </div>

                <div className="modal-actions">
                  <a className="button modal-whatsapp" href={productWhatsApp(selectedProduct)} target="_blank" rel="noreferrer">
                    <Icon name="phone"/> Ask price on WhatsApp
                  </a>
                  <a className="button modal-call" href={telHref}>
                    Call {displayPhone}
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer>
        <div className="wrap footer-row">
          <div className="identity">
            <span className="identity-badge">AB</span>
            <span className="identity-copy"><strong>AB Electronics</strong><small>Haier Home Appliances</small></span>
          </div>
          <p>AB Electronics Haier Store · Old Shuja Abad Rd, opposite PSO Pump, Shershah Town, Multan.</p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </div>
  )
}

export default App
