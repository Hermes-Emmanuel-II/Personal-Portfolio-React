import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Glass } from './Header'

export function Popup ({
  children,
  isOpen,
  onClose,
  className = '',
  draggable = true,
  width = 'auto',
  height = 'auto',
  maxWidth = '46.5rem',
  maxHeight = '32rem',
  padding = '2rem 2.5rem',
  borderRadius = '2.5rem',
  ...props
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [flatCorners, setFlatCorners] = useState([])
  const popupRef = useRef(null)

  function updateFlatCorners () {
    const el = popupRef.current
    if (!el) return

    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const threshold = remPx * 3

    const rect = el.getBoundingClientRect()

    const nearTop = rect.top <= threshold
    const nearBottom = (window.innerHeight - rect.bottom) <= threshold
    const nearLeft = rect.left <= threshold
    const nearRight = (window.innerWidth - rect.right) <= threshold

    const corners = []
    if (nearTop || nearLeft) corners.push('tl')
    if (nearTop || nearRight) corners.push('tr')
    if (nearBottom || nearLeft) corners.push('bl')
    if (nearBottom || nearRight) corners.push('br')

    setFlatCorners(corners)
  }

  useEffect(() => {
    if (!isOpen) return
    updateFlatCorners()
    window.addEventListener('resize', updateFlatCorners)
    return () => window.removeEventListener('resize', updateFlatCorners)
  }, [isOpen, pos])

  const cornerRadiusMap = {
    tl: 'borderTopLeftRadius',
    tr: 'borderTopRightRadius',
    bl: 'borderBottomLeftRadius',
    br: 'borderBottomRightRadius'
  }

  const cornerStyle = flatCorners.reduce((style, corner) => {
    style[cornerRadiusMap[corner]] = 0
    return style
  }, {})

  const handleMouseDown = (e) => {
    if (!draggable) return
    if (e.target.closest('[data-no-drag]')) return
    e.preventDefault()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
      requestAnimationFrame(updateFlatCorners)
    }

    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    const handleEscape = (e) => {
      if ((e.key === 'X' || e.key === 'x' || e.key === 'Escape' || e.key === 'Backspace') && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <Glass
      ref = { popupRef }
      className = { `popup-base ${ className }` }
      onMouseDown = { handleMouseDown }
      style = {{
        transform: `translate(calc(-50% + ${ pos.x }px), calc(-50% + ${ pos.y }px))`,
        userSelect: isDragging ? 'none' : 'auto',
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        ...cornerStyle,
        ...props.style
      }}
    >
      { children }
    </Glass>,
    document.body
  )
}