import { create } from 'zustand'
import * as authApi from '../api/authApi'
import {
  clearAccessToken,
  clearOfflineCache,
  registerLogoutHandler,
  setAccessToken,
  setOfflineUserId,
} from '../api/axiosClient'

let refreshSessionPromise = null
const OFFLINE_USER_KEY = 'dauoi-offline-user'
const OFFLINE_SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const saveOfflineUser = (user) => {
  if (!user?.id) return
  localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify({ user, savedAt: Date.now() }))
  setOfflineUserId(user.id)
}

const readOfflineUser = () => {
  try {
    const snapshot = JSON.parse(localStorage.getItem(OFFLINE_USER_KEY))
    if (!snapshot?.user?.id || Date.now() - snapshot.savedAt > OFFLINE_SESSION_MAX_AGE) {
      localStorage.removeItem(OFFLINE_USER_KEY)
      return null
    }
    return snapshot.user
  } catch {
    localStorage.removeItem(OFFLINE_USER_KEY)
    return null
  }
}

const removeOfflineUser = () => localStorage.removeItem(OFFLINE_USER_KEY)

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  isOffline: false,
  error: '',
  setAccessToken: (token) => {
    setAccessToken(token)
    set({ accessToken: token })
  },
  clearAuth: ({ clearOfflineData = false } = {}) => {
    clearAccessToken()
    setOfflineUserId(null)
    if (clearOfflineData) {
      removeOfflineUser()
      clearOfflineCache()
    }
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, isOffline: false })
  },
  login: async (credentials) => {
    set({ isLoading: true, error: '' })
    try {
      const { user, accessToken } = await authApi.login(credentials)
      saveOfflineUser(user)
      set({ user, accessToken, isAuthenticated: true, isLoading: false, isOffline: false })
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể đăng nhập. Vui lòng thử lại.'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  register: (payload) => authApi.register(payload),
  fetchMe: async () => {
    const user = await authApi.me()
    saveOfflineUser(user)
    set({ user, isAuthenticated: true, isOffline: false })
    return user
  },
  refreshSession: ({ force = false } = {}) => {
    if (get().initialized && !force) return Promise.resolve()
    if (refreshSessionPromise) return refreshSessionPromise

    set({ isLoading: true })
    refreshSessionPromise = (async () => {
      try {
        const { accessToken } = await authApi.refresh()
        if (!accessToken) throw new Error('No access token')
        const user = await authApi.me()
        saveOfflineUser(user)
        set({ user, accessToken, isAuthenticated: true, isLoading: false, initialized: true, isOffline: false })
      } catch {
        const offlineUser = !navigator.onLine ? readOfflineUser() : null
        if (offlineUser) {
          setOfflineUserId(offlineUser.id)
          set({
            user: offlineUser,
            accessToken: null,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
            isOffline: true,
          })
        } else {
          get().clearAuth({ clearOfflineData: navigator.onLine })
          set({ initialized: true })
        }
      } finally {
        refreshSessionPromise = null
      }
    })()

    return refreshSessionPromise
  },
  logout: async () => {
    try { await authApi.logout() } catch { /* local session still clears */ }
    get().clearAuth({ clearOfflineData: true })
  },
}))

registerLogoutHandler(() => useAuthStore.getState().clearAuth({ clearOfflineData: true }))
