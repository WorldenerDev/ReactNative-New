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

const Booking = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrders();
        if (response?.success && response?.data) {
          setOrders(response.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Transform API data to match UI structure
  const transformOrdersToTrips = (ordersData) => {
    const trips = [];
    
    ordersData.forEach((order) => {
      const tripId = order.trip?.trip_id || order._id;
      const tripTitle = order.city?.name || "Trip";
      const tripDates = order.trip ? 
        `${new Date(order.trip.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(order.trip.end_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
        new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const orderType = new Date(order.trip?.end_at || order.createdAt) > new Date() ? "upcoming" : "past";
      
      // Create a separate trip for each order
      const trip = {
        tripId: `${tripId}_${order._id}`, // Make each trip unique
        tripTitle,
        tripDates,
        type: orderType,
        bookings: []
      };
      
      // Transform each order item to booking
      order.musement_data?.items?.forEach((item) => {
        const booking = {
          id: item.uuid,
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
          }
        };
        
        trip.bookings.push(booking);
      });
      
      trips.push(trip);
    });
    
    return trips;
  };

  const currentTrips = useMemo(() => {
    // Use real data from API
    const tripsData = transformOrdersToTrips(orders);
    
    // Filter trips based on active tab
    if (activeTab === "Cancelled") {
      return [];
    }

    if (activeTab === "All") {
      return tripsData;
    }

    if (activeTab === "Upcoming") {
      return tripsData.filter((trip) => trip.type === "upcoming");
    }

    if (activeTab === "Past") {
      return tripsData.filter((trip) => trip.type === "past");
    }

    return tripsData;
  }, [activeTab, orders]);

  const handleViewDetails = (item) => {
    console.log("View details for:", item.bookingId);
    // Navigate to booking details screen
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
