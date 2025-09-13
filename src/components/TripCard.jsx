import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import colors from "@assets/colors";
import { getHeight, getRadius, getWidth } from "@utils/responsive";

const TripCard = ({
  image,
  city,
  startDate,
  endDate,
  onItineraryPress,
  onGroupPress,
  onDeletePress,
}) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.dates}>
          {startDate} to {endDate}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onItineraryPress}
          >
            <Text style={styles.actionButtonText}>Itinerary</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onGroupPress}>
            <Text style={styles.actionButtonText}>Group</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onDeletePress}
          style={styles.deleteContainer}
        >
          <Text style={styles.deleteText}>delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    marginBottom: getHeight(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    marginHorizontal: getWidth(1),
    width: "48%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: "100%",
    height: getHeight(120), // Fixed height for image
    resizeMode: "cover",
  },
  cardContent: {
    padding: getHeight(12),
    flex: 1,
    justifyContent: "space-between",
  },
  cityName: {
    fontSize: getHeight(16),
    fontWeight: "700",
    color: colors.black,
    marginBottom: getHeight(4),
  },
  dates: {
    fontSize: getHeight(12),
    color: colors.black,
    marginBottom: getHeight(8),
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: getHeight(8),
  },
  actionButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: getRadius(6),
    paddingHorizontal: getWidth(5),
    paddingVertical: getHeight(6),
    marginRight: getWidth(8),
    minWidth: getWidth(55),
    alignItems: "center",
    flex: 1,
  },
  actionButtonText: {
    fontSize: getHeight(11),
    color: colors.black,
    fontWeight: "500",
  },
  deleteContainer: {
    alignItems: "flex-start",
    marginTop: getHeight(4),
  },
  deleteText: {
    fontSize: getHeight(11),
    color: colors.red,
    fontWeight: "500",
    textAlign: "left",
  },
});
