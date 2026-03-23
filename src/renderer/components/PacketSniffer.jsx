import { useRef, useEffect } from 'react'
import { useAnimTask } from '../hooks/useAnimLoop'
import Panel from './Panel'

const IPS    = ['192.168.1','10.0.0','172.16.0','185.220.101']
const PROTOS = [
  { name:'TCP',  color:'#00f5ff' },
  { name:'UDP',  color:'#ffd700' },
  { name:'ICMP', color:'rgba(0,245,255,0.4)' },
  { name:'TLS',  color:'#00ff88' },
  { name:'SSH',  color:'#ff00aa' },
  { name:'HTTP', color:'#ffd700' },
]
const PORTS = [22,80,443,3306,8080,53,25,110,8443,4444,1337]
const MAX_ROWS = 10
let pktCount = 0

// FIX 6 — pré-créer un pool de rows réutilisables, zéro création/destruction de DOM
const GRID = '36px 1fr 1fr 38px 38px 1fr'
const CELL = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'

export default function PacketSniffer() {
  const rowsRef  = useRef(null) // FIX 6 — ref direct, pas getElementById
  const countRef = useRef(null)
  const totalRef = useRef(0)
  const poolRef  = useRef([])   // pool de DOM nodes réutilisables

  useEffect(() => {
    const rows = rowsRef.current
    if (!rows) return
    // Créer le pool de lignes une seule fois
    const pool = []
    for (let i=0; i<MAX_ROWS; i++) {
      const row = document.createElement('div')
      row.style.cssText = `display:grid;grid-template-columns:${GRID};font-size:8px;padding:2px 0;border-bottom:1px solid rgba(0,245,255,0.04);font-family:'Share Tech Mono',monospace`
      for (let j=0; j<6; j++) {
        const span = document.createElement('span')
        span.style.cssText = CELL
        row.appendChild(span)
      }
      rows.appendChild(row)
      pool.push(row)
    }
    poolRef.current = pool
  }, [])

  useAnimTask('packets', () => {
    const pool = poolRef.current
    if (!pool.length) return
    const n = Math.random()>0.6 ? 2 : 1
    for (let k=0; k<n; k++) {
      pktCount++
      totalRef.current++
      const ip1   = `${IPS[Math.random()*IPS.length|0]}.${Math.random()*255|0}`
      const ip2   = `${IPS[Math.random()*IPS.length|0]}.${Math.random()*255|0}`
      const proto = PROTOS[Math.random()*PROTOS.length|0]
      const sport = PORTS[Math.random()*PORTS.length|0]
      const dport = Math.random()*65535|0
      const size  = Math.random()*1400+64|0
      // hex inline, pas de Array.from
      let hex = ''
      for (let i=0; i<8; i++) hex += (i?'  ':'')+((Math.random()*256|0).toString(16).padStart(2,'0'))

      // Rotation du pool — prendre la dernière row, la mettre en premier
      const row = pool.pop()
      const rows = rowsRef.current
      rows.insertBefore(row, rows.firstChild)
      pool.unshift(row)

      const cells = row.children
      cells[0].textContent = String(pktCount).padStart(4,'0')
      cells[0].style.color = 'rgba(0,245,255,0.3)'
      cells[1].textContent = `${ip1}:${sport}`
      cells[1].style.color = 'rgba(0,245,255,0.6)'
      cells[2].textContent = `${ip2}:${dport}`
      cells[2].style.color = 'rgba(0,245,255,0.4)'
      cells[3].textContent = proto.name
      cells[3].style.color = proto.color
      cells[4].textContent = size
      cells[4].style.color = 'rgba(0,245,255,0.5)'
      cells[5].textContent = hex
      cells[5].style.color = 'rgba(0,245,255,0.25)'
    }
    if (countRef.current) countRef.current.textContent = totalRef.current
  }, 280)

  return (
    <Panel title="PACKET SNIFFER" badgeRef={countRef} badge="0">
      <div style={{padding:'6px 10px',height:'100%',overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:GRID,fontSize:'7px',
          letterSpacing:'0.06em',color:'rgba(0,245,255,0.3)',
          paddingBottom:'4px',borderBottom:'1px solid rgba(0,245,255,0.1)',
          marginBottom:'3px',fontFamily:"'Share Tech Mono',monospace"}}>
          <span>#</span><span>SRC</span><span>DST</span>
          <span>PROTO</span><span>SZ</span><span>HEX</span>
        </div>
        <div ref={rowsRef}/>
      </div>
    </Panel>
  )
}
