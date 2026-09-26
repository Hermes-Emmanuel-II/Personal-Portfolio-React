import { memo, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Glass, Trail } from './Header'
import { Idea } from './Hero'
import { SectionHeader } from './Work'

import analytics from '../assets/external-icons/analytics.png'
import blender from '../assets/external-icons/blender.png'
import figma from '../assets/external-icons/figma.png'
import hotjar from '../assets/external-icons/hotjar.png'
import illustrator from '../assets/external-icons/illustrator.png'
import maze from '../assets/external-icons/maze.png'
import miro from '../assets/external-icons/miro.png'
import react from '../assets/external-icons/react.png'
import vsc from '../assets/external-icons/vsc.png'

import background from '../assets/motion.png'
import car from '../assets/car.png'
import face from '../assets/face.png'

export function Subhead ({ title }) {
    return <div className = 'subhead in-w center gap-lg'>
        <span className = 'block'>{ title }</span>
        <div className = 'in-w bar-x'></div>
    </div>
}

function CaretIcon () {
    return (
        <svg viewBox = '64 0 192 512' xmlns = 'http://www.w3.org/2000/svg'>
            <path fill = 'currentColor' d = 'M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z'/>
        </svg>
    )
}

export function CompletionRing ({ duration, relative = false, onIteration }) {
    return <div
        className = { `completion-ring square round ${ relative ? 'relative' : 'absolute' }` }
        style = {{ animation: `sweep ${ duration }ms linear infinite` }}
        onAnimationIteration = { onIteration }
        aria-hidden = 'true'
    ></div>
}

const services = [
    {
        service: 'Frontend Development',
        text: 'I create custom web designs, then actualise them using HTML, CSS, and JavaScript. React/TypeScript.',
        one: figma,
        two: react,
        three: vsc
    },
    {
        service: 'User Experience Design',
        text: 'I craft appealing and responsive layouts that align with your brand identity and look beautiful on any screen size.',
        one: figma,
        two: maze,
        three: miro
    },
    {
        service: 'User Interface Design',
        text: 'I craft appealing and responsive layouts that align with your brand identity and look beautiful on any screen size.',
        one: blender,
        two: figma,
        three: illustrator
    },
    {
        service: 'UX Auditing',
        text: 'I probe your digital product for friction points, then provide fixes to boost user satisfaction and retention.',
        one: analytics,
        two: figma,
        three: hotjar
    }
]

const workflow = [
    {
        title: 'Discovery × UX Strategy',
        text: 'I start by understanding your goals and users. Through user research and mapping user flows, I define a foundation to ensure the final product is user-centric and effective.',
        eli5: 'I ask questions and watch how people use things, so I know exactly what to build before I build it.'
    },
    {
        title: 'UI Design × UX Prototyping',
        text: 'Before writing code, I design the look and feel of your interface. By creating interactive prototypes, we can test the user experience and refine it early on.',
        eli5: 'I draw the app on a computer first, like a blueprint, then make it pretty and easy to use.'
    },
    {
        title: 'Architecture × Development',
        text: 'This is where I build the frontend using clean, modular, and scalable code. My component-based approach ensures your project is easy to update and expand down the road.',
        eli5: 'I turn the drawing into a real, working website using code.'
    },
    {
        title: 'Integration × Quality Assurance',
        text: 'I connect the frontend to your backend services and thoroughly test the application across different browsers and devices to guarantee a seamless, bug-free experience.',
        eli5: 'I test everything, fix any bugs, then hand you the finished website.'
    },
    {
        title: 'Deployment × Optimization',
        text: 'Finally, I launch your project on a reliable hosting service and optimize it for speed. The job doesn\'t stop at launch. I continue to refine the performance based on real-world feedback.',
        eli5: 'I put the website online and make sure it loads fast for everyone.'
    }
]

const beyondPreviews = [
    { img: '', label: 'Hermes on X' },
    { img: '', label: 'Activity on LinkedIn' },
    { img: '', label: 'Behance Perhaps?' }
]

const BEYOND_PREVIEW_CYCLE_MS = 10000

function About () {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [panelPhase, setPanelPhase] = useState('')
    const [primed, setPrimed] = useState(false)
    const [resetSeq, setResetSeq] = useState(0)
    const [beyondPreviewIndex, setBeyondPreviewIndex] = useState(0)

    const justSettledIndexRef = useRef(null)
    const transitionSeqRef = useRef(0)

    const cycle = 15000
    const PANEL_MS = 1200
    const CYCLE_REST_FRACTION = 0.16
    const ICON_TRANSITION_MS = 800
    const ICON_STAGGER_MS = 200

    useEffect(() => {
        const interval = setInterval(() => {
            setBeyondPreviewIndex(prev => (prev + 1) % beyondPreviews.length)
        }, BEYOND_PREVIEW_CYCLE_MS)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleVisibility () {
            if (document.visibilityState === 'visible') {
                justSettledIndexRef.current = null
                setResetSeq(seq => seq + 1)
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [])

    function panelClass (axis) {
        if (panelPhase === 'out') return `panel-slide-out-${ axis }`
        if (panelPhase === 'in') return `panel-slide-in-${ axis }`
        return ''
    }

    function iconStyle (position) {
        if (panelPhase === 'out') {
            const delay = (position - 1) * ICON_STAGGER_MS
            return { animation: `services-icon-click-out ${ ICON_TRANSITION_MS }ms ease-in ${ delay }ms forwards` }
        }
        if (panelPhase === 'in') {
            const delay = (3 - position) * ICON_STAGGER_MS
            return { animation: `services-icon-click-in ${ ICON_TRANSITION_MS }ms ease-out ${ delay }ms both` }
        }

        if (justSettledIndexRef.current === currentIndex) {
            const remainderMs = cycle * (1 - CYCLE_REST_FRACTION)
            const leadMultiplier = position === 1 ? 1.5 : position === 2 ? 1.25 : 1
            const delay = remainderMs - PANEL_MS * leadMultiplier
            return { animation: `services-icon-click-out ${ PANEL_MS }ms ease-in ${ delay }ms both` }
        }
        return undefined
    }

    function panelStyle () {
        if (panelPhase === '' && primed) return { animationDelay: `-${ cycle * CYCLE_REST_FRACTION }ms` }
        return undefined
    }

    function changeService (direction) {
        if (isTransitioning) return
        transitionSeqRef.current += 1
        setIsTransitioning(true)
        setPanelPhase('out')
        setTimeout(() => {
            const nextIndex = (currentIndex + direction + services.length) % services.length
            setCurrentIndex(nextIndex)
            setPanelPhase('in')
            setTimeout(() => {
                setPanelPhase('')
                setPrimed(true)
                justSettledIndexRef.current = nextIndex
                setIsTransitioning(false)
            }, PANEL_MS)
        }, PANEL_MS)
    }

    function advanceService () { changeService(1) }

    function regressService () { changeService(-1) }

    function autoAdvanceService () {
        if (isTransitioning) return
        justSettledIndexRef.current = null
        setCurrentIndex(prevIndex => (prevIndex + 1) % services.length)
    }

    const [arr, setArr] = useState([...Array(3).fill(currentIndex)])
    const [explain, setExplain] = useState(false)
    const [workflowIndex, setWorkflowIndex] = useState(0)

    function changeWorkflow (direction) {
        setWorkflowIndex(prev => (prev + direction + workflow.length) % workflow.length)
    }

    function advanceWorkflow () { changeWorkflow(1) }

    function regressWorkflow () { changeWorkflow(-1) }

    function autoAdvanceWorkflow () {
        setWorkflowIndex(prev => (prev + 1) % workflow.length)
    }

    const aboutRef = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = aboutRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: [0, 0.1] }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const analyticsTabsRef = useRef(null)
    const analyticsTabItemRefs = useRef([])
    const [analyticsTabsFit, setAnalyticsTabsFit] = useState([])

    const analyticsActionsRef = useRef(null)
    const analyticsActionItemRefs = useRef([])
    const [analyticsActionsFit, setAnalyticsActionsFit] = useState([])

    useEffect(() => {
        function measureRow (rowRef, itemRefs, setFit) {
            const row = rowRef.current
            if (!row) return
            const rowRight = row.getBoundingClientRect().right
            setFit(
                itemRefs.current.map(el => !el || el.getBoundingClientRect().right <= rowRight + 0.5)
            )
        }

        function measureAll () {
            measureRow(analyticsTabsRef, analyticsTabItemRefs, setAnalyticsTabsFit)
            measureRow(analyticsActionsRef, analyticsActionItemRefs, setAnalyticsActionsFit)
        }

        measureAll()

        const observer = new ResizeObserver(measureAll)
        if (analyticsTabsRef.current) observer.observe(analyticsTabsRef.current)
        if (analyticsActionsRef.current) observer.observe(analyticsActionsRef.current)
        analyticsTabItemRefs.current.forEach(el => el && observer.observe(el))
        analyticsActionItemRefs.current.forEach(el => el && observer.observe(el))

        document.fonts.ready.then(measureAll)
        const rafId = requestAnimationFrame(measureAll)
        window.addEventListener('resize', measureAll)

        return () => {
            observer.disconnect()
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', measureAll)
        }
    }, [])

    return <section id = 'about' ref = { aboutRef } className = 'column center relative'>
        <SectionHeader symbol = '//' title = 'about'/>
        <article className = 'content relative column gap-lg'>
            <article className = 'relative block'>
                <div className = 'square center relative'>
                    <img src = { face } alt = 'Profile Photo' className = 'square block'/>
                    <div className = 'crosshair-orbit absolute square'>
                        <i className = 'fa-solid fa-gear absolute'></i>
                    </div>
                </div>
                <p><span>Hello! I'm Ifechukwu</span> — <span>Hermes</span> works too. I'm a UI/UX Designer with over a year of professional frontend web development experience under my belt.</p>
                <p>While my work is driven by creativity, my signature is <span>pixel-level pre&shy;ci&shy;sion</span> — a manifestation of my perfectionism? Maybe. But it ensures that every design is translated flawlessly into code.</p>
                <p>My self-taught foundation has instilled in me quite the resilience and knack for rapid technological adaptation.</p>
            </article>
            <Subhead title = 'services'/>
            <div className = 'center services-wrapper gap-lg'>
                <section key = { resetSeq } className = 'services flex relative' style = {{ '--cycle': `${ cycle }ms` }}>
                    <section className = 'column gap relative'>
                        <span>{ services[currentIndex].service }</span>
                        <p className = 'block in-h'>{ services[currentIndex].text }</p>
                        <div className = 'flex gap'>
                            <img className = 'square' key = { `${ currentIndex }-one-${ transitionSeqRef.current }` } src = { services[currentIndex].one } style = { iconStyle(1) }/>
                            <img className = 'square' key = { `${ currentIndex }-two-${ transitionSeqRef.current }` } src = { services[currentIndex].two } style = { iconStyle(2) }/>
                            <img className = 'square' key = { `${ currentIndex }-three-${ transitionSeqRef.current }` } src = { services[currentIndex].three } style = { iconStyle(3) }/>
                        </div>
                    </section>
                    <section className = 'relative'>
                        <div className = { `${ panelClass('x') } relative` } style = { panelStyle() }>
                            <div className = { `service-panel analytics in-w in-h column nowrap ${ currentIndex == 3 ? 'active' : '' }` }>
                                <div className = 'analytics-chrome column in-w'>
                                    <div className = 'analytics-chrome-tabs flex'>
                                        <span className = 'analytics-tab-search center'><i className = 'fa-solid fa-chevron-down'></i></span>
                                        <div className = 'analytics-chrome-tab active flex relative'>
                                            <span className = 'analytics-favicon square'></span>
                                            <span className = 'analytics-tab-title nowrap'>Audience Overview</span>
                                            <span className = 'analytics-chrome-close'>×</span>
                                        </div>
                                        <div className = 'analytics-chrome-tab flex relative'>
                                            <span className = 'analytics-favicon google square round'></span>
                                            <span className = 'analytics-tab-title nowrap'>Google</span>
                                            <span className = 'analytics-chrome-close'>×</span>
                                        </div>
                                        <span className = 'analytics-chrome-add'>+</span>
                                        <div className = 'analytics-window-controls flex'>
                                            <i className = 'fa-solid fa-minus'></i>
                                            <i className = 'fa-regular fa-square'></i>
                                            <i className = 'fa-solid fa-xmark'></i>
                                        </div>
                                    </div>
                                    <div className = 'analytics-chrome-bar flex center gap-md'>
                                        <i className = 'fa-solid fa-arrow-left'></i>
                                        <i className = 'fa-solid fa-arrow-right'></i>
                                        <i className = 'fa-solid fa-rotate-right'></i>
                                        <div className = 'analytics-url flex center'>
                                            <i className = 'fa-solid fa-sliders'></i>
                                            <span className = 'nowrap'></span>
                                            <i className = 'fa-regular fa-star analytics-star'></i>
                                        </div>
                                        <span className = 'analytics-avatar round square'></span>
                                        <i className = 'fa-solid fa-ellipsis-vertical'></i>
                                    </div>
                                </div>
                                <ul className = 'analytics-tabs flex gap-lg' ref = { analyticsTabsRef }>
                                    <li ref = { el => { analyticsTabItemRefs.current[0] = el } } style = { analyticsTabsFit[0] === false ? { visibility: 'hidden' } : undefined }>Home</li>
                                    <li ref = { el => { analyticsTabItemRefs.current[1] = el } } style = { analyticsTabsFit[1] === false ? { visibility: 'hidden' } : undefined }>Reporting</li>
                                    <li ref = { el => { analyticsTabItemRefs.current[2] = el } } style = { analyticsTabsFit[2] === false ? { visibility: 'hidden' } : undefined }>Customization</li>
                                    <li ref = { el => { analyticsTabItemRefs.current[3] = el } } style = { analyticsTabsFit[3] === false ? { visibility: 'hidden' } : undefined }>Admin</li>
                                </ul>
                                <div className = 'analytics-body in-w relative flex'>
                                    <div className = 'analytics-rail'>◂</div>
                                    <div className = 'analytics-report'>
                                        <div className = 'analytics-title emphasis'>Audience Overview</div>
                                        <ul className = 'analytics-actions flex gap emphasis' ref = { analyticsActionsRef }>
                                            <li ref = { el => { analyticsActionItemRefs.current[0] = el } } style = { analyticsActionsFit[0] === false ? { visibility: 'hidden' } : undefined }>Email</li>
                                            <li ref = { el => { analyticsActionItemRefs.current[1] = el } } style = { analyticsActionsFit[1] === false ? { visibility: 'hidden' } : undefined }>Export</li>
                                            <li ref = { el => { analyticsActionItemRefs.current[2] = el } } style = { analyticsActionsFit[2] === false ? { visibility: 'hidden' } : undefined }>▾</li>
                                            <li ref = { el => { analyticsActionItemRefs.current[3] = el } } style = { analyticsActionsFit[3] === false ? { visibility: 'hidden' } : undefined }>Add to Dashboard</li>
                                            <li ref = { el => { analyticsActionItemRefs.current[4] = el } } style = { analyticsActionsFit[4] === false ? { visibility: 'hidden' } : undefined }>Shortcut</li>
                                        </ul>
                                        <div className = 'analytics-segments flex gap-md'>
                                            <div className = 'analytics-segment center gap-md'>
                                                <div className = 'analytics-segment-icon round square center in-h'>
                                                    <div className = 'round square'></div>
                                                </div>
                                                <div className = 'analytics-segment-text column'>
                                                    <span className = 'emphasis'>All Users</span>
                                                    <span>100.00% Sessions</span>
                                                </div>
                                            </div>
                                            <div className = 'analytics-segment add center gap-md'>
                                                <div className = 'analytics-segment-icon round square center in-h'>
                                                    <div className = 'round square'></div>
                                                </div>
                                                <div className = 'analytics-segment-text column'>
                                                    <span>+ Add Segment</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className = { `service-panel blender in-w in-h relative ${ currentIndex == 2 ? 'active' : '' }` }>
                                <img className = 'blender-render absolute' src = { car }/>
                                <div className = 'blender-topbar absolute in-w flex'>
                                    <i className = 'fa-solid fa-circle-nodes blender-logo'></i>
                                    <ul className = 'blender-menu-bar flex gap-md'>
                                        <li>File</li>
                                        <li>Edit</li>
                                        <li>Render</li>
                                        <li>Window</li>
                                        <li>Help</li>
                                    </ul>
                                    <ul className = 'blender-workspaces flex'>
                                        <li>Layout</li>
                                        <li>Modeling</li>
                                        <li>Shading</li>
                                    </ul>
                                    <div className = 'blender-scene flex center'>
                                        <i className = 'fa-solid fa-film'></i>
                                        <span className = 'nowrap'>Scene</span>
                                    </div>
                                </div>
                                <div className = 'blender-viewport-header absolute flex center gap-md'>
                                    <div className = 'blender-mode flex center'>
                                        <i className = 'fa-solid fa-cube'></i>
                                        <span className = 'nowrap'>Object Mode</span>
                                        <i className = 'fa-solid fa-caret-down'></i>
                                    </div>
                                    <ul className = 'blender-view-menu flex gap-md'>
                                        <li>View</li>
                                        <li>Select</li>
                                        <li>Add</li>
                                        <li>Object</li>
                                    </ul>
                                    <div className = 'blender-shading flex'>
                                        <span className = 'round square'></span>
                                        <span className = 'round square'></span>
                                        <span className = 'round square active'></span>
                                        <span className = 'round square'></span>
                                    </div>
                                </div>
                                <div className = 'blender-side absolute column'>
                                    <div className = 'blender-outliner column'>
                                        <div className = 'blender-outliner-bar flex center'>
                                            <i className = 'fa-solid fa-bars'></i>
                                            <span className = 'nowrap'>Scene Collection</span>
                                            <i className = 'fa-solid fa-magnifying-glass'></i>
                                        </div>
                                        <ul className = 'blender-tree column'>
                                            <li className = 'flex center'>
                                                <i className = 'fa-solid fa-caret-down'></i>
                                                <i className = 'fa-regular fa-folder'></i>
                                                <span className = 'nowrap'>Collection</span>
                                                <i className = 'fa-regular fa-eye'></i>
                                            </li>
                                            <li className = 'flex center depth-1'>
                                                <i className = 'fa-solid fa-video'></i>
                                                <span className = 'nowrap'>Camera</span>
                                                <i className = 'fa-regular fa-eye'></i>
                                            </li>
                                            <li className = 'flex center depth-1 active'>
                                                <i className = 'fa-solid fa-cube'></i>
                                                <span className = 'nowrap'>Car</span>
                                                <i className = 'fa-regular fa-eye'></i>
                                            </li>
                                            <li className = 'flex center depth-1'>
                                                <i className = 'fa-regular fa-lightbulb'></i>
                                                <span className = 'nowrap'>Light</span>
                                                <i className = 'fa-regular fa-eye'></i>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className = 'blender-props flex'>
                                        <ul className = 'blender-prop-tabs column center'>
                                            <li className = 'active'><i className = 'fa-solid fa-wrench'></i></li>
                                            <li><i className = 'fa-solid fa-cube'></i></li>
                                            <li><i className = 'fa-solid fa-circle-half-stroke'></i></li>
                                            <li><i className = 'fa-solid fa-image'></i></li>
                                            <li><i className = 'fa-solid fa-gear'></i></li>
                                        </ul>
                                        <div className = 'blender-prop-body column'>
                                            <div className = 'blender-prop-head flex center'>
                                                <i className = 'fa-solid fa-caret-down'></i>
                                                <span className = 'nowrap'>Transform</span>
                                            </div>
                                            <div className = 'blender-field flex center'>
                                                <span className = 'nowrap'>Location X</span>
                                                <span className = 'nowrap'>0 m</span>
                                            </div>
                                            <div className = 'blender-field flex center'>
                                                <span className = 'nowrap'>Y</span>
                                                <span className = 'nowrap'>0 m</span>
                                            </div>
                                            <div className = 'blender-field flex center'>
                                                <span className = 'nowrap'>Z</span>
                                                <span className = 'nowrap'>0.42 m</span>
                                            </div>
                                            <div className = 'blender-prop-head flex center'>
                                                <i className = 'fa-solid fa-caret-down'></i>
                                                <span className = 'nowrap'>Rotation</span>
                                            </div>
                                            <div className = 'blender-field flex center'>
                                                <span className = 'nowrap'>X</span>
                                                <span className = 'nowrap'>0°</span>
                                            </div>
                                            <div className = 'blender-field flex center'>
                                                <span className = 'nowrap'>Z</span>
                                                <span className = 'nowrap'>30°</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className = 'blender-menu absolute column'>
                                    <div className = 'blender-search relative flex'>
                                        <span>🔎</span>
                                        <span>cam</span>
                                        <span>|</span>
                                    </div>
                                    <ul className = 'blender-results column'>
                                        <li>Add Camera</li>
                                        <li>Align Camera To Ctrl Alt Numpad 0</li>
                                        <li>Set Active Object a Ctrl Numpad 0</li>
                                        <li>Select Camera</li>
                                    </ul>
                                </div>
                            </div>
                            <div className = { `service-panel miro in-w in-h relative ${ currentIndex == 1 ? 'active' : '' }` }>
                                <div className = 'analytics-chrome column in-w'>
                                    <div className = 'analytics-chrome-tabs flex'>
                                        <span className = 'analytics-tab-search center'><i className = 'fa-solid fa-chevron-down'></i></span>
                                        <div className = 'analytics-chrome-tab active flex relative'>
                                            <span className = 'analytics-favicon square'></span>
                                            <span className = 'analytics-tab-title nowrap'>Miro - FlexFund</span>
                                            <span className = 'analytics-chrome-close'>×</span>
                                        </div>
                                        <div className = 'analytics-chrome-tab flex relative'>
                                            <span className = 'analytics-favicon google square round'></span>
                                            <span className = 'analytics-tab-title nowrap'>Google</span>
                                            <span className = 'analytics-chrome-close'>×</span>
                                        </div>
                                        <span className = 'analytics-chrome-add'>+</span>
                                        <div className = 'analytics-window-controls flex'>
                                            <i className = 'fa-solid fa-minus'></i>
                                            <i className = 'fa-regular fa-square'></i>
                                            <i className = 'fa-solid fa-xmark'></i>
                                        </div>
                                    </div>
                                    <div className = 'analytics-chrome-bar flex center gap-md'>
                                        <i className = 'fa-solid fa-arrow-left'></i>
                                        <i className = 'fa-solid fa-arrow-right'></i>
                                        <i className = 'fa-solid fa-rotate-right'></i>
                                        <div className = 'analytics-url flex center'>
                                            <i className = 'fa-solid fa-sliders'></i>
                                            <span className = 'nowrap'></span>
                                            <i className = 'fa-regular fa-star analytics-star'></i>
                                        </div>
                                        <span className = 'analytics-avatar round square'></span>
                                        <i className = 'fa-solid fa-ellipsis-vertical'></i>
                                    </div>
                                </div>
                                <div className = 'miro-grid absolute in-w in-h'></div>
                                <div className = 'miro-flow absolute flex center'>
                                    <div className = 'miro-frame column'>
                                        <span className = 'miro-frame-label nowrap'>01 · Cart</span>
                                        <div className = 'miro-card column'>
                                            <div className = 'miro-card-top in-w'>
                                                <span className = 'miro-brand emphasis'>FlexFund</span>
                                            </div>
                                            <span className = 'miro-heading emphasis in-w'>Review your cart</span>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>FlexFund Investment Portfolio</span>
                                                <span className = 'miro-row-sub nowrap'>Standard</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'>$500</span>
                                        </div>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>FlexFund Guidebook</span>
                                                <span className = 'miro-row-sub nowrap'>E-book</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'>$0</span>
                                        </div>
                                            <div className = 'miro-cta center emphasis'>Checkout</div>
                                            <ul className = 'miro-nav flex in-w'>
                                                <li>Home</li>
                                                <li>Pay</li>
                                                <li>History</li>
                                                <li>Profile</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <i className = 'fa-solid fa-arrow-right miro-arrow'></i>
                                    <div className = 'miro-frame column'>
                                        <span className = 'miro-frame-label nowrap'>02 · Payment</span>
                                        <div className = 'miro-card column'>
                                            <div className = 'miro-card-top in-w'>
                                                <span className = 'miro-brand emphasis'>FlexFund</span>
                                            </div>
                                            <span className = 'miro-heading emphasis in-w'>Choose a payment method</span>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>Visa ****4582</span>
                                                <span className = 'miro-row-sub nowrap'>Default card</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'>✓</span>
                                        </div>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>FlexFund Wallet</span>
                                                <span className = 'miro-row-sub nowrap'>Balance $12.40</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'></span>
                                        </div>
                                            <div className = 'miro-cta center emphasis'>Pay $251.49</div>
                                            <ul className = 'miro-nav flex in-w'>
                                                <li>Home</li>
                                                <li>Pay</li>
                                                <li>History</li>
                                                <li>Profile</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <i className = 'fa-solid fa-arrow-right miro-arrow'></i>
                                    <div className = 'miro-frame column'>
                                        <span className = 'miro-frame-label nowrap'>03 · Success</span>
                                        <div className = 'miro-card column'>
                                            <div className = 'miro-card-top in-w'>
                                                <span className = 'miro-brand emphasis'>FlexFund</span>
                                            </div>
                                            <span className = 'miro-heading emphasis in-w'>Your purchase is successful</span>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>Amount</span>
                                                <span className = 'miro-row-sub nowrap'>Total $251.49</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'>$249.99</span>
                                        </div>
                                        <div className = 'miro-row flex center in-w'>
                                            <div className = 'miro-row-thumb square'></div>
                                            <div className = 'miro-row-text column'>
                                                <span className = 'miro-row-name nowrap emphasis'>FlexFund Welcome Kit</span>
                                                <span className = 'miro-row-sub nowrap'>Standard</span>
                                            </div>
                                            <span className = 'miro-row-price nowrap emphasis'>Free</span>
                                        </div>
                                            <div className = 'miro-cta center emphasis'>Back to Home</div>
                                            <ul className = 'miro-nav flex in-w'>
                                                <li>Home</li>
                                                <li>Pay</li>
                                                <li>History</li>
                                                <li>Profile</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className = 'miro-note one absolute column'>
                                    <span className = 'nowrap'>Drop-off at</span>
                                    <span className = 'nowrap'>card entry</span>
                                </div>
                                <div className = 'miro-note two absolute column'>
                                    <span className = 'nowrap'>Add wallet</span>
                                    <span className = 'nowrap'>as default?</span>
                                </div>
                                <div className = 'miro-note three absolute column'>
                                    <span className = 'nowrap'>Upsell after</span>
                                    <span className = 'nowrap'>receipt ✓</span>
                                </div>
                                <div className = 'miro-sidebar absolute in-h'></div>
                                <div className = 'miro-guide absolute in-h'></div>
                            </div>
                            <div className = { `service-panel vsc in-h column relative ${ currentIndex == 0 ? 'active' : '' }` }>
                                <div className = 'vsc-titlebar flex center gap-md'>
                                    <i className = 'fa-solid fa-code vsc-logo'></i>
                                    <ul className = 'vsc-menu flex gap-md'>
                                        <li>File</li>
                                        <li>Edit</li>
                                        <li>Selection</li>
                                        <li>View</li>
                                        <li>Go</li>
                                        <li>Run</li>
                                        <li>···</li>
                                    </ul>
                                    <div className = 'vsc-command center'>
                                        <span className = 'nowrap'>--------------</span>
                                    </div>
                                </div>
                                <div className = 'vsc-tabs flex'>
                                    <div className = 'vsc-tab flex center'>
                                        <span className = 'vsc-tab-icon square'></span>
                                        <span className = 'nowrap'>Header.jsx</span>
                                        <span className = 'vsc-tab-close'>×</span>
                                    </div>
                                    <div className = 'vsc-tab active flex center'>
                                        <span className = 'vsc-tab-icon square'></span>
                                        <span className = 'nowrap'>App.jsx</span>
                                        <span className = 'vsc-tab-close'>×</span>
                                    </div>
                                    <div className = 'vsc-tab flex center'>
                                        <span className = 'vsc-tab-icon square'></span>
                                        <span className = 'nowrap'>index.css</span>
                                        <span className = 'vsc-tab-close'>×</span>
                                    </div>
                                </div>
                                <div className = 'vsc-main flex relative'>
                                    <ul className = 'vsc-activity column center'>
                                        <li className = 'active'><i className = 'fa-regular fa-copy'></i></li>
                                        <li><i className = 'fa-solid fa-magnifying-glass'></i></li>
                                        <li><i className = 'fa-solid fa-code-branch'></i></li>
                                        <li><i className = 'fa-solid fa-play'></i></li>
                                        <li><i className = 'fa-solid fa-table-cells-large'></i></li>
                                    </ul>
                                    <div className = 'vsc-explorer column'>
                                        <span className = 'vsc-explorer-head nowrap'>Explorer</span>
                                        <ul className = 'vsc-tree column'>
                                            <li className = 'nowrap'><i className = 'fa-solid fa-chevron-down'></i>src</li>
                                            <li className = 'depth-1 nowrap'><i className = 'fa-solid fa-chevron-down'></i>components</li>
                                            <li className = 'depth-2 nowrap'>Header.jsx</li>
                                            <li className = 'depth-2 nowrap'>Work.jsx</li>
                                            <li className = 'depth-1 active nowrap'>App.jsx</li>
                                            <li className = 'depth-1 nowrap'>index.css</li>
                                            <li className = 'depth-1 nowrap'>main.jsx</li>
                                        </ul>
                                    </div>
                                    <div className = 'vsc-editor column relative'>
                                        <div className = 'vsc-breadcrumb flex center'>
                                            <span className = 'nowrap'>src</span>
                                            <span>›</span>
                                            <span className = 'nowrap'>App.jsx</span>
                                            <span>›</span>
                                            <span className = 'vsc-symbol nowrap'>smoothScrollTo</span>
                                        </div>
                                        <div className = 'vsc-code-area flex gap-md relative'>
                                            <div className = 'vsc-gutter column'>
                                                <span>1</span>
                                                <span>2</span>
                                                <span>3</span>
                                                <span>4</span>
                                                <span>5</span>
                                                <span>6</span>
                                                <span>7</span>
                                                <span>8</span>
                                                <span>9</span>
                                                <span>10</span>
                                                <span>11</span>
                                            </div>
                                            <div className = 'vsc-code column relative'>
                                                <span className = 'vsc-comment nowrap'>{ '// Scrolls the window to a target, offset for the fixed header.' }</span>
                                                <span className = 'nowrap'>
                                                    <span className = 'vsc-keyword'>export</span>{ ' ' }
                                                    <span className = 'vsc-keyword'>function</span>{ ' ' }
                                                    <span className = 'vsc-fn'>smoothScrollTo</span>{ ' (' }
                                                    <span className = 'vsc-param'>target</span>{ ', ' }
                                                    <span className = 'vsc-param'>opts</span>{ ' = {}) {' }
                                                </span>
                                                <span className = 'vsc-indent-1 nowrap'>
                                                    <span className = 'vsc-keyword'>const</span>{ ' ' }
                                                    <span className = 'vsc-var'>remPx</span>{ ' = ' }
                                                    <span className = 'vsc-fn'>parseFloat</span>{ '(' }
                                                    <span className = 'vsc-fn'>getComputedStyle</span>{ '(' }
                                                    <span className = 'vsc-obj'>document</span>{ '.' }
                                                    <span className = 'vsc-prop'>documentElement</span>{ ').' }
                                                    <span className = 'vsc-prop'>fontSize</span>{ ')' }
                                                </span>
                                                <span className = 'nowrap'>{ '\u00A0' }</span>
                                                <span className = 'vsc-indent-1 nowrap'>
                                                    <span className = 'vsc-obj'>gsap</span>{ '.' }
                                                    <span className = 'vsc-fn'>to</span>
                                                    <span className = 'vsc-caret'></span>{ '(' }
                                                    <span className = 'vsc-obj'>window</span>{ ', {' }
                                                </span>
                                                <span className = 'vsc-indent-2 nowrap'>
                                                    <span className = 'vsc-prop'>duration</span>{ ': ' }
                                                    <span className = 'vsc-num'>.375</span>{ ',' }
                                                </span>
                                                <span className = 'vsc-indent-2 nowrap'>
                                                    <span className = 'vsc-prop'>ease</span>{ ': ' }
                                                    <span className = 'vsc-str'>{ "'power2.inOut'" }</span>{ ',' }
                                                </span>
                                                <span className = 'vsc-indent-2 nowrap'>
                                                    <span className = 'vsc-prop'>scrollTo</span>{ ': { ' }
                                                    <span className = 'vsc-prop'>y</span>{ ': ' }
                                                    <span className = 'vsc-var'>target</span>{ ', ' }
                                                    <span className = 'vsc-prop'>offsetY</span>{ ': ' }
                                                    <span className = 'vsc-var'>remPx</span>{ ' * ' }
                                                    <span className = 'vsc-num'>3</span>{ ' },' }
                                                </span>
                                                <span className = 'vsc-indent-2 nowrap'>
                                                    { '...' }<span className = 'vsc-var'>opts</span>
                                                </span>
                                                <span className = 'vsc-indent-1 nowrap'>{ '})' }</span>
                                                <span className = 'nowrap'>{ '}' }</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className = 'vsc-status flex center'>
                                    <span className = 'nowrap'>main*</span>
                                    <span className = 'nowrap'>Ln 5, Col 10</span>
                                    <span className = 'nowrap'>JavaScript JSX</span>
                                </div>
                            </div>
                        </div>
                        <div className = { `absolute ${ panelClass('y') }` } style = { panelStyle() } onAnimationIteration = { autoAdvanceService }>
                            <div className = 'iphone-status-bar absolute flex in-w center'>
                                <span className = 'iphone-time'>12:12</span>
                                <div className = 'dynamic-island flex center absolute ctr-abs-x'>
                                    <span className = 'island-sensor round'></span>
                                    <span className = 'island-camera round'></span>
                                </div>
                                <div className = 'iphone-status-icons flex gap-md'>
                                    <i className = 'fa-solid fa-signal'></i>
                                    <i className = 'fa-solid fa-battery'></i>
                                </div>
                            </div>
                            <div className = { `service-panel hotjar in-w column relative nowrap ${ currentIndex == 3 ? 'active' : '' }` }>
                                <div className = 'hotjar-header center emphasis relative'>
                                    <i>Subjects</i>
                                    <i className = 'fa-solid fa-bars'></i>
                                    <div className = 'heat absolute'>
                                        <div className = 'round absolute square'></div>
                                        <div className = 'round absolute square'></div>
                                        <div className = 'round absolute square'></div>
                                        <div className = 'round absolute square'></div>
                                        <div className = 'round absolute square'></div>
                                        <div className = 'round absolute square'></div>
                                    </div>
                                </div>
                                <ul className = 'hotjar-nav gap flex'>
                                    <li>
                                        Study Options
                                        <div className = 'heat absolute'>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                        </div>
                                    </li>
                                    <li>Entry Requirements</li>
                                    <li>
                                        Non-degree Courses
                                        <div className = 'heat absolute'>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                        </div>
                                    </li>
                                </ul>
                                <ul className = 'hotjar-crumbs flex gap-md'>
                                    <li>University</li>
                                    <li>{ `>` }</li>
                                    <li>Subjects</li>
                                </ul>
                                <span className = 'hotjar-heading emphasis'>Subjects at St Andrews</span>
                                <ul className = 'hotjar-links'>
                                    <li>
                                        Ancient history
                                        <div className = 'heat absolute'>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                        </div>
                                        <div className = 'heat absolute'>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                        </div>
                                    </li>
                                    <li>Economics</li>
                                    <li>Medieval studies</li>
                                    <li>Arabic</li>
                                    <li>English</li>
                                    <li>Middle East studies</li>
                                    <li>Archaeology</li>
                                    <li>Film studies</li>
                                    <li>Music</li>
                                    <li>Art history</li>
                                    <li>French</li>
                                    <li>Neuroscience</li>
                                </ul>
                            </div>
                            <div className = { `service-panel figma in-h in-w flex gap ${ currentIndex == 0 ? 'active' : '' }` }>
                                <div className = 'figma-tabs absolute flex'>
                                    <div className = 'figma-tab flex center'>
                                        <span className = 'nowrap'>Alpha Beta Gamma Delta</span>
                                    </div>
                                    <div className = 'figma-tab active flex center'>
                                        <span className = 'nowrap'>Staging Area</span>
                                        <span className = 'figma-tab-close'>✕</span>
                                    </div>
                                    <div className = 'figma-tab flex center'>
                                        <span className = 'nowrap'>Alpha Beta Gamma Delta</span>
                                    </div>
                                    <span className = 'figma-tab-add'>＋</span>
                                </div>
                                <div className = 'figma-panel absolute column'>
                                    <div className = 'figma-panel-tabs flex'>
                                        <span className = 'active'>Design</span>
                                        <span>Prototype</span>
                                    </div>
                                    <div className = 'figma-panel-page flex center'>
                                        <span className = 'figma-swatch square'></span>
                                        <span>1E1E1E</span>
                                    </div>
                                    <div className = 'figma-panel-section column'>
                                        <span className = 'figma-panel-heading'>Styles</span>
                                        <div className = 'figma-style-row flex'><span>Ag</span><span className = 'nowrap'>Body · 20/100</span></div>
                                        <div className = 'figma-style-row flex'><span>Ag</span><span className = 'nowrap'>Body sm · 16/100</span></div>
                                        <div className = 'figma-style-row flex'><span>Ag</span><span className = 'nowrap'>Body xsm · 12/100</span></div>
                                    </div>
                                    <div className = 'figma-panel-section column'>
                                        <span className = 'figma-panel-heading'>Layout guide styles</span>
                                        <div className = 'figma-style-row flex'><span>⊞</span><span className = 'nowrap'>Desktop 1440 by 896</span></div>
                                        <div className = 'figma-style-row flex'><span>⊞</span><span className = 'nowrap'>Tablet 1024 by 768</span></div>
                                        <div className = 'figma-style-row flex'><span>⊞</span><span className = 'nowrap'>Mobile 400 by 840</span></div>
                                    </div>
                                    <div className = 'figma-panel-section column'>
                                        <span className = 'figma-panel-heading'>Export</span>
                                    </div>
                                </div>
                                <div className = 'figma-node one absolute square round'></div>
                                <div className = 'figma-node two absolute square round'></div>
                                <div className = 'figma-wire absolute'></div>
                                <div className = 'figma-pill absolute'>-------</div>
                                <div className = 'figma-frame column'>
                                    <span className = 'figma-label'>5 Rotate 2</span>
                                    <div className = 'figma-screen column'>
                                        <span className = 'figma-close'>✕</span>
                                        <span className = 'figma-title emphasis'>Scan Contact</span>
                                        <span className = 'figma-sub emphasis'>Business Card</span>
                                        <span className = 'figma-hint'>Line it up with the frame</span>
                                        <div className = 'figma-card in-w relative'>
                                            <div className = 'figma-card-wall absolute'></div>
                                            <div className = 'figma-card-desk absolute in-w'></div>
                                            <div className = 'figma-card-face absolute'>Lorem ipsum dolor sit amet consectetuer adipiscing</div>
                                        </div>
                                    </div>
                                </div>
                                <div className = 'figma-frame column'>
                                    <span className = 'figma-label'>6 Flash</span>
                                    <div className = 'figma-screen column'>
                                        <span className = 'figma-close'>✕</span>
                                        <span className = 'figma-title emphasis'>Scan Contact</span>
                                        <span className = 'figma-sub emphasis'>Business Card</span>
                                        <span className = 'figma-hint'>Line it up with the frame</span>
                                        <div className = 'figma-card in-w relative'>
                                            <div className = 'figma-card-wall absolute'></div>
                                            <div className = 'figma-card-desk absolute in-w'></div>
                                            <div className = 'figma-card-face absolute'>Lorem ipsum dolor sit amet consectetuer adipiscing</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className = { `service-panel maze in-w in-h ${ currentIndex == 1 ? 'active' : '' }` }>
                                <div className = 'maze-header in-w emphasis center'>
                                    <img className = 'maze-logo square' src = { maze }/>
                                    <span>Insights Report</span>
                                </div>
                                <div className = 'maze-toolbar flex relative'>
                                    <div className = 'maze-tool square'>+</div>
                                    <div className = 'maze-tool square'>{ `<` }</div>
                                    <div className = 'maze-share'><span>Share</span></div>
                                    <img className = 'maze-avatar square round absolute' src = { face }/>
                                    <img className = 'maze-avatar square round absolute' src = { face }/>
                                    <img className = 'maze-avatar square round absolute' src = { face }/>
                                </div>
                                <div className = 'maze-board flex relative'>
                                    <div className = 'maze-chip absolute center'><span>Page 01 Heatmap</span></div>
                                    <div className = 'maze-window relative'><img className = 'in-w' src = { background }/>
                                        <div className = 'maze-heat absolute in-w in-h'>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                            <div className = 'round absolute square'></div>
                                        </div>
                                    </div>
                                    <div className = 'maze-window column'>
                                        <span>This is a landing page with its components' opacities set to 0.</span>
                                        <span>Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron Pi Rho Sigma Tau Upsilon Phi Psi Chi Omega</span>
                                    </div>
                                </div>
                            </div>
                            <div className = { `service-panel flex illustrator in-w in-h relative ${ currentIndex == 2 ? 'active' : '' }` }>
                                <img className = 'illustrator-canvas in-h' src = { background }/>
                                <div className = 'illustrator-hub column'>
                                    <div className = 'flex gap-md'>
                                        <div className = 'illustrator-chip flex center'>
                                            <span>File Category</span>
                                            <span>-</span>
                                        </div>
                                        <div className = 'illustrator-chip flex center'>
                                            <span>Asset Type</span>
                                            <span>-</span>
                                        </div>
                                        <div className = 'illustrator-chip flex center'>
                                            <span>Asset Availability</span>
                                            <span>-</span>
                                        </div>
                                    </div>
                                    <div className = 'illustrator-row flex'>
                                        <span className = 'emphasis'>Result</span>
                                        <span>ⓘ</span>
                                        <span>(4 🗎)</span>
                                        <span>↻</span>
                                        <span>⊞</span>
                                    </div>
                                    <div className = 'illustrator-row flex'>
                                        <span>←</span>
                                        <span>Back</span>
                                    </div>
                                    <div className = 'illustrator-assets flex gap-md'>
                                        <img className = 'round square' src = { face }/>
                                        <img className = 'round square' src = { car }/>
                                        <img className = 'round square' src = { background }/>
                                        <img className = 'round square selected' src = { background }/>
                                    </div>
                                </div>
                                <div className = 'illustrator-menu absolute column'>
                                    <span className = 'nowrap'>✓ Place and link</span>
                                    <span className = 'nowrap'>Place and embed</span>
                                    <span className = 'disabled nowrap'>Replace</span>
                                    <span className = 'nowrap'>Open in Illustrator</span>
                                </div>
                            </div>
                        </div>
                        <div className = 'absolute cursor square'><i class = 'fa-solid fa-arrow-pointer in-w in-h'></i></div>
                        <CompletionRing key = { currentIndex } duration = { cycle }/>
                    </section>
                </section>
                <div className = 'column center gap-xlg'>
                    <button
                        className = { `nav-arrow center square pointer ${ isTransitioning ? 'disabled' : '' }` }
                        onClick = { advanceService }
                        tabIndex = { (isTransitioning || !inView) ? -1 : 0 }
                        data-keep-tabbable
                    >
                        <CaretIcon/>
                    </button>
                    <button
                        className = { `nav-arrow center square pointer ${ isTransitioning ? 'disabled' : '' }` }
                        onClick = { regressService }
                        tabIndex = { (isTransitioning || !inView) ? -1 : 0 }
                        data-keep-tabbable
                    >
                        <CaretIcon/>
                    </button>
                </div>
            </div>
            <Subhead title = 'workflow'/>
            <div className = 'center workflow-wrapper gap-lg'>
                <section className = 'workflow flex relative'>
                    <section className = 'column gap-md relative center workflow-num'>
                        { arr.map(index => {
                            return <div key = { index } className = { `flex ${ index == 2 ? 'last' : '' }` } >
                                <span className = 'block'>0</span>
                                <span className = 'block'>{ workflowIndex + 1 }</span>
                            </div>
                        })}
                    </section>
                    <section class = 'gap column workflow-content'>
                        <span className = 'flex'>{ workflow[workflowIndex].title }</span>
                        {
                            !explain ? <p className = 'block in-h'>{ workflow[workflowIndex].text }</p> :
                            <p className = 'block'>{ workflow[workflowIndex].eli5 }</p>
                        }
                        <Glass
                            as = 'button'
                            className = 'center pointer gap-md relative'
                            distort = { false }
                            onClick = { () => setExplain(!explain) }
                            tabIndex = { inView ? 0 : -1 }
                            data-keep-tabbable
                        >
                            <Trail/>
                            <span className = 'nowrap'>{ !explain ? 'Simplify' : 'Detail' }</span>
                        </Glass>
                    </section>
                    <CompletionRing key = { workflowIndex } duration = { cycle } onIteration = { autoAdvanceWorkflow }/>
                </section>
                <div className = 'column center gap-xlg'>
                    <button
                        className = 'nav-arrow center square pointer'
                        onClick = { advanceWorkflow }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                    >
                        <CaretIcon/>
                    </button>
                    <button
                        className = 'nav-arrow center square pointer'
                        onClick = { regressWorkflow }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                    >
                        <CaretIcon/>
                    </button>
                </div>
            </div>
            <section className = 'beyond flex gap-lg none'>
                <section className = 'column gap'>
                    <span>BEYOND</span>
                    <div className = 'bar-x'></div>
                    <p>Other things I do outside of conventional frontend work.</p>
                </section>
                <section className = 'relative center square'>
                    <img
                        key = { beyondPreviewIndex }
                        src = { beyondPreviews[beyondPreviewIndex].img }
                        alt = { beyondPreviews[beyondPreviewIndex].alt }
                        className = 'block in-w square'
                    />
                    <div className = 'absolute square ctr-abs-xy'></div>
                    <Link
                        className = 'absolute ctr-abs-x'
                        to = '/beyond'
                        onClick = { () => sessionStorage.setItem('beyondCategory', String(beyondPreviewIndex)) }
                    >
                        <Idea className = 'gap' text = { beyondPreviews[beyondPreviewIndex].label } cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                    </Link>
                </section>
                <section className = 'column gap'>
                    <Glass
                        as = 'a'
                        className = 'center pointer gap-md relative'
                        href = 'beyond'
                        onClick = { () => sessionStorage.setItem('beyondCategory', '0') }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                    >
                        <Trail once = { false }/>
                        <Idea className = 'in-w' text = 'Motion' cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                    </Glass>
                    <Glass
                        as = 'a'
                        className = 'center pointer gap-md relative'
                        href = 'beyond'
                        onClick = { () => sessionStorage.setItem('beyondCategory', '1') }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                    >
                        <Trail once = { false }/>
                        <Idea className = 'in-w' text = 'Pencilling' cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                    </Glass>
                    <Glass
                        as = { Link }
                        className = 'center pointer gap-md relative'
                        to = 'beyond'
                        onClick = { () => sessionStorage.setItem('beyondCategory', '2') }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                    >
                        <Trail once = { false }/>
                        <Idea className = 'in-w' text = 'Pixel Art' cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
                    </Glass>
                </section>
            </section>
        </article>
    </section>
}

export default memo(About)