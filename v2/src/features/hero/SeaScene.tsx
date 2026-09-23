import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { members } from '../../content/members'

// Transparent canvas: the CSS sky + moon (HeroFallback) shows through above the
// horizon; this scene draws the moving sea, the moon's path on it, and drifting
// member-colour lights.

const waterVert = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vH;
varying float vSlope;
varying float vDist;
varying vec2 vPos;

// One travelling swell: dir = direction of travel in the plane, k = wavenumber.
float swell(vec2 p, vec2 dir, float k, float speed, float amp, out float slope) {
  float ph = dot(p, dir) * k + uTime * speed;
  slope = cos(ph) * k * amp * dir.y;
  return sin(ph) * amp;
}

void main() {
  vUv = uv;
  vec3 p = position;
  // Plane is rotated -90° about X, so local +y points away from the camera and the
  // swells (phase increasing with time) roll in toward the viewer.
  // Only long swells here — finer ripples are shaded per pixel (vertex-level ripples
  // alias into visible blocks close to the camera).
  float s1, s2, s3;
  float h = swell(p.xy, normalize(vec2(0.15, 1.0)), 0.32, 1.1, 0.28, s1)
          + swell(p.xy, normalize(vec2(-0.35, 1.0)), 0.55, 1.6, 0.14, s2)
          + swell(p.xy, normalize(vec2(0.8, 0.6)), 1.1, 2.1, 0.05, s3);
  vPos = p.xy;
  p.z += h;
  vH = h;
  vSlope = s1 + s2 + s3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`

const waterFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uMoon;
uniform vec3 uHorizon;
varying vec2 vUv;
varying float vH;
varying float vSlope;
varying float vDist;
varying vec2 vPos;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  // Per-pixel ripples on top of the swells, fading out with distance.
  float near = 1.0 - smoothstep(8.0, 40.0, vDist);
  float ripple = (cos(dot(vPos, vec2(0.5, 2.6)) + uTime * 3.2) * 0.5
                + cos(dot(vPos, vec2(-1.9, 1.7)) + uTime * 2.6) * 0.35) * 0.08 * near;
  float slope = vSlope + ripple;

  // Crests facing the moon catch light; troughs stay deep.
  vec3 col = mix(uDeep, uShallow, smoothstep(-0.25, 0.3, vH));
  col += uShallow * clamp(-slope * 1.6, 0.0, 0.6);

  // Moon path: a column toward the viewer, widening with distance…
  float across = abs(vUv.x - 0.5);
  float width = mix(0.01, 0.07, smoothstep(3.0, 60.0, vDist));
  float path = exp(-pow(across / width, 2.0));
  // …broken into soft round glints that sparkle as the waves pass under them.
  vec2 g = vec2(vPos.x * 7.0, vPos.y * 16.0 + uTime * 1.6);
  vec2 cell = floor(g);
  float on = step(0.82, hash(cell + floor(uTime * 5.0 + hash(cell) * 3.0)));
  float spark = on * smoothstep(0.42, 0.0, length(fract(g) - 0.5));
  float sheen = smoothstep(-0.2, 0.9, -slope);
  col += uMoon * path * (0.18 + sheen * 0.55 + spark * 1.1);

  col = mix(col, uHorizon, smoothstep(25.0, 70.0, vDist));
  gl_FragColor = vec4(col, 1.0);
}`

function Water() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#030a16') },
      uShallow: { value: new THREE.Color('#15416a') },
      uMoon: { value: new THREE.Color('#d6f1ff') },
      uHorizon: { value: new THREE.Color('#0f3a5c') },
    }),
    [],
  )
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.1)
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, -30]}>
      <planeGeometry args={[140, 80, 280, 200]} />
      <shaderMaterial vertexShader={waterVert} fragmentShader={waterFrag} uniforms={uniforms} />
    </mesh>
  )
}

const lightsVert = /* glsl */ `
uniform float uTime;
attribute float aPhase;
attribute vec3 aColor;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vec3 p = position;
  // Rise slowly and loop, with a little sideways drift.
  p.y = mod(p.y + uTime * (0.12 + aPhase * 0.1), 4.0) - 0.4;
  p.x += sin(uTime * 0.4 + aPhase * 12.0) * 0.25;
  float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aPhase * 2.0) + aPhase * 40.0);
  vAlpha = twinkle * smoothstep(-0.4, 0.4, p.y) * (1.0 - smoothstep(3.0, 3.6, p.y));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (14.0 + 10.0 * twinkle) * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`

const lightsFrag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, glow * glow * vAlpha);
}`

/** Member-colour lights that rise and twinkle, each on its own rhythm. */
function MemberLights() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const geometry = useMemo(() => {
    const n = 260
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const phase = new Float32Array(n)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36
      pos[i * 3 + 1] = Math.random() * 4
      pos[i * 3 + 2] = -3 - Math.random() * 28
      c.set(members[i % members.length]!.color)
      col.set([c.r, c.g, c.b], i * 3)
      phase[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.1)
  })
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={lightsVert}
        fragmentShader={lightsFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Floating on the bay: a slow bob, plus a little parallax toward the pointer. */
function BoatCamera() {
  const { camera } = useThree()
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const target = pointer.current
    camera.position.x += (target.x * 0.5 - camera.position.x) * 0.03
    camera.position.y = 0.4 + Math.sin(t * 0.7) * 0.06 - target.y * 0.08
    camera.rotation.set(0.06 + Math.sin(t * 0.5) * 0.006, -camera.position.x * 0.04, Math.sin(t * 0.4) * 0.008)
  })
  return null
}

export default function SeaScene({ onFail }: { onFail: () => void }) {
  // R3F force-loses the WebGL context when the canvas unmounts (e.g. scrolling the
  // hero out of view). Only a context loss while mounted is a real failure.
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Stop rendering entirely while the tab is in the background.
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={hidden ? 'never' : 'always'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 6], fov: 50, rotation: [0.06, 0, 0] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            if (mounted.current) onFail()
          })
        }}
      >
        <BoatCamera />
        <Water />
        <MemberLights />
      </Canvas>
    </div>
  )
}
