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
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTrip, deleteUserTrip } from "@redux/slices/cityTripSlice";
import GuestPrompt from "@components/GuestPrompt";
import useAuth from "@hooks/useAuth";

const Trips = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { isGuest } = useAuth();
  const { trip } = useSelector((state) => state.cityTrip);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getAllTrips = useCallback(async () => {
    try {
      await dispatch(fetchUserTrip());
    } catch (error) {
      console.error("Failed to fetch trips: ", error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isGuest) {
      getAllTrips();
    }
  }, [getAllTrips, isGuest]);

  // Refresh data when screen comes into focus (e.g., returning from Create Trip)
  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        getAllTrips();
      }
    }, [getAllTrips, isGuest])
  );

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
    <MainContainer loader={deleteLoading}>
      <Header
        showBack={false}
        title="My Trips"
        rightIconImage={imagePath.PLUS_ICON_BORDER}
        onRightIconPress={handleAddTrip}
      />

      <FlatList
        data={trip || []}
        renderItem={({ item }) => {
          const { members, activities } = getTripMeta(item);

          return (
            <TripCard
              image={item?.city?.image}
              city={item?.name || item?.city?.name}
              startDate={item?.start_at}
              endDate={item?.end_at}
              memberCount={members}
              activityCount={activities}
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
                    })
                  : Alert.alert("Group not available");
              }}
              onDeletePress={() => handleDelete(item._id)}
              onPressCard={() =>
                navigation.navigate(navigationStrings.TRIP_DETAILS, {
                  tripId: item?._id,
                  trip: item,
                })
              }
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
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="Pull to refresh" // iOS
            titleColor={colors.lightText} // iOS
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
