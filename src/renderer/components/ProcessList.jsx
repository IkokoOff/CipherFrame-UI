import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

const NAMES = ['cipher-core','sysmon','netd','kworker','cryptd','audit','sched','sec-daemon','firewall','dns-proxy']

export default function ProcessList() {
  const listRef  = useRef(null)
  const rowsRef  = useRef([]) // pool de nodes — créés une seule fois

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    // Créer les rows une seule fois
    const rows = NAMES.map(name => {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'border-bottom:1px solid rgba(0,245,255,0.04);padding-bottom:2px;margin-bottom:2px'
      const grid = document.createElement('div')
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 40px 48px;font-size:9px;color:rgba(0,245,255,0.65)'
      const nameEl = document.createElement('span')
      nameEl.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'
      nameEl.textContent = name
      const cpuEl  = document.createElement('span')
      cpuEl.style.cssText = 'text-align:right;padding-right:4px'
      const memEl  = document.createElement('span')
      memEl.style.cssText = 'text-align:right;color:rgba(255,0,170,0.8)'
      grid.append(nameEl, cpuEl, memEl)
      const barBg  = document.createElement('div')
      barBg.style.cssText = 'height:2px;background:rgba(0,245,255,0.05);margin-top:1px'
      const barFg  = document.createElement('div')
      barFg.style.cssText = 'height:100%;width:0%;transition:width 0.5s'
      barBg.appendChild(barFg)
      wrap.append(grid, barBg)
      list.appendChild(wrap)
      return { cpuEl, memEl, barFg }
    })
    rowsRef.current = rows
  }, [])

  useAnimTask('procs', () => {
    const rows = rowsRef.current
    if (!rows.length) return
    rows.forEach(({ cpuEl, memEl, barFg }) => {
      const cpu = (Math.random()*14).toFixed(1)
      const mem = Math.random()*450+50|0
      const pct = Math.min(100, cpu*7)
      const color = cpu>10 ? '#ff2050' : cpu>6 ? '#ffd700' : '#006680'
      cpuEl.textContent = cpu
      cpuEl.style.color = color
      memEl.textContent = mem + 'M'
      barFg.style.width = pct + '%'
      barFg.style.background = color
    })
  }, 6000)

  return (
    <Panel title="PROCESSES" badge={String(NAMES.length)}>
      <div style={{padding:'6px 10px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 40px 48px',fontSize:'7px',
          letterSpacing:'0.05em',color:'rgba(0,245,255,0.35)',
          paddingBottom:'4px',borderBottom:'1px solid rgba(0,245,255,0.1)',marginBottom:'4px'}}>
          <span>NAME</span>
          <span style={{textAlign:'right',paddingRight:'4px'}}>CPU%</span>
          <span style={{textAlign:'right'}}>MEM</span>
        </div>
        <div ref={listRef}/>
      </div>
    </Panel>
  )
}
