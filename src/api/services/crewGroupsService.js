import { REUSABLE_GROUPS_MOCK_ENABLED } from "@config/reusableGroupsMock";
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
} from "@api/services/mainServices";

export { REUSABLE_GROUPS_MOCK_ENABLED, subscribeReusableGroupsMock };

export const isReusableGroupsMockEnabled = () => REUSABLE_GROUPS_MOCK_ENABLED;

export const fetchCrews = async () => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrews();
  return getGroups();
};

export const fetchCrewDetails = async (groupId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrewDetails(groupId);
  return getGroupDetails(groupId);
};

export const fetchCrewTrips = async (groupId, options) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetCrewTrips(groupId, options);
  return { success: true, data: [] };
};

export const fetchMyTripsWithMock = async (realFetch) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetMyTrips();
  return realFetch();
};

export const fetchTripDetailsWithMock = async (tripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetTripDetails(tripId);
  return getTripDetails(tripId);
};

export const fetchTripBrief = async (canonicalTripId) => {
  if (!REUSABLE_GROUPS_MOCK_ENABLED) {
    return { success: false, message: "Mock only" };
  }
  return mockGetTripBrief(canonicalTripId);
};

export const optInToTrip = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockOptIn(canonicalTripId);
  return { success: false, message: "API not implemented" };
};

export const optOutOfTrip = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockOptOut(canonicalTripId);
  return { success: false, message: "API not implemented" };
};

export const createCrew = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateGroup(payload);
  return { success: false, message: "API not implemented" };
};

export const createTripForCrew = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateTripInGroup(payload);
  return createTrip({ ...payload, groupId: payload.groupId });
};

export const createSoloTripWithMock = async (payload) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCreateSoloTrip(payload);
  return createTrip({
    city_id: payload.cityId,
    start_at: payload.start_at,
    end_at: payload.end_at,
    groups: [],
    isGroupTrip: false,
  });
};

export const fetchCrewTripNotifications = async () => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetNotifications();
  return { success: true, data: [] };
};

export const fetchTripWishlist = async (canonicalTripId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetWishlist(canonicalTripId);
  return { success: true, data: { wishlisted_items: [] } };
};

export const fetchTripCompare = async () => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockCompareUsers();
  return { success: true, data: null };
};

export const fetchOnboardingTrips = async (groupId) => {
  if (REUSABLE_GROUPS_MOCK_ENABLED) return mockGetActiveTripsForOnboarding(groupId);
  return { success: true, data: [] };
};
