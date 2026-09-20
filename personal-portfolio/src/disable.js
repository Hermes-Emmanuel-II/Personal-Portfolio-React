const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'details',
    'summary',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]'
].join(', ')

const OPT_OUT_ATTR = 'data-keep-tabbable'

function strip (el) {
    if (el.hasAttribute(OPT_OUT_ATTR)) return
    if (el.getAttribute('tabindex') !== '-1') el.setAttribute('tabindex', '-1')
}

function sweep (root) {
    if (root.nodeType !== 1 && root.nodeType !== 9) return

    if (root.nodeType === 1 && root.matches(FOCUSABLE_SELECTOR)) strip(root)
    root.querySelectorAll(FOCUSABLE_SELECTOR).forEach(strip)
}

export default function disable (root = document.body) {
    sweep(root)

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(sweep)
            } else if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                strip(mutation.target)
            }
        }
    })

    observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'disabled', 'tabindex', 'contenteditable']
    })

    return () => observer.disconnect()
}