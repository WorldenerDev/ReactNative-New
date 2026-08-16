import { apiDelete, apiGet, apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const signup = (data) => apiPost(endpoints?.auth?.signup, data);

export const otp = (data) => apiPost(endpoints?.auth?.otp, data);

export const resendOtp = (data) => apiPost(endpoints?.auth?.resendOtp, data);

export const login = (data) => apiPost(endpoints?.auth?.login, data);
export const guestLogin = (data) => apiPost(endpoints?.auth?.guestLogin, data);
export const logout = () => apiDelete(endpoints?.auth?.logout);
export const SocialLogin = (data) =>
  apiPost(endpoints?.auth?.socialLogin, data);
export const sendLinkPhoneOtp = (data) =>
  apiPost(endpoints?.auth?.sendLinkPhoneOtp, data);
export const verifyLinkPhone = (data) =>
  apiPost(endpoints?.auth?.verifyLinkPhone, data);
export const getCategory = (data) => apiGet(endpoints?.auth?.getCategory);
export const getProfile = () => apiGet(endpoints?.auth?.getProfile);
export const SelectCategory = (data) =>
  apiPost(endpoints?.auth?.selectCategory, data);
export const getCms = (type) =>
  apiGet(endpoints?.auth?.getCms, { type });
