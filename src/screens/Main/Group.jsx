import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Header from "@components/Header";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import MainContainer from "@components/container/MainContainer";
import { useStickyScrollPadding } from "@hooks/useStickyBottomInset";
import navigationStrings from "@navigation/navigationStrings";
import { getGroups } from "@api/services/mainServices";
import { formatDisplayDate } from "@utils/formatDate";
import { cardGap, cardRadius, cardShadow, typography } from "@utils/theme";
import GuestPrompt from "@components/GuestPrompt";
import useAuth from "@hooks/useAuth";

const Group = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { isGuest } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transform API data to match UI structure
  const transformGroupData = (groupsData) => {
    return groupsData.map((group) => {
      const peopleCount = group.addedUsers?.length || 0;
      const totalPeople = peopleCount + 1; // +1 for creator

      // Capitalize first letter of status
      const status = group.status
        ? group.status.charAt(0).toUpperCase() + group.status.slice(1)
        : "Active";

      return {
        id: group._id,
        tripId: group.trip_id || group.tripId || "",
        cityId: group?.cityId?.city_id,
        title: group.groupName || group.cityId?.name || "Trip",
        location: group.cityId?.name || "",
        status: status,
        startDate: formatDisplayDate(group.startDate),
        endDate: formatDisplayDate(group.endDate),
        people: `${totalPeople} ${totalPeople === 1 ? "person" : "people"}`,
        image:
          group.groupImage ||
          group.cityId?.image ||
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
      };
    });
  };

  // Fetch groups from API
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getGroups();

      if (response?.success && response?.data) {
        const transformedData = transformGroupData(
          Array.isArray(response.data) ? response.data : []
        );
        setTrips(transformedData);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [fetchGroups, isGuest]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        fetchGroups();
      }
    }, [fetchGroups, isGuest])
  );

  const handleCardPress = (item) => {
    navigation.navigate(navigationStrings.GROUP_DETAILS, {
      groupId: item?.id,
      cityId: item?.cityId,
    });
  };

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.tripImage} />

        <View style={styles.tripDetails}>
          <Text style={styles.tripTitle}>{item.title}</Text>

          <View style={styles.locationRow}>
            <Image source={imagePath.LOCATION_PIN} style={styles.locationIcon} />
            <Text style={styles.locationText}>{item?.location}</Text>
            <Image source={imagePath.CHECK_ICON} style={styles.checkIcon} />
            <Text style={styles.statusText}>{item?.status}</Text>
          </View>

          <View style={styles.dateRow}>
            <Image source={imagePath.CALENDER_ICON} style={styles.calendarIcon} />
            <Text style={styles.dateText}>
              {item.startDate} – {item.endDate}
            </Text>
          </View>

          <View style={styles.peopleRow}>
            <Text style={styles.peopleText}>{item.people}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <View style={styles.chatDivider} />
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate(navigationStrings.CHAT, {
              groupId: item?.id,
              tripId: item?.tripId,
            })
          }
          activeOpacity={0.7}
          accessibilityLabel="Chat"
          accessibilityRole="button"
        >
          <Image source={imagePath.CHAT_ICON} style={styles.chatIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleNotificationIcon = () => {
    navigation.navigate(navigationStrings.NOTIFICATION_SCREEN);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptySubtitle}>
        Join or create a group to start planning together.
      </Text>
    </View>
  );

  if (isGuest) {
    return (
      <MainContainer>
        <Header title="My Groups" showBack={false} />
        <GuestPrompt
          title="Sign in to join groups"
          subtitle="Create an account to plan trips with friends, chat, and share activities."
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer loader={loading}>
      <Header
        title="My Groups"
        showBack={false}
        rightIconImage={imagePath.NOTIFICATION_ICON}
        onRightIconPress={handleNotificationIcon}
        rightIconSize={38}
      />

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: scrollPadding },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />
    </MainContainer>
  );
};

export default Group;

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: getHeight(16),
  },
  tripCard: {
    backgroundColor: colors.white,
    marginBottom: cardGap,
    borderRadius: cardRadius,
    flexDirection: "row",
    padding: getHeight(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  cardTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tripImage: {
    width: getWidth(80),
    height: getWidth(80),
    borderRadius: getRadius(6),
    marginRight: getWidth(16),
  },
  tripDetails: {
    flex: 1,
    justifyContent: "space-between",
    height: getWidth(80),
    paddingVertical: getHeight(2),
  },
  tripTitle: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(6),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(6),
  },
  locationIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.red,
  },
  locationText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginRight: getWidth(16),
  },
  checkIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.green,
  },
  statusText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(6),
  },
  calendarIcon: {
    width: getWidth(10),
    height: getHeight(10),
    marginRight: getWidth(4),
    tintColor: colors.black,
  },
  dateText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  peopleIcons: {
    flexDirection: "row",
    marginRight: getWidth(6),
  },
  personIcon: {
    width: getWidth(14),
    height: getWidth(14),
    borderRadius: getWidth(7),
    backgroundColor: colors.secondary,
    marginLeft: getWidth(-3),
  },
  personIcon1: {
    marginLeft: 0,
  },
  personIcon2: {
    zIndex: 1,
  },
  personIcon3: {
    zIndex: 2,
  },
  peopleText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    paddingLeft: getWidth(10),
  },
  chatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    marginVertical: getHeight(10),
    marginRight: getWidth(10),
  },
  chatButton: {
    width: getWidth(40),
    height: getWidth(40),
    alignItems: "center",
    justifyContent: "center",
  },
  chatIcon: {
    width: getWidth(20),
    height: getWidth(20),
    resizeMode: "contain",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeight(100),
  },
  emptyTitle: {
    ...typography.emptyTitle,
    fontFamily: fonts.RobotoBold,
    marginBottom: getHeight(8),
  },
  emptySubtitle: {
    ...typography.emptySubtitle,
    fontFamily: fonts.RobotoRegular,
    textAlign: "center",
  },
});
