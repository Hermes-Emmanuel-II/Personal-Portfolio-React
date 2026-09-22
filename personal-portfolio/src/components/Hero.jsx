import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Glass, Trail, useWidthCheck } from './Header'
import ThreeDViewer from './ThreeDViewer'
import { smoothScrollTo } from '../App'
import resume from '../assets/resume.pdf'

export function Idea ({ as: Tag = 'button', text, cltxt, onClick, tabIndex, className = '', ...rest }) {
    return <Tag
        { ...(Tag === 'button' ? { type: 'button' } : {}) }
        className = { `gap center idea pointer ${ className }` }
        onClick = { onClick }
        tabIndex = { tabIndex }
        { ...rest }
    >
        <span className = 'nowrap'>{ text }</span>
        <i className = { `${ cltxt } square` }></i>
    </Tag>
}

export function Bar ({ vert = true, style }) {
    return <div className = { vert == true ? 'bar-y' : 'bar-x' } style = { style }></div>
}

export default function Hero ({ onOpenRecents, recentsOpen }) {
    const [visible, setVisible] = useState(false)

    const heroRef = useRef(null)
    const heroTextRef = useRef(null)
    const ctaRef = useRef(null)
    const [inView, setInView] = useState(true)
    const isDesktop = useWidthCheck()
    const tabbable = isDesktop && inView

    useEffect(() => {
        const el = heroRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: [0, 0.1] }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useLayoutEffect(() => {
        const cta = ctaRef.current
        const host = heroTextRef.current
        if (!cta || !host) return

        let last = null
        function publish () {
            if (visible) return
            const width = cta.getBoundingClientRect().width
            if (!width || width === last) return
            last = width
            host.style.setProperty('--cta-w', `${ width }px`)
        }
        publish()
        const observer = new ResizeObserver(publish)
        observer.observe(cta)
        return () => observer.disconnect()
    }, [visible])

     function handleDownload () {
        const link = document.createElement('a')
        link.href = resume
        link.download = 'Ifechukwu-Ibeneme-Resume.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return <section id = 'hero' ref = { heroRef } className = 'center'>
        <div id = 'aura' className = 'absolute'></div>
        <ThreeDViewer/>
        <article id = 'hero-text' ref = { heroTextRef } className = 'column gap-lg'>
            <div className = 'main-heading emphasis column'>
                <p className = 'gradient-text'>Frontend Developer</p>
                <p className = 'gradient-text absolute'>Frontend Developer</p>
                <p><span>×</span> UI/UX Designer</p>
                <p className = 'absolute'><span>×</span> UI/UX Designer</p>
            </div>
            <div className = 'heading column'>
                <p><span>Hermes</span> is a <span>Frontend Developer</span> with an affinity for <span>startups</span> — looking to aid in the <span>elevation</span> of their <span>digital presence</span> whenever opportune.</p>
                <p className = { visible ? 'expanded' : '' }>Specialty? Helping brands bring their web ideas to life as polished, user-focused experiences through <span>user research</span>, <span>web development</span>, and <span>UI/UX design</span>.</p>
            </div>
            <Glass as = 'div' ref = { ctaRef } className = 'cta center relative'>
                <Glass
                    as = 'a'
                    className = 'relative'
                    href = '#contact'
                    tabIndex = { tabbable ? 0 : -1 }
                    data-keep-tabbable
                    onClick = { (e) => { e.preventDefault(); smoothScrollTo('#contact') } }
                >
                    <Trail once = { false }/>
                    <Idea text = 'Get in Touch' cltxt = 'fa-solid fa-arrow-up-long rotate'/>
                </Glass>
                <Glass
                    as = 'button'
                    type = 'button'
                    className = 'center gap-md relative cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit outline-none focus-visible:ring-2 focus-visible:ring-teal-400'
                    onClick = { () => setVisible(!visible) }
                    tabIndex = { tabbable ? 0 : -1 }
                    data-keep-tabbable
                >
                    <Trail once = { true }/>
                    <span>{ visible ? 'See Less' : 'Read More' }</span>
                </Glass>
            </Glass>
        </article>
        <div className = 'center quick absolute'>
            <Idea
                text = 'Résumé'
                cltxt = 'fa-solid fa-info'
                onClick = { handleDownload }
                tabIndex = { tabbable ? 0 : -1 }
                data-keep-tabbable
            />
            <Bar />
            <Idea
                text = 'Recents'
                cltxt = 'fa-regular fa-clock'
                onClick = { onOpenRecents }
                tabIndex = { tabbable ? 0 : -1 }
                data-keep-tabbable
                className = { recentsOpen ? 'active' : '' }
            />
            <Bar/>
            <Link
                to = '/beyond'
                className = 'idea-link'
                tabIndex = { tabbable ? 0 : -1 }
                data-keep-tabbable
            >
                <Idea text = 'Sidequests' cltxt = 'fa-solid fa-arrow-up-long rotate'/>
            </Link>
        </div>
    </section>
}