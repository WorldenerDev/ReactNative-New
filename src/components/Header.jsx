import colors from "@assets/colors";
import imagePath from "@assets/icons";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = ({ showBack = true, title = "" }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtnr} />
      )}

      <Text style={styles.title}>{title}</Text>

      {/* Placeholder to balance layout */}
      <View style={styles.iconBtnr} />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  iconBtn: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16), // rounded
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border, // round background for back button
  },
  iconBtnr: {
    width: getWidth(32),
    height: getHeight(32),
    // round background for back button
  },
  iconStyle: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
    tintColor: colors.black, // make back icon black
  },
  title: {
    fontSize: getHeight(18),
    fontWeight: "600",
    color: colors.black,
  },
});
