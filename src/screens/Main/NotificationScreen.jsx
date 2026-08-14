import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import React, { useState, useCallback } from "react";
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
  getRadius,
} from "@utils/responsive";
import { formatDisplayDate } from "@utils/formatDate";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import {
  getInvitations,
  getNotifications,
  markNotificationRead,
} from "@api/services/mainServices";
import {
  fetchCrewTripNotifications,
  isReusableGroupsMockEnabled,
} from "@api/services/crewGroupsService";
import navigationStrings from "@navigation/navigationStrings";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { showToast } from "@components/AppToast";
import { getImageUrl } from "@api/apiClient";

const getInviterAvatar = (item) => {
  const fromProfile = getImageUrl(item?.invitedBy?.image);
  if (fromProfile) return fromProfile;
  const name = item?.invitedBy?.name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
};


const getInvitationStatus = (item) => {
  if (item?.status) return item.status;
  if (item?.isInviteAccepted) return "accepted";
  if (item?.isRejected) return "rejected";
  return "pending";
};

const getNotificationTypeLabel = (item) => {
  const type = item?.notifictaion_type;

  switch (type) {
    case "group_invitation":
      return "Crew Invite";
    case "trip_reminder":
      return "Trip Reminder";
    case "admin_broadcast":
      return "News & Alert";
    case "trip_created_in_group":
      return "New Crew Trip";
    default:
      return "Notification";
  }
};

const NotificationScreen = () => {
  useGuestScreenGuard();
  const navigation = useNavigation();
  const scrollPadding = useStickyScrollPadding();
  const [activeTab, setActiveTab] = useState("Notifications");
  const [notifications, setNotifications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const markAsRead = async (item) => {
    if (item?.isRead) return;

    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === item._id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    try {
      await markNotificationRead({ notificationId: item._id });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === item._id
            ? { ...notification, isRead: false }
            : notification
        )
      );
    }
  };

  const openCrewInvite = async (item, invitationId) => {
    let groupId = item?.groupId || null;
    let resolvedInvitationId = invitationId || item?.invitationId || null;
    let groupName = item?.groupName || "";
    let inviterName = item?.invitedBy?.name || item?.sender?.name || "";
    let message = item?.message || item?.body || "";

    if (
      item?.notifictaion_type === "group_invitation" &&
      (!groupId || !resolvedInvitationId)
    ) {
      try {
        const response = await getInvitations();
        const match = (response?.data || []).find(
          (invite) =>
            getInvitationStatus(invite) === "pending" &&
            groupId &&
            String(invite.groupId) === String(groupId)
        );
        if (match) {
          groupId = groupId || match.groupId;
          resolvedInvitationId = resolvedInvitationId || match._id;
          groupName = groupName || match.groupName || "";
          inviterName = inviterName || match.invitedBy?.name || "";
          message = message || match.message || "";
        }
      } catch (error) {
        console.error("Error resolving crew invitation:", error);
      }
    }

    if (!groupId || !resolvedInvitationId) {
      showToast("error", "Invitation not found");
      return;
    }

    navigation.navigate(navigationStrings.CREW_INVITE, {
      groupId,
      invitationId: resolvedInvitationId,
      groupName,
      inviterName,
      message,
    });
  };

  const openTripBrief = (item) => {
    const canonicalTripId =
      item?.canonicalTripId || item?.tripId || item?.trip_id || null;
    if (!canonicalTripId) {
      showToast("error", "Trip not found");
      return;
    }
    navigation.navigate(navigationStrings.TRIP_BRIEF, {
      canonicalTripId,
      groupId: item?.groupId || null,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Invitations") {
      fetchInvitations();
    } else {
      fetchNotifications();
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await getInvitations();
      const pending = (response?.data || []).filter((item) => {
        const status = getInvitationStatus(item);
        return status === "pending";
      });
      setInvitations(pending);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      showToast("error", error?.message || "Failed to fetch invitations");
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      let items = response?.data?.notifications || [];

      if (isReusableGroupsMockEnabled()) {
        const mockRes = await fetchCrewTripNotifications();
        const mockItems = (mockRes?.data || []).map((n) => ({
          ...n,
          body: n.message,
        }));
        items = [...mockItems, ...items];
      }

      setNotifications(items);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("error", error?.message || "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (activeTab === "Invitations") {
        fetchInvitations();
      } else {
        fetchNotifications();
      }
    }, [activeTab])
  );

  const getCurrentData = () => {
    return activeTab === "Notifications" ? notifications : invitations;
  };

  const renderInvitationItem = ({ item }) => {
    const status = getInvitationStatus(item);
    const isPending = status === "pending";
    const groupLabel = item?.groupName ? ` "${item.groupName}"` : " the crew";

    return (
      <TouchableOpacity
        style={styles.invitationCard}
        onPress={() => openCrewInvite(item, item?._id)}
        activeOpacity={0.8}
      >
        <View style={styles.invitationContent}>
          <View style={styles.invitationIconContainer}>
            <Image
              source={{ uri: getInviterAvatar(item) }}
              style={styles.invitationAvatar}
            />
          </View>
          <View style={styles.invitationTextContainer}>
            <Text style={styles.invitationText}>
              <Text style={styles.highlightedText}>{item?.invitedBy?.name}</Text>
              {` has invited you to join${groupLabel}!`}
            </Text>
            {item?.createdAt ? (
              <Text style={styles.invitationTime}>
                {formatDisplayDate(item.createdAt)}
              </Text>
            ) : null}
            {!isPending ? (
              <Text
                style={[
                  styles.statusLabel,
                  status === "accepted"
                    ? styles.statusAccepted
                    : styles.statusRejected,
                ]}
              >
                {status === "accepted" ? "Accepted" : "Rejected"}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleNotificationPress = async (item) => {
    await markAsRead(item);

    if (item?.notifictaion_type === "group_invitation") {
      await openCrewInvite(item, item?.invitationId);
      return;
    }

    if (item?.notifictaion_type === "trip_created_in_group") {
      openTripBrief(item);
    }
  };

  const renderNotificationItem = ({ item, index }) => {
    const currentData = getCurrentData();
    const message = item?.body || item?.title || "";
    const time = item?.createdAt ? formatDisplayDate(item.createdAt) : "";
    const typeLabel = getNotificationTypeLabel(item);

    return (
      <View>
        <TouchableOpacity
          style={styles.notificationItem}
          onPress={() => handleNotificationPress(item)}
        >
          <View style={styles.notificationContent}>
            <View style={styles.iconContainer}>
              <Image
                source={imagePath.NOTIFICATION_ICON}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
              {!item?.isRead ? <View style={styles.unreadDot} /> : null}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notificationTypeLabel}>{typeLabel}</Text>
              <Text
                style={[
                  styles.notificationMessage,
                  !item?.isRead && styles.notificationMessageUnread,
                ]}
              >
                {message}
              </Text>
              {time ? <Text style={styles.notificationTime}>{time}</Text> : null}
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
          : "No invitations yet. When someone invites you to a crew, it will appear here."}
      </Text>
    </View>
  );

  return (
    <MainContainer loader={loading}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="Notifications" />

      <View style={styles.container}>
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
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: scrollPadding },
          ]}
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
  tabContainer: {
    marginVertical: getVertiPadding(8),
    marginHorizontal: getHoriPadding(12),
  },
  listContainer: {
    flexGrow: 1,
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
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: getWidth(8),
    height: getHeight(8),
    borderRadius: getRadius(4),
    backgroundColor: colors.secondary,
  },
  textContainer: {
    flex: 1,
  },
  notificationTypeLabel: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoMedium,
    color: "#1E3A8A",
    marginBottom: getVertiPadding(4),
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  notificationMessage: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.primary,
    lineHeight: getFontSize(20),
    marginBottom: getVertiPadding(4),
  },
  notificationMessageUnread: {
    fontFamily: fonts.RobotoMedium,
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
    alignItems: "center",
  },
  invitationIconContainer: {
    width: getWidth(40),
    height: getHeight(40),
    marginRight: getHoriPadding(10),
    alignItems: "center",
    justifyContent: "center",
  },
  invitationAvatar: {
    width: getWidth(40),
    height: getHeight(40),
    borderRadius: getRadius(20),
    backgroundColor: colors.border,
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
  invitationTime: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(4),
  },
  statusLabel: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    marginTop: getVertiPadding(6),
  },
  statusAccepted: {
    color: "#15803D",
  },
  statusRejected: {
    color: colors.lightText,
  },
  highlightedText: {
    fontFamily: fonts.RobotoMedium,
    color: "#1E3A8A",
  },
});
