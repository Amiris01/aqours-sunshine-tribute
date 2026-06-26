import { useEffect, useRef, useState } from 'react'

/**
 * Hero-only WebGL surface: gentle water plane + sun bloom + drifting blue
 * feathers (Aqours' earned blue-feather motif). Falls back to CSS (parent
 * shows .hero-fallback) under prefers-reduced-motion or when WebGL is
 * unavailable. The animation loop pauses when the tab is hidden or when
 * `active` is false, so the parent can stop work without unmounting.
 */
export default function WaterBackground({ active = true }) {
  const hostRef = useRef(null)
  // Start "off" so the CSS sky fallback is shown until the WebGL canvas is
  // actually appended; only then flip to "on". Avoids a frame where the
  // fallback is suppressed before GL is confirmed (or while it's failing).
  const [ok, setOk] = useState(false)
  // Live mirror of `active` the rAF loop can read without re-subscribing.
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setOk(false)
      return
    }

    const host = hostRef.current
    if (!host) return

    // Cancellation + deferred teardown: `three` is loaded on demand (kept out
    // of the initial bundle), so the effect may be cleaned up before the async
    // import resolves. If cancelled early we skip setup; otherwise we run the
    // teardown captured during setup.
    let cancelled = false
    let teardown = null

    import('three').then((THREE) => {
      if (cancelled || !hostRef.current) return

      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      } catch (e) {
        setOk(false)
        return
      }

      const w = () => host.clientWidth
    const h = () => host.clientHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // DPR cap
    renderer.setSize(w(), h())
    host.appendChild(renderer.domElement)
    renderer.domElement.className = 'hero-gl'
    setOk(true) // canvas is live — hide the CSS fallback

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, w() / h(), 0.1, 200)
    // Sit low and look slightly up toward the horizon so the sea fills the
    // lower half of the frame and the sky + sun fill the upper half.
    camera.position.set(0, 2.2, 6)
    camera.lookAt(0, 3.2, -8)

    // --- Sky backdrop: a large plane with a vertical gradient texture, placed
    // far back so it covers the whole upper frame (the canvas is alpha:true, so
    // without this the page background would show through). -------------------
    const makeGradient = (stops, wpx = 4, hpx = 256) => {
      const c = document.createElement('canvas')
      c.width = wpx
      c.height = hpx
      const g = c.getContext('2d').createLinearGradient(0, 0, 0, hpx)
      stops.forEach(([o, col]) => g.addColorStop(o, col))
      const ctx = c.getContext('2d')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, wpx, hpx)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    }

    const skyTex = makeGradient([
      [0, '#6fc5f4'], // top
      [0.45, '#a4ddf9'],
      [0.78, '#d8f1fe'],
      [1, '#fff3df'], // warm haze at the horizon
    ])
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 120),
      new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false })
    )
    sky.position.set(0, 12, -60)
    scene.add(sky)

    // --- Sun disc: a glowing billboard high in the frame (soft radial glow
    // around a bright core). Purely visual; a matching light warms the water. -
    const sunTex = (() => {
      const s = 256
      const c = document.createElement('canvas')
      c.width = c.height = s
      const ctx = c.getContext('2d')
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
      g.addColorStop(0, 'rgba(255,247,214,1)')
      g.addColorStop(0.32, 'rgba(255,210,77,0.95)')
      g.addColorStop(0.55, 'rgba(255,183,51,0.5)')
      g.addColorStop(1, 'rgba(255,183,51,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    })()
    const sunSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false })
    )
    // Top-left corner, well clear of the right-aligned Aqours logo.
    sunSprite.scale.set(9, 9, 1)
    sunSprite.position.set(-15, 13, -40)
    scene.add(sunSprite)

    // Water: a wide plane with vertex ripple driven in the animation loop.
    const geo = new THREE.PlaneGeometry(80, 60, 80, 48)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4fb0e8,
      metalness: 0.45,
      roughness: 0.35,
      transparent: true,
      opacity: 0.96,
    })
    const water = new THREE.Mesh(geo, mat)
    water.rotation.x = -Math.PI / 2
    water.position.y = -1.4
    scene.add(water)

    // Sun light + ambient (warm mikan glow over cool sky fill).
    const sunLight = new THREE.PointLight(0xffd24d, 2.4, 120)
    sunLight.position.set(-15, 13, -10)
    scene.add(sunLight)
    scene.add(new THREE.AmbientLight(0xeaf8ff, 0.9))

    // Drifting translucent blue feathers (simple billboards).
    const feathers = []
    const fmat = new THREE.MeshBasicMaterial({
      color: 0x9fd6f2,
      transparent: true,
      opacity: 0.5,
    })
    for (let i = 0; i < 7; i++) {
      const fg = new THREE.PlaneGeometry(0.5, 1.1)
      const f = new THREE.Mesh(fg, fmat)
      f.position.set(
        (Math.random() - 0.5) * 16,
        1 + Math.random() * 7,
        -4 - Math.random() * 8
      )
      f.rotation.z = Math.random() * Math.PI
      f.userData.speed = 0.15 + Math.random() * 0.2
      scene.add(f)
      feathers.push(f)
    }

    const base = geo.attributes.position.array.slice()
    let raf
    let t = 0

    const onResize = () => {
      renderer.setSize(w(), h())
      camera.aspect = w() / h()
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      // Pause work when the tab is hidden or the parent marked us inactive.
      if (document.hidden || !activeRef.current) return
      t += 0.016
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        const y = base[i * 3 + 1]
        pos.setZ(i, Math.sin(x * 0.35 + t) * 0.45 + Math.cos(y * 0.4 + t * 0.8) * 0.35)
      }
      pos.needsUpdate = true
      feathers.forEach((f) => {
        f.position.y -= f.userData.speed * 0.016 * 4
        f.rotation.z += 0.003
        if (f.position.y < -1) f.position.y = 8
      })
      renderer.render(scene, camera)
    }
    tick()

      teardown = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', onResize)
        geo.dispose()
        mat.dispose()
        fmat.dispose()
        sky.geometry.dispose()
        sky.material.dispose()
        skyTex.dispose()
        sunSprite.material.dispose()
        sunTex.dispose()
        feathers.forEach((f) => f.geometry.dispose())
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
      // If the effect was already cleaned up while three was loading, tear down
      // immediately now that setup is complete.
      if (cancelled) teardown()
    })

    return () => {
      cancelled = true
      if (teardown) teardown()
    }
  }, [])

  return <div ref={hostRef} className="hero-gl-host" data-gl={ok ? 'on' : 'off'} />
}
