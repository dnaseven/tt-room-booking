import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

export const renderClient = (container: HTMLElement) => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
