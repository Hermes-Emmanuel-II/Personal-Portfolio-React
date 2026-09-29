import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Clarity, Glass, Trail } from './Header'
import { Bar, Idea } from './Hero'
import Inspect from './Inspect'
import { getRecentItems } from './Recents'
import gsap from 'gsap'
import { holdScrollNormalizer } from '../App'

import blender from '../assets/external-icons/blender.svg'
import bootstrap from '../assets/external-icons/bootstrap.png'
import css from '../assets/external-icons/css.svg'
import figma from '../assets/external-icons/figma.svg'
import git from '../assets/external-icons/git.svg'
import gsapIcon from '../assets/external-icons/gsap.svg'
import html from '../assets/external-icons/html.svg'
import javascript from '../assets/external-icons/javascript.svg'
import react from '../assets/external-icons/react.svg'
import tailwind from '../assets/external-icons/tailwind.svg'
import three from '../assets/external-icons/three.svg'
import typescript from '../assets/external-icons/typescript.svg'
import vsc from '../assets/external-icons/vsc.svg'

import face from '../assets/face.png'
import gears from '../assets/gears.png'
import portfolioFigma from '../assets/figma/personal-portfolio-figma.png'

export function SectionHeader (props) {
    const temp = props.title
    return <div className = 'section-header in-w'><span>{ props.symbol }</span>{ temp.toUpperCase() }</div>
}

const CASE_STEPS = [
    { label: 'The Point', num: '1.0' },
    { label: 'Stack', num: '2.0' },
    { label: 'Challenges', num: '3.0' },
    { label: 'Trade-offs', num: '4.0' },
    { label: 'Outcome', num: '5.0' },
    { label: 'Highlight', num: '6.1', feature: 0 },
    { label: 'Highlight', num: '6.2', feature: 1 },
    { label: 'Highlight', num: '6.3', feature: 2 }
]

function squareWave (steps, r = 10.7, e = .6) {
    const top = e
    const bottom = 100 - e
    const end = steps * 100 - e
    let d = `M ${ e } ${ top }`
    for (let i = 1; i <= steps; i++) {
        const high = i % 2 === 1
        const y = high ? top : bottom
        if (i === steps) {
            d += ` L ${ end } ${ y }`
            break
        }
        const x = i * 100
        const nextY = high ? bottom : top
        const sweepIn = high ? 1 : 0
        d += ` L ${ x - r } ${ y } A ${ r } ${ r } 0 0 ${ sweepIn } ${ x } ${ high ? y + r : y - r }`
        d += ` L ${ x } ${ high ? nextY - r : nextY + r } A ${ r } ${ r } 0 0 ${ 1 - sweepIn } ${ x + r } ${ nextY }`
    }
    return d
}

const ORB_MERGE = .3
const ORB_SPLIT = .4

const CASE_WAVE = squareWave(CASE_STEPS.length)
const CASE_SIGNAL_TIME = CASE_STEPS.length * .5
const CASE_SIGNAL_SPEED = `${ CASE_SIGNAL_TIME }s`
const CASE_TRAIL = Array.from({ length: 8 }, (_, i) => i)
const CASE_TRAIL_GAP = .07
const CASE_TRAIL_FADE = .08
const BOARD = { cx: 78, cy: 38, r: 18, squash: .62, tilt: -90, depth: 3.6 }
const BOARD_RINGS = [
    { scale: 1, tone: 'a' },
    { scale: .76, tone: 'b' },
    { scale: .52, tone: 'a' },
    { scale: .28, tone: 'b' },
    { scale: .1, tone: 'bull' }
]

function boardRim ({ cx, cy, r, squash, tilt, depth }) {
    const rad = tilt * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const a = r
    const b = r * squash
    const dx = Math.cos(FLIGHT) * depth
    const dy = Math.sin(FLIGHT) * depth
    const lx = dx * cos + dy * sin
    const ly = -dx * sin + dy * cos
    const t = Math.atan2(-b * lx, a * ly)
    const point = angle => {
        const px = a * Math.cos(angle)
        const py = b * Math.sin(angle)
        return [cx + px * cos - py * sin, cy + px * sin + py * cos]
    }
    const [x1, y1] = point(t)
    const [x2, y2] = point(t + Math.PI)
    return { back: [cx + dx, cy + dy], edges: `M ${ x1 } ${ y1 } l ${ dx } ${ dy } M ${ x2 } ${ y2 } l ${ dx } ${ dy }` }
}

const FLIGHT = 0

const RIM = boardRim(BOARD)

function dartParts (flight, toward = false) {
    const along = flight + Math.PI
    const fore = Math.sqrt(1 - BOARD.squash ** 2)
    const axis = [Math.cos(along) * fore, Math.sin(along) * fore]
    const tilt = flight - Math.PI / 2
    const wide = [Math.cos(tilt), Math.sin(tilt)]
    const deep = [Math.cos(along) * BOARD.squash, Math.sin(along) * BOARD.squash]
    const at = (t, r, a) => [
        axis[0] * t + r * (Math.cos(a) * wide[0] + Math.sin(a) * deep[0]),
        axis[1] * t + r * (Math.cos(a) * wide[1] + Math.sin(a) * deep[1])
    ]
    const line = points => points.map(([x, y], i) => `${ i ? 'L' : 'M' } ${ x.toFixed(3) } ${ y.toFixed(3) }`).join(' ')
    const arc = (t, r, from, to, steps = 16) => Array.from({ length: steps + 1 }, (_, i) => at(t, r, from + (to - from) * i / steps))
    const ring = (t, r) => `${ line(arc(t, r, 0, Math.PI * 2, 32)) } Z`
    const cylinder = (t0, t1, r) => `${ line([...arc(t0, r, Math.PI, Math.PI * 2), ...arc(t1, r, 0, Math.PI)]) } Z`
    const fin = a => `${ line([at(25.5, .9, a), at(29, 6.5, a), at(36.5, 7, a), at(35.5, .9, a)]) } Z`
    const q = Math.PI / 4
    const side = toward ? 0 : Math.PI
    return {
        far: toward ? [fin(5 * q), fin(7 * q)] : [fin(q), fin(3 * q)],
        near: toward ? [fin(q), fin(3 * q)] : [fin(5 * q), fin(7 * q)],
        tip: `${ line([at(0, 0, 0), at(7, .55, 0), at(7, .55, Math.PI)]) } Z`,
        barrel: cylinder(7, 15.5, 1.9),
        face: ring(toward ? 7 : 15.5, 1.9),
        grip: [9.5, 11, 12.5].map(t => line(arc(t, 1.9, side, side + Math.PI))).join(' '),
        shaft: cylinder(15.5, 35.5, .9),
        butt: toward ? null : ring(35.5, .9)
    }
}

function Dart ({ flight, toward = false }) {
    const parts = dartParts(flight, toward)
    if (toward) return <>
        { parts.far.map((d, i) => <path key = { i } className = 'dart-fletch' d = { d }/>) }
        <path className = 'dart-shaft' d = { parts.shaft }/>
        { parts.near.map((d, i) => <path key = { i } className = 'dart-fletch' d = { d }/>) }
        <path className = 'dart-barrel' d = { parts.barrel }/>
        <path className = 'dart-grip' d = { parts.grip }/>
        <path className = 'dart-barrel' d = { parts.face }/>
        <path className = 'dart-tip' d = { parts.tip }/>
    </>
    return <>
        { parts.far.map((d, i) => <path key = { i } className = 'dart-fletch' d = { d }/>) }
        <path className = 'dart-tip' d = { parts.tip }/>
        <path className = 'dart-barrel' d = { parts.barrel }/>
        <path className = 'dart-grip' d = { parts.grip }/>
        <path className = 'dart-barrel' d = { parts.face }/>
        <path className = 'dart-shaft' d = { parts.shaft }/>
        <path className = 'dart-shaft' d = { parts.butt }/>
        { parts.near.map((d, i) => <path key = { i } className = 'dart-fletch' d = { d }/>) }
    </>
}

function PurposeTarget () {
    const { cx, cy, r, squash, tilt } = BOARD
    const [bx, by] = RIM.back
    return <svg className = 'purpose-target' viewBox = '-23 15 121 44' preserveAspectRatio = 'xMaxYMid meet' aria-hidden = 'true'>
        <g className = 'purpose-board'>
            <ellipse className = 'purpose-side' cx = { bx } cy = { by } rx = { r } ry = { r * squash } transform = { `rotate(${ tilt } ${ bx } ${ by })` }/>
            <path className = 'purpose-side' d = { RIM.edges }/>
            { BOARD_RINGS.map(ring => (
                <ellipse key = { ring.scale } className = { `purpose-ring ${ ring.tone }` } cx = { cx } cy = { cy } rx = { r * ring.scale } ry = { r * squash * ring.scale } transform = { `rotate(${ tilt } ${ cx } ${ cy })` }/>
            )) }
        </g>
        <g className = 'purpose-dart'>
            <g transform = 'scale(.95)'><Dart flight = { FLIGHT }/></g>
        </g>
    </svg>
}

const HOOP_ANGLE = 0
const HOOP_ORIGIN = [0, 12]
const HOOP_FIRST = 34
const HOOP_GAP = 20
const HOOP_SHRINK = .78

function hoopAlong (distance) {
    const a = HOOP_ANGLE * Math.PI / 180
    return [HOOP_ORIGIN[0] + Math.cos(a) * distance, HOOP_ORIGIN[1] + Math.sin(a) * distance]
}

function hoopDepth (u) {
    return HOOP_FIRST + HOOP_GAP * (1 - HOOP_SHRINK ** u) / (1 - HOOP_SHRINK)
}

const HOOPS = [0, 1, 2].map(u => {
    const [x, y] = hoopAlong(hoopDepth(u))
    const r = 10 * HOOP_SHRINK ** u
    const rx = r * BOARD.squash
    return { x, y, r, rx, ri: r * .82, rxi: rx - r * .18, d: rx * .3 }
})

function hoopShapes ({ r, rx, ri, rxi, d }) {
    return {
        near: {
            fill: `M 0 ${ -r } A ${ rx } ${ r } 0 0 0 0 ${ r } L 0 ${ ri } A ${ rxi } ${ ri } 0 0 1 0 ${ -ri } Z`,
            line: `M 0 ${ -r } A ${ rx } ${ r } 0 0 0 0 ${ r } M 0 ${ -ri } A ${ rxi } ${ ri } 0 0 0 0 ${ ri }`
        },
        far: {
            fill: `M 0 ${ -r } L ${ d } ${ -r } A ${ rx } ${ r } 0 0 1 ${ d } ${ r } L 0 ${ r } L 0 ${ ri } A ${ rxi } ${ ri } 0 0 0 0 ${ -ri } Z`,
            line: `M 0 ${ -r } L ${ d } ${ -r } A ${ rx } ${ r } 0 0 1 ${ d } ${ r } L 0 ${ r } M 0 ${ -r } A ${ rx } ${ r } 0 0 1 0 ${ r } M 0 ${ -ri } A ${ rxi } ${ ri } 0 0 1 0 ${ ri }`
        }
    }
}

function OutcomeHoops () {
    const layer = part => HOOPS.map((hoop, index) => (
        <g key = { index } className = { `hoop-pulse-${ index }` } style = {{ transformOrigin: `${ hoop.x }px ${ hoop.y }px` }}>
            <g transform = { `translate(${ hoop.x } ${ hoop.y }) rotate(${ HOOP_ANGLE })` }>
                { part === 'back'
                    ? <ellipse className = 'hoop-back' cx = { hoop.d } cy = '0' rx = { hoop.rxi } ry = { hoop.ri }/>
                    : <>
                        <path className = 'hoop-fill' d = { hoopShapes(hoop)[part].fill }/>
                        <path className = 'hoop-line' d = { hoopShapes(hoop)[part].line }/>
                    </> }
            </g>
        </g>
    ))
    return <svg className = 'purpose-target outcome-target' viewBox = '2 0 94 24' preserveAspectRatio = 'xMidYMid meet' aria-hidden = 'true'>
        <g transform = 'translate(98 0) scale(-1 1)'>
            { layer('back') }
            { layer('near') }
            <g className = 'outcome-dart'>
                <Dart flight = { Math.PI } toward/>
            </g>
            { layer('far') }
        </g>
    </svg>
}

const PIN = { cx: 10, cy: 10, angle: Math.PI / 4, head: 7, headDepth: 3.4, collar: 3.2, collarEnd: 8, needleEnd: 17, needleBase: .9 }

function pinParts ({ cx, cy, angle, head, headDepth, collar, collarEnd, needleEnd, needleBase }) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const pt = ([x, y]) => `${ x.toFixed(2) } ${ y.toFixed(2) }`
    const along = t => [cx + cos * t, cy + sin * t]
    const off = (t, r, s) => { const [x, y] = along(t); return [x - sin * r * s, y + cos * r * s] }
    const capsule = (t0, t1, r) => {
        const line = `M ${ pt(off(t0, r, -1)) } L ${ pt(off(t1, r, -1)) } A ${ r } ${ r } 0 0 1 ${ pt(off(t1, r, 1)) } L ${ pt(off(t0, r, 1)) }`
        return { fill: `${ line } Z`, line }
    }
    return {
        needle: `M ${ pt(off(collarEnd - 1, needleBase, -1)) } L ${ pt(along(needleEnd)) } L ${ pt(off(collarEnd - 1, needleBase, 1)) } Z`,
        tip: along(needleEnd),
        collar: capsule(headDepth - 1, collarEnd, collar),
        head: capsule(0, headDepth, head),
        face: [
            { cx, cy, r: head },
            { cx: cx - .5, cy: cy - .5, r: head * .72 },
            { cx: cx - 1.3, cy: cy - 1.3, r: head * .3 }
        ]
    }
}

const PIN_PARTS = pinParts(PIN)

function PinMark () {
    const [tipX, tipY] = PIN_PARTS.tip
    return <svg className = 'pin-mark' viewBox = { `0 0 ${ tipX.toFixed(2) } ${ tipY.toFixed(2) }` } aria-hidden = 'true'>
        <path className = 'pin-needle' d = { PIN_PARTS.needle }/>
        <path className = 'pin-fill' d = { PIN_PARTS.collar.fill }/>
        <path className = 'pin-line' d = { PIN_PARTS.collar.line }/>
        <path className = 'pin-fill' d = { PIN_PARTS.head.fill }/>
        <path className = 'pin-line' d = { PIN_PARTS.head.line }/>
        { PIN_PARTS.face.map((c, i) => <circle key = { i } cx = { c.cx } cy = { c.cy } r = { c.r }/>) }
    </svg>
}

function FeatureClip ({ item, label }) {
    const [inView, setInView] = useState(false)
    const frameRef = useRef(null)
    const videoRef = useRef(null)

    useEffect(() => {
        const el = frameRef.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .5 })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return
        if (inView) video.play().catch(() => {})
        else video.pause()
    }, [inView])

    return <div className = 'case-signal-body case-signal-reel relative'>
        <div ref = { frameRef } className = 'case-signal-reel-frame relative in-w in-h'>
            { item?.video && <video
                ref = { videoRef }
                className = 'absolute in-w in-h block'
                src = { item.video }
                muted
                playsInline
                loop
                preload = 'metadata'
            /> }
            <p className = 'case-signal-reel-text absolute'>{ item?.text ?? '—' }</p>
        </div>
        <span className = 'case-signal-label case-signal-reel-label absolute' aria-label = { label }>
            <PinMark/>
        </span>
    </div>
}

function usePocketScroll (listRef, rows) {
    const [edges, setEdges] = useState({ top: false, bottom: false })

    function update () {
        const el = listRef.current
        if (!el) return
        const box = el.getBoundingClientRect()
        const rects = [...el.querySelectorAll(rows)].map(child => child.getBoundingClientRect())
        const top = rects.some(r => r.top < box.top - .5 && r.bottom > box.top + .5)
        const bottom = rects.some(r => r.top < box.bottom - .5 && r.bottom > box.bottom + .5)
        setEdges(prev => (prev.top === top && prev.bottom === bottom) ? prev : { top, bottom })
    }

    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const host = el.closest('.case-signal-pocket') || el
        let hovered = false
        let target = el.scrollTop
        let tween = null

        function scrollList (delta, duration = .5) {
            const max = el.scrollHeight - el.clientHeight
            if (max <= 0 || delta === 0) return false
            const from = tween && tween.isActive() ? target : el.scrollTop
            if ((delta < 0 && from <= 0) || (delta > 0 && from >= max - 1)) return false
            target = Math.min(max, Math.max(0, from + delta))
            tween = gsap.to(el, { scrollTop: target, duration, ease: 'power3.out', overwrite: true })
            return true
        }

        function onWheel (e) {
            const step = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY
            if (!scrollList(step)) return
            e.preventDefault()
            e.stopPropagation()
        }

        function onKeyDown (e) {
            if (!hovered && !host.contains(document.activeElement)) return
            const first = el.querySelector(rows)
            const row = first ? first.getBoundingClientRect().height : 40
            const delta = e.key === 'ArrowDown' ? row
                : e.key === 'ArrowUp' ? -row
                : e.key === 'PageDown' ? el.clientHeight
                : e.key === 'PageUp' ? -el.clientHeight
                : 0
            if (!scrollList(delta)) return
            e.preventDefault()
            e.stopImmediatePropagation()
        }

        function onEnter (e) {
            if (e.pointerType !== 'mouse') return
            hovered = true
            holdScrollNormalizer(true)
        }

        function onLeave (e) {
            if (e.pointerType !== 'mouse') return
            hovered = false
            holdScrollNormalizer(false)
        }

        host.addEventListener('wheel', onWheel, { passive: false })
        host.addEventListener('pointerenter', onEnter)
        host.addEventListener('pointerleave', onLeave)
        window.addEventListener('keydown', onKeyDown, true)
        return () => {
            host.removeEventListener('wheel', onWheel)
            host.removeEventListener('pointerenter', onEnter)
            host.removeEventListener('pointerleave', onLeave)
            window.removeEventListener('keydown', onKeyDown, true)
            holdScrollNormalizer(false)
        }
    }, [])

    return { edges, update }
}

function NotesList ({ intro, items, label, tabIndex }) {
    const listRef = useRef(null)
    const { edges, update } = usePocketScroll(listRef, ':scope > p, li')

    useEffect(() => {
        const el = listRef.current
        if (!el) return
        update()
        const observer = new ResizeObserver(update)
        observer.observe(el)
        return () => observer.disconnect()
    }, [items])

    return <div
        ref = { listRef }
        className = { `case-signal-scroll case-signal-notes column ${ edges.top ? 'fade-top' : '' } ${ edges.bottom ? 'fade-bottom' : '' }` }
        onScroll = { update }
        tabIndex = { tabIndex }
        data-keep-tabbable
        role = 'region'
        aria-label = { label }
    >
        <p>{ intro }</p>
        <ul className = 'column'>
            { items.map(item => (
                <li key = { item.title }>
                    <span className = 'block'>{ item.title }</span>
                    <p>{ item.text }</p>
                </li>
            )) }
        </ul>
    </div>
}

function StackList ({ items, tabIndex }) {
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
    const [open, setOpen] = useState(null)
    const listRef = useRef(null)
    const { edges, update } = usePocketScroll(listRef, ':scope > li')

    useEffect(() => {
        const el = listRef.current
        if (!el) return
        update()
        const observer = new ResizeObserver(update)
        observer.observe(el)
        ;[...el.children].forEach(child => observer.observe(child))
        return () => observer.disconnect()
    }, [items, open])

    return <div className = 'case-signal-stack-wrap relative'>
        <ul
            ref = { listRef }
            className = { `case-signal-scroll case-signal-stack column ${ edges.top ? 'fade-top' : '' } ${ edges.bottom ? 'fade-bottom' : '' }` }
            onScroll = { update }
        >
            { sorted.map((tech, index) => (
                <li key = { tech.name } className = { open === index ? 'open' : '' }>
                    <div className = 'case-signal-row flex in-w'>
                        <div className = 'flex gap-md'>
                            { tech.icon ? <img className = 'square' src = { tech.icon } alt = ''/> : <span className = 'case-signal-blank block square' aria-hidden = 'true'></span> }
                            <span className = 'nowrap'>{ tech.name }</span>
                        </div>
                        <button
                            type = 'button'
                            className = 'center pointer'
                            aria-expanded = { open === index }
                            aria-label = { `Why ${ tech.name }` }
                            onClick = { () => setOpen(open === index ? null : index) }
                            tabIndex = { tabIndex }
                            data-keep-tabbable
                        >
                            <span className = 'case-signal-toggle relative' aria-hidden = 'true'></span>
                        </button>
                    </div>
                    <div className = 'case-signal-why'>
                        <p>{ tech.why }</p>
                    </div>
                </li>
            )) }
        </ul>
    </div>
}

function withDesktopPreview (src) {
    const url = `https://${ src }`
    return url + (url.includes('?') ? '&' : '?') + 'desktopPreview'
}

function useTabletUp () {
    const query = '(min-width: 768px)'
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

    useEffect(() => {
        const mq = window.matchMedia(query)
        const handleChange = (e) => setMatches(e.matches)
        mq.addEventListener('change', handleChange)
        return () => mq.removeEventListener('change', handleChange)
    }, [])

    return matches
}

function Work ({ onOpenRecents }) {
    const core = [
        { icon: blender, text: 'Blender' },
        { icon: bootstrap, text: 'Bootstrap' },
        { icon: css, text: 'Cascading Style Sheets (CSS)' },
        { icon: figma, text: 'Figma' }
    ]

    const more = [
        { icon: git, text: 'Git' },
        { icon: gsapIcon, text: 'GreenSock Animation Platform (GSAP)' },
        { icon: html, text: 'HyperText Markup Language (HTML)' },
        { icon: javascript, text: 'JavaScript' },
        { icon: react, text: 'React' },
        { icon: tailwind, text: 'Tailwind' },
        { icon: three, text: 'Three.js' },
        { icon: typescript, text: 'TypeScript' },
        { icon: vsc, text: 'Visual Studio Code (VS Code)' }
    ]

    const projects = [
        {
            title: 'Personal Portfolio',
            text: '<p><span>You are here!</span> E&shy;ssen&shy;tia&shy;lly has all of my public pro&shy;fe&shy;ssio&shy;nal data.</p>',
            src: 'personal-portfolio-react-lime.vercel.app/',
            figma: portfolioFigma,
            mobileImage: null,
            notes: '<ul><li><span>Tone</span> — Dark and restrained, with one bright accent doing the work.</li><li><span>Color</span> — Teal surfaces on charcoal, with lawngreen reserved for what matters.</li><li><span>Type</span> — Michroma for presence, Comfortaa for ease.</li><li><span>Depth</span> — Glass for what floats, solid teal for what holds content.</li><li><span>Identity</span> — The gears, kept mechanical and slow.</li></ul>',
            github: 'personal-portfolio',
            caseStudy: [
                'One home for my work, where the site itself shows how I design and build.',
                [
                    { icon: react, name: 'React', why: 'Components and state for a page with many interactive parts.' },
                    { icon: css, name: 'CSS', why: 'Hand-written for the glass, masks and trails, with no framework in the way.' },
                    { icon: three, name: 'Three.js', why: 'Renders the hero gears and the particle background in the browser.' },
                    { icon: blender, name: 'Blender', why: 'Modelled the 3D gears used in the hero.' },
                    { icon: gsapIcon, name: 'GSAP', why: 'Drives the pinned section breaks and the smooth scrolling across the page.' }
                ],
                {
                    intro: 'Every breakpoint and state was designed in Figma first. Getting the build to match it on every screen, phones especially, meant working through:',
                    items: [
                        { title: 'Glass distortion', text: 'Getting SVG filters to offset what sits behind each pane, then layering them under blur, gradients and borders so it reads as real glass.' },
                        { title: 'Hero gears', text: 'Carrying the Blender model into Three.js with an iridescent glass material, an outline shader and a ring of green light.' },
                        { title: 'Background gears', text: 'Animating a particle field in two places at once without a second WebGL context, by drawing it once and mirroring it.' },
                        { title: 'Service mockups', text: 'Rebuilding browser, Figma, Blender, VS Code, Miro and Hotjar screens in pure HTML and CSS, and keeping them intact at every breakpoint.' },
                        { title: 'Popups', text: 'Making glass windows draggable, squaring their corners as they meet the screen edge, and letting the inspector zoom and pan a full design.' }
                    ]
                },
                {
                    intro: 'A few deliberate calls, each giving something up to get something better:',
                    items: [
                        { title: 'Hand-written CSS', text: 'Every style written by hand instead of reaching for Tailwind or Bootstrap. Slower to build, but it gave full control over the glass, masks and trails.' },
                        { title: 'Live previews', text: 'Projects run as live sites on tablet and up, and as images on phones, trading interactivity for speed where it counts most.' },
                        { title: 'Lighter motion on phones', text: 'GSAP pins the section breaks on desktop, touch devices get native sticky scrolling, and the smallest screens drop the section words entirely, giving up some choreography for scrolling that feels right under a finger.' }
                    ]
                },
                'Live on Vercel, with a contact form that sends real email and attachments.',
                {
                    features: [
                        { video: null, text: 'Glass panes that bend whatever sits behind them.' },
                        { video: null, text: 'A signal that runs the case study from start to finish.' },
                        { video: null, text: 'Dots that melt into a label when you hover the stack.' }
                    ]
                }
            ],
            tags: 'site',
            date: '2026-08-15'
        }
    ]

    const testimonials = [
        {
            img: face,
            quote: "Building... Actual testimonials are underway.",
            name: 'Me'
        }
    ]

    const checkedTestimonials = testimonials.length < 2 ? [...testimonials, testimonials[0]] : testimonials;

    const levels = [1, 2, 4, 8, 16]

    const filters = [
        { key: 'brand', label: 'Brand Design' },
        { key: 'app', label: 'Mobile Apps' },
        { key: 'practice', label: 'Practice Work' },
        { key: 'site', label: 'Websites' }
    ]


    const [visible, setVisible] = useState(false)
    const [stackName, setStackName] = useState(null)
    const stackNameTimer = useRef(null)

    function showStackName (name, delay) {
        clearTimeout(stackNameTimer.current)
        stackNameTimer.current = setTimeout(() => setStackName(name), delay)
    }

    useEffect(() => () => clearTimeout(stackNameTimer.current), [])

    const [orb, setOrb] = useState({ phase: 'dots', dur: .25 })
    const [shownName, setShownName] = useState(null)
    const [nameOut, setNameOut] = useState(false)
    const [arrived, setArrived] = useState(false)
    const orbTimers = useRef([])
    const splitTimer = useRef(null)
    const stackRef = useRef(null)
    const stackFirstRef = useRef(null)
    const stackInnerRef = useRef(null)
    const stackNameRef = useRef(null)

    function orbLater (fn, ms) { orbTimers.current.push(setTimeout(fn, ms)) }

    useEffect(() => {
        orbTimers.current.forEach(clearTimeout)
        orbTimers.current = []
        clearTimeout(splitTimer.current)
        setArrived(false)
        if (visible) {
            setOrb(prev => prev.phase === 'dots' ? { phase: 'blob-top', dur: .25 } : prev)
            orbLater(() => setOrb({ phase: 'blob', dur: .5 }), 375)
            orbLater(() => setArrived(true), 875)
        } else {
            setNameOut(true)
            orbLater(() => setShownName(null), 260)
            setOrb(prev => prev.phase === 'split' ? { phase: 'blob', dur: ORB_MERGE } : prev)
            orbLater(() => setOrb(prev => prev.phase === 'dots' ? prev : { phase: 'blob-top', dur: .5 }), 375)
            orbLater(() => setOrb({ phase: 'dots', dur: .25 }), 875)
        }
    }, [visible])

    useEffect(() => {
        if (!visible || !arrived || stackName === shownName) return
        clearTimeout(splitTimer.current)
        const wait = orb.phase === 'split' ? ORB_MERGE * 1000 + 20 : 0
        setNameOut(true)
        setOrb({ phase: 'blob', dur: ORB_MERGE })
        splitTimer.current = setTimeout(() => {
            setShownName(stackName)
            setNameOut(false)
            if (stackName) setOrb({ phase: 'split', dur: ORB_SPLIT })
        }, wait)
    }, [stackName, arrived])

    useEffect(() => () => {
        orbTimers.current.forEach(clearTimeout)
        clearTimeout(splitTimer.current)
    }, [])

    function placeOrbs () {
        const wrapper = stackRef.current
        const first = stackFirstRef.current
        const inner = stackInnerRef.current
        const name = stackNameRef.current
        if (!wrapper || !first || !inner || !name) return
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
        const text = name.firstElementChild
        wrapper.style.setProperty('--orb-y0', `${ rem * -.25 }px`)
        wrapper.style.setProperty('--orb-y1', `${ name.offsetHeight / -2 }px`)
        wrapper.style.setProperty('--orb-x', `${ (text ? text.offsetWidth / 2 : 0) + rem * .875 }px`)
    }

    useLayoutEffect(placeOrbs, [shownName])

    useLayoutEffect(() => {
        const wrapper = stackRef.current
        if (!wrapper) return
        const observer = new ResizeObserver(placeOrbs)
        observer.observe(stackFirstRef.current)
        observer.observe(stackInnerRef.current)
        return () => observer.disconnect()
    }, [])
    const [current, setCurrent] = useState(0)
    const [inspectOpen, setInspectOpen] = useState(false)
    const [zoom, setZoom] = useState(0)
    const [filter, setFilter] = useState('site')
    const scale = levels[zoom]
    const iframeRefs = useRef({})
    const loadedPreviews = useRef({})

    const result = projects.filter(project => {
        const tagList = project.tags.split(',').map(tag => tag.trim().toLowerCase())
        return tagList.includes(filter.toLowerCase())
    })

    const recentCount = getRecentItems().length

    const loopedTestimonials = [ ...checkedTestimonials, ...checkedTestimonials ]

    function zoomIn () { setZoom(i => Math.min(levels.length - 1, i + 1)) }

    function zoomOut () { setZoom(i => Math.max(0, i - 1)) }

    useEffect(() => {
        if (inspectOpen) {
            setZoom(0)
        }
    }, [inspectOpen])

    function refresh() {
        if (!canLoadPreview || !result[current] || !inView) return
        const iframe = iframeRefs.current[result[current].title]
        const src = iframe.src
        iframe.src = 'about:blank'
        requestAnimationFrame(() => {
            iframe.addEventListener('load', () => {
                iframe.contentWindow.postMessage(
                    { source: 'portfolio-parent', action: 'scrollToTop' },
                    'https://portfolio-html-css-javascript-silk.vercel.app'
                )
            }, { once: true })
            iframe.src = src
        })

        if (inspectOpen) {
            setZoom(0)
        }
    }

    function handleFiltering (tag) {
        setFilter(tag)
        setCurrent(0)
    }

    const quickOptionsRef = useRef(null)
    const filterBtnRefs = useRef([])
    const [sameRow, setSameRow] = useState(() => filters.slice(0, -1).map(() => true))
    const [wrapped, setWrapped] = useState(false)

    useEffect(() => {
        const container = quickOptionsRef.current
        if (!container) return

        function measure () {
            const els = filterBtnRefs.current
            setSameRow(
                els.slice(0, -1).map((el, i) => {
                    const nextEl = els[i + 1]
                    if (!el || !nextEl) return true
                    return Math.round(el.offsetTop) === Math.round(nextEl.offsetTop)
                })
            )

            const prevWrap = container.style.flexWrap
            const prevWidth = container.style.width
            container.style.flexWrap = 'nowrap'
            container.style.width = 'max-content'
            container.style.setProperty('--quick-options-w', `${ container.scrollWidth }px`)

            const natural = container.scrollWidth
            const quick = container.parentElement
            const clarity = quick.querySelector(':scope > .clarity')
            const cs = getComputedStyle(quick)
            const gap = parseFloat(cs.columnGap) || 0
            const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
            const available = quick.clientWidth - padX - (clarity ? clarity.offsetWidth + gap : 0)
            setWrapped(natural > available)

            container.style.flexWrap = prevWrap
            container.style.width = prevWidth
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(container)
        observer.observe(container.parentElement)
        return () => observer.disconnect()
    }, [])

    const articleRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => { setWidth(articleRef.current.offsetWidth) }, []);

    const workRef = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = workRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: [0, 0.1] }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const canLoadPreview = useTabletUp()

    const signalRef = useRef(null)
    const signalDrag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0, pointerId: null })

    useEffect(() => {
        const el = signalRef.current
        if (!el) return
        function update () {
            const max = el.scrollWidth - el.clientWidth
            el.classList.toggle('fade-start', el.scrollLeft > 1)
            el.classList.toggle('fade-end', el.scrollLeft < max - 1)
        }
        update()
        el.addEventListener('scroll', update, { passive: true })
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', update)
            ro.disconnect()
        }
    }, [])

    function onSignalPointerDown (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return
        signalDrag.current = { active: true, moved: false, startX: e.clientX, scrollLeft: signalRef.current.scrollLeft, pointerId: e.pointerId }
    }

    function onSignalPointerMove (e) {
        const drag = signalDrag.current
        if (!drag.active) return
        const el = signalRef.current
        const dx = e.clientX - drag.startX
        if (!drag.moved) {
            if (Math.abs(dx) < 4) return
            drag.moved = true
            el.setPointerCapture(drag.pointerId)
            el.classList.add('dragging')
        }
        el.scrollLeft = drag.scrollLeft - dx
    }

    function onSignalPointerUp () {
        const drag = signalDrag.current
        if (!drag.active) return
        drag.active = false
        const el = signalRef.current
        el.classList.remove('dragging')
        if (drag.pointerId !== null && el.hasPointerCapture(drag.pointerId)) el.releasePointerCapture(drag.pointerId)
    }

    function onSignalClickCapture (e) {
        if (!signalDrag.current.moved) return
        signalDrag.current.moved = false
        e.preventDefault()
        e.stopPropagation()
    }

    return <section id = 'work' ref = { workRef } className = 'column center relative'>
        <SectionHeader symbol = '\\' title = 'work' />
        <article className = 'content center column gap-lg relative'>
            <span className = 'center block'>Turning complex ideas into sharp, functional interfaces — one dedicated build at a time.</span>
            <div
                ref = { stackRef }
                className = 'stack-wrapper gap-lg relative column in-w'
                onMouseEnter = { () => setVisible(true) }
                onMouseLeave = { () => { setVisible(false); showStackName(null, 0) } }
                onFocus = { () => setVisible(true) }
                onBlur = { (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setVisible(false) } }
                tabIndex = { inView ? 0 : -1 } data-keep-tabbable
            >
                <ul ref = { stackFirstRef } className = 'stack-first flex gap-lg in-w'>
                    { core.map(item => {
                        return <li className = 'center square relative' key = { item.text } onMouseEnter = { () => showStackName(item.text, 150) } onMouseLeave = { () => showStackName(null, 350) }>
                            <img
                                src = { item.icon }
                                alt = { item.text }
                                className = 'in-w in-h'
                            />
                        </li>
                    }) }
                </ul>
                <svg className = 'stack-goo absolute' width = '0' height = '0' aria-hidden = 'true'>
                    <filter id = 'stack-goo'>
                        <feGaussianBlur in = 'SourceGraphic' stdDeviation = '1.2'/>
                        <feColorMatrix values = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8'/>
                    </filter>
                </svg>
                <div className = { `stack-orbs absolute ${ orb.phase }` } style = {{ '--orb-dur': `${ orb.dur }s` }} aria-hidden = 'true'>
                    <span className = 'orb left'></span>
                    <span className = 'orb mid'></span>
                    <span className = 'orb right'></span>
                </div>
                <div className = { `stack-rest-shell in-w ${ visible ? 'visible' : '' }` }>
                    <div ref = { stackInnerRef } className = 'stack-rest-inner in-w'>
                    <ul className = { `stack-rest flex gap-lg in-w ${ visible ? 'visible' : '' }` }>
                        { more.map(item => {
                            return <li className = 'center square relative' key = { item.text } onMouseEnter = { () => showStackName(item.text, 150) } onMouseLeave = { () => showStackName(null, 350) }>
                                <img
                                    src = { item.icon }
                                    alt = { item.text }
                                    className = 'in-w in-h'
                                />
                            </li>
                        }) }
                    </ul>
                    <p ref = { stackNameRef } className = { `stack-name center ${ visible ? 'visible' : '' }` } aria-live = 'polite'>
                        <span className = { `stack-name-text ${ nameOut ? 'out' : '' }` }>
                            <span key = { shownName ?? '' } className = 'nowrap'>{ shownName ?? '\u00A0' }</span>
                        </span>
                    </p>
                    </div>
                </div>
            </div>
            <section className = 'flex quick in-w'>
                <div className = { `center quick-options ${ wrapped ? 'wrapped' : '' }` } ref = { quickOptionsRef }>
                    { filters.map((item, index) => (
                        <Fragment key = { item.key }>
                            <button
                                type = 'button'
                                className = {`pointer nowrap ${ filter === item.key ? 'active' : '' }`}
                                onClick = { () => handleFiltering(item.key) }
                                tabIndex = { inView ? 0 : -1 }
                                data-keep-tabbable
                                ref = { el => { filterBtnRefs.current[index] = el } }
                            >
                                { item.label }
                            </button>
                            { index < filters.length - 1 && (
                                <Bar style = {{ visibility: sameRow[index] ? 'visible' : 'hidden' }}/>
                            ) }
                        </Fragment>
                    )) }
                </div>
                <Clarity tabIndex = { inView ? 0 : -1 }>
                    <table className = 'tooltip-table relative in-w'>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Focus</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className = 'emphasis'>Brand Design</td>
                                <td>Stra&shy;te&shy;gic and vi&shy;sual iden&shy;tity crea&shy;tion for bu&shy;si&shy;ness&shy;es, in&shy;clu&shy;ding lo&shy;gos, co&shy;lor pa&shy;le&shy;ttes, and guide&shy;lines.</td>
                                <td>Iden&shy;tity, Guide&shy;lines, Logos</td>
                            </tr>
                            <tr>
                                <td className = 'emphasis'>Mobile App Design</td>
                                <td>De&shy;si&shy;gning in&shy;tui&shy;tive and en&shy;ga&shy;ging user ex&shy;pe&shy;rien&shy;ces spe&shy;ci&shy;fi&shy;ca&shy;lly for na&shy;tive mo&shy;bile app&shy;li&shy;ca&shy;tions (iOS/An&shy;droid).</td>
                                <td>UX/UI, In&shy;te&shy;rac&shy;tion, Mobile</td>
                            </tr>
                            <tr>
                                <td className = 'emphasis'>Website Design</td>
                                <td>Struc&shy;tu&shy;ring, sty&shy;ling, and la&shy;ying out res&shy;pon&shy;sive web pages for op&shy;timal user ex&shy;pe&shy;ri&shy;ence across va&shy;rious de&shy;vi&shy;ces.</td>
                                <td>Respon&shy;sive&shy;ness, Layout, Web</td>
                            </tr>
                        </tbody>
                    </table>
                </Clarity>
            </section>
            <section className = 'current-project relative flex in-w' tabIndex = { inView ? 0 : -1 } data-keep-tabbable >
                { result.length > 0 ? (
                    <>
                        { result.length > 2 && (
                            <span
                                className = 'absolute square ctr-abs-y'
                                onClick = { () => setCurrent((current - 1 + result.length) % result.length) }
                                onKeyDown = { (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrent((current - 1 + result.length) % result.length) } } }
                                role = 'button'
                                aria-label = 'Previous project'
                                tabIndex = { inView ? 0 : -1 } data-keep-tabbable
                            >
                                <i className = 'fa-solid fa-caret-right'></i>
                            </span>
                        ) }
                        { result.length > 1 && (
                            <span
                                className = 'absolute square ctr-abs-y'
                                onClick = { () => setCurrent((current + 1) % result.length) }
                                onKeyDown = { (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrent((current + 1) % result.length) } } }
                                role = 'button'
                                aria-label = 'Next project'
                                tabIndex = { inView ? 0 : -1 } data-keep-tabbable
                            >
                                <i className = 'fa-solid fa-caret-right'></i>
                            </span>
                        ) }
                        <section className = 'relative block in-h'>
                            <Trail once = { false } />
                            <div className = 'iframe-clip relative'>
                                { result.map((project, index) => {
                                    const isCurrent = index === current
                                    const isLive = canLoadPreview && inView && isCurrent

                                    if (!canLoadPreview) {
                                        return <div
                                            key = { project.title }
                                            className = 'in-h in-w'
                                            style = {{
                                                display: isCurrent ? 'block' : 'none',
                                                backgroundColor: 'var(--accent-1)',
                                                ...(project.mobileImage ? {
                                                    backgroundImage: `url(${ project.mobileImage })`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                } : {})
                                            }}
                                        />
                                    }

                                    if (isLive) loadedPreviews.current[project.title] = true
                                    const shouldRender = loadedPreviews.current[project.title]

                                    return <iframe
                                        key = { project.title }
                                        ref = { el => { iframeRefs.current[project.title] = el } }
                                        src = { shouldRender ? withDesktopPreview(project.src) : 'about:blank' }
                                        loading = 'lazy'
                                        frameBorder = '0'
                                        scrolling = 'no'
                                        tabIndex = { -1 }
                                        className = 'in-h in-w block'
                                        style = {{ display: isCurrent ? 'block' : 'none' }}
                                    />
                                }) }
                            </div>
                            <Clarity
                                icon = {
                                    <>
                                        <i className = 'fa-solid fa-rotate-right'></i>
                                        <i className = 'fa-solid fa-rotate-right absolute duplicate'></i>
                                    </>
                                }
                                text = 'Refresh preview'
                                onClick = { refresh }
                                className = { !canLoadPreview ? 'none' : '' }
                                tabIndex = { (canLoadPreview && inView) ? 0 : -1 } data-keep-tabbable
                            />
                        </section>
                        <section className = 'relative block in-h column gap-lg description'>
                            <div className = 'emphasis'>{ result[current].title }</div>
                            <div className = 'in-h' dangerouslySetInnerHTML = {{ __html: result[current].text }} />
                            <img className = "absolute" src = { gears } alt = 'Brand Logo — Two Gears'></img>
                            <Glass
                                as = 'button'
                                type = 'button'
                                className = 'relative pointer gap-md'
                                tabIndex = { inView ? 0 : -1 } data-keep-tabbable
                                onClick = { () => setInspectOpen(true) }
                            >
                                <Trail once = { true } />
                                <Idea text = 'Inspect' cltxt = 'fa-solid fa-up-right-and-down-left-from-center' tabIndex = { -1 }/>
                            </Glass>
                            <Inspect
                                isOpen = { inspectOpen }
                                onClose = { () => setInspectOpen(false) }
                                project = { result[current] }
                                onZoomIn = { zoomIn }
                                onZoomOut = { zoomOut }
                                zoomLevel = { zoom }
                                maxZoomLevel = { levels.length - 1 }
                                scale = { scale }
                            />
                        </section>
                    </>
                ) : <span className = 'flex project-empty'>
                        No projects available under this category at the moment.
                    </span>
                }
            </section>
            <section
                ref = { signalRef }
                className = 'case-signal in-w'
                aria-label = 'Case study'
                onPointerDown = { onSignalPointerDown }
                onPointerMove = { onSignalPointerMove }
                onPointerUp = { onSignalPointerUp }
                onPointerCancel = { onSignalPointerUp }
                onClickCapture = { onSignalClickCapture }
                onDragStart = { (e) => e.preventDefault() }
            >
                <div className = 'case-signal-track flex relative'>
                    { CASE_STEPS.map((step, index) => {
                        const label = step.label
                        const feature = step.feature !== undefined
                        const data = feature ? result[current]?.caseStudy?.[5]?.features?.[step.feature] : result[current]?.caseStudy?.[index]
                        return <div key = { step.num } className = { `case-signal-step center ${ index % 2 === 0 ? 'high' : 'low' }` }>
                            <article className = { `case-signal-pocket square column gap-md relative ${ index === 0 ? 'purpose' : index === 4 ? 'outcome' : feature ? 'highlight' : '' }` }>
                                { !feature && <span className = 'case-signal-label relative'>
                                    { label }
                                    { index % 2 === 0 && <span className = 'case-signal-index absolute'>{ step.num }</span> }
                                </span> }
                                { feature ? (
                                    <FeatureClip key = { `${ result[current]?.title }-${ step.num }` } item = { data } label = { label }/>
                                ) : Array.isArray(data) ? (
                                    <StackList key = { result[current].title } items = { data } tabIndex = { inView ? 0 : -1 }/>
                                ) : data?.items ? (
                                    <NotesList key = { result[current].title } intro = { data.intro } items = { data.items } label = { label } tabIndex = { inView ? 0 : -1 }/>
                                ) : index === 4 ? (
                                    <div className = 'case-signal-body column gap-md'>
                                        <p>{ data ?? '—' }</p>
                                        <OutcomeHoops/>
                                    </div>
                                ) : index === 0 ? (
                                    <div className = 'case-signal-body column gap-md'>
                                        <p>{ data ?? '—' }</p>
                                        <PurposeTarget/>
                                    </div>
                                ) : <p>{ data ?? '—' }</p> }
                                { (index % 2 === 1 || feature) && <span className = 'case-signal-index absolute'>{ step.num }</span> }
                            </article>
                        </div>
                    }) }
                    <svg className = 'case-signal-wave absolute' viewBox = { `0 0 ${ CASE_STEPS.length * 100 } 100` } aria-hidden = 'true'>
                        <defs>
                            <radialGradient id = 'case-signal-glow'>
                                <stop offset = '10%' stopColor = '#80FF00'/>
                                <stop offset = '60%' stopColor = '#00FFFF'/>
                                <stop offset = '100%' stopColor = '#00FFFF' stopOpacity = '0'/>
                            </radialGradient>
                            <filter id = 'case-signal-blur' x = '-50%' y = '-50%' width = '200%' height = '200%'>
                                <feGaussianBlur stdDeviation = '5.5'/>
                            </filter>
                            <mask id = 'case-signal-mask' maskUnits = 'userSpaceOnUse' x = '-10' y = '-10' width = { CASE_STEPS.length * 100 + 20 } height = '120'>
                                <path d = { CASE_WAVE } fill = 'none' stroke = '#FFF' strokeWidth = '2' vectorEffect = 'non-scaling-stroke'/>
                            </mask>
                        </defs>
                        <path className = 'case-signal-line' d = { CASE_WAVE } vectorEffect = 'non-scaling-stroke'/>
                        <g mask = 'url(#case-signal-mask)'>
                            { [...CASE_TRAIL].reverse().map(i => (
                                <ellipse key = { i } rx = '21' ry = { 10.5 * (1 - i * .06) } fill = 'url(#case-signal-glow)' fillOpacity = { 1 - i / CASE_TRAIL.length } filter = 'url(#case-signal-blur)'>
                                    <animateMotion dur = { CASE_SIGNAL_SPEED } begin = { `-${ (CASE_SIGNAL_TIME - i * CASE_TRAIL_GAP).toFixed(2) }s` } repeatCount = 'indefinite' rotate = 'auto' path = { CASE_WAVE }/>
                                    <animate attributeName = 'opacity' dur = { CASE_SIGNAL_SPEED } begin = { `-${ (CASE_SIGNAL_TIME - i * CASE_TRAIL_GAP).toFixed(2) }s` } repeatCount = 'indefinite' values = '0;1;1;0' keyTimes = { `0;${ CASE_TRAIL_FADE };${ 1 - CASE_TRAIL_FADE };1` }/>
                                </ellipse>
                            )) }
                        </g>
                    </svg>
                </div>
            </section>
            <section className = 'flex count center in-w'>
                <span className = 'relative'>Curated and non-exhaustive project list</span>
                <div className = 'flex center'>
                    <div className = 'round center square'>
                        <span className = 'emphasis'>{ result.length }</span>
                    </div>
                    { result.map((project, index) => (
                        <div
                            key = { project.title }
                            className = { `round square ${ index === current ? 'active' : '' }` }
                            onClick = { () => setCurrent(index) }
                        ></div>
                    )) }
                </div>
            </section>
            <section className = 'stats gap center'>
                <Glass
                    as = 'a'
                    href = 'https://github.com/Hermes-Emmanuel-II/personal-portfolio'
                    target = '_blank'
                    rel = 'noreferrer'
                    className = 'relative pointer gap-md'
                    tabIndex = { inView ? 0 : -1 } data-keep-tabbable
                >
                    <Trail once = { false } />
                    <Idea text = { projects.length } cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                </Glass>
                <Glass
                    as = 'button'
                    type = 'button'
                    className = 'recents relative pointer gap-md'
                    onClick = { onOpenRecents }
                    tabIndex = { inView ? 0 : -1 } data-keep-tabbable
                >
                    <Trail once = { false } />
                    <Idea text = { recentCount } cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                </Glass>
            </section>
            <section className = 'quotes flex relative in-w'>
                <div className = 'quotes-inner in-h absolute flex'
                    style = {{
                        width: `${ width } * ${ loopedTestimonials.length }`,
                        animation: `continuous-scroll ${ 10 * loopedTestimonials.length }s linear infinite`
                    }}>
                    { loopedTestimonials.map((testimony, index) => {
                        return <Fragment key = { `${testimony.name} - ${index}` }>
                            <article ref = { articleRef } className = 'flex gap'>
                                <img className = 'square' src = { testimony.img } alt = { testimony.name } />
                                <div className = 'flex column'>
                                    <q className = 'block'>{ testimony.quote }</q>
                                    <span className = 'block'>{ testimony.name }</span>
                                </div>
                            </article>
                            <div className = 'bar-y'></div>
                        </Fragment>
                    }) }
                </div>
            </section>
        </article>
    </section>
}

export default memo(Work)