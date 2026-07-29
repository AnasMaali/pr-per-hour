import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/i18n'
import '@/shared/styles/index.css'
import { App } from '@/app/App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
