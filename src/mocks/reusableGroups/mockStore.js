import { createSeedState, MOCK_CURRENT_USER_ID } from "./seedData";

let state = createSeedState();
const listeners = new Set();

const notify = () => {
  listeners.forEach((fn) => fn());
};

export const subscribeReusableGroupsMock = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const resetReusableGroupsMock = () => {
  state = createSeedState();
  notify();
};

const getParticipation = (canonicalTripId, userId = MOCK_CURRENT_USER_ID) =>
  state.participations.find(
    (p) => p.canonicalTripId === canonicalTripId && p.userId === userId
  );

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const mockGetCrews = async () => {
  await delay();
  return {
    success: true,
    data: state.groups.map((g) => {
      const activeTrips = state.canonicalTrips.filter(
        (t) => t.groupId === g._id && t.status === "active"
      );
      return {
        ...g,
        activeTripCount: activeTrips.length,
        cityChips: activeTrips.map((t) => t.city),
      };
    }),
  };
};

export const mockGetCrewDetails = async (groupId) => {
  await delay();
  const group = state.groups.find((g) => g._id === groupId);
  if (!group) return { success: false, message: "Group not found" };
  return { success: true, data: group };
};

export const mockGetCrewTrips = async (groupId, { status = "active" } = {}) => {
  await delay();
  const group = state.groups.find((g) => g._id === groupId);
  const roster = [
    group?.createdBy,
    ...(group?.addedUsers || []),
  ].filter(Boolean);
  const trips = state.canonicalTrips
    .filter((t) => t.groupId === groupId && t.status === status)
    .map((t) => {
      const p = getParticipation(t._id);
      const joined = roster.filter((u) => {
        if (u._id === MOCK_CURRENT_USER_ID) {
          return p?.status === "joined";
        }
        return true;
      });
      return {
        ...t,
        participationStatus: p?.status || "not_joined",
        memberTripId: p?.memberTripId,
        joinedMemberCount: joined.length,
        joinedMembers: joined.slice(0, 4).map((u) => ({
          _id: u._id,
          name: u.name,
          image: u.image || "",
        })),
        savedCount: t.savedCount ?? Math.min(t.activityCount || 0, 8),
      };
    });
  return { success: true, data: trips };
};

export const mockGetMyTrips = async () => {
  await delay();
  const crewTrips = state.participations
    .map((p) => {
      const canonical = state.canonicalTrips.find(
        (t) => t._id === p.canonicalTripId
      );
      if (!canonical) return null;
      return {
        _id: p.memberTripId || canonical._id,
        canonicalTripId: canonical._id,
        groupId: canonical.groupId,
        groupName: canonical.groupName,
        name: canonical.city,
        city: { name: canonical.city, image: canonical.image },
        start_at: canonical.start_at,
        end_at: canonical.end_at,
        totalActivities: canonical.activityCount,
        participationStatus: p.status,
        isSolo: false,
      };
    })
    .filter(Boolean);

  const solo = state.soloTrips.map((t) => ({
    _id: t._id,
    groupId: null,
    name: t.city,
    city: { name: t.city, image: t.image },
    start_at: t.start_at,
    end_at: t.end_at,
    totalActivities: t.activityCount,
    participationStatus: "joined",
    isSolo: true,
  }));

  return { success: true, data: [...crewTrips, ...solo] };
};

export const mockGetTripDetails = async (tripId) => {
  await delay();
  const solo = state.soloTrips.find((t) => t._id === tripId);
  if (solo) {
    return {
      success: true,
      data: {
        _id: solo._id,
        groupId: null,
        name: solo.city,
        destination: solo.city,
        image: solo.image,
        start_at: solo.start_at,
        end_at: solo.end_at,
        activities: solo.activities || [],
        totalActivities: solo.activityCount,
        participationStatus: "joined",
        isSolo: true,
      },
    };
  }

  const participation = state.participations.find(
    (p) => p.memberTripId === tripId || p.canonicalTripId === tripId
  );
  const canonical = participation
    ? state.canonicalTrips.find((t) => t._id === participation.canonicalTripId)
    : state.canonicalTrips.find((t) => t._id === tripId);

  if (!canonical) return { success: false, message: "Trip not found" };

  const p = participation || getParticipation(canonical._id);
  const joinedCount = state.participations.filter(
    (x) => x.canonicalTripId === canonical._id && x.status === "joined"
  ).length;

  return {
    success: true,
    data: {
      _id: p?.memberTripId || canonical._id,
      canonicalTripId: canonical._id,
      groupId: canonical.groupId,
      groupName: canonical.groupName,
      name: canonical.city,
      destination: canonical.city,
      city_id: { city_id: canonical.cityId, name: canonical.city },
      image: canonical.image,
      start_at: canonical.start_at,
      end_at: canonical.end_at,
      activities: canonical.activities || [],
      totalActivities: canonical.activityCount,
      participationStatus: p?.status || "not_joined",
      participants: joinedCount,
      participantsList: [],
      tripStatus: canonical.status === "active" ? "Planning" : "Past",
      isSolo: false,
      createdBy: canonical.createdBy,
    },
  };
};

export const mockGetTripBrief = async (canonicalTripId) => {
  await delay();
  const canonical = state.canonicalTrips.find((t) => t._id === canonicalTripId);
  if (!canonical) return { success: false };
  const group = state.groups.find((g) => g._id === canonical.groupId);
  const p = getParticipation(canonical._id);
  return {
    success: true,
    data: {
      ...canonical,
      groupName: group?.groupName,
      participationStatus: p?.status || "not_joined",
      invitedCount: (group?.addedUsers?.length || 0) + 1,
      creatorName: canonical.createdBy?.name || "Someone",
    },
  };
};

export const mockOptIn = async (canonicalTripId) => {
  await delay();
  let p = getParticipation(canonicalTripId);
  const canonical = state.canonicalTrips.find((t) => t._id === canonicalTripId);
  if (!canonical) return { success: false, message: "Trip not found" };

  const memberTripId =
    p?.memberTripId || `${canonicalTripId.replace("-canonical", "")}-member-me`;

  if (p) {
    p.status = "joined";
    p.memberTripId = memberTripId;
  } else {
    state.participations.push({
      userId: MOCK_CURRENT_USER_ID,
      canonicalTripId,
      memberTripId,
      groupId: canonical.groupId,
      status: "joined",
    });
  }
  notify();
  return { success: true, data: { memberTripId } };
};

export const mockOptOut = async (canonicalTripId) => {
  await delay();
  const p = getParticipation(canonicalTripId);
  if (p) {
    p.status = "opted_out";
    if (!p.memberTripId) {
      p.memberTripId = `${canonicalTripId.replace("-canonical", "")}-member-me`;
    }
  }
  notify();
  return { success: true };
};

export const mockCreateGroup = async ({ groupName }) => {
  await delay();
  const id = `crew-${Date.now()}`;
  const group = {
    _id: id,
    groupName: groupName || "New Crew",
    groupImage: null,
    createdBy: { _id: MOCK_CURRENT_USER_ID, name: "You", image: "" },
    addedUsers: [],
    activeTripCount: 0,
    cityChips: [],
  };
  state.groups.unshift(group);
  notify();
  return { success: true, data: group };
};

export const mockCreateTripInGroup = async ({
  groupId,
  city,
  cityId,
  image,
  start_at,
  end_at,
}) => {
  await delay();
  const id = `trip-${Date.now()}-canonical`;
  const group = state.groups.find((g) => g._id === groupId);
  const trip = {
    _id: id,
    groupId,
    groupName: group?.groupName || "Crew",
    city: city || "New City",
    cityId: cityId || "city-new",
    image: image || "",
    start_at,
    end_at,
    activityCount: 0,
    status: "active",
    isCanonical: true,
    createdBy: { _id: MOCK_CURRENT_USER_ID, name: "You" },
    activities: [],
  };
  state.canonicalTrips.unshift(trip);

  const memberIds = [
    MOCK_CURRENT_USER_ID,
    ...(group?.addedUsers?.map((u) => u._id) || []),
  ];
  [...new Set(memberIds)].forEach((userId) => {
    state.participations.push({
      userId,
      canonicalTripId: id,
      memberTripId: userId === MOCK_CURRENT_USER_ID ? `${id}-member-me` : null,
      groupId,
      status: userId === MOCK_CURRENT_USER_ID ? "joined" : "not_joined",
    });
  });

  if (group) {
    group.activeTripCount = state.canonicalTrips.filter(
      (t) => t.groupId === groupId && t.status === "active"
    ).length;
    group.cityChips = state.canonicalTrips
      .filter((t) => t.groupId === groupId && t.status === "active")
      .map((t) => t.city);
  }

  state.notifications.unshift({
    _id: `notif-${Date.now()}`,
    notifictaion_type: "trip_created_in_group",
    title: `New trip in ${group?.groupName}`,
    message: `You added ${trip.city} to ${group?.groupName}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    groupId,
    tripId: id,
    creatorName: "You",
    cityName: trip.city,
    groupName: group?.groupName,
  });

  notify();
  return { success: true, data: { _id: id, memberTripId: `${id}-member-me` } };
};

export const mockCreateSoloTrip = async ({ city, cityId, image, start_at, end_at }) => {
  await delay();
  const id = `trip-solo-${Date.now()}`;
  const trip = {
    _id: id,
    groupId: null,
    city,
    cityId,
    image,
    start_at,
    end_at,
    activityCount: 0,
    activities: [],
    status: "active",
  };
  state.soloTrips.unshift(trip);
  notify();
  return { success: true, data: { _id: id } };
};

export const mockGetNotifications = async () => {
  await delay();
  return { success: true, data: state.notifications };
};

export const mockGetWishlist = async (canonicalTripId) => {
  await delay();
  return {
    success: true,
    data: {
      wishlisted_items: state.wishlistByTrip[canonicalTripId] || [],
    },
  };
};

export const mockCompareUsers = async () => {
  await delay();
  return { success: true, data: state.compareMock };
};

export const mockGetActiveTripsForOnboarding = async (groupId) => {
  await delay();
  const trips = state.canonicalTrips
    .filter((t) => t.groupId === groupId && t.status === "active")
    .map((t) => ({
      ...t,
      participationStatus: getParticipation(t._id)?.status || "not_joined",
    }));
  return { success: true, data: trips };
};
