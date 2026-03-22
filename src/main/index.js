import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import os from 'os'
import si from 'systeminformation'

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800,
    frame: false, backgroundColor: '#000000', show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true, nodeIntegration: false, webSecurity: false,
    },
  })
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  win.setMenuBarVisibility(false)
  win.webContents.on('did-finish-load', () => { win.maximize(); win.show() })
  win.on('closed', () => { win = null })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

// ── PTY — détection automatique de la plateforme ─────────
const platform = process.platform // 'win32' | 'darwin' | 'linux'

function getShell() {
  if (platform === 'win32') return { shell: 'powershell.exe', args: [] }
  if (platform === 'darwin') return { shell: process.env.SHELL || '/bin/zsh', args: [] }
  return { shell: process.env.SHELL || '/bin/bash', args: [] }
}

let ptyProc = null
try {
  const nodePty = require('@homebridge/node-pty-prebuilt-multiarch')
  ipcMain.on('pty:create', (e) => {
    const { shell, args } = getShell()
    ptyProc = nodePty.spawn(shell, args, {
      name: 'xterm-256color', cols: 80, rows: 24,
      cwd: os.homedir(), env: { ...process.env, TERM: 'xterm-256color' }
    })
    ptyProc.onData(d => e.sender.send('pty:data', d))
  })
} catch {
  ipcMain.on('pty:create', (e) => {
    e.sender.send('pty:data', '\r\n\x1b[36m CipherFrame ONLINE \x1b[0m\r\n\x1b[32mcipher@system\x1b[0m:\x1b[34m~\x1b[0m$ ')
  })
}
ipcMain.on('pty:write',  (_, d)      => ptyProc?.write(d))
ipcMain.on('pty:resize', (_, {c, r}) => ptyProc?.resize(c, r))

// ── SYSINFO ───────────────────────────────────────────────
let cache = null
si.currentLoad().catch(() => {})

async function refreshCache() {
  try {
    const [cpu, mem, netStats, load, disks, temp] = await Promise.all([
      si.cpu(), si.mem(), si.networkStats(), si.currentLoad(), si.fsSize(),
      si.cpuTemperature().catch(() => ({ main: null })),
    ])
    const cpuLoad  = isNaN(load.currentLoad) ? (cache?.cpu?.load ?? 0) : Math.round(load.currentLoad)
    const cpuSpeed = cpu.speed > 0 ? cpu.speed : (cpu.speedMax || cpu.speedMin || 0)
    const net      = netStats[0] ?? {}
    const rxSec    = net.rx_sec  ?? cache?.net?.rxSec ?? 0
    const txSec    = net.tx_sec  ?? cache?.net?.txSec ?? 0
    const mainDisk = disks.sort((a,b) => b.size - a.size)[0]
    cache = {
      cpu:  { brand: cpu.brand||cache?.cpu?.brand||'CPU', cores: cpu.cores||os.cpus().length, speed: cpuSpeed, load: cpuLoad },
      mem:  { total: mem.total, used: mem.used, free: mem.free },
      net:  { rxSec, txSec, rx: net.rx_bytes ?? cache?.net?.rx ?? 0 },
      disk: mainDisk ? { size: mainDisk.size, used: mainDisk.used, use: Math.round(mainDisk.use) } : cache?.disk ?? { size:1, used:0, use:0 },
      temp: temp.main ?? null,
      platform, hostname: os.hostname(), uptime: os.uptime(),
    }
  } catch {
    if (!cache) cache = {
      cpu:  { load:0, brand:'CPU', cores: os.cpus().length, speed:0 },
      mem:  { total: os.totalmem(), used: os.totalmem()-os.freemem(), free: os.freemem() },
      net:  { rxSec:0, txSec:0, rx:0 },
      disk: { size:1, used:0, use:0 },
      temp: null, platform, hostname: os.hostname(), uptime: os.uptime(),
    }
  }
}

setTimeout(refreshCache, 1000)
setInterval(refreshCache, 3000)
ipcMain.handle('sysinfo', () => cache)
ipcMain.on('win:close',    () => app.quit())
ipcMain.on('win:minimize', () => win?.minimize())
ipcMain.on('win:maximize', () => win?.isMaximized() ? win.unmaximize() : win.maximize())
