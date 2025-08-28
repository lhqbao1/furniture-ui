// // lib/axios.ts
// import axios, { AxiosError, AxiosRequestConfig } from "axios"
// import { tokenStore } from "./token"

// type PendingRequest = {
//   resolve: (value: unknown) => void
//   reject: (reason?: unknown) => void
//   config: AxiosRequestConfig
// }

// let pendingQueue: PendingRequest[] = []


// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   withCredentials: true, // để gửi/nhận HttpOnly cookie (refresh)
// })

// // attach access token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token") // lấy từ localStorage
//   if (token) {
//     config.headers = config.headers ?? {}
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// let isRefreshing = false
// // let pendingQueue: {
// //   resolve: (v: any) => void
// //   reject: (e: any) => void
// //   config: AxiosRequestConfig
// // }[] = []

// const processQueue = (error: unknown, token: string | null) => {
//   pendingQueue.forEach(({ resolve, reject, config }) => {
//     if (error) {
//       reject(error)
//     } else {
//       if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//       resolve(api(config))
//     }
//   })
//   pendingQueue = []
// }

// api.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError) => {
//     const original = error.config as AxiosRequestConfig & { _retry?: boolean }
//     const status = error.response?.status

//     if (status === 401 && !original?._retry) {
//       original._retry = true

//       if (isRefreshing) {
//         // đợi refresh xong rồi retry
//         return new Promise((resolve, reject) => {
//           pendingQueue.push({ resolve, reject, config: original })
//         })
//       }

//       isRefreshing = true
//       try {
//         const { data } = await axios.post(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
//           {},
//           { withCredentials: true }
//         )
//         const newToken = (data as any).accessToken as string
//         tokenStore.set(newToken)
//         processQueue(null, newToken)

//         // gắn token mới vào request cũ rồi retry
//         original.headers = original.headers ?? {}
//         original.headers.Authorization = `Bearer ${newToken}`
//         return api(original)
//       } catch (err) {
//         tokenStore.set(null)
//         processQueue(err, null)
//         // tuỳ ý: redirect login
//         if (typeof window !== "undefined") {
//           // window.location.href = "/login"
//         }
//         return Promise.reject(err)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// export default api
// lib/axios.ts
import axios, { AxiosError } from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
})

// attach access token
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

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token")
//   if (token) {
//     // đảm bảo headers tồn tại
//     config.headers = config.headers || {}
//     // gán trực tiếp field Authorization
//     config.headers.set("Authorization", `Bearer ${token}`)
//   }
//   return config
// })


// handle 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Xoá token cũ
      localStorage.removeItem("access_token")      
    }

    return Promise.reject(error)
  }
)

export default api
