import api from "./axiosClient"
import { setAccessToken } from "./axiosClient"

export const login = async (credentials) => {
  const response = await api.post("/auth/login", {
    ...credentials,
    email: credentials.email.trim().toLowerCase(),
  })
  const accessToken = response?.data?.data?.accessToken
  const user = response?.data?.data?.user
  if (accessToken) {
    setAccessToken(accessToken)
  }
  return { user, accessToken, message: response?.data?.message }
}

export const register = async (payload) => {
  const response = await api.post("/auth/register", {
    ...payload,
    email: payload.email.trim().toLowerCase(),
  })
  return response?.data
}

export const refresh = async () => {
  const response = await api.post("/auth/refresh")
  const accessToken = response?.data?.data?.accessToken
  if (accessToken) {
    setAccessToken(accessToken)
  }
  return { accessToken, message: response?.data?.message }
}

export const me = async () => {
  const response = await api.get("/auth/me")
  return response?.data?.data
}

export const logout = async () => {
  const response = await api.post("/auth/logout")
  setAccessToken(null)
  return response?.data
}
