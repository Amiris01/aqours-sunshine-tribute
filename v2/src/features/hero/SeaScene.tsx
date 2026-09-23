import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { members } from '../../content/members'

// Transparent canvas: the CSS sky + moon (HeroFallback) shows through above
// the horizon; this scene only draws the moving sea and the member-colour lights.

const waterVert = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vH;
varying float vDist;
void main() {
  vUv = uv;
  vec3 p = position;
  float h = sin(p.x * 0.22 + uTime * 0.55) * 0.10
          + sin(p.y * 0.35 - uTime * 0.7) * 0.08
          + sin((p.x * 0.7 + p.y) * 0.9 + uTime * 1.2) * 0.035
          + sin((p.x - p.y * 1.3) * 2.1 + uTime * 1.9) * 0.012;
  p.z += h;
  vH = h;
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
varying float vDist;
void main() {
  vec3 col = mix(uDeep, uShallow, smoothstep(-0.12, 0.16, vH));
  // Moon path: a column toward the viewer that widens with distance, broken into glints.
  float across = abs(vUv.x - 0.5);
  float width = mix(0.012, 0.06, smoothstep(4.0, 60.0, vDist));
  float path = exp(-pow(across / width, 2.0));
  float glint = pow(max(0.0, sin(vUv.y * 900.0 + vH * 60.0 + uTime * 2.0)), 6.0);
  col += uMoon * path * (0.25 + glint * 0.9);
  // Fade into the sky colour at the horizon.
  col = mix(col, uHorizon, smoothstep(25.0, 70.0, vDist));
  gl_FragColor = vec4(col, 1.0);
}`

function Water() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#030a16') },
      uShallow: { value: new THREE.Color('#12385a') },
      uMoon: { value: new THREE.Color('#d6f1ff') },
      uHorizon: { value: new THREE.Color('#0f3a5c') },
    }),
    [],
  )
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.6, -30]}>
      <planeGeometry args={[140, 80, 280, 160]} />
      <shaderMaterial vertexShader={waterVert} fragmentShader={waterFrag} uniforms={uniforms} />
    </mesh>
  )
}

/** Drifting lights in the nine member colors, hovering above the water. */
function MemberLights() {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const n = 320
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 3.5 - 0.3
      positions[i * 3 + 2] = -2 - Math.random() * 30
      c.set(members[i % members.length]!.color)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, colors }
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.05
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.12
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
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
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
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
        <Water />
        <MemberLights />
      </Canvas>
    </div>
  )
}
