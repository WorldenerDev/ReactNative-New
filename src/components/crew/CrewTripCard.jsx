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
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import { formatCompactDateRange } from "@utils/formatDate";
import imagePath from "@assets/icons";
import OptimizedImage from "@components/OptimizedImage";

const statusLabels = {
  joined: "Joined",
  not_joined: "Not joined",
  opted_out: "Opted out",
};

const CrewTripCard = ({ trip, onPress }) => {
  const dateLabel = formatCompactDateRange(trip.start_at, trip.end_at);
  const status = trip.participationStatus || "not_joined";

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
        <Text style={styles.city}>{trip.city}</Text>
        {dateLabel ? <Text style={styles.dates}>{dateLabel}</Text> : null}
        <View style={styles.metaRow}>
          <Image source={imagePath.CALENDER_ICON} style={styles.metaIcon} />
          <Text style={styles.metaText}>
            {trip.activityCount || 0} activities
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            status === "joined" && styles.badgeJoined,
            status === "not_joined" && styles.badgePending,
            status === "opted_out" && styles.badgeOptedOut,
          ]}
        >
          <Text style={styles.badgeText}>
            {statusLabels[status] || status}
          </Text>
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
    borderRadius: getRadius(12),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: getHeight(12),
    overflow: "hidden",
  },
  image: {
    width: getWidth(88),
    height: getWidth(88),
  },
  content: {
    flex: 1,
    padding: getWidth(12),
    justifyContent: "center",
  },
  city: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  dates: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getHeight(4),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: getHeight(4),
  },
  metaIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.lightText,
  },
  metaText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: getHeight(6),
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(3),
    borderRadius: getRadius(6),
    backgroundColor: "#F2F4F7",
  },
  badgeJoined: {
    backgroundColor: "#ECFDF3",
  },
  badgePending: {
    backgroundColor: "#EFF8FF",
  },
  badgeOptedOut: {
    backgroundColor: "#FEF3F2",
  },
  badgeText: {
    fontSize: getHeight(10),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
});
