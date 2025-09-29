import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ToggleSwitch from "@components/ToggleSwitch";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHoriPadding,
  getVertiPadding,
  getRadius,
} from "@utils/responsive";

const NotificationSettings = () => {
  const [eventReminders, setEventReminders] = useState(true);
  const [newsAndAlerts, setNewsAndAlerts] = useState(true);

  const handleSaveChanges = () => {
    // Handle save changes logic here
    console.log("Event Reminders:", eventReminders);
    console.log("News and Alerts:", newsAndAlerts);
  };

  return (
    <MainContainer>
      <Header title="Notification Settings" />

      <Text style={styles.headerTitle}>
        Choose what updates you want to receive.
      </Text>

      <View style={styles.settingsContainer}>
        {/* Event Reminders Card */}
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Event Reminders</Text>
            <Text style={styles.settingDescription}>
              Daily reminders of upcoming booked events
            </Text>
          </View>
          <ToggleSwitch
            isEnabled={eventReminders}
            onToggle={() => setEventReminders(!eventReminders)}
          />
        </View>

        {/* News and Alerts Card */}
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>News and Alerts</Text>
            <Text style={styles.settingDescription}>
              Alerts from our special team
            </Text>
          </View>
          <ToggleSwitch
            isEnabled={newsAndAlerts}
            onToggle={() => setNewsAndAlerts(!newsAndAlerts)}
          />
        </View>
      </View>

      {/* Save Changes Button */}
      <View style={styles.buttonContainer}>
        <ButtonComp
          title="Save Changes"
          onPress={handleSaveChanges}
          disabled={false}
        />
      </View>
    </MainContainer>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: getVertiPadding(100), // Add padding to prevent content from being hidden behind fixed button
  },
  headerTitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.primary,
    marginTop: getVertiPadding(20),
    marginBottom: getVertiPadding(30),
  },
  settingsContainer: {
    gap: getVertiPadding(16),
  },
  settingCard: {
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: getHoriPadding(16),
  },
  settingTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.primary,
    marginBottom: getVertiPadding(4),
  },
  settingDescription: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    lineHeight: getFontSize(20),
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(50),
    backgroundColor: colors.white,
  },
});
