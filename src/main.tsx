import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import './PublicSiteFont.css'

import PublicHomePage from './PublicHomePage'

const App = lazy(() => import('./App.tsx'))

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

const currentPath = window.location.pathname || '/'

createRoot(root).render(
  <StrictMode>
    {currentPath === '/' ? (
      <PublicHomePage />
    ) : (
      <Suspense
        fallback={
          <div
            dir="rtl"
            style={{
              minHeight: '100vh',
              display: 'grid',
              placeItems: 'center',
              background: '#f6f0e7',
              color: '#3b241b',
              fontFamily:
                '"Noto Kufi Arabic", Tahoma, Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            جاري تحميل برني...
          </div>
        }
      >
        <App />
      </Suspense>
    )}
    <Analytics />
  </StrictMode>,
)