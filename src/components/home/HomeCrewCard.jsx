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
import OptimizedImage from "@components/OptimizedImage";
import { getImageUrl } from "@api/apiClient";
import imagePath from "@assets/icons";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop";

const HomeCrewCard = ({ crew, onPress, onActionPress }) => {
  const image = getImageUrl(crew.groupImage) || crew.groupImage || FALLBACK_IMAGE;
  const count = crew.activeTripCount || 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <OptimizedImage source={{ uri: image }} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {crew.groupName || "Crew"}
          </Text>
          <Text style={styles.meta}>
            {count} {count === 1 ? "active trip" : "active trips"}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.action}
        onPress={onActionPress}
        hitSlop={8}
      >
        <Image source={imagePath.SHARE_ICON} style={styles.actionIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeCrewCard;

const styles = StyleSheet.create({
  card: {
    width: getWidth(150),
    marginRight: getWidth(12),
    borderRadius: getRadius(16),
    backgroundColor: colors.white,
  },
  image: {
    width: "100%",
    height: getHeight(110),
    borderRadius: getRadius(16),
    overflow: "hidden",
  },
  action: {
    position: "absolute",
    top: getHeight(8),
    right: getWidth(8),
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: getWidth(14),
    height: getHeight(14),
    tintColor: colors.black,
    resizeMode: "contain",
  },
  body: {
    paddingTop: getHeight(8),
    paddingHorizontal: getWidth(4),
    paddingBottom: getHeight(4),
  },
  title: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  meta: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getHeight(2),
    flexShrink: 1,
  },
});
