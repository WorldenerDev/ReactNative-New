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
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import navigationStrings from "@navigation/navigationStrings";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTrip, deleteUserTrip } from "@redux/slices/cityTripSlice";

const Trips = ({ navigation }) => {
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
    getAllTrips();
  }, [getAllTrips]);

  // Refresh data when screen comes into focus (e.g., returning from Create Trip)
  useFocusEffect(
    useCallback(() => {
      getAllTrips();
    }, [getAllTrips])
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
            // Automatically refresh trips after successful deletion
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
        renderItem={({ item }) => (
          <TripCard
            image={item?.city?.image}
            city={item?.city?.name}
            startDate={item?.start_at.slice(0, 10)}
            endDate={item?.end_at.slice(0, 10)}
            onItineraryPress={() =>
              navigation.navigate(navigationStrings.TRIP_DETAILS, {
                tripId: item?._id,
              })
            }
            onGroupPress={() => { }}
            onDeletePress={() => handleDelete(item._id)}
            onPressCard={() =>
              navigation.navigate(navigationStrings.TRIP_DETAILS, {
                tripId: item?._id,
              })
            }
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
  flatListContent: {
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
