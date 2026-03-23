import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Panel from './Panel'

const TYPE_COLOR = { ok:'#00ff88', warn:'#ffd700', crit:'#ff2050', info:'rgba(0,245,255,0.55)' }
const TYPE_ICON  = { ok:'▶', warn:'⚠', crit:'◉', info:'·' }
const MAX = 14

export default function AlertFeed() {
  const feedRef  = useRef(null)
  const badgeRef = useRef(null)
  const poolRef  = useRef([])

  useEffect(() => {
    const feed = feedRef.current
    if (!feed) return
    // Créer le pool une seule fois
    const pool = []
    for (let i = 0; i < MAX; i++) {
      const row = document.createElement('div')
      row.style.cssText = 'font-size:9px;line-height:1.8;padding:2px 0;border-bottom:1px solid rgba(0,245,255,0.04);display:flex;gap:4px;overflow:hidden;white-space:nowrap'
      const ts   = document.createElement('span')
      ts.style.cssText = 'color:rgba(0,245,255,0.3);flex-shrink:0'
      const icon = document.createElement('span')
      icon.style.cssText = 'flex-shrink:0'
      const msg  = document.createElement('span')
      msg.style.cssText = 'overflow:hidden;text-overflow:ellipsis'
      row.append(ts, icon, msg)
      feed.appendChild(row)
      pool.push({ row, ts, icon, msg })
    }
    poolRef.current = pool

    return useStore.subscribe(s => s.alerts, (alerts) => {
      if (badgeRef.current) badgeRef.current.textContent = alerts.length
      alerts.forEach((a, i) => {
        const p = pool[i]
        if (!p) return
        const color = TYPE_COLOR[a.type] || TYPE_COLOR.info
        p.row.style.color = color
        p.ts.textContent   = a.ts
        p.icon.textContent = TYPE_ICON[a.type] || '·'
        p.msg.textContent  = a.msg
        p.row.style.display = 'flex'
      })
      // Cacher les lignes inutilisées
      for (let i = alerts.length; i < MAX; i++) {
        pool[i].row.style.display = 'none'
      }
    })
  }, [])

  return (
    <Panel title="THREAT FEED" badgeRef={badgeRef} badge="0">
      <div ref={feedRef} style={{padding:'6px 10px',overflow:'hidden',height:'100%'}}/>
    </Panel>
  )
}
