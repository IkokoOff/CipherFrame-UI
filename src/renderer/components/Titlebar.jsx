import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { clickSound } from '../hooks/useAudio'

export default function Titlebar() {
  const timeRef   = useRef(null)
  const dateRef   = useRef(null)
  const uptimeRef = useRef(null)

  // Horloge — DOM direct, 0 re-render React
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      const hh = String(n.getHours()).padStart(2,'0')
      const mm = String(n.getMinutes()).padStart(2,'0')
      const ss = String(n.getSeconds()).padStart(2,'0')
      if (timeRef.current) timeRef.current.textContent = `${hh}:${mm}:${ss}`
      if (dateRef.current) dateRef.current.textContent =
        n.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Uptime — subscribe Zustand, DOM direct
  useEffect(() => {
    const fmtUp = (s) => {
      if (!s) return '--'
      const h = s/3600|0, m = (s%3600)/60|0
      return h ? `${h}h ${m}m` : `${m}m`
    }
    return useStore.subscribe(
      s => s.sysinfo?.uptime,
      (uptime) => {
        if (uptimeRef.current) uptimeRef.current.textContent = 'UP ' + fmtUp(uptime)
      }
    )
  }, [])

  const btn = (label, action, danger = false) => (
    <button onClick={() => { clickSound(); action() }}
      style={{
        width:'28px', height:'20px', border: '1px solid rgba(0,245,255,0.15)',
        color:'rgba(0,245,255,0.6)', fontSize:'11px', display:'flex',
        alignItems:'center', justifyContent:'center', cursor:'pointer',
        background:'transparent', transition:'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'rgba(255,32,80,0.2)' : 'rgba(0,245,255,0.1)'
        e.currentTarget.style.borderColor = danger ? '#ff2050' : '#00f5ff'
        e.currentTarget.style.color = danger ? '#ff2050' : '#00f5ff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(0,245,255,0.15)'
        e.currentTarget.style.color = 'rgba(0,245,255,0.6)'
      }}
    >{label}</button>
  )

  return (
    <div style={{
      gridColumn:'1/-1', display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px', border:'1px solid rgba(0,245,255,0.15)',
      borderBottom:'2px solid rgba(0,100,128,0.8)',
      background:'linear-gradient(90deg,rgba(4,12,20,0.97),rgba(0,0,0,0.8),rgba(4,12,20,0.97))',
      position:'relative', overflow:'hidden', WebkitAppRegion:'drag',
    }}>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(0,245,255,0.4),transparent)'}}/>

      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:'10px',WebkitAppRegion:'no-drag'}}>
        <svg width="20" height="20" viewBox="0 0 22 22">
          <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="none" stroke="#00f5ff" strokeWidth="1.5"/>
          <polygon points="11,5 17,8 17,14 11,17 5,14 5,8" fill="rgba(0,245,255,0.1)" stroke="#00f5ff" strokeWidth="0.8"/>
          <circle cx="11" cy="11" r="2" fill="#00f5ff"/>
        </svg>
        <span className="glitch" data-text="CipherFrame"
          style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:'15px',
            letterSpacing:'5px',color:'#00f5ff',
            textShadow:'0 0 12px rgba(0,245,255,0.5),0 0 40px rgba(0,245,255,0.1)'}}>
          CipherFrame
        </span>
        <span style={{fontSize:'9px',letterSpacing:'2px',color:'#ff00aa',
          textShadow:'0 0 8px #ff00aa'}}>v1.0</span>
        <span style={{fontSize:'7px',letterSpacing:'4px',color:'rgba(0,245,255,0.2)',marginLeft:'8px'}}>
          ADVANCED CYBERSECURITY TERMINAL
        </span>
      </div>

      {/* Clock — DOM direct */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',WebkitAppRegion:'no-drag'}}>
        <div ref={timeRef}
          style={{fontFamily:'Orbitron,monospace',fontSize:'17px',letterSpacing:'4px',
            color:'#ffd700',textShadow:'0 0 14px rgba(255,215,0,0.7)'}}>
          00:00:00
        </div>
        <div ref={dateRef}
          style={{fontSize:'8px',letterSpacing:'3px',color:'rgba(255,215,0,0.4)'}}>
          --
        </div>
      </div>

      {/* Status + Controls */}
      <div style={{display:'flex',alignItems:'center',gap:'20px',WebkitAppRegion:'no-drag'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'9px',letterSpacing:'0.05em'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#00ff88',
            boxShadow:'0 0 8px #00ff88'}} className="pulse-dot"/>
          <span style={{color:'rgba(0,245,255,0.7)'}}>ONLINE</span>
          <span ref={uptimeRef} style={{color:'rgba(0,245,255,0.35)'}}>UP --</span>
        </div>
        <div style={{display:'flex',gap:'5px'}}>
          {btn('─', () => window.cipher?.win.minimize())}
          {btn('□', () => window.cipher?.win.maximize())}
          {btn('✕', () => window.cipher?.win.close(), true)}
        </div>
      </div>
    </div>
  )
}
