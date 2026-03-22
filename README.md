# CipherFrame UI

> Cyberpunk terminal UI — Electron + React + Vite. Real-time system monitoring, PowerShell terminal, matrix rain & hacker panels.

![version](https://img.shields.io/badge/version-1.0.0-cyan)
![electron](https://img.shields.io/badge/electron-25.9.8-blue)
![react](https://img.shields.io/badge/react-19-blue)
![platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![license](https://img.shields.io/badge/license-MIT-green)

## Features

- 🖥️ Boot animation with sound effects
- 💻 Full terminal — PowerShell (Windows), zsh (macOS), bash (Linux)
- 📊 Real-time system monitoring — CPU, RAM, disk, temperature
- 🌧️ Matrix rain, radar scanner, hex memory map
- 📡 Live packet sniffer simulation
- 🔐 Hacker code stream — nmap, hashcat, sqlmap, metasploit...
- ⚡ Zero React re-renders at runtime — pure DOM mutations

## Stack

| | |
|---|---|
| **Electron** 25 | Desktop shell |
| **React** 19 + **Vite** | Renderer |
| **Tailwind CSS** | Styling |
| **Zustand** | Global state |
| **xterm.js** | Terminal emulator |
| **node-pty** | Shell process |
| **systeminformation** | Real system stats |

## Compatibility

| Platform | Shell | Package format |
|---|---|---|
| Windows | PowerShell | `.exe` (NSIS installer) |
| macOS | zsh | `.dmg` |
| Linux | bash | `.AppImage` / `.deb` |

## Install & Run

```bash
npm install
npm run build
npm start
```

## Dev mode (hot reload)

```bash
npm run dev
```

## Package as installer

```bash
# All platforms (run on target OS)
npm run package

# Specific platform
npm run package:win    # → release/CipherFrame Setup.exe
npm run package:mac    # → release/CipherFrame.dmg
npm run package:linux  # → release/CipherFrame.AppImage
```

> **Note:** To package for Windows you need to be on Windows (or use Wine).
> macOS packages must be built on macOS. Linux builds work on Linux and macOS.

### Troubleshooting — Windows packaging

**Error: `Cannot create symbolic link — privilege not held`**

electron-builder requires symlink permissions on Windows. Fix with one of these options:

**Option 1 — Run as Administrator (quickest)**
```powershell
# Right-click PowerShell → "Run as administrator"
cd path\to\cipherframe-ui
npm run package:win
```

**Option 2 — Enable Developer Mode (permanent fix)**

Settings → Update & Security → For developers → turn on **Developer Mode**

**Option 3 — Enable via registry (admin required once)**
```powershell
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"
```

**Then clear the corrupted cache before retrying:**
```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
npm run package:win
```

## Icons

Add your icons to the `public/` folder before packaging:
- `public/icon.ico` — Windows
- `public/icon.icns` — macOS
- `public/icon.png` — Linux (512×512px recommended)

## Project structure

```
src/
├── main/                  Electron main process
│   └── index.js           App init, PTY, sysinfo collection
├── preload/
│   └── index.js           Secure IPC bridge
└── renderer/
    ├── components/        React components (16 files)
    ├── hooks/
    │   ├── useAnimLoop.js Single rAF loop for all animations
    │   └── useAudio.js    Web Audio API sound effects
    ├── store/
    │   └── useStore.js    Zustand store with subscribeWithSelector
    ├── index.html
    ├── index.css
    └── main.jsx           App root
```

## Performance highlights

- Single `requestAnimationFrame` loop for all canvas animations
- Canvas contexts cached in refs — never re-fetched per frame
- DOM node pools for all live-updating lists — zero GC pressure
- `subscribeWithSelector` for targeted Zustand subscriptions
- Zero React re-renders after boot

## License

MIT © Ikoko
