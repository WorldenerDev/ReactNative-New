import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import CrewTripCard from "@components/crew/CrewTripCard";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getWidth } from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import {
  fetchOnboardingTrips,
  optInToTrip,
  optOutOfTrip,
} from "@api/services/crewGroupsService";

const GroupTripsOnboarding = ({ navigation, route }) => {
  useGuestScreenGuard();
  const { groupId } = route?.params || {};
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetchOnboardingTrips(groupId);
      if (res?.success) {
        setTrips(
          (res.data || []).filter((t) => t.participationStatus === "not_joined")
        );
      }
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  const handleJoin = async (trip) => {
    const res = await optInToTrip(trip._id);
    if (res?.success) {
      showToast("success", `Joined ${trip.city}`);
      setTrips((prev) => prev.filter((t) => t._id !== trip._id));
    }
  };

  const handleSkip = async (trip) => {
    await optOutOfTrip(trip._id);
    setTrips((prev) => prev.filter((t) => t._id !== trip._id));
  };

  const handleDone = () => {
    navigation.replace(navigationStrings.GROUP_DETAILS, { groupId });
  };

  return (
    <MainContainer loader={loading}>
      <Header title="Join active trips" showBack />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          This crew has trips in progress. Join any you'd like to be part of.
        </Text>

        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <CrewTripCard trip={item} />
              <View style={styles.rowActions}>
                <ButtonComp
                  title="Join"
                  onPress={() => handleJoin(item)}
                  containerStyle={styles.joinBtn}
                />
                <ButtonComp
                  title="Skip"
                  onPress={() => handleSkip(item)}
                  containerStyle={styles.skipBtn}
                  textStyle={styles.skipText}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>No pending trips to join</Text>
            ) : null
          }
        />

        <ButtonComp
          title="Go to crew"
          onPress={handleDone}
          containerStyle={styles.doneBtn}
        />
      </View>
    </MainContainer>
  );
};

export default GroupTripsOnboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getWidth(16),
  },
  subtitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(16),
  },
  row: {
    marginBottom: getHeight(8),
  },
  rowActions: {
    flexDirection: "row",
    gap: getWidth(8),
    marginBottom: getHeight(12),
  },
  joinBtn: {
    flex: 1,
    backgroundColor: colors.black,
  },
  skipBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    color: colors.black,
  },
  empty: {
    textAlign: "center",
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginVertical: getHeight(24),
  },
  doneBtn: {
    backgroundColor: colors.secondary,
    marginTop: getHeight(16),
  },
});
