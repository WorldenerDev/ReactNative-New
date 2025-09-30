// components/CityCard.js
import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import {
  getWidth,
  getHeight,
  getFontSize,
  getVertiPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";

const CityCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
    <OptimizedImage
      source={{ uri: item?.image }}
      style={styles.image}
      placeholder={<ImagePlaceholder style={styles.image} text="Loading..." />}
    />
    <View style={styles.cardOverlay}>
      <Text style={styles.cardTitle}>
        {item?.name === "Amsterdam" ? "Dummy City " : item?.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default CityCard;

const styles = StyleSheet.create({
  card: {
    marginRight: getWidth(15),
    borderRadius: getWidth(10),
    overflow: "hidden",
  },
  image: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(10),
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: getVertiPadding(5),
    alignItems: "center",
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
});
