import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TripCard from "@components/TripCard";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import navigationStrings from "@navigation/navigationStrings";

const Trips = ({ navigation }) => {
  // Sample trip data - in a real app, this would come from an API or state management
  const [trips, setTrips] = useState([
    {
      id: 1,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
    {
      id: 2,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
    {
      id: 3,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
    {
      id: 4,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
    {
      id: 5,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
    {
      id: 6,
      image: {
        uri: "https://i0.wp.com/atravelingfairy.com/wp-content/uploads/2024/01/DSC08140.jpg?w=1100&ssl=1",
      },
      city: "Paris",
      startDate: "12 Oct 2025",
      endDate: "20 Oct 2025",
    },
  ]);

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
        onPress: () => {
          setTrips(trips.filter((trip) => trip.id !== tripId));
        },
      },
    ]);
  };

  return (
    <MainContainer>
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
            image={item.image}
            city={item.city}
            startDate={item.startDate}
            endDate={item.endDate}
            onItineraryPress={() => handleItinerary(item.id)}
            onGroupPress={() => handleGroup(item.id)}
            onDeletePress={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
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
