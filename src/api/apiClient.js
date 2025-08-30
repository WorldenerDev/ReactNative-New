// apiClient.js
import axios from "axios";
import { getItem } from "@utils/storage";
import { showToast } from "@components/AppToast";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { store } from "@redux/store";

const apiClient = axios.create({
  baseURL: "https://api.worldener.com/api/v1/user",
  timeout: 15000,
});

apiClient.defaults.headers.post["Content-Type"] = undefined;
apiClient.defaults.headers.put["Content-Type"] = undefined;

apiClient.interceptors.request.use(async (config) => {
  const user = store.getState()?.auth;
  const storedToken = user?.token || (await getItem(STORAGE_KEYS?.TOKEN));

  console.log("Stored Token API client header:", storedToken);

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
    showToast("error", error?.response?.data?.message || error.message);
    throw error?.response?.data || { message: "Network error" };
  }
);

export default apiClient;
