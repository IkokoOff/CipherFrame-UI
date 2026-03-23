import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// subscribeWithSelector permet store.subscribe(selector, callback)
export const useStore = create(
  subscribeWithSelector((set) => ({
    booted:    false,
    setBooted: (v) => set({ booted: v }),

    sysinfo:    null,
    setSysinfo: (s) => set({ sysinfo: s }),

    alerts: [],
    addAlert: (a) => set(s => ({ alerts: [a, ...s.alerts].slice(0, 14) })),
  }))
)
