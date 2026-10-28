
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Application,
  Asset,
  Color,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
} from 'playcanvas'

type Pose = {
  at: number
  position: [number, number, number]
  rotation: [number, number, number]
}

const DEBUG_CAMERA = import.meta.env.DEV

// Desktop camera path
const DESKTOP_PATH: Pose[] = [
  { at: 0, position: [-1.602, 0.209, 0.443], rotation: [5.75, -79.25, 0] },
  {
  at: 0.125,
  position: [-0.665, 0.333, 0.253],
  rotation: [-7.45, -75.65, 0]},
  { at: 0.25, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 0.5, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 0.75, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 1, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
]

// Temporary mobile path: adjust these positions after testing on your phone.
const MOBILE_PATH: Pose[] = [
  { at: 0, position: [-1.602, 0.209, 0.443], rotation: [5.75, -79.25, 0] },
  { at: 0.25, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 0.5, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 0.75, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
  { at: 1, position: [-0.174, 0.312, 0.307], rotation: [-2.8, -0.56, -2] },
]

function smooth(t: number) {
  // Smoothstep easing
  return t * t * (3 - 2 * t)
}

function getPose(path: Pose[], progress: number): Pose {
  const p = Math.max(0, Math.min(1, progress))
  const nextIndex = path.findIndex((pose) => pose.at >= p)

  if (nextIndex === -1) return path[path.length - 1]
  if (nextIndex === 0) return path[0]

  const previous = path[nextIndex - 1]
  const next = path[nextIndex]
  const range = next.at - previous.at
  const rawT = range === 0 ? 1 : (p - previous.at) / range
  const t = smooth(rawT)

  const interpolate = (a: number, b: number) => a + (b - a) * t

  return {
    at: p,
    position: [
      interpolate(previous.position[0], next.position[0]),
      interpolate(previous.position[1], next.position[1]),
      interpolate(previous.position[2], next.position[2]),
    ],
    rotation: [
      interpolate(previous.rotation[0], next.rotation[0]),
      interpolate(previous.rotation[1], next.rotation[1]),
      interpolate(previous.rotation[2], next.rotation[2]),
    ],
  }
}

export default function SplatBackground() {
  const hostRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<Entity | null>(null)
  const modeRef = useRef(false)
  const speedRef = useRef(1.2)
  const sensitivityRef = useRef(0.15)

  const [positionMode, setPositionMode] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [speed, setSpeed] = useState(1.2)
  const [sensitivity, setSensitivity] = useState(0.15)
  const [rotationStep, setRotationStep] = useState(3)
  const [coords, setCoords] = useState<Pose>(DESKTOP_PATH[0])
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateScreenSize = () => setIsMobile(window.innerWidth < 768)
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  useEffect(() => {
    modeRef.current = positionMode
  }, [positionMode])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    sensitivityRef.current = sensitivity
  }, [sensitivity])

  const rotateCamera = useCallback(
    (yawChange: number, pitchChange: number, rollChange = 0) => {
      const camera = cameraRef.current
      if (!camera || !modeRef.current) return

      const r = camera.getEulerAngles()
      camera.setEulerAngles(
        Math.max(-89, Math.min(89, r.x + pitchChange)),
        r.y + yawChange,
        r.z + rollChange,
      )
    },
    [],
  )

  const copyCoordinates = useCallback(() => {
    const format = (values: number[]) =>
      `[${values.map((v) => Number(v.toFixed(3))).join(', ')}]`

    const text = `{
  at: 0,
  position: ${format(coords.position)},
  rotation: ${format(coords.rotation)},
},`

    void navigator.clipboard.writeText(text).catch(() => {
      setError('Clipboard unavailable. Copy the coordinates manually.')
    })
  }, [coords])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let app: Application | null = null
    let disposed = false
    let dragging = false
    let lastX = 0
    let lastY = 0
    const keys = new Set<string>()

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.touchAction = 'pan-y'
    host.appendChild(canvas)

    try {
      app = new Application(canvas)
      app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
      app.setCanvasResolution(RESOLUTION_AUTO)

      const initialPath = window.innerWidth < 768 ? MOBILE_PATH : DESKTOP_PATH
      const camera = new Entity('Camera')
      camera.addComponent('camera', {
        clearColor: new Color(0, 0, 0, 0),
        fov: window.innerWidth < 768 ? 60 : 45,
      })
      camera.setPosition(...initialPath[0].position)
      camera.setEulerAngles(...initialPath[0].rotation)
      app.root.addChild(camera)
      cameraRef.current = camera

      const asset = new Asset('shop1', 'gsplat', {
        url: `${import.meta.env.BASE_URL}shop1.sog`,
      })

      app.assets.add(asset)

      asset.ready((loadedAsset) => {
        if (disposed || !app) return
        const shop = new Entity('Shop')
        shop.addComponent('gsplat', { asset: loadedAsset })
        shop.setEulerAngles(-90, 0, 0)
        app.root.addChild(shop)
      })

      asset.on('error', () => {
        if (!disposed) {
          setError('Could not load shop1.sog. Check that it is in the public folder.')
        }
      })

      app.assets.load(asset)

      app.on('update', (dt: number) => {
        if (disposed) return

        if (!modeRef.current) {
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight
          const progress =
            maxScroll > 0 ? window.scrollY / maxScroll : 0

          const path = window.innerWidth < 768 ? MOBILE_PATH : DESKTOP_PATH
          const pose = getPose(path, progress)

          camera.setPosition(...pose.position)
          camera.setEulerAngles(...pose.rotation)
          return
        }

        const move = speedRef.current * dt
        if (keys.has('w') || keys.has('arrowup')) camera.translateLocal(0, 0, -move)
        if (keys.has('s') || keys.has('arrowdown')) camera.translateLocal(0, 0, move)
        if (keys.has('a') || keys.has('arrowleft')) camera.translateLocal(-move, 0, 0)
        if (keys.has('d') || keys.has('arrowright')) camera.translateLocal(move, 0, 0)
        if (keys.has('e')) camera.translate(0, move, 0)
        if (keys.has('q')) camera.translate(0, -move, 0)
      })

      app.start()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not initialise the 3D scene.')
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      ) return

      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keys.add(key)
        if (modeRef.current) event.preventDefault()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase())

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !modeRef.current) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || !modeRef.current) return

      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY

      const camera = cameraRef.current
      if (!camera) return

      const r = camera.getEulerAngles()
      camera.setEulerAngles(
        Math.max(-89, Math.min(89, r.x - dy * sensitivityRef.current)),
        r.y - dx * sensitivityRef.current,
        r.z,
      )
    }

    const stopDragging = () => {
      dragging = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDragging)
    canvas.addEventListener('pointerdown', onPointerDown)

    const updateCoords = window.setInterval(() => {
      const camera = cameraRef.current
      if (!camera || !modeRef.current) return

      const p = camera.getPosition()
      const r = camera.getEulerAngles()
      setCoords({
        at: 0,
        position: [p.x, p.y, p.z],
        rotation: [r.x, r.y, r.z],
      })
    }, 150)

    return () => {
      disposed = true
      window.clearInterval(updateCoords)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopDragging)
      canvas.removeEventListener('pointerdown', onPointerDown)
      cameraRef.current = null
      keys.clear()
      app?.destroy()
      app = null
      canvas.remove()
    }
  }, [])

  const buttonStyle: React.CSSProperties = {
    padding: '7px 5px',
    cursor: 'pointer',
    fontSize: 11,
  }

  return (
    <>
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      />

      {DEBUG_CAMERA && (
        <aside
          className="camera-panel"
          style={{
            position: 'fixed',
            zIndex: 1000,
            top: 12,
            right: 12,
            width: controlsOpen ? 260 : 'auto',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 'calc(100vh - 24px)',
            overflowY: 'auto',
            padding: 10,
            borderRadius: 10,
            background: 'rgba(15, 15, 15, 0.94)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            fontSize: 12,
            fontFamily: 'sans-serif',
          }}
        >
          <button
            type="button"
            style={{ ...buttonStyle, width: '100%' }}
            onClick={() => setControlsOpen((open) => !open)}
          >
            {controlsOpen ? 'Hide camera controls −' : 'Camera debug ⚙'}
          </button>

          {controlsOpen && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                style={{ ...buttonStyle, width: '100%', marginBottom: 12 }}
                onClick={() => setPositionMode((current) => !current)}
              >
                {positionMode ? 'Mode: Position / Explore' : 'Mode: Scroll walkthrough'}
              </button>

              <label>
                Movement speed: {speed.toFixed(1)}
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  style={{ display: 'block', width: '100%', margin: '5px 0 12px' }}
                />
              </label>

              <label>
                Mouse sensitivity: {sensitivity.toFixed(2)}
                <input
                  type="range"
                  min="0.02"
                  max="0.8"
                  step="0.01"
                  value={sensitivity}
                  onChange={(event) => setSensitivity(Number(event.target.value))}
                  style={{ display: 'block', width: '100%', margin: '5px 0 12px' }}
                />
              </label>

              <label>
                Tilt/turn step: {rotationStep}°
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={rotationStep}
                  onChange={(event) => setRotationStep(Number(event.target.value))}
                  style={{ display: 'block', width: '100%', margin: '5px 0 10px' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button style={buttonStyle} onClick={() => rotateCamera(-rotationStep, 0)}>Turn left</button>
                <button style={buttonStyle} onClick={() => rotateCamera(rotationStep, 0)}>Turn right</button>
                <button style={buttonStyle} onClick={() => rotateCamera(0, rotationStep)}>Look up</button>
                <button style={buttonStyle} onClick={() => rotateCamera(0, -rotationStep)}>Look down</button>
                <button style={buttonStyle} onClick={() => rotateCamera(0, 0, -rotationStep)}>Tilt left ↶</button>
                <button style={buttonStyle} onClick={() => rotateCamera(0, 0, rotationStep)}>Tilt right ↷</button>
              </div>

              <div style={{ lineHeight: 1.7, overflowWrap: 'anywhere', marginTop: 12 }}>
                <strong>Position</strong>
                <br />
                {coords.position.map((v) => v.toFixed(3)).join(', ')}
                <br />
                <strong>Rotation (pitch, yaw, roll)</strong>
                <br />
                {coords.rotation.map((v) => v.toFixed(2)).join(', ')}
              </div>

              <button
                type="button"
                style={{ ...buttonStyle, width: '100%', marginTop: 10 }}
                onClick={copyCoordinates}
              >
                Copy coordinates
              </button>

              <p style={{ lineHeight: 1.5, opacity: 0.8 }}>
                WASD moves the camera, Q/E lowers or raises it, and mouse drag changes the view.
              </p>

              {error && <p style={{ color: '#ffb4a8' }}>{error}</p>}
              <p style={{ opacity: 0.65 }}>Screen: {isMobile ? 'Mobile' : 'Desktop'}</p>
            </div>
          )}
        </aside>
      )}
    </>
  )
}
