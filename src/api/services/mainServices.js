import { apiGet, apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const getAllCity = (data) => apiPost(endpoints?.main?.getAllCity, data);
// Backend expects POST with search in query params (no JSON body)
export const searchCityByName = (params) =>
  apiPost(endpoints?.main?.getAllCity, undefined, { params });
// Events endpoint is GET with query params
export const getEventForYou = (params) =>
  apiGet(endpoints?.main?.getEventForYou, params);
export const getEventForYouCityId = (params) =>
  apiGet(endpoints?.main?.getEventForYou, params);
export const getPopularEvents = (params) =>
  apiGet(endpoints?.main?.getPopularEvents, params);
