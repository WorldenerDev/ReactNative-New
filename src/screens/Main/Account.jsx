import { Alert, StyleSheet, Text, View, StatusBar, Image } from "react-native";
import React from "react";
import { removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { useDispatch } from "react-redux";
import { logout } from "@redux/slices/authSlice";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import ProfileButton from "@components/ProfileButton";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import {
  getFontSize,
  getVertiPadding,
  getWidth,
  getHeight,
} from "@utils/responsive";

const Account = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          dispatch(logout());
          await removeItem(STORAGE_KEYS.USER_DATA);
          await removeItem(STORAGE_KEYS.TOKEN);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
  };

  const handleMyUpcomingBookings = () => {
    // TODO: Navigate to upcoming bookings screen
  };

  const handleTransactionHistory = () => {
    // TODO: Navigate to transaction history screen
  };

  const handleNotificationSettings = () => {
    // TODO: Navigate to notification settings screen
  };

  const handleTermsOfService = () => {
    // TODO: Navigate to terms of service screen
  };

  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy screen
  };

  const handleFAQs = () => {
    // TODO: Navigate to FAQs screen
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Handle account deletion
          },
        },
      ]
    );
  };

  return (
    <ResponsiveContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Account, bookings and payments.</Text>
        <View style={styles.notificationContainer}>
          <Image
            source={imagePath.NOTIFICATION_ICON}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* My Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Profile</Text>
        <ProfileButton title="Edit Profile" onPress={handleEditProfile} />
        <ProfileButton title="Sign Out" onPress={handleLogout} />
      </View>

      {/* My Bookings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        <ProfileButton
          title="My Upcoming Bookings"
          onPress={handleMyUpcomingBookings}
        />
        <ProfileButton
          title="Transaction History"
          onPress={handleTransactionHistory}
        />
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <ProfileButton
          title="Notification Settings"
          onPress={handleNotificationSettings}
        />
      </View>

      {/* Legal & Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>
        <ProfileButton
          title="Terms of Service"
          onPress={handleTermsOfService}
        />
        <ProfileButton title="Privacy Policy" onPress={handlePrivacyPolicy} />
        <ProfileButton title="FAQs" onPress={handleFAQs} />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <ProfileButton title="Delete Account" onPress={handleDeleteAccount} />
      </View>
    </ResponsiveContainer>
  );
};

export default Account;

const styles = StyleSheet.create({
  header: {
    paddingTop: getVertiPadding(20),
    paddingBottom: getVertiPadding(30),
    position: "relative",
  },
  title: {
    fontSize: getFontSize(19),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  subtitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  notificationContainer: {
    position: "absolute",
    top: getVertiPadding(20),
    right: getWidth(20),
    alignItems: "center",
  },
  notificationIcon: {
    width: getWidth(50),
    height: getHeight(50),
  },
  section: {
    marginBottom: getVertiPadding(32),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    fontWeight: "600",
    color: colors.black,
    marginBottom: getVertiPadding(16),
  },
});
