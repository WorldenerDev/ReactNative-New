import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import OptimizedImage from "@components/OptimizedImage";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import { getImageUrl } from "@api/apiClient";
import { getGroupDetails, acceptInvite, rejectInvite } from "@api/services/mainServices";

const CREW_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop";

const goToCrewAfterJoin = (navigation, groupId, activeTrips = []) => {
  if (activeTrips.length) {
    navigation.replace(navigationStrings.GROUP_TRIPS_ONBOARDING, {
      groupId,
      activeTrips,
    });
    return;
  }
  navigation.replace(navigationStrings.GROUP_DETAILS, { groupId });
};

const CrewInvite = ({ navigation, route }) => {
  useGuestScreenGuard();
  const groupId = route?.params?.groupId;
  const invitationId = route?.params?.invitationId;
  const [crew, setCrew] = useState({
    groupName: route?.params?.groupName || "",
    groupImage: "",
    inviterName: route?.params?.inviterName || "",
    message: route?.params?.message || "",
    memberCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCrew = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getGroupDetails(groupId);
      if (res?.success && res?.data) {
        const members = [
          res.data.createdBy,
          ...(res.data.addedUsers || []),
        ].filter(Boolean);
        setCrew((prev) => ({
          ...prev,
          groupName: res.data.groupName || prev.groupName,
          groupImage: res.data.groupImage || "",
          memberCount: res.data.totalMembers ?? members.length,
        }));
      }
    } catch (error) {
      console.error("Error loading crew invite:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadCrew();
    }, [loadCrew])
  );

  const handleJoin = async () => {
    if (!groupId || !invitationId) {
      showToast("error", "Invitation not found");
      return;
    }
    try {
      setActionLoading(true);
      let activeTrips = [];
      try {
        const res = await acceptInvite(
          { groupId, invitedId: invitationId },
          { skipErrorToast: true }
        );
        activeTrips = res?.data?.activeTrips || [];
      } catch (error) {
        const message = String(error?.message || "").toLowerCase();
        if (!message.includes("already in group")) {
          throw error;
        }
      }
      showToast("success", "You're in the crew");
      goToCrewAfterJoin(navigation, groupId, activeTrips);
    } catch (error) {
      showToast("error", error?.message || "Failed to join crew");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!groupId || !invitationId) {
      navigation.goBack();
      return;
    }
    try {
      setActionLoading(true);
      await rejectInvite(
        { groupId, invitedId: invitationId },
        { skipErrorToast: true }
      );
      showToast("success", "Invitation declined");
      navigation.goBack();
    } catch (error) {
      showToast("error", error?.message || "Failed to decline invitation");
    } finally {
      setActionLoading(false);
    }
  };

  const crewName = crew.groupName || "this crew";
  const crewImage =
    getImageUrl(crew.groupImage) || crew.groupImage || CREW_FALLBACK_IMAGE;

  return (
    <MainContainer loader={loading || actionLoading}>
      <Header title="You're invited" showBack />
      {groupId ? (
        <View style={styles.container}>
          <OptimizedImage
            source={{ uri: crewImage }}
            style={styles.hero}
            resizeMode="cover"
          />
          <Text style={styles.eyebrow}>
            {crew.inviterName
              ? `${crew.inviterName} invited you to a crew`
              : "You've been invited to a crew"}
          </Text>
          <Text style={styles.name}>{crewName}</Text>
          {crew.memberCount ? (
            <Text style={styles.meta}>
              {crew.memberCount}{" "}
              {crew.memberCount === 1 ? "member" : "members"}
            </Text>
          ) : null}
          {crew.message ? (
            <Text style={styles.message}>{crew.message}</Text>
          ) : null}

          <View style={styles.actions}>
            <ButtonComp
              title="Join Crew"
              onPress={handleJoin}
              containerStyle={styles.joinBtn}
            />
            <ButtonComp
              title="Decline"
              onPress={handleDecline}
              containerStyle={styles.skipBtn}
              textStyle={styles.skipText}
            />
          </View>
        </View>
      ) : null}
    </MainContainer>
  );
};

export default CrewInvite;

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
  name: {
    fontSize: getHeight(24),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  meta: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(12),
  },
  message: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    marginBottom: getHeight(32),
  },
  actions: {
    gap: getHeight(12),
    marginTop: getHeight(12),
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
