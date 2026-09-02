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
import { getTripImage } from "@utils/tripHelpers";

const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const statusLabels = {
  joined: "Joined",
  not_joined: "Not joined",
  invited: "Invited",
  opted_out: "Opted out",
};

const StatColumn = ({ icon, value, label }) => (
  <View style={styles.stat}>
    <View style={styles.statIconWrap}>
      <Image
        source={icon}
        style={styles.statIcon}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CrewTripCard = ({ trip, onPress }) => {
  const dateLabel = formatCompactDateRange(trip.start_at, trip.end_at);
  const status = trip.participationStatus || "not_joined";
  const members = Array.isArray(trip.joinedMembers) ? trip.joinedMembers : [];
  const memberCount = trip.joinedMemberCount ?? members.length;
  const overflow =
    memberCount > members.length ? memberCount - members.length : 0;
  const savedCount = trip.savedCount || 0;
  const activityCount = trip.activityCount || 0;
  const coverRaw = getTripImage(trip);
  const coverUri = getImageUrl(coverRaw) || coverRaw || null;
  const cityName =
    typeof trip.city === "string" ? trip.city : trip.city?.name || "";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(trip)}
      activeOpacity={0.85}
    >
      {coverUri ? (
        <OptimizedImage
          source={{ uri: coverUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={imagePath.DUMMY_ICON}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.city} numberOfLines={1}>
            {cityName}
          </Text>
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
        </View>

        {dateLabel ? <Text style={styles.dates}>{dateLabel}</Text> : null}

        {members.length > 0 ? (
          <View style={styles.avatars}>
            {members.map((m, index) => (
              <View
                key={m._id || index}
                style={[styles.avatarWrap, index > 0 && styles.avatarOverlap]}
              >
                <OptimizedImage
                  source={{
                    uri: getImageUrl(m.image) || DUMMY_USER_IMAGE,
                  }}
                  style={styles.avatar}
                />
              </View>
            ))}
            {overflow > 0 ? (
              <View style={styles.avatarMoreBadge}>
                <Text style={styles.avatarMore}>+{overflow}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.stats}>
          <StatColumn
            icon={imagePath.ACCOUNT}
            value={memberCount}
            label="Members"
          />
          <StatColumn
            icon={imagePath.LIKE_ICON}
            value={savedCount}
            label="Saved"
          />
          <StatColumn
            icon={imagePath.CALENDER_ICON}
            value={activityCount}
            label="Activities"
          />
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
    height: getHeight(118),
    borderRadius: getRadius(12),
  },
  content: {
    flex: 1,
    marginLeft: getWidth(12),
    justifyContent: "flex-start",
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(8),
  },
  city: {
    flex: 1,
    minWidth: 0,
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
  avatarWrap: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    borderWidth: 2,
    borderColor: colors.white,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: getWidth(14),
  },
  avatarOverlap: {
    marginLeft: -getWidth(8),
  },
  avatarMoreBadge: {
    marginLeft: getWidth(4),
    minWidth: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getWidth(4),
  },
  avatarMore: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  badge: {
    flexShrink: 0,
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
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  stats: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: getHeight(12),
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statIconWrap: {
    width: getWidth(14),
    height: getWidth(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeight(4),
  },
  statIcon: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.lightText,
  },
  statValue: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  statLabel: {
    marginTop: getHeight(2),
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
});
