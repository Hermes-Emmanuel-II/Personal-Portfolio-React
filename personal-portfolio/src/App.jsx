import { lazy, memo, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import About from './components/About'
import Contact from './components/Contact'
import GearsBackground from './components/GearsBackground'
import HamburgerMenu from './components/HamburgerMenu'
import Header, { useWidthCheck } from './components/Header'
import Hero from './components/Hero'
import Recents from './components/Recents'
import Work from './components/Work'
import disable from './disable.js'

const loadBeyond = () => import('./components/Beyond')
const Beyond = lazy(loadBeyond)

if (typeof window !== 'undefined') {
    const prefetch = () => loadBeyond().catch(() => {})
    window.addEventListener('load', () => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch, { timeout: 4000 })
        else setTimeout(prefetch, 2000)
    }, { once: true })
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)')
let isTouchOnly = touchQuery.matches

ScrollTrigger.config({ ignoreMobileResize: true })

let scrollNormalizer = isTouchOnly ? null : ScrollTrigger.normalizeScroll({ allowNestedScroll: true })

const touchListeners = new Set()
let touchRefreshTimer
touchQuery.addEventListener('change', (e) => {
    isTouchOnly = e.matches
    if (isTouchOnly) {
        ScrollTrigger.normalizeScroll(false)
        scrollNormalizer = null
    } else {
        scrollNormalizer = ScrollTrigger.normalizeScroll({ allowNestedScroll: true })
        if (document.documentElement.classList.contains('menu-open')) scrollNormalizer.disable()
    }
    touchListeners.forEach(fn => fn())
    clearTimeout(touchRefreshTimer)
    touchRefreshTimer = setTimeout(() => ScrollTrigger.refresh(), 350)
})

// Hover looks on touch screens, once per tap. The stylesheets keep their hover rules for mice only (@media (hover: hover)),
// as a hover left behind by a finger stays on until something else is tapped. Instead, a tap marks what's under the finger,
// and every element round it (as hover would), .is-tapped for a moment, and the copies of the hover rules at the end of
// index.css and media-queries.css (@media (hover: none), :hover swapped for .is-tapped) play the same look: it eases in
// with the hover's own transitions, holds briefly, and eases out, .5s in all. A tap that turns into a scroll clears it at once, so
// scrolling past things doesn't light them up. Mouse input is ignored: desktops keep their real hover
const TAP_SPAN = 350 // ms from the touch until the look starts back: with its .15s fade out, .5s in all
let tapped = []
let tapTimer = 0
let tapAt = 0

function clearTapped () {
    clearTimeout(tapTimer)
    tapped.forEach(el => el.classList.remove('is-tapped'))
    tapped = []
}

document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return
    clearTapped()
    tapAt = performance.now()
    for (let el = e.target; el && el !== document.documentElement; el = el.parentElement) {
        el.classList.add('is-tapped')
        tapped.push(el)
    }
}, { capture: true, passive: true })

document.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' || !tapped.length) return
    clearTimeout(tapTimer)
    tapTimer = setTimeout(clearTapped, Math.max(0, TAP_SPAN - (performance.now() - tapAt)))
}, { capture: true, passive: true })

document.addEventListener('pointercancel', (e) => {
    if (e.pointerType !== 'mouse') clearTapped() // the browser took the touch for a scroll
}, { capture: true, passive: true })

// A link that leaves the page (another route, another site, a new tab) lets go of focus once clicked, so coming back
// doesn't find it still lit. Clicks only: a keyboard user keeps their place
document.addEventListener('click', (e) => {
    if (!e.detail) return
    const link = e.target.closest('a[href]')
    if (!link) return
    const leaves = link.target === '_blank' || link.origin !== location.origin || link.pathname !== location.pathname
    if (leaves) requestAnimationFrame(() => link.blur())
}, true)

window.addEventListener('pageshow', clearTapped)
document.addEventListener('visibilitychange', clearTapped)

function useTouchOnly () {
    return useSyncExternalStore(
        (fn) => { touchListeners.add(fn); return () => touchListeners.delete(fn) },
        () => isTouchOnly
    )
}

export function holdScrollNormalizer (hold) {
    if (!scrollNormalizer) return
    if (hold) scrollNormalizer.disable()
    else if (!document.documentElement.classList.contains('menu-open')) scrollNormalizer.enable()
}

let lvhProbe = null
export function stableViewportHeight () {
    if (!lvhProbe) {
        lvhProbe = document.createElement('div')
        lvhProbe.setAttribute('aria-hidden', 'true')
        lvhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:var(--inter-vh, 100lvh);visibility:hidden;pointer-events:none;'
        document.body.appendChild(lvhProbe)
    }
    return lvhProbe.getBoundingClientRect().height || window.innerHeight
}

export function smoothScrollTo (target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target instanceof Element ? target : null
    const offsetY = el ? parseFloat(getComputedStyle(el).scrollMarginTop) || 0 : 0
    gsap.to(window, {
        duration: .375,
        ease: 'power2.inOut',
        scrollTo: { y: target, offsetY },
        ...opts
    })
}

let interRefreshFrame = 0
function scheduleInterRefresh () {
    if (interRefreshFrame) return
    interRefreshFrame = requestAnimationFrame(() => {
        interRefreshFrame = 0
        ScrollTrigger.refresh()
    })
}

export const Inter = memo(function Inter ({ text }) {
    const sticky = useTouchOnly()
    return <InterMode key = { sticky ? 'sticky' : 'pin' } text = { text } sticky = { sticky }/>
})

function InterMode ({ text, sticky }) {
    const trackRef = useRef(null)
    const containerRef = useRef(null)
    const spanRef = useRef(null)
    const timeoutRef = useRef(null)

    useGSAP(() => {
        const anchor = sticky ? trackRef.current : containerRef.current

        gsap.set(containerRef.current, { opacity: 0 })

        gsap.set(spanRef.current, { xPercent: -50 })

        function startBouncerTimer () {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                gsap.to(containerRef.current, { opacity: 1, duration: 0.3, ease: 'power1.out' })
            }, 500)
        }

        function killBouncerTimer () {
            clearTimeout(timeoutRef.current)
            gsap.to(containerRef.current, { opacity: 0, duration: 0.3, ease: 'power1.out' })
        }

        ScrollTrigger.create({
            trigger: anchor,
            start: 'top bottom',
            end: () => `+=${ stableViewportHeight() * 2.5 }`,
            onEnter: startBouncerTimer,
            onEnterBack: startBouncerTimer,
            onLeave: killBouncerTimer,
            onLeaveBack: killBouncerTimer
        })

        function softenLanding () {
            gsap.timeline()
                .to(spanRef.current, { scale: 1.0625, duration: 0.25, ease: 'power2.out' })
                .to(spanRef.current, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: anchor,
                start: 'top top',
                end: () => `+=${ stableViewportHeight() * 0.75 }`,
                scrub: 1,
                ...(sticky ? {} : {
                    pin: true,
                    pinSpacing: true
                }),
                invalidateOnRefresh: true,
                preventOverlaps: 'inter-fade',
                onEnter: softenLanding,
                onEnterBack: softenLanding
            }
        })

        tl.to(containerRef.current, {
            height: 0,
            ease: 'none',
            duration: 1.25
        }, 0)
        .fromTo(spanRef.current,
            { opacity: 1 },
            {
                opacity: 0,
                ease: 'none',
                duration: .1875
            }, 0.0625)
        // Measure again once the swapped-in mode has laid out, so later pins/sections line up behind it
        scheduleInterRefresh()
    }, { scope: trackRef })

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    return <div ref = { trackRef } className = { `${ sticky ? 'inter-track' : 'inter-pin' } in-w` }>
        <div ref = { containerRef } className = 'inter relative in-w'>
            <span ref = { spanRef } data-text = { text } className = 'absolute emphasis'>{ text }</span>
        </div>
    </div>
}

function Home ({ menuOpen, closeMenu }) {
    const [recentsOpen, setRecentsOpen] = useState(false)
    const openRecents = useCallback(() => setRecentsOpen(true), [])
    const closeRecents = useCallback(() => setRecentsOpen(false), [])
    const showInter = useWidthCheck('(min-width: 620.1px)')

    return <>
        <HamburgerMenu isOpen = { menuOpen } onClose = { closeMenu } onOpenRecents = { openRecents }/>
        <Hero onOpenRecents = { openRecents } recentsOpen = { recentsOpen }/>
        { showInter && <Inter text = 'WORK'/> }
        <Work onOpenRecents = { openRecents }/>
        { showInter && <Inter text = 'ABOUT'/> }
        <About/>
        { showInter && <Inter text = 'SAY HI?'/> }
        <Contact/>
        <Recents isOpen = { recentsOpen } onClose = { closeRecents }/>
    </>
}

export default function App () {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuOpenRef = useRef(menuOpen)
    const { pathname } = useLocation()
    const isDesktop = useWidthCheck()

    const closeMenu = useCallback(() => setMenuOpen(false), [])

    useEffect(() => {
        if (!isDesktop) return
        return disable()
    }, [isDesktop])

    useEffect(() => { setMenuOpen(false) }, [pathname])
    useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])

    useEffect(() => {
        if (pathname !== '/') return
        const sections = ['hero', 'work', 'about', 'contact'].map(id => document.getElementById(id)).filter(Boolean)
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('offscreen', !entry.isIntersecting))
        }, { rootMargin: '25% 0px' })
        sections.forEach(section => observer.observe(section))
        return () => {
            observer.disconnect()
            sections.forEach(section => section.classList.remove('offscreen'))
        }
    }, [pathname])

    useLayoutEffect(() => {
        const root = document.documentElement
        function publish () { root.style.setProperty('--page-w', `${ root.clientWidth }px`) }
        publish()
        const ro = new ResizeObserver(publish)
        ro.observe(root)
        return () => ro.disconnect()
    }, [])

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('menu-open', menuOpen)
    }, [menuOpen])
    useEffect(() => {
        if (!scrollNormalizer) return
        if (menuOpen) {
            scrollNormalizer.disable()
        } else {
            scrollNormalizer.enable()
        }
    }, [menuOpen])

    useEffect(() => {
        const SCROLL_STEP = 80

        const handleKeyDown = (e) => {
            const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space']
            if (!keys.includes(e.code)) return

            if (menuOpenRef.current) return

            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return

            if (e.code === 'Space' && document.activeElement.closest('button, a, [role="button"]')) return

            e.preventDefault()

            let distance = 0
            switch (e.code) {
                case 'ArrowDown':
                    distance = SCROLL_STEP
                    break
                case 'ArrowUp':
                    distance = -SCROLL_STEP
                    break
                case 'PageDown':
                    distance = window.innerHeight * 0.8
                    break
                case 'PageUp':
                    distance = -window.innerHeight * 0.8
                    break
                case 'Space':
                    distance = e.shiftKey ? -window.innerHeight * 0.8 : window.innerHeight * 0.8
                    break
            }

            gsap.to(window, {
                duration: 0.75,
                ease: 'power2.out',
                scrollTo: { y: window.scrollY + distance },
                overwrite: 'auto'
            })
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        let scrollTimer
        function handleScroll () {
            document.body.classList.add('is-scrolling')
            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => {
                document.body.classList.remove('is-scrolling')
            }, 100)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(scrollTimer)
        }
    }, [])

    useEffect(() => {
        let timer
        let lastWidth = window.innerWidth
        function onResize () {
            if (window.innerWidth === lastWidth) return
            lastWidth = window.innerWidth
            clearTimeout(timer)
            timer = setTimeout(() => ScrollTrigger.refresh(), 350)
        }
        window.addEventListener('resize', onResize)
        window.addEventListener('orientationchange', onResize)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('orientationchange', onResize)
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        Promise.all([
            document.fonts.ready,
            new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve()
                } else {
                    window.addEventListener('load', resolve, { once: true })
                }
            })
        ]).then(() => {
            if (cancelled) return

            setTimeout(() => {
                if (!cancelled) ScrollTrigger.refresh()
            }, 100)
        })
        return () => { cancelled = true }
    }, [])

    return (
        <div className = 'column gap-lg'>
            <GearsBackground/>
            <Header menuOpen = { menuOpen } onToggleMenu = { setMenuOpen }/>
            <Routes>
                <Route path = '/' element = { <Home menuOpen = { menuOpen } closeMenu = { closeMenu }/> } />
                <Route path = '/beyond/:category?' element = {
                    <Suspense fallback = { <div className = 'loading-screen absolute ctr-abs-xy in-w in-h'>Loading…</div> }>
                        <Beyond/>
                    </Suspense>
                } />
            </Routes>
        </div>
    )
}