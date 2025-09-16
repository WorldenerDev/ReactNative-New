import { apiGet, apiPost, apiPut, apiDelete } from "@api/apiHelpers";
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
export const createTrip = (data) => apiPost(endpoints?.main?.createTrip, data);
export const deleteTrip = (tripId) =>
  apiDelete(`${endpoints?.main?.deleteTrip}/${tripId}`);
export const activityLikeUnlike = (data) =>
  apiPost(endpoints?.main?.activityLikeUnlike, data);
