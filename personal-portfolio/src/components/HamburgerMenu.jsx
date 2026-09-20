import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import { smoothScrollTo } from '../App'
import resume from '../assets/resume.pdf'

function HamburgerOption ({ action, destination, href, prompt, onSelect, tabIndex }) {
    function handleClick (e) {
        if (action) {
            e.preventDefault()
            action()
        } else if (destination) {
            e.preventDefault()
            smoothScrollTo(`#${ destination }`)
        }
        if (onSelect) onSelect()
    }

    return <li>
        <div>
            <a
                className = 'nowrap'
                href = { destination ? `#${ destination }` : (href || '#') }
                target = { href ? '_blank' : undefined }
                rel = { href ? 'noreferrer' : undefined }
                onClick = { handleClick }
                tabIndex = { tabIndex }
                data-keep-tabbable
            >{ prompt }</a>
        </div>
    </li>
}

export default function HamburgerMenu ({ isOpen, onClose, onOpenRecents }) {
    const navigate = useNavigate()

    function handleDownload () {
        const link = document.createElement('a')
        link.href = resume
        link.download = 'Ifechukwu-Ibeneme-Resume.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return createPortal(
        <div
            className = { `hamburger-overlay none column ${ isOpen ? 'active' : '' }` }
            aria-hidden = { !isOpen }
        >
            <ul className = 'column gap-lg in-w'>
                <ul>
                    <span>Sections</span>
                    <HamburgerOption destination = 'work' prompt = 'Work' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption destination = 'about' prompt = 'About' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption destination = 'contact' prompt = 'Get in Touch' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                </ul>
                <ul>
                    <span>Access</span>
                    <HamburgerOption action = { handleDownload } prompt = 'Download Resume' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption action = { onOpenRecents } prompt = 'Recents' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption action = { () => navigate('/beyond') } prompt = 'Other Exploits' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                </ul>
                <ul>
                    <span>Skip</span>
                    <HamburgerOption href = 'https://www.figma.com/' prompt = 'Design Blueprints' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption href = 'https://github.com/' prompt = 'Frontend Builds' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                    <HamburgerOption href = 'https://www.linkedin.com/in/ifechukwu-emmanuel-ibeneme/details/certifications/' prompt = 'Certifications' tabIndex = { isOpen ? 0 : -1 } onSelect = { onClose }/>
                </ul>
            </ul>
        </div>,
        document.body
    )
}