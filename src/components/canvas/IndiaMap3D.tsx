import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Globe() {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  
  // Floating data points logic
  const points = useMemo(() => {
    const pts = []
    for(let i = 0; i < 20; i++) {
      const phi = Math.acos(-1 + (2 * i) / 20)
      const theta = Math.sqrt(20 * Math.PI) * phi
      const vec = new THREE.Vector3().setFromSphericalCoords(2.1, phi, theta)
      pts.push(vec)
    }
    return pts
  }, [])

  // Particle System logic
  const particlesGeometry = useMemo(() => {
    const particlesCount = 500
    const posArray = new Float32Array(particlesCount * 3)
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10
    }
    return new THREE.BufferAttribute(posArray, 3)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.001
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <mesh>
          <icosahedronGeometry args={[2, 2]} />
          <meshPhongMaterial
            color={0x1A237E}
            wireframe={true}
            transparent={true}
            opacity={0.3}
            emissive={0x2979FF}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {points.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={0xFF9800} />
          </mesh>
        ))}
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlesGeometry.array, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.005}
          color={0x2979FF}
          transparent={true}
          opacity={0.5}
        />
      </points>
    </>
  )
}

export default function IndiaMap3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} color={0xffffff} />
      <pointLight position={[5, 5, 5]} color={0x2979FF} intensity={1} />
      <Globe />
    </Canvas>
  )
}
