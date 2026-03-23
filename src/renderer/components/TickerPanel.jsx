import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

const INIT = [
  { sym:'BTC',   val:98420, chg:2.34  },
  { sym:'ETH',   val:3847,  chg:-0.91 },
  { sym:'CFUI', val:1337,  chg:7.77  },
  { sym:'NXS',   val:42.0,  chg:0.42  },
]

export default function TickerPanel() {
  const containerRef = useRef(null)
  const dataRef = useRef(INIT.map(t => ({ ...t })))
  // Refs directs sur chaque élément DOM — plus de querySelector
  const elRefs = useRef([])

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const els = INIT.map(t => {
      const row = document.createElement('div')
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(0,245,255,0.06)'
      const sym = document.createElement('span')
      sym.style.cssText = 'font-size:9px;color:rgba(0,245,255,0.45);letter-spacing:0.05em;width:40px'
      sym.textContent = t.sym
      const val = document.createElement('span')
      val.style.cssText = 'font-family:Orbitron,monospace;font-size:10px;color:#00f5ff;letter-spacing:0.05em'
      val.textContent = t.val.toFixed(0)
      const chg = document.createElement('span')
      chg.style.cssText = 'font-size:8px;letter-spacing:0.05em;width:48px;text-align:right'
      chg.style.color = t.chg >= 0 ? '#00ff88' : '#ff2050'
      chg.textContent = (t.chg >= 0 ? '+' : '') + t.chg.toFixed(2) + '%'
      row.append(sym, val, chg)
      c.appendChild(row)
      return { val, chg } // refs directs, pas de querySelector
    })
    elRefs.current = els
  }, [])

  useAnimTask('tickers', () => {
    dataRef.current.forEach((t, i) => {
      t.val += t.val * (Math.random() - 0.5) * 0.003
      t.chg += (Math.random() - 0.5) * 0.1
      const el = elRefs.current[i]
      if (!el) return
      el.val.textContent = t.val > 1000 ? t.val.toFixed(0) : t.val.toFixed(2)
      el.chg.textContent = (t.chg >= 0 ? '+' : '') + t.chg.toFixed(2) + '%'
      el.chg.style.color = t.chg >= 0 ? '#00ff88' : '#ff2050'
    })
  }, 3000)

  return (
    <Panel title="SIG TRACKER" badge="SIM">
      <div ref={containerRef} style={{padding:'6px 10px'}}/>
    </Panel>
  )
}
