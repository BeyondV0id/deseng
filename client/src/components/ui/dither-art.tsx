import { useEffect, useRef } from 'react'
import styles from './dither-art.module.css'

const vertex = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

const fragment = `precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float phase;
uniform vec3 ink;
uniform vec3 pigment;
uniform vec3 light;
float bayer2(vec2 p) {
  p = floor(p);
  return fract(p.x * 0.5 + p.y * p.y * 0.75);
}
float bayer8(vec2 p) {
  return bayer2(p / 4.0) * 0.0625 + bayer2(p / 2.0) * 0.25 + bayer2(p);
}
void main() {
  vec2 cell = floor(gl_FragCoord.xy / 2.0);
  vec2 uv = (cell * 2.0 - resolution * 0.5) / resolution.y;
  float t = time * 0.18 + phase;
  float diagonal = uv.x * 1.4 + uv.y * 0.65;
  float ripple = sin(length(uv - vec2(sin(t) * 0.6, -0.5)) * 4.5 - t);
  float field = sin(diagonal * 3.2 + ripple * 1.15 + t);
  field = field * 0.5 + 0.5;
  float threshold = bayer8(cell) - 0.5;
  float level = floor(clamp(field + threshold / 4.0, 0.0, 1.0) * 4.0 + 0.5) / 4.0;
  vec3 color = mix(ink, pigment, smoothstep(0.0, 0.7, level));
  color = mix(color, light, smoothstep(0.65, 1.0, level));
  gl_FragColor = vec4(color, 1.0);
}`

/** Ordered-dither interference bands. Animation stops outside the viewport. */
export function DitherArt({ phase = 0 }: { phase?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
    if (!gl) return
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
    }
    const vert = compile(gl.VERTEX_SHADER, vertex)
    const frag = compile(gl.FRAGMENT_SHADER, fragment)
    const program = gl.createProgram()
    if (!vert || !frag || !program) {
      shaders.forEach(shader => gl.deleteShader(shader))
      if (program) gl.deleteProgram(program)
      return
    }
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      shaders.forEach(shader => gl.deleteShader(shader))
      gl.deleteProgram(program)
      return
    }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, 'resolution')
    const time = gl.getUniformLocation(program, 'time')
    gl.uniform1f(gl.getUniformLocation(program, 'phase'), phase)
    const tokens = getComputedStyle(canvas)
    for (const name of ['ink', 'pigment', 'light']) {
      const components = tokens.getPropertyValue(`--discovery-shader-${name}`).trim().split(/\s+/).map(Number)
      gl.uniform3f(gl.getUniformLocation(program, name), components[0] ?? 0, components[1] ?? 0, components[2] ?? 0)
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let frame = 0
    let last = 0
    let elapsed = 0
    const draw = () => {
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, elapsed)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const tick = (now: number) => {
      if (now - last >= 1000 / 24) {
        elapsed += Math.min(now - last, 80) / 1000
        last = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      draw()
      if (visible && !document.hidden && !reduced.matches) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    const size = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight))
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw()
    }
    size()
    const resize = new ResizeObserver(size)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      sync()
    })
    resize.observe(canvas)
    intersection.observe(canvas)
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    canvas.dataset.shader = 'ready'
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      shaders.forEach(shader => gl.deleteShader(shader))
    }
  }, [phase])
  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
}
