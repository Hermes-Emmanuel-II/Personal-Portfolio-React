import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import './index.css'
import './media-queries.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <svg width = '0' height = '0' aria-hidden = 'false' className = 'none'>
        <filter id = 'glass-distortion-nav'>
          <feOffset in = 'SourceGraphic' dx = '0' dy = '-24' />
        </filter>
        <filter id = 'glass-distortion-skip'>
          <feOffset in = 'SourceGraphic' dx = '0' dy = '45' />
        </filter>
        <filter id = 'glass-distortion-recent'>
          <feOffset in = 'SourceGraphic' dx = '0' dy = '170.5' />
        </filter>
        <filter id = 'glass-distortion-inspect'>
          <feOffset in = 'SourceGraphic' dx = '0' dy = '145.875' />
        </filter>
    </svg>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
)