import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/wabi_sabi.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
