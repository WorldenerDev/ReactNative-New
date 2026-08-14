import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHeight,
  getRadius,
  getWidth,
} from "@utils/responsive";
import { formatCompactDateRange } from "@utils/formatDate";
import OptimizedImage from "@components/OptimizedImage";
import { getImageUrl } from "@api/apiClient";
import imagePath from "@assets/icons";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80";
const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const FeaturedTripCard = ({ trip, onPress }) => {
  if (!trip) return null;

  const members = Array.isArray(trip.joinedMembers) ? trip.joinedMembers : [];
  const memberCount = trip.joinedMemberCount ?? members.length;
  const overflow =
    memberCount > members.length ? memberCount - members.length : 0;
  const activityCount = trip.activityCount || 0;
  const metaParts = [];
  if (trip.groupName) metaParts.push(trip.groupName);
  if (activityCount > 0) {
    metaParts.push(
      `${activityCount} ${activityCount === 1 ? "activity" : "activities"}`
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <OptimizedImage
        source={{ uri: getImageUrl(trip.image) || trip.image || FALLBACK_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>
          {String(trip.tripStatus || "Planning").toUpperCase()}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.city} numberOfLines={1}>
          {trip.city || trip.name || "Trip"}
        </Text>
        <Text style={styles.dates}>
          {formatCompactDateRange(trip.start_at, trip.end_at)}
        </Text>
        {metaParts.length ? (
          <Text style={styles.meta} numberOfLines={1}>
            {metaParts.join(" • ")}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.avatars}>
            {members.map((member, index) => (
              <View
                key={member._id || index}
                style={[styles.avatarWrap, index > 0 && styles.avatarOverlap]}
              >
                <OptimizedImage
                  source={{
                    uri: getImageUrl(member.image) || DUMMY_USER_IMAGE,
                  }}
                  style={styles.avatar}
                />
              </View>
            ))}
            {overflow > 0 ? (
              <View style={[styles.avatarWrap, styles.overflow, styles.avatarOverlap]}>
                <Text style={styles.overflowText}>+{overflow}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.arrowBtn}>
            <Image source={imagePath.RIGHT_ICON} style={styles.arrow} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedTripCard;

const styles = StyleSheet.create({
  card: {
    height: getHeight(210),
    borderRadius: getRadius(20),
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  badge: {
    position: "absolute",
    top: getHeight(14),
    left: getWidth(14),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: getRadius(20),
    paddingHorizontal: getWidth(10),
    paddingVertical: getHeight(4),
  },
  badgeDot: {
    width: getWidth(6),
    height: getWidth(6),
    borderRadius: getWidth(3),
    backgroundColor: "#3B82F6",
    marginRight: getWidth(6),
  },
  badgeText: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    letterSpacing: 0.4,
  },
  content: {
    position: "absolute",
    left: getWidth(16),
    right: getWidth(16),
    bottom: getHeight(14),
  },
  city: {
    fontSize: getFontSize(26),
    fontFamily: fonts.RobotoBold,
    color: colors.white,
  },
  dates: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.white,
    marginTop: getHeight(2),
  },
  meta: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.white,
    marginTop: getHeight(2),
  },
  footer: {
    marginTop: getHeight(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    borderWidth: 2,
    borderColor: colors.white,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  avatarOverlap: {
    marginLeft: -getWidth(8),
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  overflow: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  overflowText: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  arrowBtn: {
    width: getWidth(36),
    height: getWidth(36),
    borderRadius: getWidth(18),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: getWidth(14),
    height: getHeight(14),
    tintColor: colors.black,
    resizeMode: "contain",
  },
});
