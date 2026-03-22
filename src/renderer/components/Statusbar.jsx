import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

function fmtB(b) {
  if (!b) return '--'
  const u=['B','KB','MB','GB']; let i=0
  while(b>=1024&&i<3){b/=1024;i++}
  return `${b.toFixed(1)}${u[i]}`
}
function fmtUp(s) {
  if (!s) return '--'
  const h=s/3600|0, m=(s%3600)/60|0
  return h ? `${h}h${m}m` : `${m}m`
}

export default function Statusbar() {
  const refs = useRef({})

  useEffect(() => {
    return useStore.subscribe(
      s => s.sysinfo,
      (info) => {
        const r = refs.current
        if (!info) return
        if (r.os)   r.os.textContent   = (info.platform||'WIN').toUpperCase()
        if (r.disk) r.disk.textContent = fmtB(info.disk ? info.disk.size - info.disk.used : 0)
        if (r.mem)  r.mem.textContent  = fmtB(info.mem?.free||0)
        if (r.cores)r.cores.textContent= info.cpu?.cores||'--'
        if (r.temp) r.temp.textContent = info.temp ? info.temp+'°C' : '--'
        if (r.up)   r.up.textContent   = fmtUp(info.uptime)
      }
    )
  }, [])

  const Item = ({ k, label, init, dot }) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',border:'1px solid rgba(0,245,255,0.1)',background:'rgba(0,0,0,0.5)',fontSize:'8px',padding:'0 8px',height:'100%'}}>
      {dot && <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#00ff88',boxShadow:'0 0 5px #00ff88',flexShrink:0}}/>}
      <span style={{color:'rgba(0,245,255,0.35)',letterSpacing:'0.05em'}}>{label}</span>
      <span ref={el => { if(el) refs.current[k] = el }} style={{color:'#00f5ff',fontWeight:'bold',letterSpacing:'0.05em'}}>{init}</span>
    </div>
  )

  return (
    <div style={{gridColumn:'1/-1',display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'2px',height:'100%'}}>
      <Item k="os"    label="OS"        init="WIN"   dot/>
      <Item k="disk"  label="DISK FREE" init="--"       />
      <Item k="mem"   label="MEM FREE"  init="--"       />
      <Item k="cores" label="CPU CORES" init="--"       />
      <Item k="temp"  label="TEMP"      init="--"       />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',border:'1px solid rgba(0,245,255,0.1)',background:'rgba(0,0,0,0.5)',fontSize:'8px',padding:'0 8px'}}>
        <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#00ff88',boxShadow:'0 0 5px #00ff88'}}/>
        <span style={{color:'rgba(0,245,255,0.35)'}}>SECURITY</span>
        <span style={{color:'#00ff88',fontWeight:'bold'}}>ALPHA</span>
      </div>
      <Item k="up"    label="UPTIME"    init="--"       />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',border:'1px solid rgba(0,245,255,0.1)',background:'rgba(0,0,0,0.5)',fontSize:'8px',padding:'0 8px'}}>
        <span style={{color:'rgba(0,245,255,0.35)'}}>BUILD</span>
        <span style={{color:'#ff00aa',fontWeight:'bold'}}>1.0.0</span>
      </div>
    </div>
  )
}
