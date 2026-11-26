// Product artwork from Antigravity and OpenCode's press kits, Nous Research's
// Hermes repository, Anthropic's Clawd artwork, OpenAI's Codex page, and the
// T3 Code app's T3 mark. The Grok Bots mask comes from the supplied mascot.
import antigravity from '@/assets/agent-marks/antigravity.svg'
import claude from '@/assets/agent-marks/claude-code.png'
import codex from '@/assets/agent-marks/codex.png'
import grok from '@/assets/agent-marks/grok.png'
import hermes from '@/assets/agent-marks/hermes.svg'
import opencode from '@/assets/agent-marks/opencode.svg'
import t3code from '@/assets/agent-marks/t3code.png'

const maskSize = 48
const sampleSize = 144
const badgeRadius = .245
const markScale = .73

function placeGlyph(name: string, asset: string, longitude: number, latitude: number) {
  return { name, asset, longitude, latitude }
}

export const agentGlyphs = [
  placeGlyph('Reference', '/brand/reference-mark.svg', -.30, .28),
  placeGlyph('Grok Bots', grok, .33, -.25),
  placeGlyph('T3 Code', t3code, -.76, -.36),
  placeGlyph('OpenCode', opencode, .89, .35),
  placeGlyph('Claude Code', claude, -1.58, .14),
  placeGlyph('Codex', codex, 1.69, -.30),
  placeGlyph('Hermes', hermes, -2.33, -.40),
  placeGlyph('Antigravity', antigravity, 2.74, .24),
]

export async function loadGlyph(asset: string) {
  const image = new Image()
  image.src = asset
  try {
    await image.decode()
  } catch {
    return new Uint8Array(0)
  }

  const surface = document.createElement('canvas')
  surface.width = surface.height = sampleSize
  const context = surface.getContext('2d', { willReadFrequently: true })
  if (!context) return new Uint8Array(0)
  const scale = sampleSize / Math.max(image.naturalWidth, image.naturalHeight)
  context.drawImage(image, 0, 0, image.naturalWidth * scale, image.naturalHeight * scale)

  const { data } = context.getImageData(0, 0, sampleSize, sampleSize)
  let left = sampleSize
  let top = sampleSize
  let right = 0
  let bottom = 0
  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      if (data[(y * sampleSize + x) * 4 + 3] < 100) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  if (right <= left || bottom <= top) return new Uint8Array(0)

  const width = right - left + 1
  const height = bottom - top + 1
  const size = Math.max(width, height)
  const copy = document.createElement('canvas')
  copy.width = copy.height = maskSize
  const target = copy.getContext('2d')
  if (!target) return new Uint8Array(0)
  target.drawImage(surface, left, top, width, height,
    (size - width) * maskSize / size / 2, (size - height) * maskSize / size / 2,
    width * maskSize / size, height * maskSize / size)
  const cropped = target.getImageData(0, 0, maskSize, maskSize).data
  return Uint8Array.from({ length: maskSize ** 2 }, (_, index) => cropped[index * 4 + 3])
}

type Glyph = ReturnType<typeof placeGlyph> & { mask: Uint8Array }
type Point = { x: number; y: number }

type GlobeFrame = {
  width: number
  height: number
  angle: number
  pointer: Point
  glyphs: Glyph[]
  dark: boolean
}

function fillDots(context: CanvasRenderingContext2D, paths: Path2D[], color: string, opacity: number) {
  context.fillStyle = color
  for (const [index, path] of paths.entries()) {
    context.globalAlpha = (index + 1) / paths.length * opacity
    context.fill(path)
  }
  context.globalAlpha = 1
}

export function globeRadius(width: number, height: number) {
  return Math.min(width, height) / 2 - 5
}

export function drawAgentGlobe(context: CanvasRenderingContext2D, frame: GlobeFrame) {
  const { width, height, angle, glyphs, pointer, dark } = frame
  context.clearRect(0, 0, width, height)
  const radius = globeRadius(width, height)
  if (radius <= 0) return ''

  const centerX = width / 2
  const centerY = height / 2
  const gap = Math.max(2.8, radius / 42)

  // The badges travel with the sphere. Their artwork faces the viewer so a
  // narrow wordmark or the bot's eyes stay legible as they pass the edge.
  const visible = glyphs.flatMap((glyph) => {
    const yaw = glyph.longitude + angle
    const pitch = Math.cos(glyph.latitude)
    const depth = Math.cos(yaw) * pitch
    if (depth < .12 || !glyph.mask.length) return []
    return [{
      ...glyph,
      depth,
      x: centerX + Math.sin(yaw) * pitch * radius,
      y: centerY + Math.sin(glyph.latitude) * radius,
      radius: radius * badgeRadius * (.52 + .48 * depth),
    }]
  }).sort((first, second) => second.depth - first.depth)

  const active = visible.find((glyph) => Math.hypot(pointer.x - glyph.x, pointer.y - glyph.y) < glyph.radius)?.name ?? ''
  const surface = Array.from({ length: 8 }, () => new Path2D())
  const rim = Array.from({ length: 8 }, () => new Path2D())
  const marks = Array.from({ length: 8 }, () => new Path2D())
  const hot = Array.from({ length: 8 }, () => new Path2D())

  for (let py = centerY - radius + gap / 2; py < centerY + radius; py += gap) {
    const y = (py - centerY) / radius
    for (let px = centerX - radius + gap / 2; px < centerX + radius; px += gap) {
      const x = (px - centerX) / radius
      const depth = 1 - x * x - y * y
      if (depth <= 0) continue

      const z = Math.sqrt(depth)
      let brightness = Math.min(.99, (.52 * z + .28) * (1 - x * .54))
      let size = (.26 + .73 * brightness) * gap * .48
      let paths = surface
      if (x < -.20 && z < .36) {
        paths = rim
        brightness = Math.max(.72, brightness)
        size = gap * .35
      }

      for (const glyph of visible) {
        const dx = px - glyph.x
        const dy = py - glyph.y
        if (dx * dx + dy * dy > glyph.radius ** 2) continue
        const scale = glyph.radius * markScale
        const ix = Math.floor((dx / scale + 1) * maskSize / 2)
        const iy = Math.floor((dy / scale + 1) * maskSize / 2)
        const alpha = ix >= 0 && iy >= 0 && ix < maskSize && iy < maskSize
          ? glyph.mask[iy * maskSize + ix] / 255 : 0
        if (alpha > .36) {
          const selected = glyph.name === active
          paths = selected ? hot : marks
          brightness = Math.min(.99, (selected ? .52 : .34) + .43 * alpha)
          size = gap * (selected ? .49 : .43) * (.63 + .37 * alpha)
        } else {
          size = 0
        }
        break
      }

      if (size <= 0) continue
      const path = paths[Math.floor(brightness * paths.length)]
      path.moveTo(px + size, py)
      path.arc(px, py, size, 0, 2 * Math.PI)
    }
  }

  fillDots(context, surface, dark ? '#a4addc' : '#6e7aab', dark ? .92 : .65)
  fillDots(context, rim, dark ? '#9ca8ff' : '#5668d3', .98)
  fillDots(context, marks, dark ? '#e0e4ff' : '#3c4782', 1)
  fillDots(context, hot, dark ? '#b8c3ff' : '#273ea7', 1)
  return active
}