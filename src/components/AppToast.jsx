// AppToast.jsx
import colors from "@assets/colors";
import {
  getFontSize,
  getHoriPadding,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

// Default styles for each type
const toastTypes = {
  success: {
    backgroundColor: colors.green,
    textColor: colors.white,
  },
  error: {
    backgroundColor: colors.red,
    textColor: colors.white,
  },
  warning: {
    backgroundColor: colors.yellow,
    textColor: colors.black, // ⚡ better contrast
  },
  info: {
    backgroundColor: colors.teal,
    textColor: colors.white,
  },
};

// Config for Toast
const toastConfig = {
  success: ({ text1 }) => (
    <View
      style={[
        styles.toast,
        { backgroundColor: toastTypes.success.backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: toastTypes.success.textColor }]}>
        {text1}
      </Text>
    </View>
  ),
  error: ({ text1 }) => (
    <View
      style={[
        styles.toast,
        { backgroundColor: toastTypes.error.backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: toastTypes.error.textColor }]}>
        {text1}
      </Text>
    </View>
  ),
  warning: ({ text1 }) => (
    <View
      style={[
        styles.toast,
        { backgroundColor: toastTypes.warning.backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: toastTypes.warning.textColor }]}>
        {text1}
      </Text>
    </View>
  ),
  info: ({ text1 }) => (
    <View
      style={[
        styles.toast,
        { backgroundColor: toastTypes.info.backgroundColor },
      ]}
    >
      <Text style={[styles.text, { color: toastTypes.info.textColor }]}>
        {text1}
      </Text>
    </View>
  ),
  notification: ({ text1, text2 }) => (
    <View style={[styles.toast, styles.notificationToast]}>
      <Text style={styles.notificationTitle}>{text1}</Text>
      {text2 ? <Text style={styles.notificationBody}>{text2}</Text> : null}
    </View>
  ),
};

const isAxiosTimeoutMessage = (message) =>
  /timeout of \d+ms exceeded/i.test(String(message || ""));

// Function to show toast anywhere
export const showToast = (type = "info", message = "") => {
  if (isAxiosTimeoutMessage(message)) {
    return;
  }

  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

export const showPushNotification = (title = "Notification", body = "") => {
  Toast.show({
    type: "notification",
    text1: title,
    text2: body || undefined,
    position: "top",
    visibilityTime: 4500,
    autoHide: true,
    topOffset: 50,
  });
};

// Main Toast Component
export const AppToast = () => <Toast config={toastConfig} />;

const styles = StyleSheet.create({
  toast: {
    paddingVertical: getVertiPadding(12),
    paddingHorizontal: getHoriPadding(16),
    borderRadius: getRadius(8),
    minWidth: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: getFontSize(14),
    fontWeight: "500",
  },
  notificationToast: {
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  notificationTitle: {
    fontSize: getFontSize(14),
    fontWeight: "600",
    color: colors.primary,
    marginBottom: getVertiPadding(4),
  },
  notificationBody: {
    fontSize: getFontSize(13),
    color: colors.lightText,
    lineHeight: getFontSize(18),
  },
});
