import { useEffect, useRef, useState } from 'react'
import { bootSound, beep } from '../hooks/useAudio'
import { useStore } from '../store/useStore'

const BOOT_LINES = [
  { t:'code', m:'> BIOS v3.11.7 · CIPHERFRAME CORP' },
  { t:'ok',   m:'[OK] CPU cores detected: scheduling initialized' },
  { t:'code', m:'> loading kernel modules...' },
  { t:'ok',   m:'[OK] Memory controller online — ECC enabled' },
  { t:'code', m:'> mount /dev/nvme0n1p1 /boot' },
  { t:'ok',   m:'[OK] Filesystem mounted — btrfs hybrid' },
  { t:'code', m:'> import cipher.security.firewall as fw' },
  { t:'ok',   m:'[OK] Firewall v9.4.2 — 1337 rules loaded' },
  { t:'code', m:'> ./init_crypto --aes256 --sha3-512' },
  { t:'ok',   m:'[OK] Cryptographic engine initialized' },
  { t:'code', m:'> net.scan(iface="eth0", mode="promiscuous")' },
  { t:'ok',   m:'[OK] Network stack online — MTU 9000' },
  { t:'code', m:'> loadModule("neural_iface", priority=HIGH)' },
  { t:'warn', m:'[!!] Neural latency: 4.2ms — within threshold' },
  { t:'code', m:'> sudo systemctl start cipher-daemon' },
  { t:'ok',   m:'[OK] CipherFrame daemon running — PID 1337' },
  { t:'code', m:'> xterm.init(cols=220, rows=55, bpp=32)' },
  { t:'ok',   m:'[OK] Terminal renderer v5.3.0 loaded' },
  { t:'code', m:'> authenticate(user="OPERATOR", lvl="ALPHA")' },
  { t:'ok',   m:'[OK] Identity verified — ACCESS GRANTED' },
  { t:'code', m:'> cipher.ui.launch(theme="CYBERPUNK")' },
  { t:'ok',   m:'[OK] Interface loaded — ALL SYSTEMS NOMINAL' },
]

const STEPS = ['HARDWARE CHECK','KERNEL INIT','SECURITY LAYER','NETWORK STACK','CRYPTO ENGINE','TERMINAL INIT','LAUNCH']

const lineColor = { ok:'text-cyber-green', warn:'text-cyber-yellow', err:'text-cyber-red', code:'text-cyber-cyan/40', info:'text-cyber-cyan/60' }

export default function BootScreen() {
  const setBooted = useStore(s => s.setBooted)
  const [lines,    setLines]    = useState([])
  const [progress, setProgress] = useState(0)
  const [stepLabel,setStepLabel]= useState('INITIALIZING...')
  const [hiding,   setHiding]   = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    bootSound()
    let i = 0
    let prevStep = -1

    const run = () => {
      if (i >= BOOT_LINES.length) {
        setProgress(100)
        setStepLabel('LAUNCH COMPLETE')
        beep(1600,'sine',0.2,0.1)
        beep(2000,'sine',0.15,0.08,0.15)
        setTimeout(() => {
          setHiding(true)
          setTimeout(() => setBooted(true), 650)
        }, 500)
        return
      }
      const line = BOOT_LINES[i]
      const pct  = Math.round((i / (BOOT_LINES.length - 1)) * 100)
      setProgress(pct)

      const sIdx = Math.min(Math.floor(i / (BOOT_LINES.length / STEPS.length)), STEPS.length - 1)
      if (sIdx !== prevStep) {
        prevStep = sIdx
        setStepLabel(STEPS[sIdx] + '...')
        beep(300 + sIdx * 80, 'square', 0.04, 0.03)
      }

      setLines(prev => [...prev.slice(-11), { ...line, id: i }])
      if (line.t === 'ok')   beep(500 + Math.random()*200,'sine',0.04,0.02)
      if (line.t === 'warn') beep(300,'square',0.05,0.03)

      i++
      setTimeout(run, line.t === 'code' ? 55 : 80)
    }
    setTimeout(run, 300)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines])

  return (
    <div className={`fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center ${hiding ? 'boot-hide' : ''}`}>
      {/* Logo */}
      <div className="font-orb font-black text-[44px] tracking-[16px] text-cyber-cyan logo-pulse glitch mb-2" data-text="CipherFrame">
        CipherFrame
      </div>
      <div className="text-[10px] tracking-[6px] text-cyber-magenta mb-10" style={{textShadow:'0 0 12px #ff00aa'}}>
        ADVANCED TERMINAL INTERFACE · BUILD 1.0.0
      </div>

      {/* Progress */}
      <div className="w-[420px] mb-6">
        <div className="flex justify-between text-[9px] tracking-widest text-cyber-cyan/50 mb-2">
          <span>{stepLabel}</span>
          <span className="font-orb text-cyber-cyan">{progress}%</span>
        </div>
        <div className="h-[3px] bg-cyber-cyan/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-cyan3 to-cyber-cyan transition-all duration-150"
            style={{ width: progress + '%', boxShadow:'0 0 10px #00f5ff' }}
          />
        </div>
      </div>

      {/* Log */}
      <div ref={logRef}
        className="w-[640px] h-[200px] overflow-hidden border border-cyber-cyan/10 bg-black/80 px-4 py-3 relative text-[11px] leading-[1.7]"
      >
        <span className="absolute top-2 right-3 text-[8px] tracking-widest text-cyber-cyan/20">// BOOT LOG</span>
        {lines.map(l => (
          <div key={l.id} className={`boot-line ${lineColor[l.t] || 'text-cyber-cyan/60'}`}>{l.m}</div>
        ))}
      </div>
    </div>
  )
}
