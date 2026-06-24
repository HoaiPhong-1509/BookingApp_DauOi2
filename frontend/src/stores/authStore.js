import { create } from 'zustand'
import * as authApi from '../api/authApi'
import { clearAccessToken, registerLogoutHandler, setAccessToken } from '../api/axiosClient'

let refreshSessionPromise = null

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,
  error: '',
  setAccessToken: (token) => {
    setAccessToken(token)
    set({ accessToken: token })
  },
  clearAuth: () => {
    clearAccessToken()
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
  },
  login: async (credentials) => {
    set({ isLoading: true, error: '' })
    try {
      const { user, accessToken } = await authApi.login(credentials)
      set({ user, accessToken, isAuthenticated: true, isLoading: false })
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
    set({ user, isAuthenticated: true })
    return user
  },
  refreshSession: () => {
    if (get().initialized) return Promise.resolve()
    if (refreshSessionPromise) return refreshSessionPromise

    set({ isLoading: true })
    refreshSessionPromise = (async () => {
      try {
        const { accessToken } = await authApi.refresh()
        if (!accessToken) throw new Error('No access token')
        const user = await authApi.me()
        set({ user, accessToken, isAuthenticated: true, isLoading: false, initialized: true })
      } catch {
        get().clearAuth()
        set({ initialized: true })
      } finally {
        refreshSessionPromise = null
      }
    })()

    return refreshSessionPromise
  },
  logout: async () => {
    try { await authApi.logout() } catch { /* local session still clears */ }
    get().clearAuth()
  },
}))

registerLogoutHandler(() => useAuthStore.getState().clearAuth())
