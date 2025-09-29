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
export const getTripDetails = (tripId) =>
  apiGet(`${endpoints?.main?.getTripDetails}/${tripId}`);
export const createTrip = (data) => apiPost(endpoints?.main?.createTrip, data);
export const updateTrip = (tripId, data) =>
  apiPost(`${endpoints?.main?.updateTrip}/${tripId}`, data);
export const deleteTrip = (tripId) =>
  apiDelete(`${endpoints?.main?.deleteTrip}/${tripId}`);
export const activityLikeUnlike = (data) =>
  apiPost(endpoints?.main?.activityLikeUnlike, data);
export const getEventDetails = (data) =>
  apiPost(endpoints?.main?.getEventDetails, data);
export const getEventDates = (data) =>
  apiPost(endpoints?.main?.getEventDates, data);
export const getEventDatesDetails = (data) =>
  apiPost(endpoints?.main?.getEventDatesDetails, data);
export const addEventInTrip = (data) =>
  apiPost(endpoints?.main?.addEventInTrip, data);
