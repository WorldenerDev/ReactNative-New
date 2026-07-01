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
import {
  fetchCrews,
  isReusableGroupsMockEnabled,
  subscribeReusableGroupsMock,
} from "@api/services/crewGroupsService";

const Group = ({ navigation }) => {
  const scrollPadding = useStickyScrollPadding();
  const { isGuest } = useAuth();
  const mockEnabled = isReusableGroupsMockEnabled();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);

  const transformLegacyGroupData = (groupsData) => {
    return groupsData.map((group) => {
      const peopleCount = group.addedUsers?.length || 0;
      const totalPeople = peopleCount + 1;

      const status = group.status
        ? group.status.charAt(0).toUpperCase() + group.status.slice(1)
        : "Active";

      return {
        id: group._id,
        tripId: group.trip_id || group.tripId || "",
        cityId: group?.cityId?.city_id,
        title: group.groupName || group.cityId?.name || "Trip",
        location: group.cityId?.name || "",
        status,
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

  const transformCrewData = (groupsData) =>
    groupsData.map((group) => {
      const peopleCount = (group.addedUsers?.length || 0) + 1;
      return {
        id: group._id,
        title: group.groupName || "Crew",
        people: `${peopleCount} ${peopleCount === 1 ? "member" : "members"}`,
        activeTripCount: group.activeTripCount || 0,
        cityChips: group.cityChips || [],
        image:
          group.groupImage ||
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
      };
    });

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = mockEnabled ? await fetchCrews() : await getGroups();

      if (response?.success && response?.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setCrews(
          mockEnabled ? transformCrewData(data) : transformLegacyGroupData(data)
        );
      } else {
        setCrews([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setCrews([]);
    } finally {
      setLoading(false);
    }
  }, [mockEnabled]);

  useEffect(() => {
    if (!isGuest) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [fetchGroups, isGuest]);

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) {
        fetchGroups();
      }
    }, [fetchGroups, isGuest])
  );

  useEffect(() => {
    if (!mockEnabled || isGuest) return undefined;
    return subscribeReusableGroupsMock(fetchGroups);
  }, [mockEnabled, isGuest, fetchGroups]);

  const handleCardPress = (item) => {
    navigation.navigate(navigationStrings.GROUP_DETAILS, {
      groupId: item?.id,
      cityId: item?.cityId,
    });
  };

  const handleCreateCrew = () => {
    navigation.navigate(navigationStrings.CREATE_GROUP);
  };

  const renderCrewCard = ({ item }) => (
    <View style={styles.tripCard}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.tripImage} />
        <View style={styles.tripDetails}>
          <Text style={styles.tripTitle}>{item.title}</Text>
          <Text style={styles.peopleText}>{item.people}</Text>
          <Text style={styles.metaText}>
            {item.activeTripCount}{" "}
            {item.activeTripCount === 1 ? "active trip" : "active trips"}
          </Text>
          {item.cityChips?.length > 0 ? (
            <View style={styles.chipRow}>
              {item.cityChips.slice(0, 3).map((city) => (
                <View key={city} style={styles.chip}>
                  <Text style={styles.chipText}>{city}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <View style={styles.chatDivider} />
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() =>
            navigation.navigate(navigationStrings.CHAT, { groupId: item?.id })
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

  const renderLegacyCard = ({ item }) => (
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
      <Text style={styles.emptyTitle}>
        {mockEnabled ? "No Crews Yet" : "No Groups Yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {mockEnabled
          ? "Create a crew to plan multiple trips with the same friends."
          : "Join or create a group to start planning together."}
      </Text>
    </View>
  );

  if (isGuest) {
    return (
      <MainContainer>
        <Header title={mockEnabled ? "My Crews" : "My Groups"} showBack={false} />
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
        title={mockEnabled ? "My Crews" : "My Groups"}
        showBack={false}
        rightIconImage={imagePath.NOTIFICATION_ICON}
        onRightIconPress={handleNotificationIcon}
        rightIconSize={38}
      />

      {mockEnabled ? (
        <TouchableOpacity
          style={styles.createCrewBar}
          onPress={handleCreateCrew}
          activeOpacity={0.85}
        >
          <Image source={imagePath.PLUS_ICON_BORDER} style={styles.createIcon} />
          <Text style={styles.createCrewText}>Create crew</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={crews}
        renderItem={mockEnabled ? renderCrewCard : renderLegacyCard}
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
    justifyContent: "center",
    minHeight: getWidth(80),
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
  peopleText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(4),
  },
  metaText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(6),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getWidth(6),
  },
  chip: {
    backgroundColor: "#EFF8FF",
    paddingHorizontal: getWidth(8),
    paddingVertical: getHeight(3),
    borderRadius: getRadius(6),
  },
  chipText: {
    fontSize: getHeight(10),
    fontFamily: fonts.RobotoMedium,
    color: "#0F5EA8",
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
  createCrewBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: getWidth(16),
    marginBottom: getHeight(8),
    paddingVertical: getHeight(12),
    borderRadius: getRadius(10),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: getWidth(8),
  },
  createIcon: {
    width: getWidth(18),
    height: getWidth(18),
    resizeMode: "contain",
  },
  createCrewText: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
});
