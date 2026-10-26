
import { useEffect, useRef } from 'react'
import {
  Application,
  Asset,
  Entity,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  Vec3,
} from 'playcanvas'

const START_POSITION = [-1.602, 0.209, 0.443]
const START_ROTATION = [5.75, -79.25, 0]

// Replace the repeated positions with recorded camera waypoints
// as you explore the shop.
const CAMERA_PATH = [
  { at: 0, position: START_POSITION, rotation: START_ROTATION },
  { at: 0.25, position: START_POSITION, rotation: START_ROTATION },
  { at: 0.5, position: START_POSITION, rotation: START_ROTATION },
  { at: 0.75, position: START_POSITION, rotation: START_ROTATION },
  { at: 1, position: START_POSITION, rotation: START_ROTATION },
]

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

function interpolate(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getCameraPose(progress: number) {
  let index = CAMERA_PATH.findIndex((point) => point.at >= progress)

  if (index <= 0) index = 1

  const previous = CAMERA_PATH[index - 1]
  const next = CAMERA_PATH[index]
  const range = next.at - previous.at
  const t = smoothstep(
    range === 0 ? 0 : (progress - previous.at) / range,
  )

  return {
    position: previous.position.map((value, i) =>
      interpolate(value, next.position[i], t),
    ),
    rotation: previous.rotation.map((value, i) =>
      interpolate(value, next.rotation[i], t),
    ),
  }
}

export default function SplatBackground() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.touchAction = 'pan-y'
    host.appendChild(canvas)

    const app = new Application(canvas, {
      graphicsDeviceOptions: { antialias: false },
    })

    app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
    app.setCanvasResolution(RESOLUTION_AUTO)

    const camera = new Entity('Camera')
    camera.addComponent('camera', {
      clearColor: [0.025, 0.02, 0.018, 1],
    })
    app.root.addChild(camera)

    const splatAsset = new Asset('shop1', 'gsplat', {
      url: `${import.meta.env.BASE_URL}shop1.sog`,
    })

    app.assets.add(splatAsset)

    splatAsset.ready(() => {
      const splat = new Entity('Shop')
      splat.setEulerAngles(-90, 0, 0)
      splat.addComponent('gsplat', { asset: splatAsset })
      app.root.addChild(splat)
    })

    app.assets.load(splatAsset)
    app.start()

    let progress = 0
    let lastManualInput = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let pitchOffset = 0
    let yawOffset = 0

    const manualPosition = new Vec3()
    const keys = new Set<string>()
    const sensitivity = 0.15
    const speed = 1.2

    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight

      progress = scrollable > 0 ? window.scrollY / scrollable : 0
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ['w', 'a', 's', 'd', 'q', 'e'].includes(event.key.toLowerCase())
      ) {
        keys.add(event.key.toLowerCase())
        lastManualInput = performance.now()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase())
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return

      yawOffset -= (event.clientX - lastX) * sensitivity
      pitchOffset -= (event.clientY - lastY) * sensitivity
      pitchOffset = Math.max(-80, Math.min(80, pitchOffset))

      lastX = event.clientX
      lastY = event.clientY
      lastManualInput = performance.now()
    }

    const onPointerUp = () => {
      dragging = false
    }

    const onScroll = () => updateProgress()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    updateProgress()

    app.on('update', (dt: number) => {
      const pose = getCameraPose(progress)
      const moving = keys.size > 0

      if (moving) {
        const forward = camera.forward
        const right = camera.right

        if (keys.has('w')) {
          manualPosition.x += forward.x * speed * dt
          manualPosition.y += forward.y * speed * dt
          manualPosition.z += forward.z * speed * dt
        }
        if (keys.has('s')) {
          manualPosition.x -= forward.x * speed * dt
          manualPosition.y -= forward.y * speed * dt
          manualPosition.z -= forward.z * speed * dt
        }
        if (keys.has('d')) {
          manualPosition.x += right.x * speed * dt
          manualPosition.y += right.y * speed * dt
          manualPosition.z += right.z * speed * dt
        }
        if (keys.has('a')) {
          manualPosition.x -= right.x * speed * dt
          manualPosition.y -= right.y * speed * dt
          manualPosition.z -= right.z * speed * dt
        }
        if (keys.has('e')) manualPosition.y += speed * dt
        if (keys.has('q')) manualPosition.y -= speed * dt

        lastManualInput = performance.now()
      }

      // Ease manual exploration back to the scroll-guided camera.
      if (!dragging && performance.now() - lastManualInput > 800) {
        const ease = 1 - Math.exp(-2.5 * dt)
        manualPosition.lerp(manualPosition, new Vec3(), ease)
        pitchOffset = interpolate(pitchOffset, 0, ease)
        yawOffset = interpolate(yawOffset, 0, ease)
      }

      camera.setPosition(
        pose.position[0] + manualPosition.x,
        pose.position[1] + manualPosition.y,
        pose.position[2] + manualPosition.z,
      )

      camera.setEulerAngles(
        pose.rotation[0] + pitchOffset,
        pose.rotation[1] + yawOffset,
        pose.rotation[2],
      )
    })

    const onResize = () => app.resizeCanvas()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      app.destroy()
      canvas.remove()
    }
  }, [])

  return <div ref={hostRef} className="splat-background" />
}
