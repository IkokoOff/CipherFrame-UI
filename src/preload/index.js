const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('cipher', {
  pty: {
    create:  ()     => ipcRenderer.send('pty:create'),
    write:   (d)    => ipcRenderer.send('pty:write', d),
    resize:  (c, r) => ipcRenderer.send('pty:resize', { c, r }),
    onData:  (cb)   => ipcRenderer.on('pty:data', (_, d) => cb(d)),
  },
  sysinfo: () => ipcRenderer.invoke('sysinfo'),
  win: {
    close:    () => ipcRenderer.send('win:close'),
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
  }
})
