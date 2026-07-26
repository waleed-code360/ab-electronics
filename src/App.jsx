import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, products } from './data/products'

const whatsappNumber = '' // Add number without +, spaces or dashes e.g. 923001234567

function Icon({ name, size = 20 }) {
  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    phone: <><path d="M7.2 3.8 9.4 8l-2 1.7c1.1 2.3 2.7 3.9 5 5l1.7-2 4.2 2.2c.4.2.6.6.5 1-.2 2-1.8 3.4-3.8 3.2C9 18.5 4.5 14 3.9 8c-.2-2 1.2-3.6 3.2-3.8.1 0 .1 0 .1-.4Z"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [category, setCategory] = useState('All')
  const stageRef = useRef(null)

  const visibleProducts = useMemo(() => {
    if (category === 'All') return products
    return products.filter((p) => p.category === category)
  }, [category])

  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0.12 }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const move = (event) => {
      const rect = stage.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      stage.style.setProperty('--mx', `${x * 11}deg`)
      stage.style.setProperty('--my', `${-y * 9}deg`)
    }
    const reset = () => {
      stage.style.setProperty('--mx', '0deg')
      stage.style.setProperty('--my', '0deg')
    }
    stage.addEventListener('mousemove', move)
    stage.addEventListener('mouseleave', reset)
    return () => {
      stage.removeEventListener('mousemove', move)
      stage.removeEventListener('mouseleave', reset)
    }
  }, [])

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi AB Electronics, I want to ask about a Haier appliance.')}`
    : '#contact'

  return (
    <div className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Haier home appliances • product guidance • current stock support</span>
          <a href="#showroom">Visit the showroom</a>
        </div>
      </div>

      <header className="header">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label="AB Electronics home">
            <span className="brand-mark">AB</span>
            <span>
              <strong>AB Electronics</strong>
              <small>Haier Home Appliances</small>
            </span>
          </a>

          <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
            <a href="#products" onClick={() => setMenuOpen(false)}>Products</a>
            <a href="#showroom" onClick={() => setMenuOpen(false)}>Showroom</a>
            <a href="#why-us" onClick={() => setMenuOpen(false)}>Why Us</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>

          <div className="nav-actions">
            <a className="nav-contact" href="#contact">Get in touch</a>
            <button className="menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />

          <div className="container hero-grid">
            <div className="hero-copy" data-reveal>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                AB Electronics
              </div>
              <h1>Haier appliances, presented the way customers actually shop.</h1>
              <p>
                Refrigerators, air conditioners, washing machines, TVs and everyday appliances —
                with model guidance, store support and a clean buying experience.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#products">
                  Browse products <Icon name="arrow" />
                </a>
                <a className="btn btn-ghost" href="#showroom">
                  See our store
                </a>
              </div>

              <div className="hero-points">
                <span><Icon name="check" size={17}/> Pakistan catalog models</span>
                <span><Icon name="check" size={17}/> Genuine product guidance</span>
                <span><Icon name="check" size={17}/> Mobile-friendly browsing</span>
              </div>
            </div>

            <div className="product-stage" ref={stageRef} data-reveal aria-label="Featured Haier appliances">
              <div className="stage-frame">
                <div className="stage-label">
                  <span>Featured in store</span>
                  <strong>Haier</strong>
                </div>

                <article className="floating-card card-fridge">
                  <img src={products[0].image} alt={products[0].model} />
                  <div>
                    <span>Refrigerator</span>
                    <strong>{products[0].model}</strong>
                  </div>
                </article>

                <article className="floating-card card-ac">
                  <img src={products[1].image} alt={products[1].model} />
                  <div>
                    <span>T3 Inverter AC</span>
                    <strong>1 Ton</strong>
                  </div>
                </article>

                <article className="floating-card card-tv">
                  <img src={products[3].image} alt={products[3].model} />
                  <div>
                    <span>Mini LED TV</span>
                    <strong>{products[3].model}</strong>
                  </div>
                </article>

                <div className="stage-note">
                  <span className="pulse" />
                  Product range built from Haier Pakistan listings
                </div>
              </div>
            </div>
          </div>

          <div className="container category-rail" data-reveal>
            {categories.slice(1).map((item, index) => (
              <a href="#products" key={item} onClick={() => setCategory(item)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item}
              </a>
            ))}
          </div>
        </section>

        <section className="section products-section" id="products">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <p className="kicker">Current range</p>
                <h2>Products customers come in looking for</h2>
              </div>
              <p className="section-note">
                Models are taken from Haier Pakistan. Exact PKR pricing will be added only after verification from Haier Mall.
              </p>
            </div>

            <div className="filter-row" data-reveal>
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? 'active' : ''}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id} data-reveal>
                  <div className="product-image">
                    <span className="catalog-chip">Pakistan model</span>
                    <img src={product.image} alt={`${product.title} ${product.model}`} loading="lazy" />
                  </div>
                  <div className="product-body">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.title}</h3>
                    <p className="model">{product.model}</p>
                    <div className="tag-row">
                      {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="product-bottom">
                      <div>
                        <small>Price</small>
                        <strong className="pending-price">
                          {product.price ? `PKR ${product.price.toLocaleString('en-PK')}` : 'Verify from Haier Mall'}
                        </strong>
                      </div>
                      <a href={product.source} target="_blank" rel="noreferrer" aria-label={`View ${product.model} on Haier Pakistan`}>
                        <Icon name="arrow" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section feature-story">
          <div className="container story-grid">
            <div className="story-media" data-reveal>
              <div className="story-product">
                <img src={products[0].image} alt={products[0].model} />
              </div>
              <div className="mini-panel panel-one">
                <span>Twin Inverter</span>
                <strong>Stable cooling</strong>
              </div>
              <div className="mini-panel panel-two">
                <span>IoT</span>
                <strong>Smart control</strong>
              </div>
            </div>

            <div className="story-copy" data-reveal>
              <p className="kicker">A better product section</p>
              <h2>Useful details first. Animation second.</h2>
              <p>
                The site uses subtle depth and movement to make products feel premium without turning
                the store into a heavy 3D demo. Shoppers can still scan the model, category and key
                features quickly.
              </p>
              <a href="#products" className="text-link">
                Explore the range <Icon name="arrow" size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="section showroom-section" id="showroom">
          <div className="container">
            <div className="section-heading showroom-heading" data-reveal>
              <div>
                <p className="kicker">AB Electronics in real life</p>
                <h2>Your shop photos belong here — not stock photography.</h2>
              </div>
              <p className="section-note">
                Replace these three placeholders with your actual front and interior photos. The layout is already prepared.
              </p>
            </div>

            <div className="showroom-grid" data-reveal>
              <figure className="showroom-photo large">
                <img src="/shop/shop-front.svg" alt="AB Electronics storefront placeholder" />
                <figcaption>Storefront / exterior</figcaption>
              </figure>
              <figure className="showroom-photo">
                <img src="/shop/shop-inside-1.svg" alt="AB Electronics interior placeholder" />
                <figcaption>Main appliance display</figcaption>
              </figure>
              <figure className="showroom-photo">
                <img src="/shop/shop-inside-2.svg" alt="AB Electronics showroom placeholder" />
                <figcaption>Customer view / second angle</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section why-section" id="why-us">
          <div className="container why-grid">
            <div className="why-intro" data-reveal>
              <p className="kicker">Why AB Electronics</p>
              <h2>A store website should make the next step obvious.</h2>
              <p>
                Browse the model, understand the key feature, confirm price and stock, then contact or visit the store.
              </p>
            </div>

            <div className="why-cards">
              {[
                ['01', 'Model guidance', 'Clear model numbers and useful feature highlights help customers compare before they visit.'],
                ['02', 'Current stock support', 'Use WhatsApp or phone as the fast path for stock, final price and availability.'],
                ['03', 'Real showroom presence', 'Your own shop imagery makes the website feel local, trustworthy and recognisable.'],
                ['04', 'Built for mobile', 'Cards, filters and contact actions stay simple on smaller screens.'],
              ].map(([no, title, text]) => (
                <article className="why-card" key={no} data-reveal>
                  <span>{no}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container contact-card" data-reveal>
            <div>
              <p className="kicker light">Store contact</p>
              <h2>Ask about a model before you visit.</h2>
              <p>
                Add the AB Electronics phone, WhatsApp, address and Google Maps link here once you send them.
              </p>
            </div>
            <div className="contact-actions">
              <a className="btn btn-white" href={whatsappHref}>
                <Icon name="phone" /> WhatsApp / Call
              </a>
              <a className="btn btn-outline-light" href="#showroom">
                <Icon name="pin" /> Store details
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="brand footer-brand">
            <span className="brand-mark">AB</span>
            <span>
              <strong>AB Electronics</strong>
              <small>Haier Home Appliances</small>
            </span>
          </div>
          <p>
            Independent retailer website concept. Haier product names and model references belong to their respective brand owner.
          </p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </div>
  )
}

export default App
