import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TripCard from "@components/TripCard";
import { getFontSize, getHeight, getRadius, getWidth } from "@utils/responsive";
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
  canDeleteTrip,
  isTripPast,
  getTripImage,
  getTripCityName,
} from "@utils/tripHelpers";
import {
  fetchMyTripsWithMock,
  isReusableGroupsMockEnabled,
  optInToTrip,
  subscribeReusableGroupsMock,
} from "@api/services/crewGroupsService";
import { showToast } from "@components/AppToast";
import { getImageUrl } from "@api/apiClient";

const FILTER_OPTIONS = [
  { label: "Current", value: "current" },
  { label: "Opt-out", value: "optout" },
  { label: "Past Trips", value: "past" },
];

const isOptedOutTrip = (trip) => trip?.participationStatus === "opted_out";

const Trips = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { isGuest, user } = useAuth();
  const dispatch = useDispatch();
  const [tripList, setTripList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);

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

  const filteredTrips = useMemo(() => {
    const filterValue = selectedFilter?.value || "current";

    return tripList.filter((trip) => {
      const optedOut = isOptedOutTrip(trip);
      const past = isTripPast(trip);

      if (filterValue === "optout") return optedOut;
      if (filterValue === "past") return past && !optedOut;
      // Current: active/upcoming trips the user has not opted out of
      return !past && !optedOut;
    });
  }, [tripList, selectedFilter]);

  const emptyCopy = useMemo(() => {
    switch (selectedFilter?.value) {
      case "optout":
        return {
          title: "No opted-out trips",
          subtitle: "Trips you leave will show up here.",
        };
      case "past":
        return {
          title: "No past trips",
          subtitle: "Completed trips will appear here.",
        };
      default:
        return {
          title: "No current trips",
          subtitle: "Start planning your next adventure!",
        };
    }
  }, [selectedFilter]);

  const renderTrip = ({ item }) => {
    const { members, activities } = getTripMeta(item);
    const isOptedOut = item?.participationStatus === "opted_out";
    const past = isTripPast(item);

    return (
      <TripCard
        image={getImageUrl(getTripImage(item)) || getTripImage(item)}
        city={getTripCityName(item) || "Trip"}
        startDate={item?.start_at}
        endDate={item?.end_at}
        memberCount={members}
        activityCount={activities}
        groupName={item?.groupName}
        participationStatus={item?.participationStatus}
        dimmed={isOptedOut}
        isPast={past}
        showCrewButton
        secondaryLabel={item?.groupId ? "Crew" : "My Wishlist"}
        onItineraryPress={() =>
          navigation.navigate(navigationStrings.TRIP_DETAILS, {
            tripId: item?._id,
            trip: item,
          })
        }
        onGroupPress={() => {
          if (item?.groupId) {
            navigation.navigate(navigationStrings.GROUP_DETAILS, {
              groupId: item?.groupId,
              tripId: item?._id,
            });
            return;
          }
          navigation.navigate(navigationStrings.TRIP_DETAILS, {
            tripId: item?._id,
            trip: item,
            initialTab: "My Wishlist",
          });
        }}
        onRejoinPress={
          isOptedOut ? () => handleRejoin(item) : undefined
        }
        onDeletePress={
          canDeleteTrip(item, user?._id || user?.id)
            ? () => handleDelete(item._id)
            : undefined
        }
        onPressCard={() => {
          if (isOptedOut) return;
          navigation.navigate(navigationStrings.TRIP_DETAILS, {
            tripId: item?._id,
            trip: item,
          });
        }}
      />
    );
  };

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

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = selectedFilter?.value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(option)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTrip}
        keyExtractor={(item) => item?._id?.toString()}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: scrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.emptyText}>{emptyCopy.title}</Text>
            <Text style={styles.emptySubText}>{emptyCopy.subtitle}</Text>
          </View>
        )}
      />
    </MainContainer>
  );
};

export default Trips;

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(8),
    marginBottom: getHeight(12),
  },
  filterChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(8),
    borderRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
  filterChipTextActive: {
    color: colors.black,
  },
  flatListContent: {
    paddingTop: getHeight(4),
    paddingBottom: getHeight(16),
    flexGrow: 1,
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
