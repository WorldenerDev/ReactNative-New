import { apiPost } from "@api/apiHelpers";
import { endpoints } from "@api/endpoints";

export const updateOnlineStatus = (data) =>
  apiPost(endpoints?.main?.updateOnlineStatus, data);
