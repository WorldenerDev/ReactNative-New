import { REUSABLE_GROUPS_MOCK_ENABLED } from "@config/reusableGroupsMock";
import {
  buildCreateGroupFormData,
  buildUpdateGroupFormData,
} from "@utils/formDataHelper";
import {
  mockGetCrews,
  mockGetCrewDetails,
  mockGetCrewTrips,
  mockGetMyTrips,
  mockGetTripDetails,
  mockGetTripBrief,
  mockOptIn,
  mockOptOut,
  mockCreateGroup,
  mockUpdateGroupPhoto,
  mockCreateTripInGroup,
  mockCreateSoloTrip,
  mockGetNotifications,
  mockGetWishlist,
  mockCompareUsers,
  mockGetActiveTripsForOnboarding,
  subscribeReusableGroupsMock,
} from "../../mocks/reusableGroups/mockStore";
import {
  getGroups,
  getGroupDetails,
  getTripDetails,
  createTrip,
  createGroup,
  updateGroup,
  getGroupTrips,
  getTripBrief,
  optInToTripApi,
  optOutOfTripApi,
  getNotifications,
  getGroupWishlisted,
  getMyWishlisted,
  compareUsersInGroup,
  getTrip,
  getGroupMessages,
} from "@api/services/mainServices";

export { REUSABLE_GROUPS_MOCK_ENABLED, subscribeReusableGroupsMock };

export const isReusableGroupsMockEnabled = () => REUSABLE_GROUPS_MOCK_ENABLED;

/** Crew feature is live; Trips|Members UI always on when not using legacy mock-only path */
export const isCrewGroupsFeatureEnabled = () => true;

export const fetchCrews = async () => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrews();
  return getGroups();
};

export const fetchCrewDetails = async (groupId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrewDetails(groupId);
  return getGroupDetails(groupId);
};

export const fetchCrewTrips = async (groupId, options = {}) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrewTrips(groupId, options);
  return getGroupTrips(groupId, { status: options.status || "active" });
};

export const fetchMyTripsWithMock = async (realFetch) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetMyTrips();
  const res = await getTrip();
  return {
    success: res?.success !== false,
    data: res?.data?.trips || res?.data || [],
  };
};

export const fetchTripDetailsWithMock = async (tripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetTripDetails(tripId);
  return getTripDetails(tripId);
};

export const fetchTripBrief = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetTripBrief(canonicalTripId);
  return getTripBrief(canonicalTripId);
};

export const optInToTrip = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockOptIn(canonicalTripId);
  return optInToTripApi(canonicalTripId);
};

export const optOutOfTrip = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockOptOut(canonicalTripId);
  return optOutOfTripApi(canonicalTripId);
};

export const createCrew = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateGroup(payload);

  const hasImageFile =
    payload?.groupImage &&
    typeof payload.groupImage === "object" &&
    payload.groupImage.uri;

  if (hasImageFile) {
    return createGroup(
      buildCreateGroupFormData({
        groupName: payload.groupName || payload.name,
        groupImage: payload.groupImage,
        phoneNumbers: payload.phoneNumbers || [],
        message: payload.message,
      })
    );
  }

  return createGroup({
    groupName: payload.groupName || payload.name,
    groupImage: payload.groupImage || "",
    phoneNumbers: payload.phoneNumbers || [],
    message: payload.message,
  });
};

export const updateCrewPhoto = async (groupId, payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) {
    return mockUpdateGroupPhoto(groupId, payload);
  }

  const hasImageFile =
    payload?.groupImage &&
    typeof payload.groupImage === "object" &&
    payload.groupImage.uri;

  if (!hasImageFile) {
    throw new Error("Please select a photo to upload");
  }

  return updateGroup(
    groupId,
    buildUpdateGroupFormData({
      groupName: payload.groupName,
      groupImage: payload.groupImage,
    })
  );
};

export const createTripForCrew = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateTripInGroup(payload);
  return createTrip({
    city_id: payload.city_id || payload.cityId,
    start_at: payload.start_at,
    end_at: payload.end_at,
    groupId: payload.groupId,
    isGroupTrip: false,
    groups: [],
  });
};

export const createSoloTripWithMock = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateSoloTrip(payload);
  return createTrip({
    city_id: payload.cityId || payload.city_id,
    start_at: payload.start_at,
    end_at: payload.end_at,
    groups: [],
    isGroupTrip: false,
  });
};

export const fetchCrewTripNotifications = async () => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetNotifications();
  const res = await getNotifications();
  const list = res?.data || res || [];
  const filtered = (Array.isArray(list) ? list : []).filter(
    (n) => n.notifictaion_type === "trip_created_in_group"
  );
  return { success: true, data: filtered };
};

export const fetchTripWishlist = async (canonicalTripId, groupId, cityId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetWishlist(canonicalTripId);
  if (groupId) return getGroupWishlisted(groupId, cityId, canonicalTripId);
  if (cityId) return getMyWishlisted(cityId);
  return { success: true, data: { wishlisted_items: [] } };
};

export const fetchTripCompare = async ({ groupId, tripId, userId1, userId2 }) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCompareUsers();
  return compareUsersInGroup({ groupId, tripId, userId1, userId2 });
};

export const fetchOnboardingTrips = async (groupId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetActiveTripsForOnboarding(groupId);
  const res = await getGroupTrips(groupId, { status: "active" });
  const trips = (res?.data || []).filter(
    (t) => t.participationStatus === "not_joined" || t.participationStatus === "invited"
  );
  return { success: true, data: trips };
};

/** Best-effort last chat message for Group Chat preview. Soft-fails on errors. */
export const fetchGroupChatPreview = async (groupId) => {
  if (!groupId) return { success: true, data: null };
  try {
    const res = await getGroupMessages(
      groupId,
      { page: 1, limit: 1 },
      { skipErrorToast: true }
    );
    const list = res?.data || [];
    const latest = Array.isArray(list) && list.length ? list[0] : null;
    if (!latest) return { success: true, data: null };
    const senderName = latest.senderId?.name || "Someone";
    const text =
      latest.message ||
      (latest.messageType === "activity" ? latest.activityName : "") ||
      (latest.mediaUrl ? "Sent an attachment" : "");
    return {
      success: true,
      data: {
        preview: text ? `${senderName}: ${text}` : null,
        senderName,
        message: text,
      },
    };
  } catch (_error) {
    return { success: true, data: null };
  }
};
