import { createRoot } from 'react-dom/client'
import GradientASCII, { type GradientASCIIShape } from './client/src/components/brand/gradient-ascii'

const DISC: React.CSSProperties = {
  position: 'relative',
  display: 'block',
  width: 27,
  height: 27,
  flex: 'none',
  overflow: 'hidden',
  borderRadius: '50%',
}

const FIELD: React.CSSProperties = {
  position: 'absolute',
  inset: -13.5,
  transform: 'scale(0.5)',
  transformOrigin: 'center',
  pointerEvents: 'none',
}

const COLORS = ['#120f07', '#5f5200', '#cdb900', '#f4ef09', '#fffbd6']

function Disc({
  shape,
  cellSize = 8,
  zoom,
  lightMode,
}: {
  shape: GradientASCIIShape
  cellSize?: number
  zoom?: number
  lightMode?: boolean
}) {
  return (
    <span style={zoom ? { ...DISC, transform: `scale(${zoom})` } : DISC}>
      <GradientASCII
        style={FIELD}
        colors={COLORS}
        shape={shape}
        characters=" =+xX0S8#@"
        cellSize={cellSize}
        density={0.85}
        glyphOpacity={0.9}
        gradientOpacity={0.95}
        glow={0.15}
        softness={0.5}
        scale={1}
        flow={0.6}
        speed={0}
        flicker={0}
        grain={0}
        depthOfField={0}
        lightMode={lightMode}
        mouseInteraction={false}
        clickEffect="none"
        intro={false}
        dpr={2}
      />
    </span>
  )
}

const box: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 96,
  height: 96,
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  background: '#fff',
}

const SHAPES: GradientASCIIShape[] = ['eclipse', 'horizon', 'pinch', 'rise']

function Row({ lightMode, dark }: { lightMode?: boolean; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ textAlign: 'center' }}>
          <div style={{ ...box, background: dark ? '#060606' : '#fff', borderColor: dark ? '#1e1e1e' : '#e5e7eb' }}>
            <Disc shape={shape} zoom={2.4} lightMode={lightMode} />
          </div>
          <div style={{ font: '11px/1.4 Inter, sans-serif', color: '#6b6b6b', marginTop: 5 }}>{shape}</div>
        </div>
      ))}
    </div>
  )
}

function App() {
  return (
    <div style={{ padding: 28, font: '13px/1.5 Inter, system-ui, sans-serif', color: '#151515' }}>
      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-.02em', marginBottom: 2 }}>
        Pure ASCII field, no CSS gradient behind it
      </div>
      <p style={{ color: '#6b6b6b', marginTop: 0, marginBottom: 14, maxWidth: '70ch' }}>
        Circle clip, nothing drawn underneath. Cell 8, three characters across the 54px field, shown at 2.4×.
      </p>
      <div style={{ font: '11px/1 Inter, sans-serif', color: '#6b6b6b', marginBottom: 6 }}>Dark surface, lightMode off</div>
      <Row dark />
      <div style={{ font: '11px/1 Inter, sans-serif', color: '#6b6b6b', marginBottom: 6 }}>Light surface, lightMode on</div>
      <Row lightMode />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
