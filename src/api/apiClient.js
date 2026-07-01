// apiClient.js
import axios from "axios";
import { getItem } from "@utils/storage";
import { showToast } from "@components/AppToast";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { store } from "@redux/store";
import { URL } from "@config/api";

export { URL };

/**
 * Constructs a full image URL from a relative path
 * @param {string} imagePath - The image path (can be relative, full URL, or empty)
 * @returns {string|undefined} Full URL if path is provided, undefined if empty
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return undefined;
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If relative path, prepend base URL
  // Ensure path starts with / if it doesn't
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${URL}${normalizedPath}`;
};

const apiClient = axios.create({
  baseURL: URL + "/api/v1/user",
  timeout: 15000,
});

apiClient.defaults.headers.post["Content-Type"] = undefined;
apiClient.defaults.headers.put["Content-Type"] = undefined;

apiClient.interceptors.request.use(async (config) => {
  const { user } = store.getState()?.auth;
  //console.log("user", user);
  const storedToken = user?.accessToken || (await getItem(STORAGE_KEYS?.TOKEN));
  if (storedToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${storedToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  console.log("📤 API Request:", {
    method: config.method?.toUpperCase(),
    url: (config.baseURL || "") + (config.url || ""),
    headers: config.headers,
    params: config.params,
    data: config.data,
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      url: (response.config.baseURL || "") + (response.config.url || ""),
      status: response.status,
      data: response.data,
    });
    return response?.data;
  },
  (error) => {
    console.log(" error =>", error);
    console.error("API Error:", error?.response?.data || error.message);
    if (!error?.config?.skipErrorToast) {
      showToast("error", error?.response?.data?.message || error.message);
    }
    throw error?.response?.data || { message: "Network error" };
  }
);

export default apiClient;
