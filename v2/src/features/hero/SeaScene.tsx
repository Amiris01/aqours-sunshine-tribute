import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { members } from '../../content/members'

const waterVert = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vH;
void main() {
  vUv = uv;
  vec3 p = position;
  float h = sin(p.x * 0.35 + uTime * 0.6) * 0.25
          + sin(p.y * 0.5 + uTime * 0.8) * 0.18
          + sin((p.x + p.y) * 0.9 + uTime * 1.3) * 0.06;
  p.z += h;
  vH = h;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const waterFrag = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uMoon;
varying vec2 vUv;
varying float vH;
void main() {
  vec3 col = mix(uDeep, uShallow, smoothstep(-0.3, 0.4, vH));
  float path = exp(-pow((vUv.x - 0.5) * 7.0, 2.0)) * smoothstep(0.2, 1.0, vUv.y);
  col += uMoon * path * (0.35 + vH * 1.4);
  gl_FragColor = vec4(col, 1.0);
}`

function Water() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color('#041022') },
      uShallow: { value: new THREE.Color('#0f3a5c') },
      uMoon: { value: new THREE.Color('#bfe9ff') },
    }),
    [],
  )
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })
  return (
    <mesh rotation-x={-Math.PI / 2.2} position={[0, -1.2, 0]}>
      <planeGeometry args={[40, 24, 160, 96]} />
      <shaderMaterial vertexShader={waterVert} fragmentShader={waterFrag} uniforms={uniforms} />
    </mesh>
  )
}

/** Drifting lights in the nine member colors. */
function MemberLights() {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const n = 360
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24
      positions[i * 3 + 1] = Math.random() * 6 - 0.5
      positions[i * 3 + 2] = -Math.random() * 14
      c.set(members[i % members.length]!.color)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    return { positions, colors }
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.015
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.15
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

export default function SeaScene({ onFail }: { onFail: () => void }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.2, 6], fov: 55 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#06101f')
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            onFail()
          })
        }}
      >
        <fog attach="fog" args={['#06101f', 6, 22]} />
        <mesh position={[0, 3.2, -14]}>
          <circleGeometry args={[1.1, 48]} />
          <meshBasicMaterial color="#e6f6ff" fog={false} />
        </mesh>
        <Water />
        <MemberLights />
      </Canvas>
    </div>
  )
}
