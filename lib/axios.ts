// lib/axios.ts
import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 1. Public API - không có token
export const apiPublic = axios.create({
  baseURL,
  withCredentials: false,
});

// 2. User API - attach access_token
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("userId");

      // 👉 Redirect về login
      // window.location.href = "/login"
    }
    if (error.response?.data === "Token expired") {
      // 👉 Redirect về login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// 3. Admin API - attach admin_access_token
export const apiAdmin = axios.create({
  baseURL,
  withCredentials: true,
});

apiAdmin.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiAdmin.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_user_id");

      // 👉 Redirect về admin login
      const isAffiliateRoute =
        window.location.pathname === "/affiliate" ||
        window.location.pathname.startsWith("/affiliate/") ||
        window.location.pathname === "/de/affiliate" ||
        window.location.pathname.startsWith("/de/affiliate/");

      window.location.href = isAffiliateRoute
        ? "/affiliate-login"
        : "/admin-login";
    }
    return Promise.reject(error);
  },
);

// 4. Flexible API (có thể dùng cho cả user lẫn admin)
export const apiFlexible = axios.create({
  baseURL,
  withCredentials: true,
});

apiFlexible.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userToken = localStorage.getItem("access_token");
    const adminToken = localStorage.getItem("admin_access_token");
    const sellerToken = localStorage.getItem("dsp_access_token");

    if (userToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${userToken}`;
    } else if (adminToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (sellerToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${sellerToken}`;
    }
  }
  return config;
});

apiFlexible.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("dsp_access_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("admin_user_id");
      localStorage.removeItem("seller_id");

      // 👉 Trường hợp flexible thì redirect về login chung
      // window.location.href = "/login"
    }
    return Promise.reject(error);
  },
);

// 3. DSP API - attach dsp_access_token
export const apiDSP = axios.create({
  baseURL,
  withCredentials: true,
});

apiDSP.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dsp_access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiDSP.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dsp_access_token");
      localStorage.removeItem("seller_id");

      // 👉 Redirect về admin login
      window.location.href = "/dsp/login";
    }
    return Promise.reject(error);
  },
);
