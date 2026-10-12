import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/golos-text/cyrillic-400.css'
import '@fontsource/golos-text/cyrillic-500.css'
import '@fontsource/golos-text/cyrillic-600.css'
import '@fontsource/golos-text/cyrillic-700.css'
import '@fontsource/golos-text/latin-400.css'
import '@fontsource/golos-text/latin-500.css'
import '@fontsource/golos-text/latin-600.css'
import '@fontsource/golos-text/latin-700.css'
import '@fontsource/unbounded/cyrillic-600.css'
import '@fontsource/unbounded/cyrillic-800.css'
import '@fontsource/unbounded/latin-600.css'
import '@fontsource/unbounded/latin-800.css'
import '@fontsource/noto-sans-hebrew/hebrew-400.css'
import '@fontsource/noto-sans-hebrew/hebrew-500.css'
import '@fontsource/noto-sans-hebrew/hebrew-600.css'
import '@fontsource/noto-sans-hebrew/hebrew-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
