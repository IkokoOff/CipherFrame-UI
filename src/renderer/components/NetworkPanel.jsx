import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import { useStore } from '../store/useStore'
import Panel from './Panel'

function fmtB(b, sec=false) {
  if (!b) return `0 B${sec?'/s':''}`
  const u=['B','KB','MB','GB']; let i=0
  while(b>=1024&&i<3){b/=1024;i++}
  return `${b.toFixed(i?1:0)} ${u[i]}${sec?'/s':''}`
}

// FIX 5 — Circular buffer : zéro allocation
function CircularBuffer(size, init=0) {
  const buf = new Float32Array(size).fill(init)
  let head = 0
  return {
    push(v) { buf[head] = v; head = (head+1) % size },
    toArray() {
      const out = new Float32Array(size)
      for (let i=0; i<size; i++) out[i] = buf[(head+i) % size]
      return out
    },
    max() {
      let m = 0
      for (let i=0; i<size; i++) if(buf[i]>m) m=buf[i]  // FIX 4 — boucle, pas spread
      return m || 1
    }
  }
}

function Sparkline({ bufRef, color, height=20, animKey, ctxRef, sizeRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width | 0
      if (sizeRef.current.w === w) return
      canvas.width = w; canvas.height = height
      sizeRef.current = { w, h: height }
      ctxRef.current = canvas.getContext('2d') // FIX 3 — ctx cache
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [height])

  useAnimTask(animKey, () => {
    const ctx = ctxRef.current
    if (!ctx || !sizeRef.current.w) return
    const { w: W, h: H } = sizeRef.current
    const data = bufRef.current.toArray()
    const max  = bufRef.current.max()
    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    const step = W / (data.length-1)
    for (let i=0; i<data.length; i++) {
      const x = i * step
      const y = H - (data[i]/max)*H*0.9 - 1
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
    }
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
  }, 200)

  return <canvas ref={canvasRef} height={height} style={{width:'100%',display:'block'}}/>
}

export default function NetworkPanel() {
  const rxBuf  = useRef(CircularBuffer(40))
  const txBuf  = useRef(CircularBuffer(40))
  const latBuf = useRef(CircularBuffer(40, 15))

  // Contexts et sizes pour chaque sparkline
  const rxCtx  = useRef(null); const rxSize  = useRef({w:0,h:0})
  const txCtx  = useRef(null); const txSize  = useRef({w:0,h:0})
  const latCtx = useRef(null); const latSize = useRef({w:0,h:0})

  const rxTextRef  = useRef(null)
  const txTextRef  = useRef(null)
  const latValRef  = useRef(null)

  useEffect(() => {
    return useStore.subscribe(s => s.sysinfo, (info) => {
      if (!info) return
      const rx = info.net?.rxSec||0, tx = info.net?.txSec||0
      rxBuf.current.push(rx); txBuf.current.push(tx)
      if (rxTextRef.current) rxTextRef.current.textContent = fmtB(rx, true)
      if (txTextRef.current) txTextRef.current.textContent = fmtB(tx, true)
    })
  }, [])

  useAnimTask('latency', () => {
    const lat = Math.random()*30+5|0
    latBuf.current.push(lat)
    const color = lat>50?'#ff2050':lat>25?'#ffd700':'#00ff88'
    if (latValRef.current) {
      latValRef.current.textContent = lat+'ms'
      latValRef.current.style.color = color
    }
  }, 2000)

  return (
    <Panel title="NETWORK I/O" badge="ETH0">
      <div style={{padding:'8px 10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',
          paddingBottom:'8px',borderBottom:'1px solid rgba(0,245,255,0.1)'}}>
          <div>
            <div style={{fontSize:'8px',letterSpacing:'0.05em',
              color:'rgba(0,245,255,0.45)',marginBottom:'4px'}}>▼ INBOUND</div>
            <div ref={rxTextRef}
              style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#00ff88',
                letterSpacing:'0.05em',textShadow:'0 0 8px rgba(0,255,136,0.4)'}}>0 B/s</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'8px',letterSpacing:'0.05em',
              color:'rgba(0,245,255,0.45)',marginBottom:'4px'}}>▲ OUTBOUND</div>
            <div ref={txTextRef}
              style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#ff00aa',
                letterSpacing:'0.05em',textShadow:'0 0 8px rgba(255,0,170,0.4)'}}>0 B/s</div>
          </div>
        </div>
        <div style={{position:'relative',height:'50px',marginBottom:'6px'}}>
          <div style={{position:'absolute',inset:0}}>
            <Sparkline bufRef={rxBuf} color="rgba(0,255,136,0.7)" height={50}
              animKey="spark-rx" ctxRef={rxCtx} sizeRef={rxSize}/>
          </div>
          <div style={{position:'absolute',inset:0}}>
            <Sparkline bufRef={txBuf} color="rgba(255,0,170,0.55)" height={50}
              animKey="spark-tx" ctxRef={txCtx} sizeRef={txSize}/>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',
          fontSize:'8px',letterSpacing:'0.05em',marginBottom:'4px'}}>
          <span style={{color:'rgba(0,245,255,0.4)'}}>LATENCY</span>
          <span ref={latValRef} style={{color:'#00ff88'}}>--ms</span>
        </div>
        <Sparkline bufRef={latBuf} color="rgba(0,255,136,0.5)" height={18}
          animKey="spark-lat" ctxRef={latCtx} sizeRef={latSize}/>
      </div>
    </Panel>
  )
}
