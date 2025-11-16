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
export const checkoutTrip = (data) => apiPost(endpoints?.main?.checkout, data);
export const getCartList = () => apiGet(endpoints?.main?.getCartList);
export const cartCheckout = (data) =>
  apiPost(endpoints?.main?.cartCheckout, data);
export const getCartSchema = (data) =>
  apiPost(endpoints?.main?.cartSchema, data);
export const getParticipantSchema = (data) =>
  apiPost(endpoints?.main?.getParticipantSchema, data);
export const cartCustomerInfo = (data) =>
  apiPost(endpoints?.main?.cartCustomerInfo, data);
export const createOrder = (data) =>
  apiPost(endpoints?.main?.createOrder, data);
export const createNoPayment = (data) =>
  apiPost(endpoints?.main?.createNoPayment, data);
export const downloadVoucher = (data) =>
  apiPost(endpoints?.main?.downloadVoucher, data);
export const removeItemFromCart = (data) =>
  apiPost(endpoints?.main?.removeItemFromCart, data);
export const updateParticipants = (data) =>
  apiPost(endpoints?.main?.updateParticipants, data);
export const updateCart = (data) =>
  apiPost(endpoints?.main?.updateCart, data);
export const getOrders = (params) => apiGet(endpoints?.main?.getOrders, params);
export const getTripBuddies = (data) =>
  apiPost(endpoints?.main?.getTripBuddies, data);
export const getTripBycity = (cityId) =>
  apiGet(`${endpoints?.main?.getTripBycity}/${cityId}`);
export const getGroups = () => apiGet(endpoints?.main?.getGroups);
export const getGroupDetails = (groupId) =>
  apiGet(`${endpoints?.main?.getGroupDetails}/${groupId}`);
export const sendInvitation = (data) => apiPost(endpoints?.main?.sendInvitation, data);
export const getInvitations = () => apiGet(endpoints?.main?.getInvitations);
export const acceptInvite = (data) => apiPost(endpoints?.main?.acceptInvite, data);
export const rejectInvite = (data) => apiPost(endpoints?.main?.rejectInvite, data);
