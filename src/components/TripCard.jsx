import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import { formatCompactDateRange } from "@utils/formatDate";
import imagePath from "@assets/icons";
import OptimizedImage from "@components/OptimizedImage";

const cardColors = {
  dateText: "#667085",
  metaText: "#475467",
  primaryBtn: "#111111",
  secondaryBtnBg: "#EEF6FF",
  secondaryBtnText: "#0F5EA8",
  deleteBtnBg: "#FFF0F3",
  deleteBtnText: "#D92D20",
};

const TripCard = ({
  image,
  city,
  startDate,
  endDate,
  memberCount,
  activityCount,
  onItineraryPress,
  onGroupPress,
  onDeletePress,
  onPressCard,
}) => {
  const dateLabel = formatCompactDateRange(startDate, endDate);
  const metaParts = [];

  if (memberCount != null && memberCount > 0) {
    metaParts.push(
      `${memberCount} ${memberCount === 1 ? "Member" : "Members"}`
    );
  }

  if (activityCount != null && activityCount > 0) {
    metaParts.push(
      `${activityCount} ${activityCount === 1 ? "Activity" : "Activities"} Planned`
    );
  }

  const metaLabel = metaParts.join(" • ");

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={onPressCard}
        style={styles.cardInner}
        activeOpacity={0.92}
      >
        <View style={styles.hero}>
          <OptimizedImage
            source={{ uri: image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.tripName} numberOfLines={1}>
            {city}
          </Text>
          {dateLabel ? (
            <Text style={styles.dates} numberOfLines={1}>
              {dateLabel}
            </Text>
          ) : null}
          {metaLabel ? (
            <Text style={styles.meta} numberOfLines={1}>
              {metaLabel}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.primaryBtn]}
              onPress={onItineraryPress}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText} numberOfLines={1}>
                View Itinerary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.secondaryBtn]}
              onPress={onGroupPress}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText} numberOfLines={1}>
                Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.deleteBtn]}
              onPress={onDeletePress}
              activeOpacity={0.85}
            >
              <Image source={imagePath.DELETE_ICON} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.bottomShadow} pointerEvents="none" />
    </View>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: getHeight(12),
    position: "relative",
  },
  cardInner: {
    borderRadius: getRadius(16),
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  bottomShadow: {
    position: "absolute",
    left: getWidth(10),
    right: getWidth(10),
    bottom: -getHeight(4),
    height: getHeight(1),
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 2,
      },
      android: {
        height: getHeight(4),
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderBottomLeftRadius: getRadius(2),
        borderBottomRightRadius: getRadius(2),
      },
    }),
  },
  hero: {
    height: getHeight(96),
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(10),
  },
  tripName: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoBold,
    fontWeight: "700",
    color: colors.black,
    lineHeight: getHeight(20),
  },
  dates: {
    marginTop: getHeight(2),
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: cardColors.dateText,
  },
  meta: {
    marginTop: getHeight(4),
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: cardColors.metaText,
    lineHeight: getHeight(14),
  },
  actions: {
    marginTop: getHeight(8),
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(6),
  },
  btn: {
    borderRadius: getRadius(10),
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeight(36),
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: cardColors.primaryBtn,
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(8),
  },
  primaryBtnText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: cardColors.secondaryBtnBg,
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(8),
  },
  secondaryBtnText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    color: cardColors.secondaryBtnText,
    textAlign: "center",
  },
  deleteBtn: {
    width: getWidth(40),
    backgroundColor: cardColors.deleteBtnBg,
    paddingVertical: getHeight(8),
  },
  deleteIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: cardColors.deleteBtnText,
  },
});
