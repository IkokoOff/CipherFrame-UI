import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { clickSound } from '../hooks/useAudio'
import { useStore } from '../store/useStore'
import 'xterm/css/xterm.css'

export default function TerminalPanel() {
  const wrapRef  = useRef(null)
  const termRef  = useRef(null)
  const fitRef   = useRef(null)
  const booted   = useStore(s => s.booted)
  const [tabs, setTabs]           = useState([{ id:0, label:'SH-1' }])
  const [activeTab, setActiveTab] = useState(0)
  const [ready, setReady]         = useState(false)

  useEffect(() => {
    if (!booted || termRef.current) return

    const timer = setTimeout(() => {
      const wrap = wrapRef.current
      if (!wrap) return

      const term = new Terminal({
        theme: {
          background:'transparent', foreground:'#00f5ff',
          cursor:'#00f5ff', cursorAccent:'#000000',
          black:'#000000',   brightBlack:'#444466',
          red:'#ff2050',     brightRed:'#ff4070',
          green:'#00ff88',   brightGreen:'#44ffaa',
          yellow:'#ffd700',  brightYellow:'#ffee55',
          blue:'#0088ff',    brightBlue:'#44aaff',
          magenta:'#ff00aa', brightMagenta:'#ff44cc',
          cyan:'#00f5ff',    brightCyan:'#66ffff',
          white:'#ccddee',   brightWhite:'#eeffff',
        },
        fontFamily: "'Share Tech Mono','Courier New',monospace",
        fontSize: 13, lineHeight: 1.3,
        cursorStyle: 'block', cursorBlink: true,
        scrollback: 1000, allowTransparency: true, convertEol: true,
      })

      const fit = new FitAddon()
      term.loadAddon(fit)
      term.open(wrap)

      // Double rAF pour s'assurer que le layout est calculé
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fit.fit()
        setReady(true)
      }))

      const obs = new ResizeObserver(() => {
        requestAnimationFrame(() => fitRef.current?.fit())
      })
      obs.observe(wrap)

      term.onResize(({ cols, rows }) => window.cipher?.pty.resize(cols, rows))
      term.onData(d => window.cipher?.pty.write(d))

      if (window.cipher) {
        window.cipher.pty.onData(d => term.write(d))
        window.cipher.pty.create()
      } else {
        term.write('\r\n\x1b[36m CipherFrame ONLINE \x1b[0m\r\n\x1b[32mcipher@system\x1b[0m:\x1b[34m~\x1b[0m$ ')
        term.onData(d => {
          if (d === '\r') term.write('\r\n\x1b[32mcipher@system\x1b[0m:\x1b[34m~\x1b[0m$ ')
          else if (d === '\x7f') term.write('\b \b')
          else term.write(d)
        })
      }

      termRef.current = term
      fitRef.current  = fit
    }, 400)

    return () => clearTimeout(timer)
  }, [booted])

  useEffect(() => () => termRef.current?.dispose(), [])

  const addTab = () => {
    clickSound()
    const id = tabs.length
    setTabs(t => [...t, { id, label: `SH-${id+1}` }])
    setActiveTab(id)
  }

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'100%', width:'100%',            /* ← remplit son conteneur */
      position:'relative',
      border:'1px solid rgba(0,200,215,0.6)',
      background:'rgba(2,8,14,0.98)',
      boxShadow:'0 0 20px rgba(0,245,255,0.2), inset 0 0 60px rgba(0,245,255,0.015)',
      overflow:'hidden',
    }}>
      {/* Coins */}
      {['corner-tl','corner-tr','corner-bl','corner-br'].map(c => (
        <div key={c} className={`absolute w-4 h-4 pointer-events-none z-20 ${c}`} style={{borderColor:'#00f5ff'}}/>
      ))}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at 50% 0%,rgba(0,245,255,0.04) 0%,transparent 50%)'}}/>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'2px', padding:'5px 8px 0', background:'rgba(0,0,0,0.6)', flexShrink:0, borderBottom:'1px solid rgba(0,245,255,0.1)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { clickSound(); setActiveTab(t.id) }}
            style={{
              padding:'3px 12px', fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'2px',
              border: activeTab===t.id ? '1px solid rgba(0,200,215,0.6)' : '1px solid rgba(0,245,255,0.12)',
              color:  activeTab===t.id ? '#00f5ff' : 'rgba(0,245,255,0.35)',
              background: activeTab===t.id ? 'rgba(0,245,255,0.07)' : 'transparent',
              cursor:'pointer', transition:'all 0.15s',
            }}>{t.label}</button>
        ))}
        <button onClick={addTab}
          style={{
            padding:'3px 10px', fontSize:'13px',
            border:'1px dashed rgba(0,245,255,0.15)', color:'rgba(0,245,255,0.25)',
            background:'transparent', cursor:'pointer', transition:'all 0.15s',
          }}>+</button>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 14px', borderBottom:'1px solid rgba(0,245,255,0.1)', background:'rgba(4,12,20,0.5)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'3px', color:'#00f5ff' }}>
          <svg width="10" height="10" viewBox="0 0 12 12">
            <rect width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
            <path d="M2 4L5 6 2 8M6 8h4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          TERMINAL · POWERSHELL
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          {[['PTY', ready],['UTF-8',true],['SSH',false],['ENC',false]].map(([l, on]) => (
            <span key={l} style={{
              fontSize:'7px', padding:'1px 7px', border: on ? '1px solid rgba(0,204,102,0.4)' : '1px solid rgba(0,245,255,0.12)',
              color: on ? '#00ff88' : 'rgba(0,245,255,0.3)', letterSpacing:'0.05em',
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Zone xterm — flex:1 + minHeight:0 = critique */}
      <div ref={wrapRef} style={{ flex:'1 1 0', minHeight:0, padding:'6px', overflow:'hidden' }}/>

      {!ready && booted && (
        <div style={{ position:'absolute', inset:0, top:'70px', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', letterSpacing:'4px', color:'rgba(0,245,255,0.25)' }}>
            INITIALIZING PTY...
          </span>
        </div>
      )}
    </div>
  )
}
