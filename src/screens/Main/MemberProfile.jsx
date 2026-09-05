import { getImageUrl } from "@api/apiClient";
import { blockUser, getUserInfo } from "@api/services/mainServices";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import Header from "@components/Header";
import Loader from "@components/Loader";
import OptimizedImage from "@components/OptimizedImage";
import MainContainer from "@components/container/MainContainer";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import { navigateToGroupDetails } from "@navigation/helpers/nestedTabNavigation";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "U";
};

const normalizeInterests = (user) => {
  const categories = Array.isArray(user?.category_details)
    ? user.category_details
    : [];
  const fromCategories = categories
    .map((cat) => (typeof cat === "string" ? cat : cat?.name || cat?.id))
    .filter(Boolean)
    .map(String);

  if (fromCategories.length > 0) return fromCategories;

  const preferences = Array.isArray(user?.preferences) ? user.preferences : [];
  return preferences
    .map((pref) => (typeof pref === "string" ? pref : pref?.name || pref?.id))
    .filter(Boolean)
    .map(String);
};

const normalizeMutualGroups = (groups) =>
  (Array.isArray(groups) ? groups : [])
    .map((group) => {
      const id = group?._id || group?.id;
      if (!id) return null;
      return {
        id: String(id),
        name: group.groupName || group.trip?.name || "Untitled Group",
        tripId: group.trip?._id || null,
        cityId: group.city?.city_id || null,
      };
    })
    .filter(Boolean);

const MemberProfile = ({ route, navigation }) => {
  useGuestScreenGuard();
  const routeUser = route?.params?.userData || route?.params?.user || {};
  const userId =
    route?.params?.userId || routeUser._id || routeUser.id || null;

  const [loading, setLoading] = useState(true);
  const [blockLoading, setBlockLoading] = useState(false);
  const [profile, setProfile] = useState({
    id: userId,
    name: routeUser.name || "",
    avatar:
      getImageUrl(routeUser.avatar) || getImageUrl(routeUser.image) || null,
    interests: [],
    mutualGroups: [],
  });

  const fetchUserInfo = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      showToast("error", "User not found");
      return;
    }

    try {
      setLoading(true);
      const response = await getUserInfo(userId);
      const data = response?.data || {};
      const user = data.user || {};

      setProfile({
        id: user._id || userId,
        name: user.name || routeUser.name || "User",
        avatar:
          getImageUrl(user.image) ||
          getImageUrl(routeUser.avatar) ||
          getImageUrl(routeUser.image) ||
          null,
        interests: normalizeInterests(user),
        mutualGroups: normalizeMutualGroups(data.mutual_groups),
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  }, [routeUser.avatar, routeUser.image, routeUser.name, userId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleBlock = () => {
    if (!userId || blockLoading) return;

    Alert.alert(
      "Block User",
      `Are you sure you want to block ${profile.name || "this user"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              setBlockLoading(true);
              await blockUser({ blockedUserId: String(userId) });
              showToast(
                "success",
                `Blocked ${profile.name || "user"} successfully`
              );
              navigation.goBack();
            } catch (error) {
              console.error("Error blocking user:", error);
            } finally {
              setBlockLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleGroupPress = (group) => {
    if (!group?.id) return;
    navigateToGroupDetails(navigation, {
      groupId: group.id,
      tripId: group.tripId || null,
      cityId: group.cityId || null,
    });
  };

  const interestChunks = useMemo(() => {
    const interests = profile.interests || [];
    const chunks = [];
    const itemsPerChunk = 4;
    for (let i = 0; i < interests.length; i += itemsPerChunk) {
      chunks.push({
        id: `chunk-${i}`,
        items: interests.slice(i, i + itemsPerChunk),
      });
    }
    return chunks;
  }, [profile.interests]);

  const renderInterestItem = ({ item }) => (
    <View style={styles.interestGridContainer}>
      {item.items.map((interest, idx) => (
        <View key={`chip-${item.id}-${idx}`} style={styles.interestChip}>
          <Text
            style={styles.interestChipText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {interest}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.groupItemText}>{item.name}</Text>
      <Image
        source={imagePath.RIGHT_ICON}
        style={styles.groupArrowIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  return (
    <MainContainer>
      <View style={styles.headerContainer}>
        <Header title="User Info" showBack={true} />
        <TouchableOpacity
          style={styles.blockButton}
          onPress={handleBlock}
          activeOpacity={0.7}
          disabled={blockLoading || !userId}
        >
          <Text style={styles.blockButtonText}>
            {blockLoading ? "Blocking..." : "Block"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loader />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar ? (
                <OptimizedImage
                  source={{ uri: profile.avatar }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {getInitials(profile.name)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{profile.name || "User"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            {interestChunks.length > 0 ? (
              <FlatList
                data={interestChunks}
                renderItem={renderInterestItem}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.interestsContainer}
                removeClippedSubviews={true}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
              />
            ) : (
              <Text style={styles.emptyText}>No interests shared.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mutual Groups</Text>
            {profile.mutualGroups.length > 0 ? (
              <FlatList
                data={profile.mutualGroups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => `group-${item.id}`}
                scrollEnabled={false}
                contentContainerStyle={styles.groupsContainer}
              />
            ) : (
              <Text style={styles.emptyText}>No mutual groups.</Text>
            )}
          </View>

          <View style={{ height: getVertiPadding(20) }} />
        </ScrollView>
      )}
    </MainContainer>
  );
};

export default MemberProfile;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    backgroundColor: colors.white,
    marginHorizontal: -getHoriPadding(15),
    paddingHorizontal: getHoriPadding(15),
  },
  blockButton: {
    position: "absolute",
    right: getHoriPadding(15),
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  blockButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.red,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getVertiPadding(20),
  },
  profileSection: {
    alignItems: "center",
    marginBottom: getVertiPadding(30),
  },
  avatarContainer: {
    marginBottom: getVertiPadding(15),
  },
  avatar: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
  },
  avatarPlaceholder: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
    backgroundColor: colors.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: getFontSize(36),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  userName: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
  },
  section: {
    marginBottom: getVertiPadding(30),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(15),
  },
  interestsContainer: {
    paddingRight: getHoriPadding(16),
  },
  interestGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: getWidth(220),
    marginRight: getWidth(12),
    justifyContent: "space-between",
  },
  interestChip: {
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(8),
    borderRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    width: getWidth(104),
    marginBottom: getVertiPadding(8),
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeight(36),
    overflow: "hidden",
  },
  interestChipText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    textAlign: "center",
    flexShrink: 1,
  },
  groupsContainer: {
    paddingBottom: getVertiPadding(8),
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getVertiPadding(12),
    paddingHorizontal: getHoriPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupItemText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    flex: 1,
  },
  groupArrowIcon: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.black,
  },
  emptyText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
});
