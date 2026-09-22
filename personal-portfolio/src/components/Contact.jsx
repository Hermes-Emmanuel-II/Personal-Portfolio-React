import { useEffect, useRef, useState } from 'react'

import { Glass, Trail } from './Header'
import { Idea } from './Hero'
import { SectionHeader } from './Work'
import gears from '../assets/gears.png'

export default function Contact () {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const contactRef = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = contactRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: [0, 0.1] }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    function handleChange (e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    return <section id = 'contact' ref = { contactRef } className = 'column center'>
        <div className = 'contact-aura absolute ctr-abs-xy'></div>
        <SectionHeader symbol = '#' title = 'hello'/>
        <article className = 'content relative column gap-lg'>
            <p>Let's make something together! I'm open to both exploring new opportunities and collaborating. Feel free to drop a 'hi' so we can start something or maybe just rub minds.</p>
            <form className = 'contact-form column gap-lg' >
                <div className = 'flex gap-lg relative'>
                    <input
                        type = 'text'
                        name = 'name'
                        placeholder = 'Full Name'
                        className = 'in-w block'
                        value = { form.name }
                        onChange = { handleChange }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                        required
                    />
                    <input
                        type = 'email'
                        name = 'email'
                        placeholder = 'Email Address'
                        className = 'in-w block'
                        value = { form.email }
                        onChange = { handleChange }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                        required
                    />
                    <img src = { gears } alt = '' className = 'absolute square'/>
                </div>
                <div className = 'message relative block'>
                    <textarea
                        name = 'message'
                        placeholder = 'Message goes here...'
                        className = 'in-w block'
                        value = { form.message }
                        onChange = { handleChange }
                        tabIndex = { inView ? 0 : -1 }
                        data-keep-tabbable
                        required
                    ></textarea>
                    <img src = { gears } alt = '' className = 'absolute square'/>
                </div>
                <Glass as = 'button' type = 'submit' className = 'relative' distort = { false } tabIndex = { inView ? 0 : -1 } data-keep-tabbable>
                    <Trail once = { true }/>
                    <Idea as = 'span' text = { sent ? 'Sent!' : 'Send' } cltxt = 'fa-solid fa-paper-plane'/>
                </Glass>
            </form>
            <div className = 'bar-x in-w'></div>
            <footer className = 'footer center gap' >
                <div className = 'footer-logo square' style = {{ backgroundImage: `url(${ gears })` }}></div>
                <div className = 'footer-text'>© <span className = 'current-year'>{ new Date().getFullYear() }</span> Hermes E.</div>
                <div className = 'footer-socials flex'>
                    <a href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-facebook'></i></a>
                    <a href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-github'></i></a>
                    <a href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-linkedin'></i></a>
                    <a href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-x-twitter'></i></a>
                </div>
            </footer>
        </article>
    </section>
}