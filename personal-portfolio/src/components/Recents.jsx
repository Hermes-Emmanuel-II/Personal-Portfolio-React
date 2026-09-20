import { useEffect, useState } from 'react'

import { Clarity } from './Header'
import { Bar } from './Hero'
import { Popup } from './Popup'

const recentItems = [

]

function label (date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (diff <= 0) return 'Published today'
  if (diff === 1) return 'Published yesterday'
  if (diff < 30) return `Published ${ diff } days ago`
  return 'skip'
}

export function getRecentItems () {
  return recentItems.filter(item => label(item.date) !== 'skip')
}

export default function Recents ({ isOpen, onClose }) {
  const displayItems = getRecentItems()
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (displayItems.length === 0) return
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % displayItems.length)
      setProgress(0)
    }, 10000)
    return () => clearInterval(interval)
  }, [displayItems.length])

  if (displayItems.length === 0) {
    return (
      <Popup isOpen = { isOpen } onClose = { onClose } className = 'recents-popup column'>
        <div className = 'center in-w in-h'>
          <span>No recent items to show at the moment.</span>
        </div>
      </Popup>
    )
  }

  const currentItem = displayItems[current]

  function goPrev (e) {
    e.preventDefault()
    e.stopPropagation()
    setCurrent(prev => (prev - 1 + displayItems.length) % displayItems.length)
    setProgress(0)
  }

  function goNext (e) {
    e.preventDefault()
    e.stopPropagation()
    setCurrent(prev => (prev + 1) % displayItems.length)
    setProgress(0)
  }

  return (
    <Popup isOpen = { isOpen } onClose = { onClose } className = 'recents-popup column'>
      <div
        className = 'column'
        style = {{ userSelect: 'none' }}
      >
        <span className = 'block'>Recents</span>
        <div className = 'in-w flex gap'>
          { displayItems.map((el, index) => (
            <Bar
              vert = { false }
              style = {{ backgroundColor: index === current ? 'var(--accent-2)' : undefined }}
            />
          )) }
          <Clarity text = 'Recently published work and posts' data-no-drag tabIndex = { isOpen ? 0 : -1 }/>
        </div>
      </div>
      <div className = 'recents-item-wrapper column'>
        <a
          className = 'relative block recents-item in-w'
          href = { currentItem.link || undefined }
          target = { currentItem.link ? '_blank' : undefined }
          rel = { currentItem.link ? 'noreferrer' : undefined }
          data-no-drag
        >
            { currentItem.thumbnail && <img src = { currentItem.thumbnail } alt = { currentItem.title } className = 'in-w in-h absolute block'/> }
            <span className = 'recents-type absolute block'>{ currentItem.type }</span>
            <span
              className = { `recents-nav prev absolute square ctr-abs-y ${ displayItems.length <= 2 ? 'none' : '' }` }
              onClick = { goPrev }
              onKeyDown = { (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') goPrev(e)
              } }
              tabIndex = { isOpen && displayItems.length > 2 ? 0 : -1 }
              data-keep-tabbable
              role = 'button'
              aria-label = 'Previous item'
            >
              <i className = 'fa-solid fa-caret-right'></i>
            </span>
            <span
              className = { `recents-nav next absolute square ctr-abs-y ${ displayItems.length === 1 ? 'none' : '' }` }
              onClick = { goNext }
              onKeyDown = { (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') goNext(e)
              } }
              tabIndex = { isOpen && displayItems.length !== 1 ? 0 : -1 }
              data-keep-tabbable
              role = 'button'
              aria-label = 'Next item'
            >
              <i className = 'fa-solid fa-caret-right'></i>
            </span>
        </a>
        <div className = { `recents-progress relative in-w ${ displayItems.length === 1 ? 'none' : '' }` }>
          <div className = 'in-h absolute' style = {{ width: `${ progress }%` }}></div>
        </div>
        <div className = 'column gap-lg'>
          <a
            className = 'block recents-title'
            href = { currentItem.link || undefined }
            target = { currentItem.link ? '_blank' : undefined }
            rel = { currentItem.link ? 'noreferrer' : undefined }
            data-no-drag
          >{ currentItem.title }</a>
          <span className = 'block recents-label'>{ label(currentItem.date) }</span>
        </div>
      </div>
    </Popup>
  )
}