import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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

const Beyond = lazy(() => import('./components/Beyond'))

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const scrollNormalizer = ScrollTrigger.normalizeScroll({ allowNestedScroll: true })

export function smoothScrollTo (target, opts = {}) {
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
    gsap.to(window, {
        duration: .375,
        ease: 'power2.inOut',
        scrollTo: { y: target, offsetY: remPx * 3 },
        ...opts
    })
}

export function Inter ({ text }) {
    const containerRef = useRef(null)
    const spanRef = useRef(null)
    const timeoutRef = useRef(null)

    useGSAP(() => {
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
            trigger: containerRef.current,
            start: 'top bottom',
            end: () => `+=${ window.innerHeight * 2.5 }`,
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
                trigger: containerRef.current,
                start: 'top top',
                end: '+=75%',
                scrub: 1,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                preventOverlaps: 'inter-fade',
                onEnter: softenLanding,
                onEnterBack: softenLanding
            }
        })

        tl.to(containerRef.current, {
            height: 0,
            ease: 'none',
            duration: 1
        }, 0)
        .fromTo(spanRef.current,
            { opacity: 1 },
            {
                opacity: 0,
                ease: 'none',
                duration: 0.25
            }, 0.125)
    }, { scope: containerRef })

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    return <div ref = { containerRef } className = 'inter relative in-w'>
        <span ref = { spanRef } data-text = { text } className = 'absolute emphasis'>{ text }</span>
    </div>
}

function Home ({ menuOpen, closeMenu }) {
    const [recentsOpen, setRecentsOpen] = useState(false)
    const openRecents = () => setRecentsOpen(true)

    return <>
        <HamburgerMenu isOpen = { menuOpen } onClose = { closeMenu } onOpenRecents = { openRecents }/>
        <Hero onOpenRecents = { openRecents } recentsOpen = { recentsOpen }/>
        <Inter text = 'WORK'/>
        <Work onOpenRecents = { openRecents }/>
        <Inter text = 'ABOUT'/>
        <About/>
        <Inter text = 'HELLO'/>
        <Contact/>
        <Recents isOpen = { recentsOpen } onClose = { () => setRecentsOpen(false) }/>
    </>
}

export default function App () {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuOpenRef = useRef(menuOpen)
    const { pathname } = useLocation()
    const isDesktop = useWidthCheck()
    const showGearsBg = useWidthCheck('(min-width: 550.1px)')

    function closeMenu () {
        setMenuOpen(false)
    }

    useEffect(() => {
        if (!isDesktop) return
        return disable()
    }, [isDesktop])

    useEffect(() => { setMenuOpen(false) }, [pathname])
    useEffect(() => { menuOpenRef.current = menuOpen }, [menuOpen])
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
            { showGearsBg && <GearsBackground/> }
            <Header menuOpen = { menuOpen } onToggleMenu = { setMenuOpen }/>
            <Routes>
                <Route path = '/' element = { <Home menuOpen = { menuOpen } closeMenu = { closeMenu }/> } />
                <Route path = '/beyond' element = {
                    <Suspense fallback = { <div className = 'loading-screen absolute center in-w in-h'>Loading…</div> }>
                        <Beyond/>
                    </Suspense>
                } />
            </Routes>
        </div>
    )
}