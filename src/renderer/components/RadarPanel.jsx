import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

const RINGS = [0.33, 0.66, 1.0]
const BLIPS = Array.from({length:6}, () => ({
  r: 0.2 + Math.random() * 0.7,
  a: Math.random() * Math.PI * 2,
  v: 0
}))
let angle = 0

export default function RadarPanel() {
  const canvasRef  = useRef(null)
  const ctxRef     = useRef(null)
  const sizeRef    = useRef({ w: 0, h: 0, cx: 0, cy: 0, R: 0 })
  const gradRef    = useRef(null) // gradient mis en cache

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => {
      const w = canvas.offsetWidth | 0
      const h = canvas.offsetHeight | 0
      if (sizeRef.current.w === w && sizeRef.current.h === h) return
      canvas.width = w; canvas.height = h
      const cx = w/2, cy = h/2, R = Math.min(cx, cy) - 6
      sizeRef.current = { w, h, cx, cy, R }
      // Recréer le gradient seulement au resize
      const ctx = ctxRef.current
      ctxRef.current = canvas.getContext('2d')
      const g = ctxRef.current.createLinearGradient(cx, cy-R, cx, cy)
      g.addColorStop(0, 'rgba(0,245,255,0)')
      g.addColorStop(1, 'rgba(0,245,255,0.22)')
      gradRef.current = g
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  useAnimTask('radar', () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h, cx, cy, R } = sizeRef.current
    if (!R) return
    const ctx = ctxRef.current

    ctx.fillStyle = 'rgba(0,12,22,0.97)'
    ctx.fillRect(0, 0, w, h)

    ctx.lineWidth = 1
    ;[.33,.66,1].forEach(r => {
      ctx.beginPath(); ctx.arc(cx, cy, R*r, 0, Math.PI*2)
      ctx.strokeStyle = r===1 ? 'rgba(0,245,255,0.22)' : 'rgba(0,245,255,0.05)'
      ctx.stroke()
    })
    ctx.strokeStyle = 'rgba(0,245,255,0.04)'
    ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy)
    ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke()

    // sweep — gradient depuis le cache
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle)
    ctx.beginPath(); ctx.moveTo(0,0)
    ctx.arc(0, 0, R, -Math.PI/2, -Math.PI/2 + Math.PI*.6)
    ctx.closePath()
    ctx.fillStyle = gradRef.current || 'rgba(0,245,255,0.15)'; ctx.fill()
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-R)
    ctx.strokeStyle = 'rgba(0,245,255,0.8)'; ctx.lineWidth = 1.5
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 5; ctx.stroke()
    ctx.restore(); ctx.shadowBlur = 0

    BLIPS.forEach(b => {
      const da = ((b.a - angle) % (Math.PI*2) + Math.PI*2) % (Math.PI*2)
      b.v = da < 1.3 ? 1 - da/1.3 : Math.max(0, b.v - 0.05)
      if (b.v > 0.02) {
        const bx = cx + Math.cos(b.a)*R*b.r
        const by = cy + Math.sin(b.a)*R*b.r
        ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI*2)
        ctx.fillStyle = `rgba(0,255,136,${b.v})`
        ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8*b.v; ctx.fill()
        ctx.shadowBlur = 0
      }
    })
    angle += 0.022
  }, 1000/24)

  return (
    <Panel title="RADAR · SCAN">
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'4px',height:'100%'}}>
        <canvas ref={canvasRef}
          style={{width:'100%',height:'100%',contain:'strict',willChange:'contents',display:'block'}}/>
      </div>
    </Panel>
  )
}
