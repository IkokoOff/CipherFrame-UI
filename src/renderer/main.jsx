import { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { useStore } from './store/useStore'
import { alertSound } from './hooks/useAudio'
import BootScreen    from './components/BootScreen'
import Titlebar      from './components/Titlebar'
import SystemMonitor from './components/SystemMonitor'
import MatrixRain    from './components/MatrixRain'
import AlertFeed     from './components/AlertFeed'
import CodeStream    from './components/CodeStream'
import TerminalPanel from './components/TerminalPanel'
import NetworkPanel  from './components/NetworkPanel'
import RadarPanel    from './components/RadarPanel'
import HexMap        from './components/HexMap'
import ProcessList   from './components/ProcessList'
import PacketSniffer from './components/PacketSniffer'
import Statusbar     from './components/Statusbar'

const ALERT_DATA = [
  { type:'ok',   msg:'AUTH · Operator credentials verified' },
  { type:'info', msg:'NET · Deep packet inspection active' },
  { type:'ok',   msg:'SEC · Firewall v9.4 — 1337 rules loaded' },
  { type:'warn', msg:'MEM · Usage above 70% — monitor' },
  { type:'info', msg:'SYS · Kernel heartbeat nominal' },
  { type:'crit', msg:'SEC · Brute-force blocked — 192.168.1.42' },
  { type:'ok',   msg:'DISK · SMART check passed — 0 errors' },
  { type:'warn', msg:'CPU · Thermal spike 78°C — throttled' },
  { type:'info', msg:'NET · DNS query resolved 2ms' },
  { type:'ok',   msg:'CRYPTO · AES-256 key rotated' },
  { type:'crit', msg:'SCAN · Rootkit signature detected — PID 8821' },
  { type:'ok',   msg:'SYS · Memory snapshot saved' },
  { type:'warn', msg:'NET · Unusual outbound traffic — 45MB burst' },
  { type:'crit', msg:'AUTH · Privilege escalation attempt — blocked' },
]
let alertIdx = 0, alertCounter = 0

function App() {
  const booted     = useStore(s => s.booted)
  const setSysinfo = useStore(s => s.setSysinfo)
  const addAlert   = useStore(s => s.addAlert)

  useEffect(() => {
    if (!booted) return
    const poll = async () => {
      const info = await window.cipher?.sysinfo().catch(() => null)
      if (info) setSysinfo(info)
    }
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [booted])

  useEffect(() => {
    if (!booted) return
    const fire = () => {
      const a = ALERT_DATA[alertIdx++ % ALERT_DATA.length]
      const n = new Date()
      const ts = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`
      addAlert({ ...a, ts, id: alertCounter++ })
      alertSound(a.type === 'crit')
    }
    fire()
    const id = setInterval(fire, 5000)
    return () => clearInterval(id)
  }, [booted])

  return (
    <>
      {!booted && <BootScreen/>}
      <div
        className={`transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          position:'fixed', inset:0, overflow:'hidden',
          display:'grid',
          gridTemplateRows:'44px 1fr 34px',
          gridTemplateColumns:'270px 1fr 270px',
          gap:'2px', padding:'4px',
          background:
            'linear-gradient(rgba(0,245,255,0.06) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(0,245,255,0.06) 1px,transparent 1px)',
          backgroundSize:'40px 40px',
          backgroundColor:'#020408',
        }}>

        <Titlebar/>

        {/* Colonne gauche */}
        <div style={{display:'flex',flexDirection:'column',gap:'2px',minHeight:0,overflow:'hidden'}}>
          <div style={{flex:'1.3 1 0',minHeight:0,overflow:'hidden'}}><SystemMonitor/></div>
          <div style={{flex:'0.7 1 0',minHeight:0,overflow:'hidden'}}><MatrixRain/></div>
          <div style={{flex:'0.8 1 0',minHeight:0,overflow:'hidden'}}><AlertFeed/></div>
          <div style={{flex:'1.1 1 0',minHeight:0,overflow:'hidden'}}><CodeStream/></div>
        </div>

        {/* Terminal */}
        <div style={{minHeight:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <TerminalPanel/>
        </div>

        {/* Colonne droite */}
        <div style={{display:'flex',flexDirection:'column',gap:'2px',minHeight:0,overflow:'hidden'}}>
          <div style={{flex:'1 1 0',  minHeight:0,overflow:'hidden'}}><NetworkPanel/></div>
          <div style={{flex:'0.9 1 0',minHeight:0,overflow:'hidden'}}><RadarPanel/></div>
          <div style={{flex:'0.7 1 0',minHeight:0,overflow:'hidden'}}><HexMap/></div>
          <div style={{flex:'1.1 1 0',minHeight:0,overflow:'hidden'}}><ProcessList/></div>
          <div style={{flex:'1.1 1 0',minHeight:0,overflow:'hidden'}}><PacketSniffer/></div>
        </div>

        <Statusbar/>
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
