import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/geist-sans/latin-400.css'
import '@fontsource/geist-sans/latin-500.css'
import '@fontsource/geist-sans/latin-600.css'
import '@fontsource/geist-sans/latin-700.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@/components/arc/foundation.css'
import { SoundEffects } from '@/components/ui/sound'
import { SurfaceProvider } from '@/lib/surface-context'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SurfaceProvider value={1}>
      <SoundEffects>
        <App />
      </SoundEffects>
    </SurfaceProvider>
  </React.StrictMode>,
)
