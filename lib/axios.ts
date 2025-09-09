// lib/axios.ts
import axios, { AxiosError } from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

// 1. Public API - không có token
export const apiPublic = axios.create({
  baseURL,
  withCredentials: true,
})

// 2. User API - attach access_token
export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      // có thể redirect về login nếu cần
    }
    return Promise.reject(error)
  }
)

// 3. Admin API - attach admin_access_token
export const apiAdmin = axios.create({
  baseURL,
  withCredentials: true,
})

apiAdmin.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_access_token")
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiAdmin.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token")
      // redirect về admin login nếu cần
    }
    return Promise.reject(error)
  }
)

export const apiFlexible = axios.create({
  baseURL,
  withCredentials: true,
})

apiFlexible.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userToken = localStorage.getItem("access_token")
    const adminToken = localStorage.getItem("admin_access_token")

    if (userToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${userToken}`
    } else if (adminToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${adminToken}`
    }
  }
  return config
})

apiFlexible.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // remove tokens khi bị 401
      localStorage.removeItem("access_token")
      localStorage.removeItem("admin_access_token")
      // redirect nếu muốn
    }
    return Promise.reject(error)
  }
)
