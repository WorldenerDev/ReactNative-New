import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Share,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import Accordion from "@components/Accordion";
import CustomDropdown from "@components/CustomDropdown";
import { getImageUrl } from "@api/apiClient";
import {
  addSavedIdeaToItinerary,
  getSavedIdea,
  getTrip,
  reactToSavedIdea,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import { formatTripShareTitle, memberCountLabel } from "@utils/shareLink";

const BLUE = "#2F6BFF";

const imageUri = (value) => {
  if (!value) return undefined;
  if (String(value).startsWith("http")) return value;
  return getImageUrl(value);
};

const formatDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const tripDates = (trip) => {
  if (!trip?.start_at || !trip?.end_at) return [];
  const dates = [];
  const cursor = new Date(trip.start_at);
  const end = new Date(trip.end_at);
  cursor.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);
  while (cursor <= end && dates.length < 62) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const SavedIdeaDetail = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const ideaId = route?.params?.ideaId;
  const [idea, setIdea] = useState(route?.params?.idea || null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(!route?.params?.idea);
  const [liking, setLiking] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!ideaId) return;
    try {
      setLoading(true);
      const [ideaRes, tripRes] = await Promise.all([getSavedIdea(ideaId), getTrip()]);
      const nextIdea = ideaRes?.data?.idea;
      const list = tripRes?.data?.trips || [];
      setIdea(nextIdea || null);
      setTrips(list);
      const match =
        list.find((trip) => String(trip.canonicalTripId || trip._id) === String(nextIdea?.trip_id)) ||
        list.find((trip) => String(trip._id) === String(nextIdea?.itinerary_trip_id)) ||
        null;
      if (match) {
        setSelectedTrip({
          label: `${formatTripShareTitle(match)} · ${memberCountLabel(match.memberCount)}`,
          value: match._id,
          start_at: match.start_at,
          end_at: match.end_at,
          canonicalTripId: match.canonicalTripId || match._id,
        });
      }
      if (nextIdea?.itinerary_date) {
        setSelectedDate({
          label: formatDay(nextIdea.itinerary_date),
          value: nextIdea.itinerary_date,
        });
      }
    } catch (error) {
      showToast("error", error?.message || "Could not open this idea");
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const matchingTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const canonical = String(trip.canonicalTripId || trip._id);
        return canonical === String(idea?.trip_id);
      }),
    [trips, idea?.trip_id]
  );

  const dateOptions = useMemo(() => {
    const trip = trips.find((item) => item._id === selectedTrip?.value);
    return tripDates(trip).map((date) => ({
      label: formatDay(date),
      value: date.toISOString(),
    }));
  }, [trips, selectedTrip]);

  const toggleLike = async () => {
    if (!ideaId || liking) return;
    try {
      setLiking(true);
      const res = await reactToSavedIdea(ideaId);
      if (res?.data?.idea) setIdea(res.data.idea);
    } catch (error) {
      showToast("error", error?.message || "Could not update the like");
    } finally {
      setLiking(false);
    }
  };

  const openOriginal = () => {
    if (idea?.url) Linking.openURL(idea.url).catch(() => {});
  };

  const shareIdea = () => {
    if (!idea?.url) return;
    Share.share({ message: idea.url, url: idea.url }).catch(() => {});
  };

  const addToItinerary = async () => {
    if (!selectedTrip || adding) return;
    try {
      setAdding(true);
      const res = await addSavedIdeaToItinerary(ideaId, {
        trip_id: selectedTrip.value,
        date: selectedDate?.value || null,
      });
      if (!res?.success) {
        showToast("error", res?.message || "Could not add this to your itinerary");
        return;
      }
      showToast("success", "Added to your itinerary");
    } catch (error) {
      showToast("error", error?.message || "Could not add this to your itinerary");
    } finally {
      setAdding(false);
    }
  };

  if (loading && !idea) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!idea) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>This saved link is no longer available.</Text>
      </View>
    );
  }

  const hero = imageUri(idea.image);
  const special = idea.highlights?.length ? idea.highlights : idea.description ? [idea.description] : [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + getHeight(88) }}>
        <View>
          {hero ? (
            <OptimizedImage source={{ uri: hero }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, styles.heroFallback]} />
          )}
          <View style={[styles.heroActions, { top: insets.top + 8 }]}>
            <TouchableOpacity style={styles.round} onPress={() => navigation.goBack()}>
              <Text style={styles.roundLabel}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.round} onPress={shareIdea}>
                <Image source={imagePath.SHARE_ICON} style={styles.heroIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.round} onPress={toggleLike} disabled={liking}>
                <Image
                  source={idea.is_liked_by_current_user ? imagePath.LIKE_ICON : imagePath.UN_LIKE_ICON}
                  style={styles.heroIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{idea.title}</Text>
          {idea.rating_value != null ? (
            <Text style={styles.meta}>
              ★ {idea.rating_value}
              {idea.rating_count != null ? ` (${idea.rating_count})` : ""}
            </Text>
          ) : null}
          {idea.location_name ? (
            <Text style={styles.meta}>📍 {idea.location_name}</Text>
          ) : null}

          <TouchableOpacity style={styles.sourceRow} onPress={openOriginal}>
            <View>
              <Text style={styles.sourceTitle}>From {idea.source || "the web"}</Text>
              <Text style={styles.sourceHost}>{idea.host || idea.url}</Text>
            </View>
            <Text style={styles.external}>↗</Text>
          </TouchableOpacity>

          {idea.note ? <Text style={styles.note}>“{idea.note}”</Text> : null}
          {idea.like_count ? (
            <Text style={styles.likes}>
              {idea.like_count} liked
              {idea.liked_by_members?.length
                ? ` · ${idea.liked_by_members.map((member) => member.name).join(", ")}`
                : ""}
            </Text>
          ) : null}

          <Text style={styles.section}>Add to trip</Text>
          <CustomDropdown
            placeholder="Select a trip"
            options={matchingTrips.map((trip) => ({
              label: `${formatTripShareTitle(trip)} · ${memberCountLabel(trip.memberCount)}`,
              value: trip._id,
              start_at: trip.start_at,
              end_at: trip.end_at,
            }))}
            selectedValue={selectedTrip}
            onValueChange={(item) => {
              setSelectedTrip(item);
              setSelectedDate(null);
            }}
          />

          <Text style={styles.section}>Select date (optional)</Text>
          <CustomDropdown
            placeholder="Choose a day"
            options={dateOptions}
            selectedValue={selectedDate}
            onValueChange={setSelectedDate}
            disabled={!dateOptions.length}
          />

          {(idea.duration_label || idea.audience_label) && (
            <View style={styles.chips}>
              {idea.duration_label ? <Text style={styles.chip}>{idea.duration_label}</Text> : null}
              {idea.audience_label ? <Text style={styles.chip}>{idea.audience_label}</Text> : null}
            </View>
          )}

          {special.length > 0 ? (
            <Accordion title="What makes this special">
              {special.map((item) => (
                <Text key={item} style={styles.copy}>
                  {item}
                </Text>
              ))}
            </Accordion>
          ) : null}
          {idea.before_you_go ? (
            <Accordion title="Before you go">
              <Text style={styles.copy}>{idea.before_you_go}</Text>
            </Accordion>
          ) : null}
          {idea.included?.length ? (
            <Accordion title="Included">
              {idea.included.map((item) => (
                <Text key={item} style={styles.copy}>
                  {"• "}
                  {item}
                </Text>
              ))}
            </Accordion>
          ) : null}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.addButton, (!selectedTrip || adding) && styles.addDisabled]}
          disabled={!selectedTrip || adding}
          onPress={addToItinerary}
        >
          {adding ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.addLabel}>Add to itinerary</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SavedIdeaDetail;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  missing: { fontFamily: fonts.RobotoRegular, color: colors.lightText, textAlign: "center" },
  hero: { width: "100%", height: getHeight(280), backgroundColor: colors.border },
  heroFallback: { backgroundColor: "#E8EEF5" },
  heroActions: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroRight: { flexDirection: "row", gap: 8 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  roundLabel: { fontSize: 18, color: colors.black },
  heroIcon: { width: 18, height: 18, resizeMode: "contain" },
  body: { padding: getWidth(16) },
  title: {
    fontFamily: fonts.RobotoBold,
    fontSize: getHeight(26),
    color: colors.black,
  },
  meta: {
    marginTop: 6,
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  sourceRow: {
    marginTop: getHeight(16),
    padding: getWidth(14),
    borderRadius: getRadius(14),
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceTitle: { fontFamily: fonts.RobotoMedium, color: colors.black },
  sourceHost: { fontFamily: fonts.RobotoRegular, color: colors.lightText, marginTop: 2 },
  external: { color: BLUE, fontSize: 18 },
  note: {
    marginTop: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  likes: {
    marginTop: 6,
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  section: {
    marginTop: getHeight(18),
    marginBottom: getHeight(8),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  chips: { flexDirection: "row", gap: 12, marginTop: getHeight(16) },
  chip: { fontFamily: fonts.RobotoRegular, color: colors.black },
  copy: {
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: getWidth(16),
    backgroundColor: colors.white,
  },
  addButton: {
    backgroundColor: BLUE,
    borderRadius: getRadius(28),
    minHeight: getHeight(52),
    alignItems: "center",
    justifyContent: "center",
  },
  addDisabled: { opacity: 0.5 },
  addLabel: { color: colors.white, fontFamily: fonts.RobotoMedium, fontSize: getHeight(16) },
});
