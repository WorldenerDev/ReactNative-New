import { removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { store } from "@redux/store";

let isHandlingSessionExpiry = false;

export const handleSessionExpired = async () => {
  if (isHandlingSessionExpiry) {
    return;
  }

  const { auth } = store.getState();
  if (!auth?.user?.accessToken && !auth?.token) {
    return;
  }

  isHandlingSessionExpiry = true;
  try {
    await removeItem(STORAGE_KEYS.USER_DATA);
    await removeItem(STORAGE_KEYS.TOKEN);
    const { expireSession } = await import("@redux/slices/authSlice");
    store.dispatch(expireSession());
  } finally {
    isHandlingSessionExpiry = false;
  }
};
