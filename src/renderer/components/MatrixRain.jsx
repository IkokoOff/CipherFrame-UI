import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

const CHARS = '01アイウエオABCDEF@#$%∑∂∇<>?!'.split('')
const SZ = 11
const FONT = `${SZ}px 'Share Tech Mono',monospace`

export default function MatrixRain() {
  const canvasRef = useRef(null)
  const ctxRef    = useRef(null) // FIX 3 — ctx en cache
  const stateRef  = useRef({ cols:0, drops:[], w:0, h:0, fontSet:false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => {
      const w = canvas.offsetWidth|0, h = canvas.offsetHeight|0
      if (stateRef.current.w===w && stateRef.current.h===h) return
      canvas.width = w; canvas.height = h
      const cols = w/SZ|0
      stateRef.current = { cols, drops: Array(cols).fill(1), w, h, fontSet: false }
      ctxRef.current = canvas.getContext('2d', { alpha:false }) // recréer ctx au resize
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  useAnimTask('matrix', () => {
    const ctx = ctxRef.current
    if (!ctx) return
    const { cols, drops, w, h, fontSet } = stateRef.current
    if (!cols) return

    // FIX 10 — font assigné une seule fois
    if (!fontSet) {
      ctx.font = FONT
      stateRef.current.fontSet = true
    }

    ctx.fillStyle = 'rgba(2,8,14,0.07)'
    ctx.fillRect(0, 0, w, h)
    for (let i=0; i<cols; i++) {
      ctx.fillStyle = Math.random()>0.93 ? '#00f5ff' : '#005566'
      ctx.fillText(CHARS[Math.random()*CHARS.length|0], i*SZ, drops[i]*SZ)
      if (drops[i]*SZ > h && Math.random()>0.975) drops[i] = 0
      drops[i]++
    }
  }, 1000/18)

  return (
    <Panel title="MATRIX FEED">
      <canvas ref={canvasRef}
        style={{width:'100%',height:'100%',contain:'strict',willChange:'contents',display:'block'}}/>
    </Panel>
  )
}
