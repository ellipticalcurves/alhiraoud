import SplatBackground from './SplatBackground'
import './App.css'

export default function App() {
  return (
    <>
      <SplatBackground />

      {/* Target Reticle visually framing the center 3D scene */}
      <div className="viewfinder-target" aria-hidden="true" />

      <div className="site-content">
        {/* HEADER */}
        <header className="site-header">
          <a className="brand" href="#storefront">
            <span className="brand-mark">AH</span>
            <span className="brand-title">AL HIRA OUD</span>
          </a>

          <nav className="nav-links">
            <a href="#storefront">01 Store Entrance</a>
            <a href="#perfume-wall">02 Perfume Shelf</a>
            <a href="#showcase">03 Jewelry Counter</a>
            <a href="#apparel">04 Apparel Rack</a>
          </nav>

          <a href="tel:07412518845" className="tel-link">
            07412 518 845
          </a>
        </header>

        <main>
          {/* TOUR NODE 1: STORE FRONT ENTRANCE */}
          <section className="tour-section align-left" id="storefront">
            <div className="annotation-card">
              <div className="annotation-pointer" />
              <span className="node-tag">Focal Point 01 / Store Entrance</span>
              <h1>Al Hira Oud</h1>
              <p>
                Welcome to our boutique. Explore our complete 3D scan scan of traditional oriental perfumery and modest fashion. Scroll to proceed through the spatial tour.
              </p>

              <div className="spec-list">
                <div className="spec-item">
                  <span className="spec-label">Location</span>
                  <span className="spec-val">Main Street Store</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Specialism</span>
                  <span className="spec-val">Oud & Modest Wear</span>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <a className="annotation-action" href="#perfume-wall">
                  Inspect Perfume Shelf ↗
                </a>
              </div>
            </div>
          </section>

          {/* TOUR NODE 2: GOLDEN PERFUME BOTTLE WALL */}
          <section className="tour-section align-right" id="perfume-wall">
            <div className="annotation-card">
              <div className="annotation-pointer" />
              <span className="node-tag">Focal Point 02 / Main Shelf</span>
              <h2>Golden Bottle Wall</h2>
              <p>
                Our signature wall houses pure aged Cambodian and Indian oud oils, concentrated attars, and luxury oriental spray scents in handcrafted glass-and-gold bottles.
              </p>

              <div className="spec-list">
                <div className="spec-item">
                  <span className="spec-label">Featured Oils</span>
                  <span className="spec-val">Pure Cambodian Oud</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Fragrance Type</span>
                  <span className="spec-val">Attar & Concentrates</span>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <a className="annotation-action" href="#showcase">
                  View Gemstone Counter ↗
                </a>
              </div>
            </div>
          </section>

          {/* TOUR NODE 3: JEWELRY & MISBAHA COUNTER */}
          <section className="tour-section align-left" id="showcase">
            <div className="annotation-card">
              <div className="annotation-pointer" />
              <span className="node-tag">Focal Point 03 / Display Counter</span>
              <h2>Rings & Misbaha</h2>
              <p>
                Carefully selected silver gemstone rings (Aqeeq, Durr, Turquoise) alongside traditional prayer beads crafted from natural woods and minerals.
              </p>

              <div className="spec-list">
                <div className="spec-item">
                  <span className="spec-label">Rings</span>
                  <span className="spec-val">Silver Gemstones</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Beads</span>
                  <span className="spec-val">Natural Wood Misbaha</span>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <a className="annotation-action" href="#apparel">
                  View Garment Collection ↗
                </a>
              </div>
            </div>
          </section>

          {/* TOUR NODE 4: APPAREL RACK (ABAYA, JUBAH, HIJAB) */}
          <section className="tour-section align-right" id="apparel">
            <div className="annotation-card">
              <div className="annotation-pointer" />
              <span className="node-tag">Focal Point 04 / Garment Section</span>
              <h2>Abaya & Jubah</h2>
              <p>
                A broad collection of tailored modest garments, featuring high-grade fabrics, custom embroidery, and lightweight everyday wear.
              </p>

              <div className="spec-list">
                <div className="spec-item">
                  <span className="spec-label">Menswear</span>
                  <span className="spec-val">Traditional Jubah</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Womenswear</span>
                  <span className="spec-val">Abaya & Hijab</span>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <a className="annotation-action" href="tel:07412518845">
                  Inquire In-Store Availability ↗
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="site-footer">
          <div>AL HIRA OUD — SPATIAL TOUR</div>
          <div>TEL: 07412 518 845</div>
        </footer>
      </div>
    </>
  )
}