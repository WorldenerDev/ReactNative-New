import { apiGet, apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const getAllCity = (data) => apiPost(endpoints?.main?.getAllCity, data);
export const getEventForYou = () => apiGet(endpoints?.main?.getEventForYou);
