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
import imagePath from "@assets/icons";

const InspirationCard = ({ item, onPress }) => {
  if (!item) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <OptimizedImage
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        {item.kicker ? (
          <Text style={styles.kicker}>{String(item.kicker).toUpperCase()}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
      <View style={styles.arrowBtn}>
        <Image source={imagePath.RIGHT_ICON} style={styles.arrow} />
      </View>
    </TouchableOpacity>
  );
};

export default InspirationCard;

const styles = StyleSheet.create({
  card: {
    height: getHeight(150),
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
  content: {
    position: "absolute",
    left: getWidth(16),
    right: getWidth(70),
    bottom: getHeight(16),
  },
  kicker: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoMedium,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
    marginBottom: getHeight(4),
  },
  title: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.white,
  },
  arrowBtn: {
    position: "absolute",
    right: getWidth(14),
    bottom: getHeight(14),
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
