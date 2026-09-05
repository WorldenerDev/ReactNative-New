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
  rejoinBtnBg: "#ECFDF3",
  rejoinBtnText: "#027A48",
};

const TripCard = ({
  image,
  city,
  startDate,
  endDate,
  memberCount,
  activityCount,
  groupName,
  participationStatus,
  dimmed = false,
  showCrewButton = true,
  secondaryLabel = "Crew",
  onItineraryPress,
  onGroupPress,
  onDeletePress,
  onRejoinPress,
  onPressCard,
  isPast = false,
}) => {
  const dateLabel = formatCompactDateRange(startDate, endDate);
  const metaParts = [];

  if (groupName) {
    metaParts.push(groupName);
  }

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
  const isOptedOut = participationStatus === "opted_out" || dimmed;

  return (
    <View style={[styles.cardContainer, isOptedOut && styles.dimmedCard]}>
      <TouchableOpacity
        onPress={onPressCard}
        style={styles.cardInner}
        activeOpacity={0.92}
        disabled={isOptedOut && !onRejoinPress}
      >
        <View style={styles.hero}>
          {image ? (
            <OptimizedImage
              source={{ uri: image }}
              style={[styles.heroImage, isOptedOut && styles.dimmedImage]}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={imagePath.DUMMY_ICON}
              style={[styles.heroImage, isOptedOut && styles.dimmedImage]}
              resizeMode="cover"
            />
          )}
          {isOptedOut ? (
            <View style={styles.optedOutBadge}>
              <Text style={styles.optedOutText}>Opted out</Text>
            </View>
          ) : isPast ? (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Past</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={[styles.tripName, isOptedOut && styles.dimmedText]} numberOfLines={1}>
            {city}
          </Text>
          {dateLabel ? (
            <Text style={[styles.dates, isOptedOut && styles.dimmedText]} numberOfLines={1}>
              {dateLabel}
            </Text>
          ) : null}
          {metaLabel ? (
            <Text style={[styles.meta, isOptedOut && styles.dimmedText]} numberOfLines={1}>
              {metaLabel}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {isOptedOut && onRejoinPress ? (
              <TouchableOpacity
                style={[styles.btn, styles.rejoinBtn]}
                onPress={onRejoinPress}
                activeOpacity={0.85}
              >
                <Text style={styles.rejoinBtnText} numberOfLines={1}>
                  Rejoin
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.primaryBtn]}
                  onPress={onItineraryPress}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText} numberOfLines={1}>
                    View Itinerary
                  </Text>
                </TouchableOpacity>

                {showCrewButton ? (
                  <TouchableOpacity
                    style={[styles.btn, styles.secondaryBtn]}
                    onPress={onGroupPress}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.secondaryBtnText} numberOfLines={1}>
                      {secondaryLabel}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {onDeletePress ? (
                  <TouchableOpacity
                    style={[styles.btn, styles.deleteBtn]}
                    onPress={onDeletePress}
                    activeOpacity={0.85}
                  >
                    <Image source={imagePath.DELETE_ICON} style={styles.deleteIcon} />
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {Platform.OS === "ios" ? (
        <View style={styles.bottomShadow} pointerEvents="none" />
      ) : null}
    </View>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: getHeight(12),
    position: "relative",
  },
  dimmedCard: {
    opacity: 0.72,
  },
  cardInner: {
    borderRadius: getRadius(16),
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  bottomShadow: {
    position: "absolute",
    left: getWidth(10),
    right: getWidth(10),
    bottom: -getHeight(4),
    height: getHeight(1),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
  },
  hero: {
    height: getHeight(96),
    position: "relative",
    ...Platform.select({
      android: {
        overflow: "hidden",
        borderTopLeftRadius: getRadius(16),
        borderTopRightRadius: getRadius(16),
      },
    }),
  },
  heroImage: {
    width: "100%",
    height: "100%",
    ...Platform.select({
      android: {
        borderTopLeftRadius: getRadius(16),
        borderTopRightRadius: getRadius(16),
      },
    }),
  },
  dimmedImage: {
    opacity: 0.55,
  },
  optedOutBadge: {
    position: "absolute",
    top: getHeight(8),
    right: getWidth(8),
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(4),
    borderRadius: getRadius(6),
  },
  optedOutText: {
    color: colors.white,
    fontSize: getHeight(10),
    fontFamily: fonts.RobotoMedium,
  },
  pastBadge: {
    position: "absolute",
    top: getHeight(8),
    right: getWidth(8),
    backgroundColor: "rgba(17,17,17,0.72)",
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(4),
    borderRadius: getRadius(6),
  },
  pastBadgeText: {
    color: colors.white,
    fontSize: getHeight(10),
    fontFamily: fonts.RobotoMedium,
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
  dimmedText: {
    color: colors.lightText,
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
  rejoinBtn: {
    flex: 1,
    backgroundColor: cardColors.rejoinBtnBg,
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(8),
  },
  rejoinBtnText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
    color: cardColors.rejoinBtnText,
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
