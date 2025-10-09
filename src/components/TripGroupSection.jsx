import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import TripSection from "./TripSection";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getWidth, getHeight, getFontSize } from "@utils/responsive";

const TripGroupSection = ({ trip, onViewDetails }) => {
  return (
    <View style={styles.tripGroupContainer}>
      {/* Trip Header */}
      <View style={styles.tripHeader}>
        <Text style={styles.tripTitle}>{trip.tripTitle}</Text>
        <Text style={styles.tripDates}>{trip.tripDates}</Text>
      </View>

      {/* Separator Line */}
      <View style={styles.separator} />

      {/* Bookings */}
      <FlatList
        data={trip.bookings}
        renderItem={({ item }) => (
          <TripSection booking={item} onViewDetails={onViewDetails} />
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tripGroupContainer: {
    marginBottom: getHeight(24),
  },
  tripHeader: {
    //paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(12),
    borderBottomColor: colors.primary,
    borderBottomWidth: 1,
  },
  tripTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  tripDates: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: getWidth(16),
    marginBottom: getHeight(8),
  },
});

export default TripGroupSection;
