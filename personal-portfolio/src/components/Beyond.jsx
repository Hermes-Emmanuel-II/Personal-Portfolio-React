import { useEffect, useRef, useState } from 'react'

import { CompletionRing } from './About'
import { useWidthCheck } from './Header'
import { Bar } from './Hero'
import ThreeDViewer from './ThreeDViewer'
import color from '../color.js'

import aftereffects from '../assets/external-icons/aftereffects.png'
import figma from '../assets/external-icons/figma.png'
import ibis from '../assets/external-icons/ibis.png'
import remotion from '../assets/external-icons/remotion.png'

import motion from '../assets/motion.png'
import pencilling from '../assets/pencilling.png'
import pixel from '../assets/pixel.png'

import bronze from '../assets/works/bronze.png'
import cephalopod from '../assets/works/cephalopod.png'
import haoqi from '../assets/works/haoqi.mp4'
import machu from '../assets/works/machu.png'

export default function Beyond () {
    const cards = [
        {
            title: 'Motion Graphics',
            img: motion,
            exp: 'The art of applying animation principles, timing, and visual effects to static graphics, typography, and UI elements.',
            one: aftereffects,
            two: figma,
            three: remotion,
            tech: true,
            entries: [

            ]
        },
        {
            title: 'Pencilling',
            img: pencilling,
            exp: 'The foundational stage of illustration and comic art where concepts, layouts, line work, and anatomical structures are established.',
            one: null,
            two: null,
            three: null,
            tech: false,
            entries: [

            ]
        },
        {
            title: 'Pixel Art',
            img: pixel,
            exp: 'A specialized form of digital art created by deliberately placing individual pixels on a low-resolution canvas. Heavily rooted in classic 8-bit and 16-bit video game aesthetics.',
            one: ibis,
            tech: true,
            entries: [
                {
                    title: 'Alien Cephalopod',
                    video: null,
                    videoLength: 0,
                    thumbnail: cephalopod,
                    bg: true,
                    notes: `A pixelated alien cephalopod — trailing arms and a striped mantle in cool lilac tones, punctuated by luminous slit-pupil eyes.`,
                    link: null
                },
                {
                    title: 'Bronze Head of Ile-Ife',
                    video: null,
                    videoLength: 0,
                    thumbnail: bronze,
                    bg: true,
                    notes: `A pixelated rendition of the Bronze Head of Ile-Ife, Western Nigeria — the royal sculpture's facial striations and crown rendered with warm metallic hues. An ode to ancient Yoruba naturalism.`,
                    link: null
                },
                {
                    title: 'Machu Picchu',
                    video: null,
                    videoLength: 0,
                    thumbnail: machu,
                    bg: false,
                    notes: `A pixelated rendition of Machu Picchu, Peru — the citadel's stone terraces and surrounding peaks manually distilled into pixels. Layered mist to suggest the site's altitude.`,
                    link: null
                }
            ]
        }
    ]

    const isDesktop = useWidthCheck()
    const tabIndex = isDesktop ? 0 : -1

    const [currentIndex, setCurrentIndex] = useState(0)
    const [entryIndex, setEntryIndex] = useState(0)
    const [bg, setBg] = useState(null)
    const [measuredDuration, setMeasuredDuration] = useState(null)

    const bgCacheRef = useRef(cards.map(card => card.entries.map(() => null)))

    const durationCacheRef = useRef(cards.map(card => card.entries.map(() => null)))

    const entries = cards[currentIndex].entries
    const currentEntry = entries[entryIndex] || entries[0]

    const effectiveLength = currentEntry && currentEntry.video
        ? (measuredDuration ?? currentEntry.videoLength)
        : (currentEntry ? currentEntry.videoLength : 0)

    const cycle = effectiveLength > 10
        ? effectiveLength * 1000
        : 15000

    useEffect(() => {
        setEntryIndex(0)
    }, [currentIndex])

    useEffect(() => {
        const stored = sessionStorage.getItem('beyondCategory')
        if (stored === null) return
        sessionStorage.removeItem('beyondCategory')
        const index = parseInt(stored, 10)
        if (!Number.isNaN(index) && index >= 0 && index < cards.length) {
            setCurrentIndex(index)
        }
    }, [])

    useEffect(() => {
        if (!currentEntry || !currentEntry.video) {
            setMeasuredDuration(null)
            return
        }
        const cachedRow = durationCacheRef.current[currentIndex]
        const cached = cachedRow ? cachedRow[entryIndex] : null
        setMeasuredDuration(cached ?? null)
    }, [currentIndex, entryIndex, currentEntry?.video])

    useEffect(() => {
        cards.forEach(card => {
            [card.img, card.one, card.two, card.three].filter(Boolean).forEach(src => {
                const img = new Image();
                img.src = src;
                if (img.decode) img.decode().catch(() => {});
            });
            card.entries.forEach(entry => {
                if (entry.thumbnail) {
                    const img = new Image();
                    img.src = entry.thumbnail;
                    if (img.decode) img.decode().catch(() => {});
                }
            });
        });
    }, []);

    function handleLoadedMetadata (e) {
        const duration = e.target.duration
        if (!Number.isFinite(duration)) return
        if (!durationCacheRef.current[currentIndex]) durationCacheRef.current[currentIndex] = []
        durationCacheRef.current[currentIndex][entryIndex] = duration
        setMeasuredDuration(duration)
    }

    useEffect(() => {
        if (!currentEntry || !currentEntry.thumbnail) {
            setBg(null)
            return
        }

        const cachedRow = bgCacheRef.current[currentIndex]
        const cached = cachedRow ? cachedRow[entryIndex] : null
        if (cached) {
            setBg(cached)
            return
        }

        let cancelled = false
        setBg(null)

        color(currentEntry.thumbnail)
            .then((result) => {
                if (cancelled) return
                const value = result.hex || `rgb(${ result.r }, ${ result.g }, ${ result.b })`
                if (!bgCacheRef.current[currentIndex]) bgCacheRef.current[currentIndex] = []
                bgCacheRef.current[currentIndex][entryIndex] = value
                setBg(value)
            })
            .catch(() => {
                if (!cancelled) setBg(null)
            })

        return () => { cancelled = true }
    }, [currentIndex, entryIndex, currentEntry?.thumbnail, currentEntry?.bg])

    useEffect(() => {
        if (entries.length === 0) return
        const interval = setInterval(() => {
            setEntryIndex(prev => (prev + 1) % entries.length)
        }, cycle)
        return () => clearInterval(interval)
    }, [currentIndex, entryIndex, cycle, entries.length])

    return (
        <section id = 'beyond' className = 'flex'>
            <article className = 'column'>
                <div className = 'column gap in-h'>
                    { cards.map((el, index) => (
                        <div
                            key = { el.title }
                            role = 'button'
                            aria-pressed = { index === currentIndex }
                            tabIndex = { tabIndex }
                            data-keep-tabbable
                            onClick = { () => setCurrentIndex(index) }
                            onKeyDown = { (e) => {
                                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                                    e.preventDefault()
                                    setCurrentIndex(index)
                                }
                            } }
                            className = { `in-h relative ${ index === currentIndex ? 'active' : '' }` }
                            style = {{ '--cycle': `${cycle}ms` }}
                        >
                            <img src = { el.img } alt = '' className = 'absolute'/>
                            { el.title }
                        </div>
                    )) }
                </div>
                <div className = 'column in-h'>
                    <div className = 'in-w column in-h gap-md'>
                        <span className = 'block'>{ `${ cards[currentIndex].title }` }</span>
                        <span>{ `${ entries.length } Entries` }</span>
                        <Bar vert = { false }></Bar>
                        <div className = 'in-h flex'>
                            { entries.length > 0 ? (
                                entries.map((entry, index) => (
                                    <button
                                        key = { entry.title }
                                        type = 'button'
                                        className = { `pointer block ${ index === entryIndex ? 'active' : '' }` }
                                        aria-pressed = { index === entryIndex }
                                        tabIndex = { tabIndex }
                                        data-keep-tabbable
                                        onClick = { () => setEntryIndex(index) }
                                    >
                                        { entry.title }
                                    </button>
                                ))
                                ) : (
                                <span>...</span>
                                ) }
                        </div>
                    </div>
                    <div className = 'flex gap-md'>
                        {
                            cards[currentIndex].tech == false ? <span>Non-technical craft</span> :
                            [cards[currentIndex].one, cards[currentIndex].two, cards[currentIndex].three]
                                .filter(Boolean)
                                .map(src => <img key = { src } src = { src } alt = ''/>)
                        }
                    </div>
                    <span className = 'block in-w'>{ cards[currentIndex].exp }</span>
                </div>
            </article>
            { currentEntry && <article className = 'relative gap-lg column'>
                <span>{ `Entry ${ entryIndex + 1 } — ${ currentEntry.title }` }</span>
                <Bar vert = { false }/>
                <div className = 'in-h relative center beyond-media'>
                    { currentEntry && currentEntry.video ? (
                        <video
                            key = { currentEntry.title }
                            src = { currentEntry.video }
                            className = 'block in-w in-h'
                            autoPlay
                            muted
                            loop
                            playsInline
                            onLoadedMetadata = { handleLoadedMetadata }
                        />
                    ) : currentEntry && currentEntry.thumbnail ? (
                        currentEntry.bg ? (
                            <>
                                <div
                                    aria-hidden = 'true'
                                    className = 'beyond-media-backdrop absolute in-w in-h'
                                    style = { bg ? { backgroundColor: bg } : undefined }
                                />
                                <img
                                    src = { currentEntry.thumbnail }
                                    alt = { currentEntry.title }
                                    className = 'beyond-media-fg relative'
                                />
                            </>
                        ) : (
                            <img
                                src = { currentEntry.thumbnail }
                                alt = { currentEntry.title }
                                className = 'beyond-media-fg relative in-h'
                            />
                        )
                    ) : null }
                </div>
                <div className = 'center beyond-viewer gap-xlg'>
                    { entries.length > 1 && currentEntry ? <ThreeDViewer/> : null }
                    <span className = 'center in-h'>{ currentEntry ? currentEntry.notes : null }</span>
                    { entries.length > 1 && currentEntry ? (
                        <CompletionRing key = { `${ currentIndex }-${ entryIndex }` } duration = { cycle } relative/>
                    ) : null }
                </div>
            </article> }
        </section>
    )
}