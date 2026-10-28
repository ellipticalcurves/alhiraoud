
// import { useEffect, useRef, useState } from 'react'
// import {
//   Application,
//   Asset,
//   Entity,
//   FILLMODE_FILL_WINDOW,
//   RESOLUTION_AUTO,
//   Vec3,
// } from 'playcanvas'

// const START_POSITION = [-1.602, 0.209, 0.443]
// const START_ROTATION = [5.75, -79.25, 0]

// const CAMERA_PATH = [
//   { at: 0, position: START_POSITION, rotation: START_ROTATION },
//   { at: 0.25, position: START_POSITION, rotation: START_ROTATION },
//   { at: 0.5, position: START_POSITION, rotation: START_ROTATION },
//   { at: 0.75, position: START_POSITION, rotation: START_ROTATION },
//   { at: 1, position: START_POSITION, rotation: START_ROTATION },
// ]

// type CameraPose = {
//   position: number[]
//   rotation: number[]
// }

// function getPose(progress: number): CameraPose {
//   let index = CAMERA_PATH.findIndex((p) => p.at >= progress)
//   if (index <= 0) index = 1

//   const a = CAMERA_PATH[index - 1]
//   const b = CAMERA_PATH[index]
//   const range = b.at - a.at
//   const t = range === 0 ? 0 : Math.max(0, Math.min(1, (progress - a.at) / range))
//   const smooth = t * t * (3 - 2 * t)

//   return {
//     position: a.position.map((v, i) => v + (b.position[i] - v) * smooth),
//     rotation: a.rotation.map((v, i) => v + (b.rotation[i] - v) * smooth),
//   }
// }

// export default function SplatBackground() {
//   const hostRef = useRef<HTMLDivElement>(null)
//   const [positionMode, setPositionMode] = useState(true)
//   const [speed, setSpeed] = useState(1.2)
//   const [sensitivity, setSensitivity] = useState(0.15)
//   const [coords, setCoords] = useState({
//     position: START_POSITION,
//     rotation: START_ROTATION,
//   })

//   const modeRef = useRef(true)
//   const speedRef = useRef(1.2)
//   const sensitivityRef = useRef(0.15)

//   useEffect(() => {
//     modeRef.current = positionMode
//   }, [positionMode])

//   useEffect(() => {
//     speedRef.current = speed
//   }, [speed])

//   useEffect(() => {
//     sensitivityRef.current = sensitivity
//   }, [sensitivity])

//   useEffect(() => {
//     const host = hostRef.current
//     if (!host) return

//     const canvas = document.createElement('canvas')
//     canvas.style.width = '100%'
//     canvas.style.height = '100%'
//     canvas.style.display = 'block'
//     canvas.style.touchAction = 'pan-y'
//     host.appendChild(canvas)

//     const app = new Application(canvas, {
//       graphicsDeviceOptions: { antialias: false },
//     })

//     app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
//     app.setCanvasResolution(RESOLUTION_AUTO)

//     const camera = new Entity('Camera')
//     camera.addComponent('camera', {
//       clearColor: [0.025, 0.02, 0.018, 1],
//     })
//     camera.setPosition(...START_POSITION as [number, number, number])
//     camera.setEulerAngles(...START_ROTATION as [number, number, number])
//     app.root.addChild(camera)

//     const asset = new Asset('shop1', 'gsplat', {
//       url: `${import.meta.env.BASE_URL}shop1.sog`,
//     })

//     app.assets.add(asset)

//     asset.ready(() => {
//       const shop = new Entity('Shop')
//       shop.setEulerAngles(-90, 0, 0)
//       shop.addComponent('gsplat', { asset })
//       app.root.addChild(shop)
//     })

//     app.assets.load(asset)
//     app.start()

//     const keys = new Set<string>()
//     let dragging = false
//     let lastX = 0
//     let lastY = 0
//     let scrollProgress = 0
//     let lastCoordsUpdate = 0

//     const updateScroll = () => {
//       const maxScroll =
//         document.documentElement.scrollHeight - window.innerHeight

//       scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
//     }

//     const onKeyDown = (e: KeyboardEvent) => {
//       if (
//         ['w', 'a', 's', 'd', 'q', 'e'].includes(e.key.toLowerCase()) &&
//         modeRef.current
//       ) {
//         keys.add(e.key.toLowerCase())
//         e.preventDefault()
//       }
//     }

//     const onKeyUp = (e: KeyboardEvent) => {
//       keys.delete(e.key.toLowerCase())
//     }

//     const onPointerDown = (e: PointerEvent) => {
//       if (e.pointerType === 'touch' || !modeRef.current) return
//       dragging = true
//       lastX = e.clientX
//       lastY = e.clientY
//       canvas.setPointerCapture(e.pointerId)
//     }

//     const onPointerMove = (e: PointerEvent) => {
//       if (!dragging || !modeRef.current) return

//       const rotation = camera.getEulerAngles()
//       const yaw =
//         rotation.y - (e.clientX - lastX) * sensitivityRef.current
//       const pitch =
//         rotation.x - (e.clientY - lastY) * sensitivityRef.current

//       camera.setEulerAngles(
//         Math.max(-89, Math.min(89, pitch)),
//         yaw,
//         rotation.z,
//       )

//       lastX = e.clientX
//       lastY = e.clientY
//     }

//     const onPointerUp = () => {
//       dragging = false
//     }

//     const onScroll = () => updateScroll()

//     window.addEventListener('scroll', onScroll, { passive: true })
//     window.addEventListener('keydown', onKeyDown)
//     window.addEventListener('keyup', onKeyUp)
//     canvas.addEventListener('pointerdown', onPointerDown)
//     canvas.addEventListener('pointermove', onPointerMove)
//     canvas.addEventListener('pointerup', onPointerUp)
//     canvas.addEventListener('pointercancel', onPointerUp)

//     updateScroll()

//     app.on('update', (dt: number) => {
//       if (!modeRef.current) {
//         const pose = getPose(scrollProgress)
//         camera.setPosition(...pose.position as [number, number, number])
//         camera.setEulerAngles(...pose.rotation as [number, number, number])
//         return
//       }

//       if (keys.size > 0) {
//         const position = camera.getPosition().clone()
//         const forward = camera.forward.clone()
//         const right = camera.right.clone()
//         const amount = speedRef.current * dt

//         if (keys.has('w')) position.add(forward.clone().mulScalar(amount))
//         if (keys.has('s')) position.sub(forward.clone().mulScalar(amount))
//         if (keys.has('d')) position.add(right.clone().mulScalar(amount))
//         if (keys.has('a')) position.sub(right.clone().mulScalar(amount))
//         if (keys.has('e')) position.y += amount
//         if (keys.has('q')) position.y -= amount

//         camera.setPosition(position)
//       }

//       if (performance.now() - lastCoordsUpdate > 100) {
//         const p = camera.getPosition()
//         const r = camera.getEulerAngles()

//         setCoords({
//           position: [p.x, p.y, p.z].map((v) => Number(v.toFixed(3))),
//           rotation: [r.x, r.y, r.z].map((v) => Number(v.toFixed(2))),
//         })

//         lastCoordsUpdate = performance.now()
//       }
//     })

//     const onResize = () => app.resizeCanvas()
//     window.addEventListener('resize', onResize)

//     return () => {
//       window.removeEventListener('scroll', onScroll)
//       window.removeEventListener('keydown', onKeyDown)
//       window.removeEventListener('keyup', onKeyUp)
//       window.removeEventListener('resize', onResize)
//       canvas.removeEventListener('pointerdown', onPointerDown)
//       canvas.removeEventListener('pointermove', onPointerMove)
//       canvas.removeEventListener('pointerup', onPointerUp)
//       canvas.removeEventListener('pointercancel', onPointerUp)
//       app.destroy()
//       canvas.remove()
//     }
//   }, [])

//   const positionCode = `position: [${coords.position.join(', ')}],`
//   const rotationCode = `rotation: [${coords.rotation.join(', ')}],`

//   const copyCoordinates = () => {
//     void navigator.clipboard.writeText(
//       `{\n  at: 0,\n  ${positionCode}\n  ${rotationCode}\n},`,
//     )
//   }

//   return (
//     <>
//       <div ref={hostRef} className="splat-background" />

//       <aside className="camera-panel">
//         <h3>Camera Controls</h3>

//         <button
//           onClick={() => setPositionMode((current) => !current)}
//           className={positionMode ? 'mode-active' : ''}
//         >
//           {positionMode ? 'Position Mode: ON' : 'Guided Scroll Mode: ON'}
//         </button>

//         <p className="camera-help">
//           {positionMode
//             ? 'WASD = move · Q/E = down/up · Drag mouse = look'
//             : 'Scroll the page to follow the camera path'}
//         </p>

//         <label>
//           Movement speed: {speed.toFixed(1)}
//           <input
//             type="range"
//             min="0.1"
//             max="5"
//             step="0.1"
//             value={speed}
//             onChange={(e) => setSpeed(Number(e.target.value))}
//           />
//         </label>

//         <label>
//           Mouse sensitivity: {sensitivity.toFixed(2)}
//           <input
//             type="range"
//             min="0.02"
//             max="0.5"
//             step="0.01"
//             value={sensitivity}
//             onChange={(e) => setSensitivity(Number(e.target.value))}
//           />
//         </label>

//         <p className="coordinate-label">POSITION</p>
//         <code>[{coords.position.join(', ')}]</code>

//         <p className="coordinate-label">ROTATION (pitch, yaw, roll)</p>
//         <code>[{coords.rotation.join(', ')}]</code>

//         <button onClick={copyCoordinates}>Copy camera waypoint</button>
//       </aside>
//     </>
//   )
// }

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
