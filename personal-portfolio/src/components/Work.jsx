import { Fragment, memo, useEffect, useRef, useState } from 'react'

import { Clarity, Glass, Trail } from './Header'
import { Bar, Idea } from './Hero'
import Inspect from './Inspect'
import { getRecentItems } from './Recents'

import blender from '../assets/external-icons/blender.png'
import bootstrap from '../assets/external-icons/bootstrap.png'
import css from '../assets/external-icons/css.png'
import figma from '../assets/external-icons/figma.png'
import git from '../assets/external-icons/git.png'
import html from '../assets/external-icons/html.png'
import javascript from '../assets/external-icons/javascript.png'
import react from '../assets/external-icons/react.png'
import tailwind from '../assets/external-icons/tailwind.png'
import three from '../assets/external-icons/three.png'
import typescript from '../assets/external-icons/typescript.png'
import vsc from '../assets/external-icons/vsc.png'

import face from '../assets/face.png'
import gears from '../assets/gears.png'

export function SectionHeader (props) {
    const temp = props.title
    return <div className = 'section-header in-w'><span>{ props.symbol }</span>{ temp.toUpperCase() }</div>
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
    const stack = [
        { icon: blender, text: 'Blender' },
        { icon: bootstrap, text: 'Bootstrap' },
        { icon: css, text: 'Cascading Stylesheet' },
        { icon: figma, text: 'Figma' },
        { icon: git, text: 'Git' },
        { icon: html, text: 'Hyper Text Markup Language' },
        { icon: javascript, text: 'JavaScript' },
        { icon: react, text: 'React' },
        { icon: tailwind, text: 'Tailwind' },
        { icon: three, text: 'Three.js' },
        { icon: typescript, text: 'TypeScript' },
        { icon: vsc, text: 'Visual Studio Code' }
    ]

    const projects = [
        {
            title: 'Personal Portfolio',
            text: '<p><span>You are here!</span> E&shy;ssen&shy;tia&shy;lly has all of my public pro&shy;fe&shy;ssio&shy;nal data.</p>',
            src: 'personal-portfolio-react-lime.vercel.app/',
            figma: '',
            mobileImage: null,
            notes: '<p>Tools employed include <span>HTML5</span> + <span>CSS3</span> + <span>React JavaScript</span>. <span>Git</span> for version control. <span>Blender</span> and <span>Three.js</span> for 3D asset in hero section. Demonstrated understanding of <a href = "https://en.wikipedia.org/wiki/React_(software)#Hooks" target = "_blank">hooks</a>, <a href = "https://en.wikipedia.org/wiki/Routing" target = "_blank">routing</a>, and complex styling such as <a href = "https://en.wikipedia.org/wiki/Mask_(computing)" target = "_blank">mask subtraction</a>, and <a href = "https://en.wikipedia.org/wiki/Filter_(graphics)" target = "_blank">glass filters</a>.</p>',
            github: 'personal-portfolio',
            tags: 'site',
            date: '2026-08-15'
        }
    ]

    const testimonials = [
        {
            img: face,
            quote: "I did great — If I do say so myself. Seriously though, I'm working on getting more testimonials.",
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

    const firstSix = stack.slice(6)
    const rest = stack.slice(0, 6)

    const [visible, setVisible] = useState(false)
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

    return <section id = 'work' ref = { workRef } className = 'column center relative'>
        <SectionHeader symbol = '\\' title = 'work' />
        <article className = 'content center column gap-lg relative'>
            <span className = 'center block'>Turning complex ideas into sharp, functional interfaces — one dedicated build at a time.</span>
            <div
                className = 'stack-wrapper gap-lg relative column in-w'
                onMouseEnter = { () => setVisible(true) }
                onMouseLeave = { () => setVisible(false) }
                onFocus = { () => setVisible(true) }
                onBlur = { (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setVisible(false) } }
                tabIndex = { inView ? 0 : -1 } data-keep-tabbable
            >
                <ul className = 'stack-first flex gap-lg in-w'>
                    { rest.map(item => {
                        return <li className = 'center square relative' key = { item.text }>
                            <img
                                src = { item.icon }
                                alt = { item.text }
                                className = 'in-w in-h'
                            />
                            <Glass className = 'explanation-tooltip absolute nowrap'>
                                <span className = 'relative center'>{ item.text }</span>
                            </Glass>
                        </li>
                    }) }
                </ul>
                <div className = { `stack-ellipsis absolute round ${ visible ? 'hidden' : '' }` }></div>
                <div className = { `stack-rest-shell in-w ${ visible ? 'visible' : '' }` }>
                    <ul className = { `stack-rest flex gap-lg in-w ${ visible ? 'visible' : '' }` }>
                        { firstSix.map(item => {
                            return <li className = 'center square relative' key = { item.text }>
                                <img
                                    src = { item.icon }
                                    alt = { item.text }
                                    className = 'in-w in-h'
                                />
                                <Glass className = 'explanation-tooltip absolute nowrap'>
                                    <span className = 'relative center'>{ item.text }</span>
                                </Glass>
                            </li>
                        }) }
                    </ul>
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
            <section className = 'flex count gap-xlg center in-w'>
                <span className = 'relative'>Curated and not exhaustive</span>
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