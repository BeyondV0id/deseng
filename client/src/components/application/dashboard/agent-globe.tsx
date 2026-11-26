import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/arc/button/button'
import { agentGlyphs, drawAgentGlobe, globeRadius, loadGlyph } from './agent-globe-drawing'
import styles from './agent-globe.module.css'

const idleSpeed = .07
const dragDecay = 1.4

export function AgentGlobe({ loading }: { loading: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playing = useRef(true)
  const resume = useRef<(() => void) | null>(null)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highlighted, setHighlighted] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const glyphs = agentGlyphs.map((glyph) => ({ ...glyph, mask: new Uint8Array(0) }))
    const pointer = { x: -1, y: -1 }
    let angle = 0
    let velocity = 0
    let previousFrame = 0
    let previousScroll = window.scrollY
    let frame = 0
    let width = 0
    let height = 0
    let visible = true
    let disposed = false
    let activeGlyph = ''
    let drag: { id: number; x: number; time: number } | undefined

    function render(time: number) {
      frame = 0
      if (!context || !canvas || !visible || !width || !height) return
      const elapsed = previousFrame ? Math.min((time - previousFrame) / 1000, .05) : 0
      previousFrame = time
      if (!loading && playing.current && !motionPreference.matches && !drag) {
        angle += (idleSpeed + velocity) * elapsed
        velocity *= Math.exp(-elapsed * dragDecay)
      }

      const dark = document.documentElement.classList.contains('dark')
      const next = drawAgentGlobe(context, { width, height, angle, pointer, glyphs, dark })
      if (next !== activeGlyph) {
        activeGlyph = next
        setHighlighted(next)
      }
      if (!loading && playing.current && !motionPreference.matches && !document.hidden) schedule()
    }

    function schedule() {
      if (!disposed && visible && !frame) frame = requestAnimationFrame(render)
    }

    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return
      width = entry.contentRect.width
      height = entry.contentRect.height
      const scale = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      context.setTransform(scale, 0, 0, scale, 0, 0)
      schedule()
    })
    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      previousFrame = 0
      previousScroll = window.scrollY
      if (visible) schedule()
    })
    const theme = new MutationObserver(schedule)

    function onMove(event: PointerEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      if (drag?.id === event.pointerId) {
        const delta = (event.clientX - drag.x) / globeRadius(width, height)
        angle += delta
        velocity = Math.max(-6, Math.min(6, 1000 * delta / Math.max(1, event.timeStamp - drag.time)))
        drag = { id: event.pointerId, x: event.clientX, time: event.timeStamp }
      }
      schedule()
    }

    function onDown(event: PointerEvent) {
      if (loading || !canvas || !event.isPrimary || event.button !== 0) return
      const rect = canvas.getBoundingClientRect()
      const radius = globeRadius(width, height)
      const x = event.clientX - rect.left - width / 2
      const y = event.clientY - rect.top - height / 2
      if (Math.hypot(x, y) > radius) return
      onMove(event)
      drag = { id: event.pointerId, x: event.clientX, time: event.timeStamp }
      velocity = 0
      canvas.setPointerCapture(event.pointerId)
      canvas.dataset.dragging = ''
    }

    function onLeave() {
      pointer.x = -1
      pointer.y = -1
      schedule()
    }

    function onEnd(event: PointerEvent) {
      if (!canvas || drag?.id !== event.pointerId) return
      if (event.type !== 'pointerup' || event.timeStamp - drag.time > 100) velocity = 0
      drag = undefined
      delete canvas.dataset.dragging
      if (event.type === 'pointercancel') onLeave()
      schedule()
    }

    function onScroll() {
      const position = window.scrollY
      if (!loading && visible && playing.current && !motionPreference.matches) angle += (position - previousScroll) * .004
      previousScroll = position
      schedule()
    }

    function onPreferenceChange() {
      setReducedMotion(motionPreference.matches)
      previousFrame = 0
      schedule()
    }

    onPreferenceChange()
    resize.observe(canvas)
    intersection.observe(canvas)
    theme.observe(document.documentElement, { attributeFilter: ['class'] })
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerup', onEnd)
    canvas.addEventListener('pointercancel', onEnd)
    canvas.addEventListener('lostpointercapture', onEnd)
    motionPreference.addEventListener('change', onPreferenceChange)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', schedule)
    resume.current = () => {
      previousFrame = 0
      schedule()
    }
    for (const glyph of glyphs) {
      void loadGlyph(glyph.asset).then((mask) => { glyph.mask = mask; schedule() })
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      theme.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerup', onEnd)
      canvas.removeEventListener('pointercancel', onEnd)
      canvas.removeEventListener('lostpointercapture', onEnd)
      motionPreference.removeEventListener('change', onPreferenceChange)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', schedule)
      resume.current = null
    }
  }, [loading])

  function togglePlayback() {
    playing.current = paused
    setPaused(!paused)
    resume.current?.()
  }

  return <div className={styles.stage}>
    <canvas
      ref={canvasRef}
      className={styles.globe}
      data-interactive={!loading || undefined}
      role="img"
      aria-label="Dotted globe with the marks of Reference, Grok Bots, Hermes, T3 Code, OpenCode, Claude Code, Codex, and Antigravity"
    />
    {highlighted && <span className={styles.label} aria-hidden="true">{highlighted}</span>}
    {!loading && !reducedMotion && <Button
      className={styles.playback}
      size="sm"
      variant="secondary"
      type="button"
      onClick={togglePlayback}
    >{paused ? 'Play globe' : 'Pause globe'}</Button>}
  </div>
}
