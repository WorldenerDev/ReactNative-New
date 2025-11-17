import { StyleSheet, FlatList } from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TopTab from "@components/TopTab";
import TripGroupSection from "@components/TripGroupSection";
import EmptyBookingState from "@components/EmptyBookingState";
import Loader from "@components/Loader";
import colors from "@assets/colors";
import { getHeight } from "@utils/responsive";
import { getOrders } from "@api/services/mainServices";
import navigationStrings from "@navigation/navigationStrings";

const Booking = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders from API based on active tab
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query params based on active tab
        const params = {};
        if (activeTab === "Upcoming") {
          params.status = "upcoming";
        } else if (activeTab === "Past") {
          params.status = "past";
        } else if (activeTab === "Cancelled") {
          params.status = "cancelled";
        }
        // For "All" tab, params will be empty {} which means no status filter

        // Call API with appropriate params
        // If params object has keys, pass it; otherwise pass empty object (no query params)
        const apiParams = Object.keys(params).length > 0 ? params : {};
        const response = await getOrders(apiParams);
        if (response?.success && response?.data) {
          setOrders(Array.isArray(response.data) ? response.data : []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  // Transform API data to match UI structure
  const transformOrdersToTrips = (ordersData, currentTab) => {
    const trips = [];

    ordersData.forEach((order) => {
      const tripId = order.trip?.trip_id || order._id;
      const tripTitle = order.city?.name || "Trip";
      const tripDates = order.trip ?
        `${new Date(order.trip.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(order.trip.end_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
        new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Determine if order is past or upcoming based on booking_date or earliest activity date
      let bookingDate = null;
      if (order.booking_date) {
        bookingDate = new Date(order.booking_date);
      } else if (order.musement_data?.items?.length > 0) {
        // Find the earliest activity date from items
        const activityDates = order.musement_data.items
          .map(item => item.product?.date ? new Date(item.product.date) : null)
          .filter(date => date !== null);
        if (activityDates.length > 0) {
          bookingDate = new Date(Math.min(...activityDates));
        }
      }

      // If no booking date found, fall back to trip end date or createdAt
      if (!bookingDate) {
        bookingDate = order.trip?.end_at ? new Date(order.trip.end_at) : new Date(order.createdAt);
      }

      const orderType = bookingDate > new Date() ? "upcoming" : "past";

      // Create a separate trip for each order
      const trip = {
        tripId: `${tripId}_${order._id}`, // Make each trip unique
        tripTitle,
        tripDates,
        type: orderType,
        bookings: []
      };

      // Only mark as cancelled if:
      // 1. We're on Cancelled tab (all bookings on this tab are cancelled)
      // 2. OR the order status is explicitly "cancelled"
      // Note: Don't mark past bookings as cancelled
      const isCancelled = currentTab === "Cancelled" ||
        (order.status === "cancelled" && currentTab !== "Past") ||
        (order.order_status === "cancelled" && currentTab !== "Past");

      // Transform each order item to booking
      order.musement_data?.items?.forEach((item) => {
        const booking = {
          id: item.uuid,
          orderId: order?._id, // Add order _id to booking object
          activityTitle: item.product?.title || "Activity",
          bookingId: order.order_identifier || order.order_id,
          price: item.total_retail_price_in_order_currency?.formatted_value || "$0.00",
          dateTime: item.product?.date ?
            new Date(item.product.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) :
            new Date(order.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
          image: {
            uri: item.product?.cover_image_url || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=300&fit=crop"
          },
          isCancelled: isCancelled // This will be true for cancelled tab
        };

        trip.bookings.push(booking);
      });

      trips.push(trip);
    });

    return trips;
  };

  const currentTrips = useMemo(() => {
    // Use real data from API
    const tripsData = transformOrdersToTrips(orders, activeTab);

    // Since we're fetching filtered data from API, we mainly return what we get
    // However, we can still do client-side filtering as a fallback based on dates
    if (activeTab === "All") {
      return tripsData;
    }

    // For other tabs, API should return filtered data, but we'll also filter by date as fallback
    if (activeTab === "Upcoming") {
      return tripsData.filter((trip) => trip.type === "upcoming");
    }

    if (activeTab === "Past") {
      return tripsData.filter((trip) => trip.type === "past");
    }

    if (activeTab === "Cancelled") {
      // Return cancelled orders from API
      return tripsData;
    }

    return tripsData;
  }, [activeTab, orders]);

  const handleViewDetails = (item) => {
    console.log("item", item);
    navigation.navigate(navigationStrings.BOOKING_DETAILS, { orderId: item.orderId, bookingId: item?.bookingId });
  };

  const renderTripItem = ({ item }) => (
    <TripGroupSection trip={item} onViewDetails={handleViewDetails} />
  );

  const renderEmptyComponent = () => <EmptyBookingState type={activeTab} />;

  if (loading) {
    return (
      <MainContainer>
        <Header showBack={false} title="My Booking" />
        <Loader />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Header showBack={false} title="My Booking" />
      <TopTab activeTab={activeTab} onTabChange={setActiveTab} />
      <FlatList
        data={currentTrips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.tripId}
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
