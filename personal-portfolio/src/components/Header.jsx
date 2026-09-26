import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { smoothScrollTo } from '../App'

export function Explanation () {
      return <>
          <i className = "fa-solid fa-question"></i>
          <i className = "fa-solid fa-question absolute duplicate"></i>
      </>
  }

export const Glass = forwardRef(function Glass ({ as: Tag = 'div', distort = true, className = '', children, ...rest }, ref) {
    return <Tag ref = { ref } className = { `glass ${ className }` } { ...rest }>
        { distort && <div className = 'in-w in-h absolute glass-distort'></div> }
        { children }
    </Tag>
})

export function Trail ({ once = false , children}) {
    const trail = once ? 'trail-once' : 'trail'
    const wrapper = once ? 'trail-wrapper-once' : 'trail-wrapper'
    return <div className = { `${ wrapper } absolute` }>
        <div className = { `${ trail } absolute` }></div>
        { children }
    </div>
}

export function Clarity ({ text, children, icon, className = '', tabIndex, onClick, ...rest }) {
    const focusable = tabIndex !== undefined
    function handleKeyDown (e) {
        if (!onClick) return
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault()
            onClick(e)
        }
    }

    function handleMouseDown (e) { e.preventDefault() }

    return <div className = { `clarity relative ${ className }` } onClick = { onClick } { ...rest }>
        <Glass
            className = 'round center square relative'
            { ...(focusable ? { tabIndex, 'data-keep-tabbable': true, onKeyDown: handleKeyDown, onMouseDown: handleMouseDown } : {}) }
        >
            { icon || <Explanation/> }
            <div className = 'lin-grad-tran-hack round absolute'></div>
        </Glass>
        { (text || children) && <Glass className = 'explanation-tooltip absolute'>
            { children ? children : <span className = 'relative center nowrap'>{ text }</span> }
        </Glass> }
    </div>
}

export function useWidthCheck (query = '(min-width: 1024.1px)') {
    const [matches, setMatches] = useState(
        () => window.matchMedia(query).matches
    )

    useEffect(() => {
        const mql = window.matchMedia(query)
        setMatches(mql.matches)
        const handleChange = (e) => setMatches(e.matches)
        mql.addEventListener('change', handleChange)
        return () => mql.removeEventListener('change', handleChange)
    }, [query])

    return matches
}

export default function Header ({ menuOpen = false, onToggleMenu }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isHome, setIsHome] = useState(true)
    const [navPushed, setNavPushed] = useState(false)
    const ratios = useRef({})
    const navRef = useRef(null)
    const navPushTimer = useRef(null)
    const hamburgerRef = useRef(null)
    const drawerRef = useRef(null)
    const location = useLocation()
    const isDesktop = useWidthCheck()
    const options = { threshold: Array.from({ length: 6 }, (_, i) => i * 0.2) }

    function handleNavClick (e, id) {
        e.preventDefault()
        smoothScrollTo(`#${ id }`)
    }

    useEffect(() => {
        if (location.pathname !== '/') {
            setIsHome(true)
            return
        }

        const identifiers = ['hero', 'work', 'about', 'contact']
        const sections = identifiers.map(id => document.getElementById(id)).filter(Boolean)

        ratios.current = {}

        const observer = new IntersectionObserver (
            (entries) => {
                entries.forEach(entry => ratios.current[entry.target.id] = entry.intersectionRatio)
                let bestId = null
                let bestRatio = 0
                identifiers.forEach(id => {
                    const ratio = ratios.current[id] || 0
                    if (ratio > bestRatio) {
                        bestRatio = ratio
                        bestId = id
                    }
                })

                if (bestId) {
                    const index = identifiers.indexOf(bestId)
                    if (index === 0) {
                        setIsHome(true)
                    } else {
                        setIsHome(false)
                        setActiveIndex(index - 1)
                    }
                }
            }, options
        )

        sections.forEach((section) => observer.observe(section))

        return () => observer.disconnect()
    }, [location.pathname])

    useEffect(() => {
        if (location.pathname !== '/') return

        const headerEls = new Map(
            [
                ['work', document.querySelector('#work .section-header')],
                ['about', document.querySelector('#about .section-header')]
            ].filter(([, el]) => el)
        )

        if (headerEls.size === 0) return

        const idByEl = new Map([...headerEls].map(([id, el]) => [el, id]))

        let observer

        function setup () {
            if (observer) observer.disconnect()

            const navEl = navRef.current
            if (!navEl) return
            const rect = navEl.getBoundingClientRect()

            if (rect.width === 0 || rect.height === 0) {
                setNavPushed(false)
                return
            }

            const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
            const lead = remPx * 1

            const top = Math.max(0, rect.top - lead)
            const bottom = Math.max(0, window.innerHeight - (rect.bottom + lead))
            const intersecting = {}

            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        const id = idByEl.get(entry.target)
                        if (id) intersecting[id] = entry.isIntersecting
                    })

                    const nextPushed = Object.values(intersecting).some(Boolean)
                    clearTimeout(navPushTimer.current)
                    navPushTimer.current = setTimeout(() => setNavPushed(nextPushed), 180)
                },
                { ...options, rootMargin: `-${ top }px 0px -${ bottom }px 0px` }
            )
            headerEls.forEach(el => observer.observe(el))
        }

        setup()
        window.addEventListener('resize', setup)

        return () => {
            if (observer) observer.disconnect()
            window.removeEventListener('resize', setup)
            clearTimeout(navPushTimer.current)
        }
    }, [location.pathname])

    const headerRef = useRef(null)

    useEffect(() => {
        const el = headerRef.current
        if (!el) return
        const root = document.documentElement
        let last = null
        function publish () {
            const drawer = drawerRef.current
            const rect = el.getBoundingClientRect()
            const fixed = getComputedStyle(el).position === 'fixed'
            const h = (fixed ? rect.bottom : rect.height) - (drawer ? drawer.getBoundingClientRect().height : 0)
            if (!h || h === last) return
            last = h
            root.style.setProperty('--header-h', `${ h }px`)
        }
        publish()
        const ro = new ResizeObserver(publish)
        ro.observe(el)
        window.addEventListener('resize', publish)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', publish)
        }
    }, [])

    return <header ref = { headerRef } className = "flex">
        <div className = 'header-glass absolute none' aria-hidden = 'true'></div>
        <section className = "flex gap-xlg">
            { location.pathname !== '/' && <Link
                to = '/'
                className = 'back-button'
                tabIndex = { 0 }
                data-keep-tabbable
            >
                <Clarity icon = { <i className = "fa-solid fa-arrow-left"></i> }/>
            </Link> }
            <div className = 'column gap-md'>
                <span className = "nowrap">Hermes E.</span>
                <span className = "nowrap">Frontend Developer</span>
            </div>
        </section>
        <Glass as = 'nav' ref = { navRef } className = { `center flex ${ navPushed ? 'nav-pushed' : '' }` }>
                <ul className = { `flex in-w in-h relative ${ location.pathname === '/beyond' ? 'hide' : '' }` }>
                    <li className = 'center block in-w in-h'>
                        <a
                            href = '#work'
                            className = { `pointer center relative in-w in-h ${ !isHome && activeIndex === 0 ? 'active' : '' }` }
                            tabIndex = { isDesktop && location.pathname !== '/beyond' ? 0 : -1 }
                            data-keep-tabbable
                            onClick = { (e) => handleNavClick(e, 'work') }
                        >Work</a>
                    </li>
                    <li className = 'center block in-w in-h'>
                        <a
                            href = '#about'
                            className = { `pointer center relative in-w in-h ${ !isHome && activeIndex === 1 ? 'active' : '' }` }
                            tabIndex = { isDesktop && location.pathname !== '/beyond' ? 0 : -1 }
                            data-keep-tabbable
                            onClick = { (e) => handleNavClick(e, 'about') }
                        >About</a>
                    </li>
                    <li className = 'center block in-w in-h'>
                        <a
                            href = '#contact'
                            className = { `pointer center relative in-w in-h ${ !isHome && activeIndex === 2 ? 'active' : '' }` }
                            tabIndex = { isDesktop && location.pathname !== '/beyond' ? 0 : -1 }
                            data-keep-tabbable
                            onClick = { (e) => handleNavClick(e, 'contact') }
                        >Hello?</a>
                    </li>
                    <Glass className = { `slider absolute in-h ${ isHome ? 'hide' : '' }` }
                        style = {{
                            transform: `translateX(${ activeIndex * 100 }%)`,
                        }}
                    >
                        <Trail once = { false }/>
                    </Glass>
                </ul>
                <Glass
                    as = 'div'
                    className = 'skip absolute center'
                    tabIndex = { isDesktop ? 0 : -1 }
                    data-keep-tabbable
                >
                    <ul className = 'column'>
                        <li className = 'relative'>
                            <a
                                className = 'block pointer nowrap'
                                href = 'https://www.figma.com/'
                                target = '_blank'
                                rel = 'noopener noreferrer'
                                tabIndex = { isDesktop ? 0 : -1 }
                                data-keep-tabbable
                            >Skip to Design Blueprints</a>
                            <i className = 'fa-brands fa-figma absolute'></i>
                        </li>
                        <li className = 'relative'>
                            <a
                                className = 'block pointer nowrap'
                                href = 'https://github.com/'
                                target = '_blank'
                                rel = 'noopener noreferrer'
                                tabIndex = { isDesktop ? 0 : -1 }
                                data-keep-tabbable
                            >Skip to Frontend Builds</a>
                            <i className = 'fa-brands fa-github absolute'></i>
                        </li>
                        <li className = 'relative'>
                            <a
                                className = 'block pointer nowrap'
                                href = 'https://www.linkedin.com/in/ifechukwu-emmanuel-ibeneme/details/certifications/'
                                target = '_blank'
                                rel = 'noopener noreferrer'
                                tabIndex = { isDesktop ? 0 : -1 }
                                data-keep-tabbable
                            >Skip to Certifications</a>
                            <i className = 'fa-brands fa-linkedin-in absolute'></i>
                        </li>
                    </ul>
                </Glass>
            </Glass>
        <a
            href = '#'
            className = { `home ${ isHome ? 'none' : '' }` }
            tabIndex = { !isHome ? 0 : -1 }
            data-keep-tabbable
            onClick = { (e) => { e.preventDefault(); smoothScrollTo(0) } }
        >
            <Clarity text = 'To Top' icon = { <i className = 'fa-solid fa-chevron-up'></i> }/>
        </a>
        <section className = "flex status center gap-lg">
            <div className = "round square pulse relative">
                <div className = "in-w in-h round absolute  ctr-abs-x"></div>
                <div className = "in-w in-h round relative"></div>
            </div>
            <span className = 'block'>Available</span>
            <Clarity text = 'Availability Status' tabIndex = { (!isDesktop || isHome) ? 0 : -1 }/>
        </section>
        { location.pathname === '/' && (
            <button
                ref = { hamburgerRef }
                type = 'button'
                className = { `hamburger-menu none ${ menuOpen ? 'active' : '' }` }
                aria-label = { menuOpen ? 'Close menu' : 'Open menu' }
                aria-expanded = { menuOpen }
                tabIndex = { 0 }
                data-keep-tabbable
                onClick = { () => onToggleMenu && onToggleMenu(!menuOpen) }
            >
                <div className = 'hamburger gap-md column center in-w in-h absolute pointer' >
                    <div className = "bar"></div>
                    <div className = "bar"></div>
                </div>
            </button>
        ) }
        { location.pathname === '/' && (
            <div
                ref = { drawerRef }
                className = { `hamburger-drawer none ${ menuOpen ? 'active' : '' }` }
                aria-hidden = { !menuOpen }
            >
                <div className = 'hamburger-slot'></div>
            </div>
        ) }
    </header>
}