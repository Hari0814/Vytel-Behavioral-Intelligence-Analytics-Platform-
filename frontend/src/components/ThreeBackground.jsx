import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingSphere({ position, scale, speed, color }) {
  const mesh = useRef()
  const { mouse } = useThree()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    mesh.current.position.y = position[1] + Math.sin(t * speed) * 0.3
    mesh.current.position.x = position[0] + mouse.x * 0.15
    mesh.current.rotation.x = t * 0.1
    mesh.current.rotation.y = t * 0.15
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        wireframe={false}
      />
    </mesh>
  )
}

function FloatingTorus({ position, speed }) {
  const mesh = useRef()
  const { mouse } = useThree()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.x = t * 0.08
    mesh.current.rotation.y = t * 0.12
    mesh.current.position.y = position[1] + Math.sin(t * speed + 1) * 0.4
    mesh.current.position.x = position[0] + mouse.x * 0.08
  })

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry args={[1.5, 0.3, 16, 100]} />
      <meshStandardMaterial color="#6366F1" transparent opacity={0.07} wireframe />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, 5]} intensity={0.4} color="#6366F1" />

      <FloatingSphere position={[-4, 1, -3]} scale={2.5} speed={0.4} color="#6366F1" />
      <FloatingSphere position={[4, -1, -4]} scale={1.8} speed={0.6} color="#818CF8" />
      <FloatingTorus position={[2, 2, -5]} speed={0.35} />
    </>
  )
}

export default function ThreeBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
