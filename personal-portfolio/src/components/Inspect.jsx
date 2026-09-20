import { useEffect, useRef, useState } from 'react'

import { Clarity, Glass, Trail } from './Header'
import { Idea } from './Hero'
import { Popup } from './Popup'

export default function Inspect ({ isOpen, onClose, project, onZoomIn, onZoomOut, zoomLevel, maxZoomLevel, scale }) {
  const inspectScrollRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const atMinZoom = zoomLevel <= 0
  const atMaxZoom = zoomLevel >= maxZoomLevel

  function resetPan () {
    const el = inspectScrollRef.current
    if (!el) return
    el.scrollTo({ left: 0, top: 0, behavior: 'smooth' })
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

  useEffect(() => {
    resetPan()
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
              onClick = { onZoomIn }
              text = 'Zoom In'
              className = { atMaxZoom ? 'none' : '' }
              tabIndex = { isOpen ? 0 : -1 }
            />
            <Clarity
              icon = { <i className = 'fa-solid fa-compress'></i> }
              onClick = { onZoomOut }
              text = 'Zoom Out'
              className = { atMinZoom ? 'none' : '' }
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
            <div>Notes</div>
            <div
              dangerouslySetInnerHTML = {{ __html: project.notes }}
            />
          </div>
          { project.github && (
            <Glass
              as = 'a'
              className = 'relative pointer gap-md'
              href = { `https://github.com/Hermes-Emmanuel-II/${ project.github }` }
              target = '_blank'
              rel = 'noreferrer'
              tabIndex = { isOpen ? 0 : -1 }
              data-keep-tabbable
            >
              <Trail once = { true } />
              <Idea text = 'Github' cltxt = 'fa-solid fa-arrow-up-long rotate' />
            </Glass>
          )}
        </section>
      </div>
    </Popup>
  )
}