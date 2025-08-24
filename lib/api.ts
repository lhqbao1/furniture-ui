import axios from "axios"

export const api = axios.create({
  baseURL: "http://20.61.3.4:8000", // backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
})
