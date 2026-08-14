import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import { exitGuestForSignIn } from "@redux/slices/authSlice";

/** Screens guests must not land on (navigation guard). */
export const GUEST_RESTRICTED_SCREENS = new Set([
  navigationStrings.CART,
  navigationStrings.CART_CUSTOMER_INFO,
  navigationStrings.PAYMENT,
  navigationStrings.PAYMENT_SUCCESS,
  navigationStrings.CREATE_TRIP,
  navigationStrings.ADD_TO_TRIP,
  navigationStrings.TRIP_DETAILS,
  navigationStrings.EDIT_TRIP,
  navigationStrings.CALENDAR_VIEW_TRIP_DETAIL,
  navigationStrings.GROUP_DETAILS,
  navigationStrings.CREW_INVITE,
  navigationStrings.TRIP_BRIEF,
  navigationStrings.GROUP_TRIPS_ONBOARDING,
  navigationStrings.CHAT,
  navigationStrings.BOOKING_DETAILS,
  navigationStrings.EDIT_PROFILE,
  navigationStrings.NOTIFICATION_SCREEN,
  navigationStrings.NOTIFICATION_SETTINGS,
  navigationStrings.PAYMENT_METHODS,
  navigationStrings.SAVED_CARDS,
  navigationStrings.ADD_CARD,
  navigationStrings.SAVE_CARD,
  navigationStrings.AI_CHAT,
  navigationStrings.VIEW_AI_CHAT,
  navigationStrings.MEMBER_PROFILE,
  navigationStrings.UPDATE_INTERESTS,
  navigationStrings.TRANSACTION_HISTORY,
  navigationStrings.TRANSACTION_DETAIL,
]);

/**
 * If the user is a guest, exits guest session and sends them to Sign In.
 * Returns true when the caller may proceed (registered user).
 */
export const requireAuth = (dispatch, isGuest, message = "Sign in to continue") => {
  if (!isGuest) {
    return true;
  }
  showToast("info", message);
  dispatch(exitGuestForSignIn());
  return false;
};
