import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getWidth, getHeight, getFontSize, getRadius } from "@utils/responsive";

const TripSection = ({ booking, onViewDetails }) => {
  return (
    <View style={styles.bookingContainer}>
      <View style={styles.bookingCard}>
        <View style={styles.mainContent}>
          <Image source={booking.image} style={styles.thumbnail} />
          <View style={styles.textContent}>
            <Text style={styles.activityTitle} numberOfLines={2}>
              {booking.activityTitle}
            </Text>
            <Text style={styles.bookingId}>
              Booking ID: {booking.bookingId}
            </Text>
            <Text style={styles.price}>${booking.price}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.dateTime}>{booking.dateTime}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => onViewDetails(booking)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>View details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bookingContainer: {
    marginBottom: getHeight(16),
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: getRadius(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(16),
  },
  mainContent: {
    flexDirection: "row",
    marginBottom: getHeight(8),
  },
  thumbnail: {
    width: getWidth(60),
    height: getWidth(60),
    borderRadius: getRadius(6),
    marginRight: getWidth(12),
  },
  textContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  bookingId: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(4),
  },
  price: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(16),
  },
  calendarIcon: {
    fontSize: getFontSize(16),
    marginRight: getWidth(8),
  },
  dateTime: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  viewDetailsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: getHeight(10),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
  },
});

export default TripSection;
