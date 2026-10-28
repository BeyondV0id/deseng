import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Inter is the app's only face: one variable family covers body, display and
// the sidebar, which animates font weight as part of Fluid Functionalism.
import '@fontsource-variable/inter'
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
  </React.StrictMode>,
)
