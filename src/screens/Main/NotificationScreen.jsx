import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import TopTab from "@components/TopTab";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import {
  getHeight,
  getWidth,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";

const NotificationScreen = () => {
  const [activeTab, setActiveTab] = useState("Notifications");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      message: "This is a test notification that can be more than 1 line",
      time: "Yesterday",
      isRead: false,
    },
    {
      id: "2",
      message: "This is a single line notification",
      time: "Yesterday",
      isRead: false,
    },
  ]);
  const [invitations, setInvitations] = useState([]);

  const markAsRead = (id) => {
    if (activeTab === "Notifications") {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } else {
      setInvitations((prev) =>
        prev.map((invitation) =>
          invitation.id === id ? { ...invitation, isRead: true } : invitation
        )
      );
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getCurrentData = () => {
    return activeTab === "Notifications" ? notifications : invitations;
  };

  const renderNotificationItem = ({ item, index }) => {
    const currentData = getCurrentData();
    return (
      <View>
        <TouchableOpacity
          style={styles.notificationItem}
          onPress={() => markAsRead(item.id)}
        >
          <View style={styles.notificationContent}>
            <View style={styles.iconContainer}>
              <Image
                source={imagePath.NOTIFICATION_ICON}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {index < currentData.length - 1 && <View style={styles.separator} />}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={imagePath.NOTIFICATION_ICON}
        style={styles.emptyIcon}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>
        {activeTab === "Notifications"
          ? "No Notifications Yet"
          : "No Invitations Yet"}
      </Text>
      <Text style={styles.emptyMessage}>
        {activeTab === "Notifications"
          ? "You're all caught up! We'll notify you when something new happens."
          : "No pending invitations at the moment."}
      </Text>
    </View>
  );

  return (
    <MainContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="Notifications" />

      <View style={styles.container}>
        {/* <Text style={styles.headerMessage}>
          Stay updated with real time alerts!
        </Text> */}

        <TopTab
          tabs={["Notifications", "Invitations"]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          containerStyle={styles.tabContainer}
        />

        <FlatList
          data={getCurrentData()}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </MainContainer>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerMessage: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    paddingVertical: getVertiPadding(16),
  },
  tabContainer: {
    marginVertical: getVertiPadding(10),
  },
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },
  notificationItem: {
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(16),
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: getWidth(24),
    height: getHeight(24),
    alignItems: "center",
    justifyContent: "center",
    marginRight: getHoriPadding(12),
    marginTop: getVertiPadding(2),
  },
  notificationIcon: {
    width: getWidth(30),
    height: getHeight(30),
  },
  textContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.primary,
    lineHeight: getFontSize(20),
    marginBottom: getVertiPadding(4),
  },
  notificationTime: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: getHoriPadding(16),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getHoriPadding(40),
  },
  emptyIcon: {
    width: getWidth(80),
    height: getHeight(80),
    marginBottom: getVertiPadding(20),
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  emptyMessage: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    lineHeight: getFontSize(20),
  },
});
