import React from "react";
import { View, Text, StyleSheet } from "react-native";
import fonts from "@assets/fonts";
import { getWidth, getHeight, getFontSize } from "@utils/responsive";
import { typography } from "@utils/theme";

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
    ...typography.emptyTitle,
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    marginBottom: getHeight(8),
    textAlign: "center",
  },
  subtitle: {
    ...typography.emptySubtitle,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
    lineHeight: getHeight(20),
  },
});

export default EmptyBookingState;
