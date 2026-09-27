import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Glass, Trail } from './Header'
import { Idea } from './Hero'
import { SectionHeader } from './Work'
import gears from '../assets/gears.png'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']
const MB = 1000 * 1000
const MAX_TOTAL_SIZE = 4 * MB

const WARNING_MS = 5000

function toMB (bytes) {
    return (Math.ceil((bytes / MB) * 10) / 10).toFixed(1).replace(/\.0$/, '')
}

function shortName (name, max = 18) {
    if (name.length <= max) return name
    const dot = name.lastIndexOf('.')
    const ext = dot > 0 ? name.slice(dot) : ''
    return `${ name.slice(0, max - ext.length - 1) }…${ ext }`
}

function Contact () {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState('idle')
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)
    const filesRef = useRef(null)
    const fileDrag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0, pointerId: null })
    const [fileEdges, setFileEdges] = useState({ left: false, right: false })

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
        if (status === 'sent') setStatus('idle')
    }

    const [warning, setWarning] = useState(null)
    const warningTimer = useRef(null)

    function warn (text) {
        clearTimeout(warningTimer.current)
        setWarning(prev => ({ text, key: (prev?.key ?? 0) + 1 }))
        warningTimer.current = setTimeout(() => setWarning(null), WARNING_MS)
    }

    useEffect(() => () => clearTimeout(warningTimer.current), [])

    function addFiles (list) {
        let total = files.reduce((sum, file) => sum + file.size, 0)
        const next = [...files]
        const tooBig = []
        const wrongType = []
        const duplicate = []

        ;[...list].forEach(file => {
            if (!ACCEPTED_TYPES.includes(file.type)) return wrongType.push(file)
            if (next.some(p => p.name === file.name && p.size === file.size)) return duplicate.push(file)
            if (total + file.size > MAX_TOTAL_SIZE) return tooBig.push(file)
            total += file.size
            next.push(file)
        })

        if (next.length !== files.length) setFiles(next)

        const skipped = tooBig.length + wrongType.length + duplicate.length
        if (!skipped) return

        const left = MAX_TOTAL_SIZE - total
        if (skipped > 1) {
            const reason = tooBig.length === skipped ? `over ${ toMB(MAX_TOTAL_SIZE) } MB`
                : wrongType.length === skipped ? 'not PNG, JPEG or PDF'
                : duplicate.length === skipped ? 'already attached'
                : [
                    tooBig.length && `${ tooBig.length } too big`,
                    wrongType.length && `${ wrongType.length } wrong type`,
                    duplicate.length && `${ duplicate.length } repeated`
                ].filter(Boolean).join(', ')
            warn(`${ skipped } files skipped: ${ reason }`)
        } else if (tooBig.length) {
            warn(next.length ? `File too big — ${ toMB(left) } MB left` : `File too big — ${ toMB(MAX_TOTAL_SIZE) } MB max`)
        } else if (wrongType.length) {
            warn(`${ shortName(wrongType[0].name) } isn't a PNG, JPEG or PDF`)
        } else {
            warn(`${ shortName(duplicate[0].name) } is already attached`)
        }
    }

    function handleFileChange (e) {
        addFiles(e.target.files)
        e.target.value = ''
    }

    function removeFile (index) {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    function updateFileEdges () {
        const el = filesRef.current
        if (!el) return
        const left = el.scrollLeft > 1
        const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
        setFileEdges(prev => (prev.left === left && prev.right === right) ? prev : { left, right })
    }

    useEffect(() => {
        const el = filesRef.current
        if (!el) return
        updateFileEdges()
        const observer = new ResizeObserver(updateFileEdges)
        observer.observe(el)
        return () => observer.disconnect()
    }, [files.length])

    const actionsRef = useRef(null)
    const [sendWrapped, setSendWrapped] = useState(false)

    useLayoutEffect(() => {
        const row = actionsRef.current
        if (!row) return
        function check () {
            const send = row.lastElementChild
            const before = send?.previousElementSibling
            setSendWrapped(!!before && send.offsetTop >= before.offsetTop + before.offsetHeight)
        }
        check()
        const observer = new ResizeObserver(check)
        observer.observe(row)
        return () => observer.disconnect()
    }, [files.length, !!warning])

    const formRef = useRef(null)

    useLayoutEffect(() => {
        const form = formRef.current
        if (!form) return
        const first = form.firstElementChild
        const message = form.querySelector('.message')
        if (!first || !message) return
        function align () {
            const box = form.getBoundingClientRect()
            const scale = box.height ? form.offsetHeight / box.height : 1
            form.style.setProperty('--gear-shift', `${ (message.getBoundingClientRect().top - first.getBoundingClientRect().top) * scale }px`)
        }
        align()
        const observer = new ResizeObserver(align)
        observer.observe(form)
        observer.observe(first)
        return () => observer.disconnect()
    }, [])

    function onFilesPointerDown (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return
        const el = filesRef.current
        fileDrag.current = { active: true, moved: false, startX: e.clientX, scrollLeft: el.scrollLeft, pointerId: e.pointerId }
    }

    function onFilesPointerMove (e) {
        const drag = fileDrag.current
        if (!drag.active) return
        const el = filesRef.current
        const dx = e.clientX - drag.startX
        if (!drag.moved) {
            if (Math.abs(dx) < 4) return
            drag.moved = true
            el.setPointerCapture(drag.pointerId)
            el.classList.add('dragging')
        }
        el.scrollLeft = drag.scrollLeft - dx
    }

    function onFilesPointerUp () {
        const drag = fileDrag.current
        if (!drag.active) return
        drag.active = false
        const el = filesRef.current
        el.classList.remove('dragging')
        if (drag.pointerId !== null && el.hasPointerCapture(drag.pointerId)) el.releasePointerCapture(drag.pointerId)
    }

    function onFilesClickCapture (e) {
        if (!fileDrag.current.moved) return
        fileDrag.current.moved = false
        e.preventDefault()
        e.stopPropagation()
    }

    function handleDrop (e) {
        e.preventDefault()
        if (!e.dataTransfer.files.length) return
        if (storageFull) return warn(`Storage full (${ toMB(MAX_TOTAL_SIZE) } MB), remove a file first`)
        addFiles(e.dataTransfer.files)
    }

    const usedSize = files.reduce((sum, file) => sum + file.size, 0)
    const storageFull = MAX_TOTAL_SIZE - usedSize < MB / 10
    const usedAngle = Math.min(360, (usedSize / MAX_TOTAL_SIZE) * 360)

    async function handleSubmit (e) {
        e.preventDefault()
        if (status === 'sending') return
        setStatus('sending')
        clearTimeout(warningTimer.current)
        setWarning(null)

        const body = new FormData(e.currentTarget)
        body.delete('attachments')
        files.forEach(file => body.append('attachments', file))

        try {
            const response = await fetch('/api/contact', { method: 'POST', body })
            const result = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(result.error || 'Couldn\'t send right now. Please try again.')
            setStatus('sent')
            setForm({ name: '', email: '', message: '' })
            setFiles([])
        } catch (error) {
            setStatus('idle')
            warn(error instanceof TypeError ? 'No connection. Please try again.' : error.message)
        }
    }

    return <section id = 'contact' ref = { contactRef } className = 'column center relative'>
        <div className = 'contact-aura absolute ctr-abs-xy'></div>
        <SectionHeader symbol = '>_ ' title = 'hello'/>
        <article className = 'content relative column gap-lg'>
            <p>Let's make something together! I'm open to both exploring new opportunities and collaborating. Feel free to drop a 'hi' so we can start something or maybe just rub minds.</p>
            <form ref = { formRef } className = 'contact-form column gap-lg' onSubmit = { handleSubmit }>
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
                <div
                    className = 'message relative block'
                    onDragOver = { (e) => e.preventDefault() }
                    onDrop = { handleDrop }
                >
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
                    { status !== 'sent' && <Trail/> }
                    <img src = { gears } alt = '' className = 'absolute square'/>
                    <input
                        type = 'text'
                        name = 'company'
                        className = 'none'
                        tabIndex = { -1 }
                        autoComplete = 'off'
                        aria-hidden = 'true'
                    />
                    <input
                        ref = { fileInputRef }
                        type = 'file'
                        name = 'attachments'
                        accept = '.png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf'
                        multiple
                        className = 'none'
                        tabIndex = { -1 }
                        onChange = { handleFileChange }
                    />
                    <div className = 'attach absolute flex'>
                        <button
                            type = 'button'
                            className = 'center pointer'
                            aria-label = { storageFull ? `Storage full (${ toMB(MAX_TOTAL_SIZE) } MB)` : `Attach PNG, JPEG or PDF (${ toMB(MAX_TOTAL_SIZE) } MB max)` }
                            disabled = { storageFull }
                            onClick = { () => fileInputRef.current?.click() }
                            tabIndex = { inView ? 0 : -1 }
                            data-keep-tabbable
                        >
                            <i className = 'fa-solid fa-paperclip'></i>
                        </button>
                    </div>
                </div>
                <div ref = { actionsRef } className = { `contact-actions flex gap ${ files.length || warning ? 'has-files' : '' } ${ sendWrapped ? 'wrapped' : '' }` }>
                    { warning && <Glass as = 'p' key = { warning.key } className = 'contact-warning relative flex' distort = { false } role = 'status'>
                        <i className = 'fa-solid fa-triangle-exclamation'></i>
                        <span>{ warning.text }</span>
                    </Glass> }
                    { files.length > 0 && <div className = 'contact-uploads flex gap'>
                        <div className = 'contact-storage flex gap' aria-live = 'polite'>
                            <div
                                className = 'completion-ring square round relative'
                                style = {{ '--angle': `${ usedAngle }deg` }}
                                aria-hidden = 'true'
                            ></div>
                            <span className = 'nowrap'>{ `${ toMB(usedSize) }/${ toMB(MAX_TOTAL_SIZE) } MB` }</span>
                        </div>
                        <div className = 'bar-y'></div>
                        <ul
                            ref = { filesRef }
                            className = { `contact-files flex gap-md ${ fileEdges.left ? 'fade-left' : '' } ${ fileEdges.right ? 'fade-right' : '' }` }
                            onScroll = { updateFileEdges }
                            onPointerDown = { onFilesPointerDown }
                            onPointerMove = { onFilesPointerMove }
                            onPointerUp = { onFilesPointerUp }
                            onPointerCancel = { onFilesPointerUp }
                            onClickCapture = { onFilesClickCapture }
                        >
                            { files.map((file, index) => (
                                <Glass as = 'li' key = { `${ file.name }-${ file.size }` } className = 'contact-file relative flex' distort = { false }>
                                    <span className = 'nowrap'>{ file.name }</span>
                                    <button
                                        type = 'button'
                                        className = 'center pointer'
                                        aria-label = { `Remove ${ file.name }` }
                                        onClick = { () => removeFile(index) }
                                        tabIndex = { inView ? 0 : -1 }
                                        data-keep-tabbable
                                    >
                                        <i className = 'fa-solid fa-xmark'></i>
                                    </button>
                                </Glass>
                            )) }
                        </ul>
                    </div> }
                    <Glass as = 'button' type = 'submit' className = 'contact-send relative' distort = { false } disabled = { status === 'sending' } aria-busy = { status === 'sending' } tabIndex = { inView ? 0 : -1 } data-keep-tabbable>
                        <Trail once = { true }/>
                        <Idea as = 'span' text = { status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Send' } cltxt = 'fa-solid fa-paper-plane'/>
                    </Glass>
                </div>
            </form>
            <div className = 'bar-x in-w'></div>
            <footer className = 'footer center gap' >
                <div className = 'footer-logo square' style = {{ backgroundImage: `url(${ gears })` }}></div>
                <div className = 'footer-text'>© <span className = 'current-year'>{ new Date().getFullYear() }</span> Hermes E.</div>
                <div className = 'footer-socials flex'>
                    <a className = 'block' href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-facebook in-w'></i></a>
                    <a className = 'block' href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-github in-w'></i></a>
                    <a className = 'block' href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-linkedin in-w'></i></a>
                    <a className = 'block' href = '' target = '_blank' rel = 'noreferrer' tabIndex = { inView ? 0 : -1 } data-keep-tabbable><i className = 'fa-brands fa-x-twitter in-w'></i></a>
                </div>
            </footer>
        </article>
    </section>
}

export default memo(Contact)