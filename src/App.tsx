
import SplatBackground from './SplatBackground'
import './App.css'

const products = [
  {
    number: '01',
    name: 'Signature Oud',
    description: 'A rich, warm fragrance inspired by traditional oud.',
    price: '£65',
  },
  {
    number: '02',
    name: 'Amber Essence',
    description: 'Warm amber notes with a refined, lasting finish.',
    price: '£45',
  },
  {
    number: '03',
    name: 'The Collection',
    description: 'Discover the Al Hira Oud collection.',
    price: 'Explore',
  },
]

export default function App() {
  return (
    <>
      <SplatBackground />

      <div className="site-content">
        <header className="site-header">
          <a className="brand" href="#home">AL HIRA OUD</a>
          <nav>
            <a href="#story">Our Story</a>
            <a href="#collection">Collection</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main>
          <section className="hero" id="home">
            <p className="eyebrow">THE ART OF FRAGRANCE</p>
            <h1>Discover the world of Oud.</h1>
            <p className="hero-copy">
              An invitation to explore fragrance, craftsmanship and tradition.
            </p>
            <a className="gold-button" href="#story">Enter the experience</a>
            <span className="scroll-note">SCROLL TO EXPLORE ↓</span>
          </section>

          <section className="content-section" id="story">
            <p className="eyebrow">OUR PHILOSOPHY</p>
            <h2>Tradition meets refinement.</h2>
            <p>
              Explore Al Hira Oud through an immersive journey into our
              world of fragrance and carefully selected pieces.
            </p>
          </section>

          <section className="content-section collection" id="collection">
            <p className="eyebrow">DISCOVER</p>
            <h2>Selected for you.</h2>

            <div className="product-list">
              {products.map((product) => (
                <article className="product" key={product.number}>
                  <span className="product-number">{product.number}</span>
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <span className="product-price">{product.price}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="closing" id="contact">
            <p className="eyebrow">AL HIRA OUD</p>
            <h2>A world worth discovering.</h2>
            <a className="gold-button" href="#home">Return to the entrance ↑</a>
          </section>
        </main>

        <footer>
          <span>AL HIRA OUD</span>
          <span>Fragrance. Heritage. Craft.</span>
        </footer>
      </div>
    </>
  )
}
