import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import Header from "@components/Header";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import MainContainer from "@components/container/MainContainer";

const Group = () => {
  // Sample data - replace with your actual data
  const [trips, setTrips] = useState([
    {
      id: "1",
      title: "Tokyo Trip",
      location: "Tokyo, Japan",
      status: "Planning",
      startDate: "Dec 15, 2024",
      endDate: "Jan 20, 2025",
      people: "2 people",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "Tokyo Trip",
      location: "Tokyo, Japan",
      status: "Planning",
      startDate: "Dec 15, 2024",
      endDate: "Jan 20, 2025",
      people: "2 people",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    },
  ]);

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <Image source={{ uri: item.image }} style={styles.tripImage} />

      <View style={styles.tripDetails}>
        <Text style={styles.tripTitle}>{item.title}</Text>

        <View style={styles.locationRow}>
          <Image source={imagePath.LOCATION_PIN} style={styles.locationIcon} />
          <Text style={styles.locationText}>{item.location}</Text>
          <Image source={imagePath.CHECK_ICON} style={styles.checkIcon} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        <View style={styles.dateRow}>
          <Image source={imagePath.CALENDER_ICON} style={styles.calendarIcon} />
          <Text style={styles.dateText}>
            {item.startDate} - {item.endDate}
          </Text>
        </View>

        <View style={styles.peopleRow}>
          <View style={styles.peopleIcons}>
            <View style={[styles.personIcon, styles.personIcon1]} />
            <View style={[styles.personIcon, styles.personIcon2]} />
            <View style={[styles.personIcon, styles.personIcon3]} />
          </View>
          <Text style={styles.peopleText}>{item.people}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Trips Found</Text>
      <Text style={styles.emptySubtitle}>
        Create your first trip to get started
      </Text>
    </View>
  );

  return (
    <MainContainer>
      <Header title="My Groups" showBack={false} />

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />
    </MainContainer>
  );
};

export default Group;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: getHeight(20),
  },
  tripCard: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    marginBottom: getHeight(20),
    borderRadius: getRadius(8),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    padding: getHeight(16),
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tripImage: {
    width: getWidth(80),
    height: getWidth(80),
    borderRadius: getRadius(6),
    marginRight: getWidth(16),
  },
  tripDetails: {
    flex: 1,
    justifyContent: "space-between",
    height: getWidth(80),
    paddingVertical: getHeight(2),
  },
  tripTitle: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(6),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(6),
  },
  locationIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.red,
  },
  locationText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    marginRight: getWidth(16),
  },
  checkIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.green,
  },
  statusText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(6),
  },
  calendarIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.black,
  },
  dateText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  peopleIcons: {
    flexDirection: "row",
    marginRight: getWidth(6),
  },
  personIcon: {
    width: getWidth(14),
    height: getWidth(14),
    borderRadius: getWidth(7),
    backgroundColor: colors.secondary,
    marginLeft: getWidth(-3),
  },
  personIcon1: {
    marginLeft: 0,
  },
  personIcon2: {
    zIndex: 1,
  },
  personIcon3: {
    zIndex: 2,
  },
  peopleText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  actionButtons: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: getWidth(16),
  },
  actionButton: {
    backgroundColor: colors.secondary,
    borderRadius: getRadius(6),
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
    marginBottom: getHeight(6),
    minWidth: getWidth(50),
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeight(100),
  },
  emptyTitle: {
    fontSize: getHeight(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  emptySubtitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
  },
});
