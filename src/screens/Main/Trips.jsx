import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TripCard from "@components/TripCard";
import { getHeight, getWidth } from "@utils/responsive";
import { typography } from "@utils/theme";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch } from "react-redux";
import { deleteUserTrip } from "@redux/slices/cityTripSlice";
import GuestPrompt from "@components/GuestPrompt";
import useAuth from "@hooks/useAuth";
import {
  fetchMyTripsWithMock,
  isReusableGroupsMockEnabled,
  optInToTrip,
  subscribeReusableGroupsMock,
} from "@api/services/crewGroupsService";
import { showToast } from "@components/AppToast";

const Trips = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { isGuest } = useAuth();
  const dispatch = useDispatch();
  const [tripList, setTripList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const getAllTrips = useCallback(async () => {
    try {
      setListLoading(true);
      const response = await fetchMyTripsWithMock();
      if (response?.success) {
        const trips = response.data?.trips || response.data || [];
        setTripList(Array.isArray(trips) ? trips : []);
      } else {
        setTripList([]);
      }
    } catch (error) {
      console.error("Failed to fetch trips: ", error);
      setTripList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) {
      getAllTrips();
    }
  }, [getAllTrips, isGuest]);

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        getAllTrips();
      }
    }, [getAllTrips, isGuest])
  );

  useEffect(() => {
    if (!isReusableGroupsMockEnabled() || isGuest) return undefined;
    return subscribeReusableGroupsMock(getAllTrips);
  }, [isGuest, getAllTrips]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllTrips();
    } catch (error) {
      console.error("Failed to refresh trips: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddTrip = () => {
    navigation.navigate(navigationStrings.CREATE_TRIP);
  };

  const handleDelete = (tripId) => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleteLoading(true);
          try {
            await dispatch(deleteUserTrip(tripId));
            await getAllTrips();
          } catch (error) {
            Alert.alert("Error", "Failed to delete trip. Please try again.");
          } finally {
            setDeleteLoading(false);
          }
        },
      },
    ]);
  };

  const handleRejoin = async (item) => {
    const canonicalId = item.canonicalTripId || item._id;
    try {
      setListLoading(true);
      const res = await optInToTrip(canonicalId);
      if (res?.success) {
        showToast("success", "Welcome back!");
        await getAllTrips();
      }
    } catch (error) {
      showToast("error", error?.message || "Failed to rejoin");
    } finally {
      setListLoading(false);
    }
  };

  const getTripMeta = (item) => {
    const members =
      typeof item?.participants === "number"
        ? item.participants
        : item?.participantsList?.length ?? item?.addedUsers?.length ?? null;

    const activities =
      typeof item?.totalActivities === "number"
        ? item.totalActivities
        : Array.isArray(item?.activities)
          ? item.activities.length
          : null;

    return { members, activities };
  };

  const displayTrips = tripList;

  if (isGuest) {
    return (
      <MainContainer>
        <Header showBack={false} title="My Trips" />
        <GuestPrompt
          title="Sign in to plan trips"
          subtitle="Create an account to save destinations, build itineraries, and travel with friends."
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer loader={deleteLoading || listLoading}>
      <Header
        showBack={false}
        title="My Trips"
        rightIconImage={imagePath.PLUS_ICON_BORDER}
        onRightIconPress={handleAddTrip}
      />

      <FlatList
        data={displayTrips}
        renderItem={({ item }) => {
          const { members, activities } = getTripMeta(item);
          const isOptedOut = item?.participationStatus === "opted_out";

          return (
            <TripCard
              image={item?.city?.image}
              city={item?.name || item?.city?.name}
              startDate={item?.start_at}
              endDate={item?.end_at}
              memberCount={members}
              activityCount={activities}
              groupName={item?.groupName}
              participationStatus={item?.participationStatus}
              dimmed={isOptedOut}
              showCrewButton={!!item?.groupId}
              onItineraryPress={() =>
                navigation.navigate(navigationStrings.TRIP_DETAILS, {
                  tripId: item?._id,
                  trip: item,
                })
              }
              onGroupPress={() => {
                item?.groupId
                  ? navigation.navigate(navigationStrings.GROUP_DETAILS, {
                      groupId: item?.groupId,
                      tripId: item?._id,
                    })
                  : Alert.alert("Crew not available");
              }}
              onRejoinPress={
                isOptedOut
                  ? () => handleRejoin(item)
                  : undefined
              }
              onDeletePress={() => handleDelete(item._id)}
              onPressCard={() => {
                if (isOptedOut) return;
                navigation.navigate(navigationStrings.TRIP_DETAILS, {
                  tripId: item?._id,
                  trip: item,
                });
              }}
            />
          );
        }}
        keyExtractor={(item) => item?._id.toString()}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: scrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.lightText}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trips found</Text>
            <Text style={styles.emptySubText}>
              Start planning your next adventure!
            </Text>
          </View>
        )}
      />
    </MainContainer>
  );
};

export default Trips;

const styles = StyleSheet.create({
  flatListContent: {
    paddingTop: getHeight(4),
    paddingBottom: getHeight(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidth(32),
    paddingTop: getHeight(100),
  },
  emptyText: {
    ...typography.emptyTitle,
    textAlign: "center",
    marginBottom: getHeight(8),
  },
  emptySubText: {
    ...typography.emptySubtitle,
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
    lineHeight: getHeight(20),
  },
});
