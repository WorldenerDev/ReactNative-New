const toId = (value) => {
  if (value == null || value === "") return null;
  return String(value);
};

export const getTripId = (trip) =>
  toId(trip?._id ?? trip?.id ?? trip?.trip_id);

export const getTripCityId = (trip) => {
  if (!trip) return null;

  const raw =
    trip.city_id ??
    trip.city?.city_id ??
    trip.city?._id ??
    trip.city?.id;

  if (typeof raw === "string" || typeof raw === "number") {
    return toId(raw);
  }

  if (raw && typeof raw === "object") {
    return toId(raw.city_id ?? raw._id ?? raw.id);
  }

  return null;
};

export const getTripName = (trip) =>
  trip?.name ||
  trip?.destination ||
  trip?.city?.name ||
  trip?.city_id?.name ||
  "Trip";

export const getTripImage = (trip) =>
  trip?.image ||
  trip?.city?.image ||
  trip?.city_id?.image ||
  null;

const normalizeActivities = (trip, raw) => {
  const activities =
    trip?.activities ??
    raw?.activities ??
    trip?.events ??
    raw?.events ??
    [];

  return Array.isArray(activities) ? activities : [];
};

export const normalizeTripDetails = (payload) => {
  if (!payload) return null;

  const raw = payload?.data ?? payload;
  const trip = raw?.trip ?? raw;
  const id = getTripId(trip);

  if (!id) return null;

  const activities = normalizeActivities(trip, raw);
  const cityId = getTripCityId(trip);
  const participantsList = Array.isArray(trip?.participantsList)
    ? trip.participantsList
    : Array.isArray(trip?.participants)
      ? trip.participants
      : [];

  const participantsCount =
    typeof trip?.participants === "number"
      ? trip.participants
      : participantsList.length;

  return {
    ...trip,
    _id: id,
    id,
    name: getTripName(trip),
    destination: trip?.destination || getTripName(trip),
    start_at: trip?.start_at || trip?.startDate || null,
    end_at: trip?.end_at || trip?.endDate || null,
    startDate: trip?.startDate || trip?.start_at?.slice?.(0, 10) || null,
    endDate: trip?.endDate || trip?.end_at?.slice?.(0, 10) || null,
    image: getTripImage(trip),
    city_id: cityId,
    city: {
      ...(typeof trip?.city === "object" ? trip.city : {}),
      ...(typeof trip?.city_id === "object" ? trip.city_id : {}),
      name: getTripName(trip),
      image: getTripImage(trip),
      city_id: cityId,
      _id: cityId,
    },
    activities,
    totalActivities: trip?.totalActivities ?? activities.length,
    groupId: trip?.groupId || trip?.group_id || null,
    participantsList,
    participants: participantsCount,
    totalBudget: trip?.totalBudget ?? trip?.budget ?? 0,
    budget: trip?.budget ?? trip?.totalBudget ?? 0,
    tripStatus: trip?.tripStatus || trip?.status || "",
  };
};

export const getActivityDateKey = (activity) => {
  const raw = activity?.date || activity?.start_date || activity?.time;
  if (!raw) return "Unknown Date";

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return String(raw).split("T")[0];
};

export const toSelectedTripOption = (trip) => {
  const id = getTripId(trip);
  if (!id) return null;

  return {
    label: getTripName(trip),
    value: id,
    start_at: trip?.start_at || trip?.startDate || null,
    end_at: trip?.end_at || trip?.endDate || null,
  };
};

const toComparableId = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return String(value._id ?? value.id ?? "");
  }
  return String(value);
};

export const canDeleteTrip = (trip, currentUserId) => {
  const uid = toComparableId(currentUserId);
  if (!uid || !trip) return false;

  const groupAdminId = toComparableId(trip.groupCreatedBy);
  if (groupAdminId && groupAdminId === uid) return true;

  const tripCreatorId = toComparableId(trip.tripCreatorId);
  if (tripCreatorId && tripCreatorId === uid) return true;

  const isCrewTrip = Boolean(trip.groupId || trip.group_id);
  if (isCrewTrip) return false;

  const ownerId = toComparableId(trip.user_id);
  return Boolean(ownerId && ownerId === uid);
};
