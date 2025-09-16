import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TripCard from "@components/TripCard";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTrip, deleteUserTrip } from "@redux/slices/cityTripSlice";

const Trips = ({ navigation }) => {
  const { trip, loading } = useSelector((state) => state.cityTrip);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getAllTrips();
  }, [dispatch]);

  useEffect(() => {
    setTrips(trip);
  }, [trip]);

  const getAllTrips = async () => {
    try {
      const response = await dispatch(fetchUserTrip());
    } catch (error) {
      console.error("Failed to fetch trips: ", error);
    }
  };

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

  const handleClearAllTrips = () => {
    Alert.alert(
      "Clear All Trips",
      "Are you sure you want to clear all trips?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => setTrips([]),
        },
      ]
    );
  };

  const handleItinerary = (tripId) => {
    Alert.alert("Itinerary", `View itinerary for trip ${tripId}`);
  };

  const handleGroup = (tripId) => {
    Alert.alert("Group", `View group for trip ${tripId}`);
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
            console.log("Trip deleted successfully");
            // Remove the trip from local state
            setTrips(trips.filter((trip) => trip._id !== tripId));
          } catch (error) {
            console.error("Failed to delete trip: ", error);
            Alert.alert("Error", "Failed to delete trip. Please try again.");
          } finally {
            setDeleteLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <MainContainer loader={deleteLoading}>
      <Header
        showBack={false}
        title="My Trips"
        rightIconImage={imagePath.PLUS_ICON_BORDER}
        onRightIconPress={handleAddTrip}
      />

      <FlatList
        data={trips}
        renderItem={({ item }) => (
          <TripCard
            image={item?.city?.image}
            city={item?.city?.name}
            startDate={item?.start_at.slice(0, 10)}
            endDate={item?.end_at.slice(0, 10)}
            onItineraryPress={() => handleItinerary(item._id)}
            onGroupPress={() => handleGroup(item._id)}
            onDeletePress={() => handleDelete(item._id)}
          />
        )}
        keyExtractor={(item) => item?._id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
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
  container: {
    flex: 1,
  },
  flatListContent: {
    // paddingHorizontal: getWidth(8),
    paddingTop: getHeight(16),
    paddingBottom: getHeight(20),
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: getWidth(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidth(32),
    paddingTop: getHeight(100),
  },
  emptyText: {
    fontSize: getHeight(20),
    fontWeight: "600",
    color: colors.black,
    textAlign: "center",
    marginBottom: getHeight(8),
  },
  emptySubText: {
    fontSize: getHeight(16),
    color: colors.lightText,
    textAlign: "center",
    lineHeight: getHeight(22),
  },
});
