import { apiGet, apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const getAllCity = (data) => apiPost(endpoints?.main?.getAllCity, data);
export const searchCityByName = (params) =>
  apiPost(endpoints?.main?.getAllCity, undefined, { params });
export const getEventForYou = (params) =>
  apiGet(endpoints?.main?.getEventForYou, params);
export const getEventForYouCityId = (params) =>
  apiGet(endpoints?.main?.getEventForYou, params);
export const getPopularEvents = (params) =>
  apiGet(endpoints?.main?.getPopularEvents, params);
export const getEventBrowserByCategory = (params) =>
  apiGet(endpoints?.main?.getEventBrowserByCategory, params);
export const getTrip = (params) => apiGet(endpoints?.main?.getTrips, params);
