import React from 'react'
import { MotionConfig } from 'motion/react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/funnel-sans'
import '@/components/arc/foundation.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { SoundEffects } from '@/components/ui/sound'
import { SurfaceProvider } from '@/lib/surface-context'
import { ShapeProvider } from '@/lib/shape-context'
import { IconProvider } from '@/lib/icon-context'
import { fluidIcons } from '@/components/icons'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <SurfaceProvider value={1}>
        <ShapeProvider defaultShape="pill">
          <IconProvider icons={fluidIcons}>
            <SoundEffects>
              <AuthProvider>
                <App />
              </AuthProvider>
            </SoundEffects>
          </IconProvider>
        </ShapeProvider>
      </SurfaceProvider>
    </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>,
)
