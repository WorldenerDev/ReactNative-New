import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import OptimizedImage from "@components/OptimizedImage";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import { formatCompactDateRange } from "@utils/formatDate";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import { getImageUrl } from "@api/apiClient";
import {
  fetchTripBrief,
  optInToTrip,
  optOutOfTrip,
} from "@api/services/crewGroupsService";

const CREW_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop";

const TripBrief = ({ navigation, route }) => {
  useGuestScreenGuard();
  const canonicalTripId =
    route?.params?.canonicalTripId || route?.params?.tripId;
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBrief = useCallback(async () => {
    if (!canonicalTripId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetchTripBrief(canonicalTripId);
      if (res?.success) {
        setBrief(res.data);
      } else {
        showToast("error", "Trip not found");
      }
    } finally {
      setLoading(false);
    }
  }, [canonicalTripId]);

  useFocusEffect(
    useCallback(() => {
      loadBrief();
    }, [loadBrief])
  );

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      const res = await optInToTrip(canonicalTripId);
      if (res?.success) {
        showToast("success", "You're in!");
        navigation.replace(navigationStrings.TRIP_DETAILS, {
          tripId: res.data.memberTripId,
        });
      }
    } catch (error) {
      showToast("error", error?.message || "Failed to join trip");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOptOut = async () => {
    try {
      setActionLoading(true);
      await optOutOfTrip(canonicalTripId);
      showToast("success", "You opted out of this trip");
      navigation.goBack();
    } catch (error) {
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const dateLabel = brief
    ? formatCompactDateRange(brief.start_at, brief.end_at)
    : "";
  const crewImage =
    getImageUrl(brief?.groupImage) || brief?.groupImage || CREW_FALLBACK_IMAGE;

  return (
    <MainContainer loader={loading || actionLoading}>
      <Header title="You're invited" showBack />
      {brief ? (
        <View style={styles.container}>
          <OptimizedImage
            source={{ uri: crewImage }}
            style={styles.hero}
            resizeMode="cover"
          />
          <Text style={styles.eyebrow}>
            {brief.creatorName} added a trip to {brief.groupName}
          </Text>
          <Text style={styles.city}>{brief.city}</Text>
          {dateLabel ? (
            <View style={styles.dateRow}>
              <Image source={imagePath.CALENDER_ICON} style={styles.icon} />
              <Text style={styles.dates}>{dateLabel}</Text>
            </View>
          ) : null}
          <Text style={styles.meta}>
            {brief.invitedCount || 0} crew members invited ·{" "}
            {brief.activityCount || 0} activities planned
          </Text>

          <View style={styles.actions}>
            <ButtonComp
              title="Join Trip"
              onPress={handleJoin}
              containerStyle={styles.joinBtn}
            />
            <ButtonComp
              title="Not this time"
              onPress={handleOptOut}
              containerStyle={styles.skipBtn}
              textStyle={styles.skipText}
            />
          </View>
        </View>
      ) : null}
    </MainContainer>
  );
};

export default TripBrief;

const styles = StyleSheet.create({
  container: {
    padding: getWidth(16),
  },
  hero: {
    width: "100%",
    height: getHeight(180),
    borderRadius: getRadius(16),
    marginBottom: getHeight(16),
  },
  eyebrow: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(6),
  },
  city: {
    fontSize: getHeight(24),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(8),
  },
  icon: {
    width: getWidth(14),
    height: getHeight(14),
    marginRight: getWidth(6),
    tintColor: colors.black,
  },
  dates: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  meta: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(32),
  },
  actions: {
    gap: getHeight(12),
  },
  joinBtn: {
    backgroundColor: colors.black,
    width: "100%",
  },
  skipBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  skipText: {
    color: colors.black,
  },
});
