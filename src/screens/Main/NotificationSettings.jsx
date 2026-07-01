import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import React, { useCallback, useEffect, useState } from "react";
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
import useStickyBottomInset, {
  useStickyScrollPadding,
} from "@hooks/useStickyBottomInset";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@api/services/mainServices";
import { updateOnlineStatus } from "@api/services/onlineStatusService";
import { showToast } from "@components/AppToast";
import { getFCMToken } from "@utils/fcmToken";


const NotificationSettings = () => {
  useGuestScreenGuard();
  const bottomInset = useStickyBottomInset();
  const scrollPadding = useStickyScrollPadding();
  const [eventReminders, setEventReminders] = useState(true);
  const [newsAndAlerts, setNewsAndAlerts] = useState(true);
  const [savedEventReminders, setSavedEventReminders] = useState(true);
  const [savedNewsAndAlerts, setSavedNewsAndAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    eventReminders !== savedEventReminders ||
    newsAndAlerts !== savedNewsAndAlerts;

  const applySettings = useCallback((data) => {
    const event = data?.event_reminders_notify ?? true;
    const news = data?.news_alerts_notify ?? true;
    setEventReminders(event);
    setNewsAndAlerts(news);
    setSavedEventReminders(event);
    setSavedNewsAndAlerts(news);
  }, []);

  const syncDeviceToken = useCallback(async (settings) => {
    const fcmToken = await getFCMToken();
    if (!fcmToken || !settings) return;

    const newsEnabled = settings?.news_alerts_notify ?? true;
    const eventEnabled = settings?.event_reminders_notify ?? true;

    if (!newsEnabled) {
      await updateNotificationSettings({
        event_reminders_notify: eventEnabled,
        news_alerts_notify: false,
        fcm_token: fcmToken,
      });
      return;
    }

    await updateOnlineStatus({ isOnline: true, fcm_token: fcmToken });
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotificationSettings();
      const settings = response?.data;
      applySettings(settings);
      await syncDeviceToken(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      showToast(
        "error",
        error?.message || "Failed to load notification settings"
      );
    } finally {
      setLoading(false);
    }
  }, [applySettings, syncDeviceToken]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveChanges = async () => {
    if (!hasChanges || saving) return;

    try {
      setSaving(true);
      const fcmToken = await getFCMToken();
      const payload = {
        event_reminders_notify: eventReminders,
        news_alerts_notify: newsAndAlerts,
      };

      if (fcmToken) {
        payload.fcm_token = fcmToken;
      }

      const response = await updateNotificationSettings(payload);
      applySettings(response?.data);
      showToast(
        "success",
        response?.message || "Notification settings updated successfully"
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
      showToast(
        "error",
        error?.message || "Failed to update notification settings"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainContainer>
      <Header title="Notification Settings" />

      <View style={[styles.wrapper, { paddingBottom: scrollPadding }]}>
        <Text style={styles.headerTitle}>
          Choose what updates you want to receive.
        </Text>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.settingsContainer}>
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
        )}
      </View>

      <View style={[styles.buttonContainer, { bottom: bottomInset }]}>
        <ButtonComp
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSaveChanges}
          disabled={loading || saving || !hasChanges}
        />
      </View>
    </MainContainer>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.primary,
    marginTop: getVertiPadding(20),
    marginBottom: getVertiPadding(30),
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getVertiPadding(40),
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
    left: 0,
    right: 0,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(16),
    backgroundColor: colors.white,
  },
});
