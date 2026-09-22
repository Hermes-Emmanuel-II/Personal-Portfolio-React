import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

const SETTINGS = {
    particleSize: 0.35,
    lineOpacity: 0.15,
    gearARadius: 12, gearATeeth: 8,
    gearBRadius: 21, gearBTeeth: 8,
    toothDepth: 5, depth: 5, layers: 6, detailDensity: 0.05,
    depthRange: 15,
    minBrightness: 0.02
}

function clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function generateGearPositions (offsetX, offsetY, phaseOffset, teeth, radius) {
    const positions = []
    const totalSegments = teeth * 2
    const segmentAngle = (2 * Math.PI) / totalSegments
    const outerRadius = radius + SETTINGS.toothDepth / 2
    const innerRadius = radius - SETTINGS.toothDepth / 2

    for (let i = 0; i < totalSegments; i++) {
        const isTooth = i % 2 === 0
        const maxR = isTooth ? outerRadius : innerRadius
        for (let a = i * segmentAngle + phaseOffset; a < (i + 1) * segmentAngle + phaseOffset; a += SETTINGS.detailDensity) {
            const jitterA = a + (Math.random() - 0.5) * 0.05
            for (let r = 5; r <= maxR; r += 1.5) {
                const x = r * Math.cos(jitterA)
                const y = r * Math.sin(jitterA)
                for (let l = 0; l < SETTINGS.layers; l++) {
                    positions.push(
                        x + offsetX,
                        y + offsetY,
                        ((l / (SETTINGS.layers - 1)) - 0.5) * SETTINGS.depth + (Math.random() - 0.5)
                    )
                }
            }
        }
    }
    return positions
}

function useGearGeometry () {
    return useMemo(() => {
        const dist = 15
        const a = generateGearPositions(dist, dist, 0, SETTINGS.gearATeeth, SETTINGS.gearARadius)
        const b = generateGearPositions(-dist, -dist, Math.PI / SETTINGS.gearATeeth, SETTINGS.gearBTeeth, SETTINGS.gearBRadius)
        const all = [...a, ...b]

        const linePositions = []
        for (let i = 0; i < all.length / 3 - 30; i += 2) {
            const i3 = i * 3
            linePositions.push(all[i3], all[i3 + 1], all[i3 + 2])
            linePositions.push(all[i3 + 30], all[i3 + 31], all[i3 + 32])
        }

        const colors = new Float32Array(all.length).fill(1)

        return {
            positions: new Float32Array(all),
            original: Float32Array.from(all),
            colors,
            linePositions: new Float32Array(linePositions)
        }
    }, [])
}

function GearPair () {
    const groupRef = useRef()
    const pointsRef = useRef()
    const { positions, original, colors } = useGearGeometry()

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y = -(Date.now() * 0.00025)
            groupRef.current.rotation.x = 0
            groupRef.current.rotation.z = 0
        }

        if (pointsRef.current) {
            const drift = Date.now() * 0.0015
            const posArray = pointsRef.current.geometry.attributes.position.array
            const colorArray = pointsRef.current.geometry.attributes.color.array

            const theta = groupRef.current ? groupRef.current.rotation.y : 0
            const cosT = Math.cos(theta)
            const sinT = Math.sin(theta)
            const { depthRange, minBrightness } = SETTINGS

            let minZ = Infinity
            let maxZ = -Infinity

            for (let i = 0; i < original.length / 3; i++) {
                const i3 = i * 3
                const x = original[i3] + Math.cos(drift + original[i3 + 1] * 0.2) * 0.3
                const y = original[i3 + 1] + Math.sin(drift + original[i3] * 0.2) * 0.3
                const z = original[i3 + 2]

                posArray[i3] = x
                posArray[i3 + 1] = y
                posArray[i3 + 2] = z

                const rotatedZ = -sinT * x + cosT * z
                if (rotatedZ < minZ) minZ = rotatedZ
                if (rotatedZ > maxZ) maxZ = rotatedZ
            }

            const range = maxZ - minZ || 1

            for (let i = 0; i < original.length / 3; i++) {
                const i3 = i * 3
                const x = posArray[i3]
                const z = posArray[i3 + 2]

                const rotatedZ = -sinT * x + cosT * z

                const t = clamp((rotatedZ - minZ) / range, 0, 1)

                const brightness = minBrightness + (1 - minBrightness) * t

                colorArray[i3] = brightness
                colorArray[i3 + 1] = brightness
                colorArray[i3 + 2] = brightness
            }

            pointsRef.current.geometry.attributes.position.needsUpdate = true
            pointsRef.current.geometry.attributes.color.needsUpdate = true
        }
    })

    return (
        <group ref = { groupRef }>
            <points ref = { pointsRef }>
                <bufferGeometry>
                    <bufferAttribute
                        attach = 'attributes-position'
                        count = { positions.length / 3 }
                        array = { positions }
                        itemSize = { 3 }
                    />
                    <bufferAttribute
                        attach = 'attributes-color'
                        count = { colors.length / 3 }
                        array = { colors }
                        itemSize = { 3 }
                    />
                </bufferGeometry>
                <pointsMaterial
                    size = { SETTINGS.particleSize }
                    color = '#D5D5D5'
                    vertexColors
                    transparent
                    opacity = { .875 }
                    sizeAttenuation
                />
            </points>
        </group>
    )
}

function GearsCanvas () {
    return (
        <Canvas camera = {{ position: [0, 0, 80], fov: 75 }}>
            <GearPair/>
        </Canvas>
    )
}

export default function GearsBackground () {
    return (
        <div className = 'gears-bg' aria-hidden = 'true'>
            <div className = 'webgl-background-top gears-bg-layer square'>
                <GearsCanvas/>
            </div>
            <div className = 'webgl-background-bottom gears-bg-layer square'>
                <GearsCanvas/>
            </div>
        </div>
    )
}