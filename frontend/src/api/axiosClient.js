import axios from "axios"

// Keep production auth requests on the frontend origin so the refresh-token
// cookie remains first-party. Vercel forwards /api to the backend, while Vite
// uses its local proxy during development.
const baseURL = import.meta.env.PROD
  ? "/api"
  : (import.meta.env.VITE_API_URL || "/api")

const api = axios.create({
  baseURL,
  withCredentials: true,
})

let accessToken = null
let refreshInProgress = false
let refreshSubscribers = []
let logoutHandler = null

export const setAccessToken = (token) => {
  accessToken = token
}

export const clearAccessToken = () => {
  accessToken = null
}

export const registerLogoutHandler = (callback) => {
  logoutHandler = callback
}

const subscribeRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const notifyRefreshSuccess = (token) => {
  refreshSubscribers.forEach((callback) => callback(token, null))
  refreshSubscribers = []
}

const notifyRefreshFailure = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error))
  refreshSubscribers = []
}

const refreshAccessToken = async () => {
  const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
  })

  const response = await refreshClient.post("/auth/refresh")
  const newToken = response?.data?.data?.accessToken
  if (!newToken) {
    throw new Error(response?.data?.message || "Refresh failed")
  }
  setAccessToken(newToken)
  return newToken
}

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = String(originalRequest?.url || "")
    const shouldSkipRefresh = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
    ].some((path) => requestUrl.includes(path))

    if (status === 401 && originalRequest && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true

      if (refreshInProgress) {
        return new Promise((resolve, reject) => {
          subscribeRefresh(async (token, refreshError) => {
            if (refreshError) {
              reject(refreshError)
              return
            }
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      refreshInProgress = true

      try {
        const newToken = await refreshAccessToken()
        notifyRefreshSuccess(newToken)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        notifyRefreshFailure(refreshError)
        if (typeof logoutHandler === "function") {
          logoutHandler()
        }
        return Promise.reject(refreshError)
      } finally {
        refreshInProgress = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
