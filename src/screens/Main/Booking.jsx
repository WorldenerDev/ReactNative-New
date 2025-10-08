import { StyleSheet, FlatList } from "react-native";
import React, { useState, useMemo } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TopTab from "@components/TopTab";
import TripSection from "@components/TripSection";
import EmptyBookingState from "@components/EmptyBookingState";
import colors from "@assets/colors";
import { getHeight } from "@utils/responsive";

const Booking = () => {
  const [activeTab, setActiveTab] = useState("All");

  // Mock data - all tabs show same data
  const mockTrips = [
    {
      tripId: "trip-1",
      tripTitle: "Tokyo Trip",
      tripDates: "Dec 15, 2024 - Jan 20, 2025",
      type: "upcoming",
      bookings: [
        {
          id: "1",
          activityTitle: "Tokyo Tower Visit and a dinner with live music",
          bookingId: "1234354",
          price: "1,232",
          dateTime: "17 Oct 2026, 12:00 PM",
          image: {
            uri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=300&fit=crop",
          },
        },
        {
          id: "2",
          activityTitle: "Tokyo Tower Visit and a dinner with live music",
          bookingId: "1234355",
          price: "1,232",
          dateTime: "17 Oct 2026, 12:00 PM",
          image: {
            uri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=300&fit=crop",
          },
        },
      ],
    },
    {
      tripId: "trip-2",
      tripTitle: "London Trip",
      tripDates: "Dec 15, 2024 - Jan 20, 2025",
      type: "past",
      bookings: [
        {
          id: "3",
          activityTitle: "Tokyo Tower Visit and a dinner with live music",
          bookingId: "1234356",
          price: "1,232",
          dateTime: "17 Oct 2026, 12:00 PM",
          image: {
            uri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=300&fit=crop",
          },
        },
      ],
    },
  ];

  const currentBookings = useMemo(() => {
    // All tabs show same data
    if (activeTab === "Cancelled") {
      return [];
    }
    // Flatten all bookings from all trips
    return mockTrips.flatMap((trip) =>
      trip.bookings.map((booking) => ({
        ...booking,
        tripTitle: trip.tripTitle,
        tripDates: trip.tripDates,
        type: trip.type,
      }))
    );
  }, [activeTab]);

  const handleViewDetails = (item) => {
    console.log("View details for:", item.bookingId);
    // Navigate to booking details screen
  };

  const renderBookingItem = ({ item }) => (
    <TripSection booking={item} onViewDetails={handleViewDetails} />
  );

  const renderEmptyComponent = () => <EmptyBookingState type={activeTab} />;

  return (
    <MainContainer>
      <Header showBack={false} title="My Booking" />
      <TopTab activeTab={activeTab} onTabChange={setActiveTab} />
      <FlatList
        data={currentBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />
    </MainContainer>
  );
};

export default Booking;

const styles = StyleSheet.create({
  flatListContainer: {
    flexGrow: 1,
    paddingTop: getHeight(8),
    paddingBottom: getHeight(24),
  },
});
