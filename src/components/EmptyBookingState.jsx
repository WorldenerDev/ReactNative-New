import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getWidth, getHeight, getFontSize } from "@utils/responsive";

const EmptyBookingState = ({ type = "All" }) => {
  const getEmptyContent = () => {
    switch (type) {
      case "Upcoming":
        return {
          title: "No Upcoming Bookings",
          subtitle: "Your upcoming trips and activities will appear here.",
          icon: "📅",
        };
      case "Past":
        return {
          title: "No Past Bookings",
          subtitle: "View your completed trips and activities here.",
          icon: "✅",
        };
      case "Cancelled":
        return {
          title: "No Cancelled Bookings",
          subtitle: "Your cancelled bookings and refunds will be shown here.",
          icon: "❌",
        };
      default:
        return {
          title: "No Bookings Found",
          subtitle:
            "Here you can see all your bookings - upcoming, past, and cancelled.",
          icon: "📋",
        };
    }
  };

  const content = getEmptyContent();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{content.icon}</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getWidth(40),
    paddingVertical: getHeight(60),
  },
  icon: {
    fontSize: getFontSize(48),
    marginBottom: getHeight(16),
  },
  title: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.primary,
    marginBottom: getHeight(12),
    textAlign: "center",
  },
  subtitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    lineHeight: getHeight(24),
  },
});

export default EmptyBookingState;
