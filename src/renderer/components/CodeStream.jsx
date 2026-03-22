import { useRef, useEffect } from 'react'
import Panel from './Panel'

const SEQUENCES = [
  [
    { t:'cmd',  m:'> nmap -sS -p- --min-rate 5000 192.168.1.0/24' },
    { t:'info', m:'  Starting Nmap 7.94 ( https://nmap.org )' },
    { t:'ok',   m:'  192.168.1.1   22/tcp  open  ssh    OpenSSH 8.9' },
    { t:'ok',   m:'  192.168.1.42  80/tcp  open  http   nginx 1.24.0' },
    { t:'warn', m:'  192.168.1.42  443/tcp open  https  TLS 1.0 (deprecated)' },
    { t:'ok',   m:'  192.168.1.99  3306/tcp open mysql  MySQL 8.0.32' },
    { t:'crit', m:'  192.168.1.99  3306 — NO AUTH REQUIRED — critical' },
  ],[
    { t:'cmd',  m:'> hashcat -a 3 -m 1400 hashes.txt ?a?a?a?a?a?a' },
    { t:'info', m:'  hashcat v6.2.6 · OpenCL API · Speed: 2.3 GH/s' },
    { t:'ok',   m:'  5f4dcc3b5aa765d61d83: "password" (dict match)' },
    { t:'ok',   m:'  482c811da5d5b4bc6d49: "n3xus_4dm1n" (brute)' },
    { t:'crit', m:'  e10adc3949ba59abbe56: "123456" — ADMIN ACCOUNT' },
  ],[
    { t:'cmd',  m:'> python3 exploit_CVE-2024-1337.py --target 10.0.0.5' },
    { t:'info', m:'  [*] Connecting to 10.0.0.5:8080...' },
    { t:'ok',   m:'  [+] Apache/2.4.51 detected (vulnerable)' },
    { t:'info', m:'  [*] Injecting shellcode — offset: 1024' },
    { t:'ok',   m:'  [+] Shell obtained! uid=0(root) gid=0(root)' },
    { t:'crit', m:'  [!] Root access confirmed — session logged' },
  ],[
    { t:'cmd',  m:"> sqlmap -u 'http://target.com/login' --dbs --batch" },
    { t:'info', m:"  [*] GET parameter 'id' is injectable" },
    { t:'info', m:'  [*] Technique: UNION — 4 columns' },
    { t:'ok',   m:'  [+] DB: users — tables: accounts, sessions' },
    { t:'ok',   m:'  [+] Dumping accounts... 847 rows extracted' },
    { t:'crit', m:'  [!] Admin credentials written to dump.txt' },
  ],[
    { t:'cmd',  m:'> msfconsole -x "use exploit/multi/handler"' },
    { t:'info', m:'  Metasploit Framework 6.3.44' },
    { t:'cmd',  m:'  msf6 > set PAYLOAD windows/x64/meterpreter/reverse_tcp' },
    { t:'ok',   m:'  PAYLOAD => windows/x64/meterpreter/reverse_tcp' },
    { t:'info', m:'  [*] Started reverse TCP handler 0.0.0.0:4444' },
    { t:'crit', m:'  [*] Meterpreter session 1 opened (10.0.0.1:4444)' },
  ],[
    { t:'cmd',  m:'> tshark -i eth0 -Y "http.request" -T fields -e ip.src' },
    { t:'info', m:'  Capturing on eth0...' },
    { t:'ok',   m:'  10.0.0.42 → GET /api/users  Authorization: Bearer eyJ...' },
    { t:'warn', m:'  10.0.0.99 → POST /login  password=admin123 (CLEARTEXT)' },
    { t:'ok',   m:'  10.0.0.15 → GET /admin/config  200 OK  5.2KB' },
    { t:'crit', m:'  CREDENTIAL CAPTURE: admin:n3xus_p@ss (10.0.0.99)' },
  ],[
    { t:'cmd',  m:'> hydra -l admin -P rockyou.txt ssh://10.0.0.5' },
    { t:'info', m:'  Hydra v9.5 · 16 tasks · attempting logins...' },
    { t:'warn', m:'  [22][ssh] failed: admin:password123' },
    { t:'warn', m:'  [22][ssh] failed: admin:letmein' },
    { t:'ok',   m:'  [22][ssh] login: admin  password: n3xus77' },
    { t:'crit', m:'  1 valid password found — session opened' },
  ],
]

const COLORS = { cmd:'#00f5ff', info:'rgba(0,245,255,0.45)', ok:'#00ff88', warn:'#ffd700', crit:'#ff2050' }
const MAX_LINES = 16

export default function CodeStream() {
  const containerRef = useRef(null)
  const poolRef  = useRef([]) // { row, tsEl, msgEl }
  const stateRef = useRef({ seqIdx:0, lineIdx:0, timer:null })

  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    // Pré-créer les lignes du pool — jamais d'innerHTML après ça
    const pool = []
    for (let i = 0; i < MAX_LINES; i++) {
      const row = document.createElement('div')
      row.style.cssText = 'font-size:9px;line-height:1.75;padding:1px 0;border-bottom:1px solid rgba(0,245,255,0.03);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;gap:6px'
      const tsEl  = document.createElement('span')
      tsEl.style.cssText  = 'color:rgba(0,245,255,0.2);flex-shrink:0'
      const msgEl = document.createElement('span')
      msgEl.style.cssText = 'overflow:hidden;text-overflow:ellipsis'
      row.append(tsEl, msgEl)
      c.appendChild(row)
      pool.push({ row, tsEl, msgEl })
    }
    poolRef.current = pool

    const nextLine = () => {
      const s   = stateRef.current
      const seq = SEQUENCES[s.seqIdx % SEQUENCES.length]
      const line = seq[s.lineIdx]

      // Rotation du pool
      const entry = pool.pop()
      c.insertBefore(entry.row, c.firstChild)
      pool.unshift(entry)

      // Mise à jour textContent uniquement — pas de innerHTML
      const ms = Date.now()
      const d  = new Date(ms)
      entry.tsEl.textContent  = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`
      entry.msgEl.textContent = line.m
      entry.row.style.color   = COLORS[line.t] || COLORS.info

      s.lineIdx++
      if (s.lineIdx >= seq.length) {
        s.lineIdx = 0; s.seqIdx++
        s.timer = setTimeout(nextLine, 1800 + Math.random() * 1200)
      } else {
        s.timer = setTimeout(nextLine, line.t === 'cmd' ? 380 + Math.random()*180 : 70 + Math.random()*110)
      }
    }

    stateRef.current.timer = setTimeout(nextLine, 600)
    return () => clearTimeout(stateRef.current.timer)
  }, [])

  return (
    <Panel title="CODE EXEC STREAM" badge="LIVE">
      <div ref={containerRef}
        style={{padding:'6px 10px', height:'100%', overflow:'hidden',
          fontFamily:"'Share Tech Mono',monospace"}}/>
    </Panel>
  )
}
