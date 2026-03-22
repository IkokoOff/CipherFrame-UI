import { useEffect, useRef } from 'react'

// Un seul rAF pour toute l'app
const tasks = new Map()
let rafId = null

function loopTick(ts) {
  tasks.forEach((task) => {
    if (ts - task.last >= task.interval) {
      task.fn(ts)
      task.last = ts
    }
  })
  rafId = requestAnimationFrame(loopTick)
}

export function useAnimTask(key, fn, interval) {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    tasks.set(key, { fn: (ts) => fnRef.current(ts), interval, last: 0 })
    if (!rafId) rafId = requestAnimationFrame(loopTick)
    return () => {
      tasks.delete(key)
      // Arrête le loop si plus aucune tâche
      if (tasks.size === 0 && rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }
  }, [key, interval])
}
