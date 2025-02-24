import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const WHITELIST = new Set([
  "/auth/token/refresh",
  "/auth/sign_in",
  "/auth/sign_up",
]);

api.interceptors.response.use((response) => response, async (error) => {
  const { config, response } = error;
  if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }
    if ([...WHITELIST].some((path) => config.url.includes(path))) {
      return Promise.reject(error);
    }
    config._retry = true;
    try {
      await sendRequest("post", "/auth/token/refresh");
      return api(config);
    } catch (refreshError) {
      if (typeof window !== "undefined") {
        await sendRequest("post", "/auth/logout");
        window.location.href = "/auth";
      }
      return Promise.reject(refreshError);
    }
  }
);

export const sendRequest = async (
  method: string,
  url: string,
  data: any = {},
  headers: any = {}
) => {
  try {
    const config: any = { 
      method, 
      url, 
      data, 
      headers
    };
    
    // If sending FormData, remove the Content-Type header to let the browser set it
    if (data instanceof FormData) {
      delete api.defaults.headers["Content-Type"];
      delete config.headers["Content-Type"];
    } else {
      api.defaults.headers["Content-Type"] = "application/json";
    }
    
    const response = await api(config);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export default api;
