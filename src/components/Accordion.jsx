import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { getFontSize, getHeight, getWidth } from "@utils/responsive";

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <Image
          source={imagePath.ARROW_DOWN_ICON}
          style={[
            styles.icon,
            { transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
          ]}
        />
      </TouchableOpacity>

      {/* Body */}
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  title: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  icon: {
    height: getHeight(16),
    width: getWidth(16),
    resizeMode: "contain",
    tintColor: colors.black,
  },
  body: {
    marginBottom: 10,
  },
});
