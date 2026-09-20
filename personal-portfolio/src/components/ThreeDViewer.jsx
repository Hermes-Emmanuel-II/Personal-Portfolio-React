import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import gearsModel from '../assets/gears.glb'
import * as THREE from 'three'

function useGearMaterials () {
  return useMemo(() => {
    const outerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x284228,
      roughness: 0.125,
      metalness: 0.125,
      transparent: true,
      opacity: 0.5,
      transmission: 0.5,
      thickness: 1.0,
      ior: 1.5,
      iridescence: 1,
      iridescenceIOR: 1,
      iridescenceThicknessRange: [100, 400],
      side: THREE.DoubleSide,
      depthWrite: true,
      envMapIntensity: 3.0
    })

    const outlineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        outlineColor: { value: new THREE.Color(0x00B3B3) },
        thickness: { value: 0.05 }
      },
      vertexShader: `
        uniform float thickness;
        void main() {
          vec3 scaledPosition = position + normal * thickness;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 outlineColor;
        void main() { gl_FragColor = vec4(outlineColor, 1.0); }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    })

    return { outerMaterial, outlineMaterial }
  }, [])
}

function Model ({ modelPath }) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef()
  const dressed = useRef(false)
  const { outerMaterial, outlineMaterial } = useGearMaterials()

  useEffect(() => {
    if (dressed.current) return
    dressed.current = true

    const outlines = []
    scene.traverse((child) => {
      if (!child.isMesh) return
      child.material = outerMaterial
      child.renderOrder = 1

      const aura = new THREE.Mesh(child.geometry, outlineMaterial)
      aura.renderOrder = 0
      outlines.push({ parent: child, aura })
    })
    outlines.forEach(({ parent, aura }) => parent.add(aura))
  }, [scene, outerMaterial, outlineMaterial])

  useFrame(() => {
    if (modelRef.current) modelRef.current.rotation.y = Date.now() * 0.00025 + (30 * (Math.PI / 180))
  })

  return <primitive ref = { modelRef } object = { scene } position = { [0, -.75, 0] }/>;
}

function CylinderRing({
  count = 16,
  radius = 4,
  height = 2,
  intensity = 4,
  color = '#7CFC00',
  scale = [2, 2, 2]
}) {
  const lights = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    lights.push(
      <Lightformer
        key = { i }
        form = 'circle'
        intensity = { intensity }
        color = { color }
        scale = { scale }
        position = { [x, height, z] }
        target = { [0, 0, 0] }
      />
    );
  }
  return <>{ lights }</>;
}

export default function ThreeDViewer () {
  return (
    <div className = 'gears relative pointer-events-none'>
      <Canvas camera = {{ position: [2.5, 0, 5], fov: 50 }} className = 'in-w in-h'>
        <Environment resolution = { 256 }>
          <CylinderRing
            count = { 8 }
            radius = { .5 }
            height = { 0 }
            intensity = { 4 }
            color = '#7CFC00'
          />
        </Environment>
        <ambientLight intensity = { .5 }/>
        <directionalLight position = { [10, 10, 10] } intensity = { 16 }/>
        <Suspense fallback = { null }>
          <Model modelPath = { gearsModel }/>
        </Suspense>
      </Canvas>
    </div>
  )
}