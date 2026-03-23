import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

// Styles pré-calculés — 0 création de string dans le hot path
const STYLES = {
  default: 'aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:7px;border:1px solid rgba(0,245,255,0.12);color:rgba(0,245,255,0.25);transition:color 0.3s,background 0.3s,border-color 0.3s;background:rgba(0,245,255,0.01)',
  active:  'aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:7px;border:1px solid rgba(0,200,215,0.5);color:#00f5ff;transition:color 0.3s,background 0.3s,border-color 0.3s;background:rgba(0,245,255,0.1)',
  hot:     'aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:7px;border:1px solid rgba(255,0,170,0.5);color:#ff00aa;transition:color 0.3s,background 0.3s,border-color 0.3s;background:rgba(255,0,170,0.1)',
}
const HEX = '0123456789ABCDEF'

export default function HexMap() {
  const gridRef  = useRef(null)
  const cellsRef = useRef([])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cells = []
    for (let i=0; i<64; i++) {
      const c = document.createElement('div')
      c.style.cssText = STYLES.default // FIX 7 — 1 seul assignment
      c.textContent = HEX[Math.random()*16|0]
      grid.appendChild(c)
      cells.push(c)
    }
    cellsRef.current = cells
  }, [])

  useAnimTask('hexmap', () => {
    const cells = cellsRef.current
    if (!cells.length) return
    for (let i=0; i<4; i++) {
      const j = Math.random()*64|0
      const c = cells[j]
      if (!c) continue
      c.textContent = HEX[Math.random()*16|0]
      const r = Math.random()
      // FIX 7 — 1 seul cssText assignment au lieu de 3
      c.style.cssText = r>0.9 ? STYLES.hot : r>0.55 ? STYLES.active : STYLES.default
    }
  }, 600)

  return (
    <Panel title="MEM MAP">
      <div ref={gridRef}
        style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'2px',padding:'4px'}}/>
    </Panel>
  )
}
