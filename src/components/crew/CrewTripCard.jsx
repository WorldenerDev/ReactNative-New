import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHeight,
  getRadius,
  getWidth,
} from "@utils/responsive";
import { formatCompactDateRange } from "@utils/formatDate";
import imagePath from "@assets/icons";
import OptimizedImage from "@components/OptimizedImage";
import { getImageUrl } from "@api/apiClient";

const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const statusLabels = {
  joined: "Joined",
  not_joined: "Not joined",
  invited: "Invited",
  opted_out: "Opted out",
};

const CrewTripCard = ({ trip, onPress }) => {
  const dateLabel = formatCompactDateRange(trip.start_at, trip.end_at);
  const status = trip.participationStatus || "not_joined";
  const members = Array.isArray(trip.joinedMembers) ? trip.joinedMembers : [];
  const memberCount = trip.joinedMemberCount ?? members.length;
  const overflow =
    memberCount > members.length ? memberCount - members.length : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(trip)}
      activeOpacity={0.85}
    >
      <OptimizedImage
        source={{ uri: trip.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.city} numberOfLines={1}>
          {trip.city}
        </Text>
        {dateLabel ? <Text style={styles.dates}>{dateLabel}</Text> : null}

        {members.length > 0 ? (
          <View style={styles.avatars}>
            {members.map((m, index) => (
              <OptimizedImage
                key={m._id || index}
                source={{
                  uri: getImageUrl(m.image) || DUMMY_USER_IMAGE,
                }}
                style={[styles.avatar, index > 0 && styles.avatarOverlap]}
              />
            ))}
            {overflow > 0 ? (
              <Text style={styles.avatarMore}>+{overflow}</Text>
            ) : null}
          </View>
        ) : null}

        <View
          style={[
            styles.badge,
            status === "joined" && styles.badgeJoined,
            (status === "not_joined" || status === "invited") &&
              styles.badgePending,
            status === "opted_out" && styles.badgeOptedOut,
          ]}
        >
          <Text style={styles.badgeText}>
            {statusLabels[status] || status}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Image source={imagePath.GROUP} style={styles.statIcon} />
            <Text style={styles.statText}>
              {memberCount} Member{memberCount === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Image source={imagePath.LIKE_ICON} style={styles.statIcon} />
            <Text style={styles.statText}>{trip.savedCount || 0} Saved</Text>
          </View>
          <View style={styles.stat}>
            <Image source={imagePath.CALENDER_ICON} style={styles.statIcon} />
            <Text style={styles.statText}>
              {trip.activityCount || 0} Activities
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CrewTripCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: getRadius(16),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: getHeight(12),
    overflow: "hidden",
    padding: getWidth(12),
  },
  image: {
    width: getWidth(92),
    height: getHeight(110),
    borderRadius: getRadius(12),
  },
  content: {
    flex: 1,
    marginLeft: getWidth(12),
    justifyContent: "flex-start",
  },
  city: {
    fontSize: getFontSize(17),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  dates: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getHeight(2),
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: getHeight(10),
  },
  avatar: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarOverlap: {
    marginLeft: -getWidth(8),
  },
  avatarMore: {
    marginLeft: getWidth(4),
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: getHeight(8),
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(3),
    borderRadius: getRadius(6),
    backgroundColor: "#F2F4F7",
  },
  badgeJoined: {
    backgroundColor: "#E8F5E9",
  },
  badgePending: {
    backgroundColor: "#FFF3E0",
  },
  badgeOptedOut: {
    backgroundColor: "#FEF3F2",
  },
  badgeText: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getWidth(12),
    marginTop: getHeight(10),
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: getWidth(14),
    height: getWidth(14),
    marginRight: getWidth(5),
    tintColor: colors.lightText,
    opacity: 0.75,
  },
  statText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
  },
});
