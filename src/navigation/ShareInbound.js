import { useEffect, useRef } from "react";
import { AppState, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { exitGuestForSignIn } from "@redux/slices/authSlice";
import { getItem, setItem, removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { extractHttpsUrl, parseInboundLink } from "@utils/shareLink";
import { consumePendingShare } from "@utils/sharedAuth";
import { navigationRef } from "./navigationRef";
import navigationStrings from "./navigationStrings";

async function readNativePending() {
  const pending = await consumePendingShare();
  if (!pending?.url && pending?.action !== "wishlist") return null;
  if (pending.action === "wishlist" && pending.tripId) {
    return { action: "wishlist", tripId: pending.tripId };
  }
  if (pending.action === "createTrip") {
    const url = extractHttpsUrl(pending.url);
    return url ? { action: "createTrip", url } : null;
  }
  const parsed = parseInboundLink(pending.url);
  if (parsed?.url || parsed?.tripId) return parsed;
  const url = extractHttpsUrl(pending.url);
  return url ? { action: "save", url } : null;
}

function navigateWhenReady(name, params, attempt = 0) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }
  if (attempt > 20) return;
  setTimeout(() => navigateWhenReady(name, params, attempt + 1), 50);
}

const ShareInbound = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const handledInitial = useRef(false);
  const lastRaw = useRef("");
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    let cancelled = false;

    const remember = async (payload) => {
      await setItem(STORAGE_KEYS.PENDING_SHARE, payload);
    };

    const openPayload = async (payload) => {
      if (!payload) return;
      const current = userRef.current;
      const signedIn = Boolean(current?.accessToken) && !current?.isGuest;

      if (!signedIn) {
        await remember(payload);
        if (current?.isGuest) {
          dispatch(exitGuestForSignIn());
        }
        return;
      }

      await removeItem(STORAGE_KEYS.PENDING_SHARE);
      if (payload.action === "wishlist" && payload.tripId) {
        navigateWhenReady(navigationStrings.TRIP_DETAILS, {
          tripId: payload.tripId,
          initialTab: "Wishlist",
        });
        return;
      }
      if (payload.action === "createTrip" && payload.url) {
        navigateWhenReady(navigationStrings.CREATE_TRIP, {
          pendingShareUrl: payload.url,
        });
        return;
      }
      if (payload.url) {
        navigateWhenReady(navigationStrings.SAVE_IDEA, {
          url: payload.url,
          fromShare: true,
          selectedTripId: payload.selectedTripId,
        });
      }
    };

    const handleRaw = async (raw) => {
      if (!raw || raw === lastRaw.current) return;
      const payload = parseInboundLink(raw);
      if (!payload) return;
      lastRaw.current = raw;
      await openPayload(payload);
    };

    const boot = async () => {
      const nativePending = await readNativePending();
      if (!cancelled && nativePending) {
        await openPayload(nativePending);
      }
      const stored = await getItem(STORAGE_KEYS.PENDING_SHARE);
      if (!cancelled && stored?.url) {
        await openPayload(stored);
      }
      if (!handledInitial.current) {
        handledInitial.current = true;
        const initial = await Linking.getInitialURL();
        if (!cancelled && initial) await handleRaw(initial);
      }
    };

    boot();
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleRaw(url);
    });
    const appState = AppState.addEventListener("change", async (state) => {
      if (state !== "active" || cancelled) return;
      const pending = await readNativePending();
      if (!cancelled && pending) await openPayload(pending);
      const url = await Linking.getInitialURL();
      if (!cancelled && url) await handleRaw(url);
    });
    return () => {
      cancelled = true;
      subscription.remove();
      appState.remove();
    };
  }, [dispatch, user?.accessToken, user?.isGuest]);

  return null;
};

export default ShareInbound;
