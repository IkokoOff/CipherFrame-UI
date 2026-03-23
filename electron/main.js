const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path  = require('path')
const os    = require('os')
const si    = require('systeminformation')

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
process.on('uncaughtException', e => console.error('[NEXUS]', e.message))

const DEV = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL

let win
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
    width, height, x: 0, y: 0,
    frame: false, backgroundColor: '#000000', show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, webSecurity: false,
    }
  })

  if (DEV) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.on('did-finish-load', () => win.show())
  win.on('closed', () => { win = null })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

// PTY
let pty = null
try {
  const nodePty = require('@homebridge/node-pty-prebuilt-multiarch')
  ipcMain.on('pty:create', (e) => {
    pty = nodePty.spawn('powershell.exe', [], {
      name: 'xterm-256color', cols: 80, rows: 24, cwd: os.homedir(),
      env: { ...process.env, TERM: 'xterm-256color' }
    })
    pty.onData(d => e.sender.send('pty:data', d))
  })
  ipcMain.on('pty:write',  (_, d)      => pty?.write(d))
  ipcMain.on('pty:resize', (_, {c,r})  => pty?.resize(c, r))
} catch(e) {
  ipcMain.on('pty:create', (ev) => ev.sender.send('pty:data', '\r\n\x1b[36m NEXUS-7 ONLINE \x1b[0m\r\n\x1b[32mnexus\x1b[0m$ '))
  ipcMain.on('pty:write',  () => {})
  ipcMain.on('pty:resize', () => {})
}

// Sysinfo cache
let cache = null
async function refresh() {
  try {
    const [cpu, mem, net, load, disk, temp] = await Promise.all([
      si.cpu(), si.mem(), si.networkStats(), si.currentLoad(),
      si.fsSize(), si.cpuTemperature().catch(() => ({ main: null }))
    ])
    cache = {
      cpu:  { brand: cpu.brand, cores: cpu.cores, speed: cpu.speed, load: Math.round(load.currentLoad) },
      mem:  { total: mem.total, used: mem.used, free: mem.free },
      net:  net[0] ? { rxSec: net[0].rx_sec, txSec: net[0].tx_sec, rx: net[0].rx_bytes } : {},
      disk: disk[0] ? { size: disk[0].size, used: disk[0].used, use: disk[0].use } : {},
      temp: temp.main, platform: os.platform(), hostname: os.hostname(), uptime: os.uptime()
    }
  } catch(_) {
    if (!cache) cache = { cpu: { load: 42, brand: 'NEXUS CPU', cores: 8, speed: 3.6 }, mem: { total: 16e9, used: 8e9, free: 8e9 }, temp: 42 }
  }
}
refresh()
setInterval(refresh, 3000)
ipcMain.handle('sysinfo', () => cache)

ipcMain.on('win:close',    () => app.quit())
ipcMain.on('win:minimize', () => win?.minimize())
ipcMain.on('win:maximize', () => win?.isMaximized() ? win.unmaximize() : win.maximize())
