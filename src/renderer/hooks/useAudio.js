let ac = null
function getAC() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)()
  return ac
}

export function beep(freq = 440, type = 'square', duration = 0.08, vol = 0.06, when = 0) {
  try {
    const ctx = getAC()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = type; o.frequency.value = freq
    const t = ctx.currentTime + when
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    o.start(t); o.stop(t + duration + 0.01)
  } catch {}
}

export function bootSound() {
  beep(120, 'sawtooth', 0.15, 0.07, 0.0)
  beep(240, 'square',   0.08, 0.05, 0.2)
  beep(480, 'square',   0.06, 0.04, 0.32)
  beep(960, 'sine',     0.10, 0.06, 0.42)
  beep(1200,'sine',     0.06, 0.04, 0.56)
  beep(1600,'sine',     0.20, 0.09, 0.72)
  beep(2000,'sine',     0.12, 0.06, 0.88)
}

export function clickSound()  { beep(600, 'square', 0.03, 0.03) }
export function alertSound(crit = false) {
  if (crit) { beep(880,'square',0.05,0.05); setTimeout(()=>beep(660,'square',0.05,0.04),80) }
  else beep(440, 'sine', 0.04, 0.03)
}
