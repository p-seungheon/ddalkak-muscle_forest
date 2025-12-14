"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import type * as THREE from "three"

function ShibaDog({ level = 1 }: { level: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const muscleScale = 1 + (level - 1) * 0.15
  const bodyWidth = 1.2 * muscleScale
  const bodyDepth = 0.8 * muscleScale
  const legThickness = 0.15 * muscleScale

  useFrame((state) => {
    if (groupRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02
      groupRef.current.position.y = breathe
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const bodyColor = "#F4D8A8"
  const whiteColor = "#FFFFFF"
  const darkColor = "#2D2D2D"
  const noseColor = "#1A1A1A"
  const tongueColor = "#FF6B9D"

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[bodyWidth, 0.8, bodyDepth]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Chest (white fur) */}
      <mesh position={[0, 0.35, 0.35]} castShadow>
        <boxGeometry args={[bodyWidth * 0.7, 0.7, 0.3]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0.5]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.6]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.7, 0.85]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.3]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.7, 1.05]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={noseColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.18, 0.85, 0.75]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={darkColor} />
      </mesh>
      <mesh position={[0.18, 0.85, 0.75]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={darkColor} />
      </mesh>

      {/* Eye highlights */}
      <mesh position={[-0.16, 0.88, 0.8]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={whiteColor} />
      </mesh>
      <mesh position={[0.2, 0.88, 0.8]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={whiteColor} />
      </mesh>

      {/* Tongue (only at higher levels - happy buff doggo) */}
      {level >= 3 && (
        <mesh position={[0, 0.58, 0.95]} rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.15, 0.25, 0.05]} />
          <meshStandardMaterial color={tongueColor} />
        </mesh>
      )}

      {/* Ears (pointed Shiba ears) */}
      <mesh position={[-0.28, 1.1, 0.45]} rotation={[0, 0, -Math.PI / 8]} castShadow>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.28, 1.1, 0.45]} rotation={[0, 0, Math.PI / 8]} castShadow>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Legs */}
      {/* Front Left */}
      <mesh position={[-0.35, -0.1, 0.25]} castShadow>
        <cylinderGeometry args={[legThickness, legThickness, 0.7, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Front Right */}
      <mesh position={[0.35, -0.1, 0.25]} castShadow>
        <cylinderGeometry args={[legThickness, legThickness, 0.7, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Back Left */}
      <mesh position={[-0.35, -0.1, -0.2]} castShadow>
        <cylinderGeometry args={[legThickness, legThickness, 0.7, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Back Right */}
      <mesh position={[0.35, -0.1, -0.2]} castShadow>
        <cylinderGeometry args={[legThickness, legThickness, 0.7, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Paws (white) */}
      <mesh position={[-0.35, -0.5, 0.25]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>
      <mesh position={[0.35, -0.5, 0.25]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>
      <mesh position={[-0.35, -0.5, -0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>
      <mesh position={[0.35, -0.5, -0.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>

      {/* Tail (curled Shiba tail) */}
      <mesh position={[0, 0.6, -0.5]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <torusGeometry args={[0.2, 0.12, 8, 16, Math.PI]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.8, -0.45]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>

      {/* Muscle definition at higher levels */}
      {level >= 4 && (
        <>
          {/* Shoulder muscles */}
          <mesh position={[-0.45, 0.5, 0.25]} castShadow>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0.45, 0.5, 0.25]} castShadow>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          {/* Abs (visible on chest) */}
          <mesh position={[0, 0.3, 0.45]}>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
        </>
      )}

      {/* Level 5: Extra buff details */}
      {level === 5 && (
        <>
          <mesh position={[0, 0.5, 0.4]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0, 0.5, 0.4]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
        </>
      )}
    </group>
  )
}

export function Shiba3DModel({ level = 1 }: { level: number }) {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 3.5]} fov={50} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 2]} intensity={0.5} />

        {/* Shiba Dog */}
        <ShibaDog level={level} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
      </Canvas>
    </div>
  )
}
