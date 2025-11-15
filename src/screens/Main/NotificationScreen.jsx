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
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import {
  getHeight,
  getWidth,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
  getRadius,
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
  const [invitations, setInvitations] = useState([
    {
      id: "1",
      inviterName: "Nadal",
      groupName: "Paris group",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: "2",
      inviterName: "Serena",
      groupName: "London trip",
      time: "1 day ago",
      isRead: false,
    },
  ]);

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

  const handleAcceptInvitation = (id) => {
    setInvitations((prev) => prev.filter((invitation) => invitation.id !== id));
    // Add your API call here to accept the invitation
  };

  const handleRejectInvitation = (id) => {
    setInvitations((prev) => prev.filter((invitation) => invitation.id !== id));
    // Add your API call here to reject the invitation
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getCurrentData = () => {
    return activeTab === "Notifications" ? notifications : invitations;
  };

  const renderInvitationItem = ({ item, index }) => {
    return (
      <View style={styles.invitationCard}>
        <View style={styles.invitationContent}>
          <View style={styles.invitationIconContainer}>
            <Image
              source={imagePath.INVITATION_ICON}
              style={styles.invitationIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.invitationTextContainer}>
            <Text style={styles.invitationText}>
              <Text style={styles.highlightedText}>{item.inviterName}</Text>
              {" has invited you to join the "}
              <Text style={styles.highlightedText}>{item.groupName}!</Text>
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <ButtonComp
            title="Accept"
            onPress={() => handleAcceptInvitation(item.id)}
            disabled={false}
            containerStyle={styles.acceptButton}
            textStyle={styles.acceptButtonText}
          />
          <ButtonComp
            title="Reject"
            onPress={() => handleRejectInvitation(item.id)}
            disabled={false}
            containerStyle={styles.rejectButton}
            textStyle={styles.rejectButtonText}
          />
        </View>
      </View>
    );
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
          renderItem={
            activeTab === "Invitations" ? renderInvitationItem : renderNotificationItem
          }
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
    marginVertical: getVertiPadding(8),
    marginHorizontal: getHoriPadding(12),
  },
  listContainer: {
    paddingBottom: getVertiPadding(12),
    paddingTop: getVertiPadding(4),
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
  // Invitation Card Styles
  invitationCard: {
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(10),
    marginHorizontal: getHoriPadding(8),
    marginVertical: getVertiPadding(5),
    borderRadius: getRadius(10),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  invitationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: getVertiPadding(8),
  },
  invitationIconContainer: {
    width: getWidth(36),
    height: getHeight(36),
    marginRight: getHoriPadding(8),
    alignItems: "center",
    justifyContent: "center",
  },
  invitationIcon: {
    width: getWidth(36),
    height: getHeight(36),
  },
  invitationTextContainer: {
    flex: 1,
    paddingTop: getVertiPadding(1),
  },
  invitationText: {
    fontSize: getFontSize(13.5),
    fontFamily: fonts.RobotoRegular,
    color: colors.primary,
    lineHeight: getFontSize(19),
  },
  highlightedText: {
    fontFamily: fonts.RobotoMedium,
    color: "#1E3A8A",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: getVertiPadding(1),
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: getVertiPadding(8),
    paddingHorizontal: getHoriPadding(14),
    borderRadius: getRadius(8),
    marginRight: getHoriPadding(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  acceptButtonText: {
    fontSize: getFontSize(13.5),
    fontFamily: fonts.RobotoMedium,
    color: colors.primary,
    fontWeight: "normal",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: getVertiPadding(8),
    paddingHorizontal: getHoriPadding(14),
    borderRadius: getRadius(8),
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: getHoriPadding(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1.5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  rejectButtonText: {
    fontSize: getFontSize(13.5),
    fontFamily: fonts.RobotoMedium,
    color: colors.primary,
    fontWeight: "normal",
  },
});
