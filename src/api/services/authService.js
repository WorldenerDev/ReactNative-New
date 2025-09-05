import { apiPost, apiPut } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const signup = (data) => apiPost(endpoints?.auth?.signup, data);

export const otp = (data) => apiPost(endpoints?.auth?.otp, data);

export const resendOtp = (data) => apiPost(endpoints?.auth?.resendOtp, data);

export const login = (data) => apiPost(endpoints?.auth?.login, data);
export const SocialLogin = (data) =>
  apiPost(endpoints?.auth?.socialLogin, data);

export const newPass = (data) => apiPost(endpoints?.auth?.resetPass, data);

export const freelancerProfile = (data) =>
  apiPut(endpoints?.auth?.freelancer?.profile, data);
