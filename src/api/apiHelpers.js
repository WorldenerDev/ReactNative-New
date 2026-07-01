import apiClient from "./apiClient";

export const apiGet = (url, params = {}, config = {}) =>
  apiClient.get(url, { params, ...config });
export const apiPost = (url, data = {}, config = {}) => apiClient.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => apiClient.put(url, data, config);
export const apiDelete = (url) => apiClient.delete(url);
