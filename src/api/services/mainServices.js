import { apiGet, apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const getAllCity = (data) => apiPost(endpoints?.main?.getAllCity, data);
export const getEventForYou = () => apiGet(endpoints?.main?.getEventForYou);
export const getEventForYouCityId = (params) =>
  apiGet(endpoints?.main?.getEventForYou, params);
export const getPopularEvents = (params) =>
  apiGet(endpoints?.main?.getPopularEvents, params);
