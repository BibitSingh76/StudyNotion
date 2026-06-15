import axios from "axios";

// Use environment-configured backend URL or default to local server
const DEFAULT_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

export const axiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

// Lightweight request/response logging to surface network errors quickly
axiosInstance.interceptors.request.use(
  (req) => {
    try {
      console.log("API Request ->", req.method, req.baseURL + req.url);
    } catch (e) {
      // ignore
    }
    return req;
  },
  (err) => {
    console.error("API Request Error ->", err && err.message ? err.message : err);
    return Promise.reject(err);
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Provide clearer network error logging for easier debugging
    console.error("API Response Error ->", {
      message: err?.message,
      isAxiosError: err?.isAxiosError,
      status: err?.response?.status,
      url: err?.config?.baseURL + err?.config?.url,
    });
    return Promise.reject(err);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  // Log outgoing request details to help debug Network Errors
  try {
    console.log("apiConnector ->", { method, url, bodyData, headers, params, baseURL: axiosInstance.defaults.baseURL });
  } catch (e) {
    // ignore logging errors
  }

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
