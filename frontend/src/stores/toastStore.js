import { create } from 'zustand'

let toastTimer
export const useToastStore = create((set) => ({
  toast: null,
  show: (message, tone = 'success') => {
    clearTimeout(toastTimer)
    set({ toast: { message, tone } })
    toastTimer = setTimeout(() => set({ toast: null }), 3200)
  },
  hide: () => set({ toast: null }),
}))
