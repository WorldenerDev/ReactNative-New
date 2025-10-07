// components/CategoryCard.js
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import {
  getWidth,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";

const CategoryCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
    <OptimizedImage
      source={{
        uri:
          item?.cover_image_url ||
          "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
      }}
      style={styles.image}
      placeholder={<ImagePlaceholder style={styles.image} text="Loading..." />}
    />
    <View style={styles.cardOverlay}>
      <Text numberOfLines={2} style={styles.cardTitle}>
        {item?.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default CategoryCard;

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
    paddingHorizontal: getHoriPadding(5),
    alignItems: "center",
    backgroundColor: colors.light_bg
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
});
