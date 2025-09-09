// components/ForYouCard.js
import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  getWidth,
  getHeight,
  getFontSize,
  getHoriPadding,
  getVertiPadding,
  getRadius,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";

const ForYouCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
    <Image source={{ uri: item?.image }} style={styles.image} />
    <View style={styles.overlay}>
      <Text numberOfLines={2} style={styles.title}>
        {item?.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default ForYouCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: getVertiPadding(15),
    marginHorizontal: getWidth(5),
    borderRadius: getWidth(12),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: getHeight(150),
    borderRadius: getWidth(12),
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: getHoriPadding(8),
    backgroundColor: colors.light_white,
    borderTopRightRadius: getRadius(20),
    borderTopLeftRadius: getRadius(20),
  },
  title: {
    color: colors.white,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
  },
});
