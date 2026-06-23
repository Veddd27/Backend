import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * main.jsx — entry point. React renders <App /> into the #root div in index.html.
 * StrictMode helps catch bugs during development (runs effects twice).
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
