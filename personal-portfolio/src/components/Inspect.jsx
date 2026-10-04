import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Clarity, Glass, Trail } from './Header'
import { Idea } from './Hero'
import { Popup } from './Popup'

export default function Inspect ({ isOpen, onClose, project, onZoomIn, onZoomOut, zoomLevel, maxZoomLevel, scale }) {
  const inspectScrollRef = useRef(null)
  const notesRef = useRef(null)
  const [notesEdges, setNotesEdges] = useState({ top: false, bottom: false })
  const [dragging, setDragging] = useState(false)
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const atMinZoom = zoomLevel <= 0
  const atMaxZoom = zoomLevel >= maxZoomLevel

  // The point of the design sitting at the centre of the view, as a fraction of the image (0–1 on each axis).
  // Captured just before a zoom, then restored after it, so the same spot stays in focus.
  const anchorRef = useRef(null)

  function captureAnchor () {
    const el = inspectScrollRef.current
    const img = el && el.querySelector('img')
    if (!el || !img) return
    const box = el.getBoundingClientRect()
    const rect = img.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const clamp = n => Math.min(1, Math.max(0, n))
    anchorRef.current = {
      x: clamp((box.left + el.clientWidth / 2 - rect.left) / rect.width),
      y: clamp((box.top + el.clientHeight / 2 - rect.top) / rect.height)
    }
  }

  function zoomIn () {
    captureAnchor()
    onZoomIn()
  }

  function zoomOut () {
    captureAnchor()
    onZoomOut()
  }

  function onInspectPointerDown (e) {
    const el = inspectScrollRef.current
    if (!el) return
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop
    }
    el.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function onInspectPointerMove (e) {
    if (!dragState.current.dragging) return
    const el = inspectScrollRef.current
    if (!el) return
    el.scrollLeft = dragState.current.scrollLeft - (e.clientX - dragState.current.startX)
    el.scrollTop = dragState.current.scrollTop - (e.clientY - dragState.current.startY)
  }

  function onInspectPointerUp (e) {
    if (!dragState.current.dragging) return
    dragState.current.dragging = false
    setDragging(false)
    const el = inspectScrollRef.current
    if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
  }

  function onInspectKeyDown (e) {
    const el = inspectScrollRef.current
    if (!el) return
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.stopPropagation()
    const step = 60
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        el.scrollTop -= step
        break
      case 'ArrowDown':
        e.preventDefault()
        el.scrollTop += step
        break
      case 'ArrowLeft':
        e.preventDefault()
        el.scrollLeft -= step
        break
      case 'ArrowRight':
        e.preventDefault()
        el.scrollLeft += step
        break
      default:
        break
    }
  }

  function updateNotesEdges () {
    const el = notesRef.current
    if (!el) return
    const top = el.scrollTop > 1
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
    setNotesEdges(prev => (prev.top === top && prev.bottom === bottom) ? prev : { top, bottom })
  }

  useEffect(() => {
    const el = notesRef.current
    if (!el) return
    updateNotesEdges()
    const observer = new ResizeObserver(updateNotesEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isOpen, project])

  function onNotesKeyDown (e) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.stopPropagation()
  }

  // Runs after the image has its new width but before paint, so there's no jump to the top-left first
  useLayoutEffect(() => {
    const el = inspectScrollRef.current
    const img = el && el.querySelector('img')
    const anchor = anchorRef.current
    anchorRef.current = null
    if (!el || !img) return

    // Zoom changed without the buttons (popup reopened, preview refreshed): start from the top-left as before
    if (!anchor) {
      el.scrollTo(0, 0)
      return
    }

    const box = el.getBoundingClientRect()
    const rect = img.getBoundingClientRect()
    const x = rect.left - box.left + el.scrollLeft + anchor.x * rect.width
    const y = rect.top - box.top + el.scrollTop + anchor.y * rect.height
    el.scrollLeft = x - el.clientWidth / 2
    el.scrollTop = y - el.clientHeight / 2
  }, [zoomLevel])

  return (
    <Popup isOpen = { isOpen } onClose = { onClose } className = 'inspect-popup center column gap-lg flex' draggable = { false }>
      <div className = 'inspect-wrapper in-h in-w flex'>
        <section className = 'in-h relative'>
          <Glass
            className = 'absolute ctr-abs-x flex inspect-controls'
            distort = { false }
          >
            <Clarity
              icon = { <i className = 'fa-solid fa-expand'></i> }
              onClick = { zoomIn }
              text = 'Zoom In'
              className = { atMaxZoom ? 'none' : '' }
              tabIndex = { isOpen ? 0 : -1 }
            />
            <Clarity
              icon = { <i className = 'fa-solid fa-compress'></i> }
              onClick = { zoomOut }
              text = 'Zoom Out'
              className = { atMinZoom ? 'none' : '' }
              tabIndex = { isOpen ? 0 : -1 }
            />
            <div className = 'bar-y'></div>
            <Clarity
              icon = { <i className = 'fa-solid fa-arrow-right-from-bracket'></i> }
              onClick = { onClose }
              text = 'Exit'
              tabIndex = { isOpen ? 0 : -1 }
            />
          </Glass>
          <div
            className = { `inspect-scroll in-w in-h ${ dragging ? 'dragging' : '' }` }
            ref = { inspectScrollRef }
            onPointerDown = { onInspectPointerDown }
            onPointerMove = { onInspectPointerMove }
            onPointerUp = { onInspectPointerUp }
            onPointerCancel = { onInspectPointerUp }
            onKeyDown = { onInspectKeyDown }
            tabIndex = { isOpen ? 0 : -1 }
            data-keep-tabbable
            role = 'group'
            aria-label = { `${ project.title } preview. Use arrow keys to pan.` }
          >
            <i className = 'absolute down direction-indicator fa-solid fa-arrow-right'/>
            <i className = 'absolute right direction-indicator fa-solid fa-arrow-down'/>
            <img
              className = 'block'
              src = { project.figma }
              alt = { project.title }
              draggable = { false }
              style = {{
                width: `calc((25rem / var(--fig-dsk-w)) * 100vw * ${scale})`
              }}
            />
          </div>
        </section>
        <section className = 'column gap-lg in-h'>
          <div className = 'column gap-lg'>
            <div>Design Notes</div>
            <div
              ref = { notesRef }
              className = { `notes-scroll ${ notesEdges.top ? 'fade-top' : '' } ${ notesEdges.bottom ? 'fade-bottom' : '' }` }
              onScroll = { updateNotesEdges }
              tabIndex = { isOpen ? 0 : -1 }
              data-keep-tabbable
              role = 'region'
              aria-label = { `${ project.title } notes` }
              onKeyDown = { onNotesKeyDown }
              dangerouslySetInnerHTML = {{ __html: project.notes }}
            />
          </div>
          { project.figmaUrl && (
            <Glass
              as = 'a'
              className = 'relative pointer gap-md'
              href = { project.figmaUrl }
              target = '_blank'
              rel = 'noreferrer'
              tabIndex = { isOpen ? 0 : -1 }
              data-keep-tabbable
            >
              <Trail once = { true } />
              <Idea text = 'Figma' cltxt = 'fa-solid fa-arrow-up-long rotate' tabIndex = { -1 }/>
            </Glass>
          )}
        </section>
      </div>
    </Popup>
  )
}