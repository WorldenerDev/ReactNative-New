import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import OptimizedImage from "@components/OptimizedImage";

const TripCard = ({
  image,
  city,
  startDate,
  endDate,
  onItineraryPress,
  onGroupPress,
  onDeletePress,
  onPressCard,
}) => {
  return (
    <TouchableOpacity onPress={onPressCard} style={styles.card}>
      <OptimizedImage
        source={{ uri: image }}
        style={styles.cardImage}
        resizeMode="cover"
        priority="high"
        cache="immutable"
        showLoader={true}
        loaderColor={colors.primary}
      />

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

          <TouchableOpacity onPress={onDeletePress} style={styles.deleteButton}>
            <Image source={imagePath.DELETE_ICON} style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  dates: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
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
    marginRight: getWidth(4),
    minWidth: getWidth(50),
    alignItems: "center",
    flex: 1,
  },
  actionButtonText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  deleteButton: {
    backgroundColor: "transparent",

    paddingVertical: getHeight(6),
  },
  deleteIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: colors.red,
  },
});
