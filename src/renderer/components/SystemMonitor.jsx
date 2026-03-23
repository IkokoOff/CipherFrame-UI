import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Panel from './Panel'
import { useAnimTask } from '../hooks/useAnimLoop'

function fmtB(b) {
  if (!b) return '0B'
  const u = ['B','KB','MB','GB']; let i = 0
  while (b >= 1024 && i < 3) { b /= 1024; i++ }
  return `${b.toFixed(i?1:0)}${u[i]}`
}

// Stat bar entièrement en DOM direct — 0 re-render React
function StatBarDOM({ labelEl, valEl, fillEl }) {
  // refs passées depuis le parent
  return null
}

export default function SystemMonitor() {
  const canvasRef = useRef(null)
  const ctxRef    = useRef(null)           // FIX 3 — ctx en cache
  const sizeRef   = useRef({ w: 0, h: 0 })
  const cpuHistRef= useRef(Array(60).fill(0))

  // Refs DOM pour les stat bars — 0 re-render React
  const bars = useRef({
    cpu:  { fill: null, val: null },
    mem:  { fill: null, val: null },
    disk: { fill: null, val: null },
    temp: { fill: null, val: null },
  })
  const infoRefs = useRef({
    brand: null, corefreq: null, memfree: null, host: null
  })

  // ResizeObserver sur le canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width | 0, h = 36
      if (sizeRef.current.w === w) return
      canvas.width = w; canvas.height = h
      sizeRef.current = { w, h }
      ctxRef.current = canvas.getContext('2d') // recréer ctx si canvas resizé
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  // Subscribe sysinfo — met à jour le DOM directement
  useEffect(() => {
    return useStore.subscribe(s => s.sysinfo, (info) => {
      if (!info) return
      cpuHistRef.current.push(info.cpu?.load || 0)
      cpuHistRef.current.shift()

      const b = bars.current
      const r = infoRefs.current

      const setBar = (b, pct) => {
        if (!b.fill) return
        b.fill.style.width = pct + '%'
        const danger = pct > 85, warn = pct > 65
        b.fill.style.background = danger
          ? 'linear-gradient(90deg,#7a0015,#ff2050)'
          : warn
          ? 'linear-gradient(90deg,#7a5500,#ffd700)'
          : 'linear-gradient(90deg,#006680,#00f5ff)'
        b.fill.style.boxShadow = `0 0 6px ${danger?'#ff2050':warn?'#ffd700':'#00f5ff'}`
        if (b.val) b.val.textContent = pct + '%'
      }

      setBar(b.cpu,  info.cpu?.load || 0)
      setBar(b.mem,  info.mem ? Math.round(info.mem.used/info.mem.total*100) : 0)
      setBar(b.disk, info.disk?.use || 0)

      if (info.temp) {
        const tp = Math.min(100, info.temp)
        setBar(b.temp, tp)
        if (b.temp.val) b.temp.val.textContent = info.temp + '°C'
      }

      if (r.brand)    r.brand.textContent    = (info.cpu?.brand||'LOADING').substring(0,16)
      if (r.corefreq) r.corefreq.textContent = `${info.cpu?.cores||'--'} / ${info.cpu?.speed||0}`
      if (r.memfree)  r.memfree.textContent  = fmtB(info.mem?.free||0)
      if (r.host)     r.host.textContent     = info.hostname||'CIPHER'
    })
  }, [])

  // Dessin CPU graph — ctx mis en cache, font assigné une seule fois
  const fontSetRef = useRef(false)
  useAnimTask('cpu-graph', () => {
    if (!ctxRef.current || !sizeRef.current.w) return
    const ctx = ctxRef.current
    const { w: W, h: H } = sizeRef.current
    const data = cpuHistRef.current

    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(0,245,255,0.05)'
    ctx.lineWidth = 1
    ;[25,50,75].forEach(p => {
      const y = H - (p/100)*H*0.9 - 1
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke()
    })
    ctx.beginPath()
    for (let i = 0; i < data.length; i++) {
      const x = i * (W/(data.length-1))
      const y = H - (data[i]/100)*H*0.9 - 1
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
    }
    ctx.strokeStyle = 'rgba(0,245,255,0.7)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath()
    ctx.fillStyle = 'rgba(0,245,255,0.06)'; ctx.fill()
  }, 1000/15)

  // Générateur de stat bar DOM
  const mkBar = (key, label) => {
    const fillRef = el => { if(el) bars.current[key].fill = el }
    const valRef  = el => { if(el) bars.current[key].val  = el }
    return (
      <div style={{marginBottom:'9px'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'8px',
          letterSpacing:'0.05em',color:'rgba(0,245,255,0.5)',marginBottom:'3px'}}>
          <span>{label}</span>
          <span ref={valRef} style={{color:'#00f5ff'}}>0%</span>
        </div>
        <div style={{height:'3px',background:'rgba(0,245,255,0.07)',overflow:'hidden'}}>
          <div ref={fillRef} style={{height:'100%',width:'0%',
            background:'linear-gradient(90deg,#006680,#00f5ff)',
            boxShadow:'0 0 6px #00f5ff',
            // FIX 11 — width seul, pas transition-all (évite composite promotion)
            transition:'width 1s cubic-bezier(0.4,0,0.2,1)',
            position:'relative'}}>
            <div style={{position:'absolute',right:0,top:0,width:'3px',height:'100%',
              background:'#fff',boxShadow:'0 0 4px #fff'}}/>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Panel title="SYSTEM MONITOR" badge="LIVE">
      <div style={{padding:'8px 10px'}}>
        {mkBar('cpu',  'CPU')}
        {mkBar('mem',  'MEMORY')}
        {mkBar('disk', 'DISK')}
        {mkBar('temp', 'TEMP')}
        <canvas ref={canvasRef} height={36}
          style={{display:'block',width:'100%',marginTop:'4px',opacity:0.9}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginTop:'8px'}}>
          {[
            { k:'brand',    l:'PROCESSOR',   s:true },
            { k:'corefreq', l:'CORES / GHz'  },
            { k:'memfree',  l:'MEM FREE'     },
            { k:'host',     l:'HOST', g:true },
          ].map(({k,l,s,g}) => (
            <div key={k} style={{border:'1px solid rgba(0,245,255,0.1)',
              background:'rgba(0,245,255,0.02)',padding:'5px 8px'}}>
              <div style={{fontSize:'7px',letterSpacing:'0.05em',
                color:'rgba(0,245,255,0.4)',marginBottom:'2px'}}>{l}</div>
              <div ref={el=>{if(el) infoRefs.current[k]=el}}
                style={{fontFamily:'Orbitron,monospace',
                  fontSize:s?'8px':'10px',
                  color:g?'#00ff88':'#00f5ff',
                  letterSpacing:'0.05em'}}>--</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
