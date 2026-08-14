import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import MainContainer from "@components/container/MainContainer";
import TopTab from "@components/TopTab";
import OptimizedImage from "@components/OptimizedImage";
import ButtonComp from "@components/ButtonComp";
import Loader from "@components/Loader";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getWidth,
  getHeight,
  getRadius,
  getFontSize,
  getHoriPadding,
  getVertiPadding,
} from "@utils/responsive";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import navigationStrings from "@navigation/navigationStrings";
import useStickyBottomInset, {
  useStickyScrollPadding,
} from "@hooks/useStickyBottomInset";
import icons from "@assets/icons";
import ForYouCard from "@components/appComponent/ForYouCard";
import {
  getGroupDetails,
  getTripBuddies,
  removeUserFromGroup,
  compareUsersInGroup,
  getGroupWishlisted,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import usePermissions from "@hooks/usePermissions";
import Contacts from "react-native-contacts";
import { getImageUrl } from "@api/apiClient";
import CrewTripCard from "@components/crew/CrewTripCard";
import {
  fetchCrewDetails,
  fetchCrewTrips,
  fetchGroupChatPreview,
  isReusableGroupsMockEnabled,
  subscribeReusableGroupsMock,
} from "@api/services/crewGroupsService";

// Dummy image URL for users without images
const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const normalizeUserId = (id) => (id == null ? "" : String(id));


const GroupDetails = () => {
  useGuestScreenGuard();
  const navigation = useNavigation();
  const route = useRoute();
  const bottomInset = useStickyBottomInset();
  const scrollPadding = useStickyScrollPadding();
  const { user } = useSelector((state) => state.auth);
  const { groupId, cityId, tripId: tripIdFromRoute } = route?.params || {};

  // Debug: Log route params
  useEffect(() => {
    console.log("GroupDetails: Route params:", route?.params);
    console.log("GroupDetails: groupId:", groupId);
  }, [route?.params, groupId]);

  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const { requestContactsPermission } = usePermissions();
  const [wishlisted, setWishlisted] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showLikedByModal, setShowLikedByModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const mockEnabled = isReusableGroupsMockEnabled();
  const crewFeature = true;
  const tabs = useMemo(
    () => (crewFeature ? ["Trips", "Members"] : ["Members", "Compare", "Wishlisted"]),
    [crewFeature]
  );
  const [activeTab, setActiveTab] = useState(() =>
    crewFeature ? "Trips" : "Members"
  );
  const [crewTrips, setCrewTrips] = useState([]);
  const [tripSegment, setTripSegment] = useState("active");
  const [chatPreview, setChatPreview] = useState(null);
  const [compareUser, setCompareUser] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const memberCount = useMemo(() => {
    if (!groupData) return 0;
    const ids = new Set();
    const creatorId = groupData.createdBy?._id || groupData.createdBy;
    if (creatorId) ids.add(String(creatorId));
    (groupData.addedUsers || []).forEach((u) => {
      const id = u?._id || u;
      if (id) ids.add(String(id));
    });
    return ids.size;
  }, [groupData]);

  const crewAvatarUri = useMemo(() => {
    const fallback =
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop";
    if (!groupData) return fallback;
    const fromGroup = getImageUrl(groupData.groupImage);
    return fromGroup || groupData.groupImage || fallback;
  }, [groupData]);

  // Always show selection list when switching to Compare tab
  useEffect(() => {
    if (activeTab === "Compare") {
      setCompareUser(null);
      setComparisonData(null);
    }
  }, [activeTab]);

  // Fetch comparison data when a user is selected for comparison
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (!compareUser || !groupId || !user) {
        return;
      }

      const currentUserId = user?._id || user?.id;
      const compareUserId = compareUser.id;

      if (!currentUserId || !compareUserId) {
        showToast("error", "Unable to get user information for comparison");
        return;
      }

      try {
        setComparisonLoading(true);
        // Note: userId1 is always the current user (you), userId2 is the user being compared
        const response = await compareUsersInGroup({
          groupId: groupId,
          userId1: currentUserId, // Always current user
          userId2: compareUserId, // User to compare with
        });

        if (response?.success && response?.data) {
          setComparisonData(response.data);
        } else {
          showToast(
            "error",
            response?.message || "Failed to fetch comparison data"
          );
          setComparisonData(null);
        }
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        showToast("error", error?.message || "Something went wrong");
        setComparisonData(null);
      } finally {
        setComparisonLoading(false);
      }
    };

    fetchComparisonData();
  }, [compareUser, groupId, user]);

  // Transform API response to members format
  const transformMembersData = (data) => {
    if (!data) return [];

    const currentUserId = normalizeUserId(user?._id || user?.id);
    const membersList = [];
    const avatarBgColors = [
      "#FFE5E5",
      "#FFF5C4",
      "#E5D5FF",
      "#E5F5FF",
      "#FFE5F5",
    ];

    // Add createdBy user
    if (data.createdBy) {
      const isCurrentUser =
        normalizeUserId(data.createdBy._id) === currentUserId;
      const createdByImage =
        data.createdBy.image || data.createdBy.avatar || "";
      membersList.push({
        id: data.createdBy._id,
        name: data.createdBy.name || "Unknown",
        isYou: isCurrentUser,
        avatar: getImageUrl(createdByImage) || DUMMY_USER_IMAGE,
        isOnline: data.createdBy.isOnline ?? false,
        isAdmin: true,
        avatarBg: avatarBgColors[0],
      });
    }

    // Add addedUsers
    if (data.addedUsers && Array.isArray(data.addedUsers)) {
      data.addedUsers.forEach((addedUser, index) => {
        // Skip if user is already added as createdBy
        if (addedUser._id === data.createdBy?._id) return;

        const isCurrentUser =
          normalizeUserId(addedUser._id) === currentUserId;
        const addedUserImage = addedUser.image || addedUser.avatar || "";
        membersList.push({
          id: addedUser._id,
          name: addedUser.name || "Unknown",
          isYou: isCurrentUser,
          avatar: getImageUrl(addedUserImage) || DUMMY_USER_IMAGE,
          isOnline: addedUser.isOnline ?? false,
          isAdmin: false,
          avatarBg: avatarBgColors[(index + 1) % avatarBgColors.length],
        });
      });
    }

    return membersList;
  };

  // Fetch group details on mount
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        console.log("GroupDetails: No groupId provided");
        return;
      }

      try {
        console.log(
          "GroupDetails: Fetching group details for groupId:",
          groupId
        );
        setLoading(true);
        const response = await fetchCrewDetails(groupId);
        console.log("GroupDetails: API response:", response);
        if (response?.success && response?.data) {
          setGroupData(response.data);
        } else {
          showToast(
            "error",
            response?.message || "Failed to fetch group details"
          );
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        showToast("error", error?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  useEffect(() => {
    const loadChatPreview = async () => {
      if (!groupId) return;
      const res = await fetchGroupChatPreview(groupId);
      setChatPreview(res?.data?.preview || null);
    };
    loadChatPreview();
  }, [groupId]);

  useEffect(() => {
    if (!mockEnabled || !groupId) return undefined;
    return subscribeReusableGroupsMock(() => {
      fetchCrewDetails(groupId).then((res) => {
        if (res?.success) setGroupData(res.data);
      });
      if (activeTab === "Trips") {
        fetchCrewTrips(groupId, { status: tripSegment }).then((res) => {
          if (res?.success) setCrewTrips(res.data || []);
        });
      }
    });
  }, [mockEnabled, groupId, activeTab, tripSegment]);

  useEffect(() => {
    const loadCrewTrips = async () => {
      if (!groupId || activeTab !== "Trips") return;
      try {
        setLoading(true);
        const res = await fetchCrewTrips(groupId, { status: tripSegment });
        if (res?.success) setCrewTrips(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    loadCrewTrips();
  }, [groupId, activeTab, tripSegment]);

  // Fetch wishlist data when Wishlisted tab is active
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!groupId || activeTab !== "Wishlisted") {
        return;
      }

      try {
        setWishlistLoading(true);
        const response = await getGroupWishlisted(groupId, cityId);

        if (response?.success && response?.data) {
          // API response structure: response.data.data.wishlisted_items
          const wishlistData =
            response.data?.wishlisted_items ||
            response.data?.data?.wishlisted_items ||
            [];
          setWishlisted(wishlistData);
        } else {
          showToast("error", response?.message || "Failed to fetch wishlist");
          setWishlisted([]);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        showToast("error", error?.message || "Something went wrong");
        setWishlisted([]);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [groupId, activeTab, cityId]);

  // Transform members data from groupData
  const members = groupData ? transformMembersData(groupData) : [];

  const handleRemoveMember = async (memberId) => {
    if (!groupId || !memberId) {
      showToast("error", "Missing required information");
      return;
    }

    try {
      setLoading(true);
      const response = await removeUserFromGroup({
        groupId: groupId,
        userIdToRemove: memberId,
      });

      if (response?.success) {
        // Update local state to reflect the removal
        if (groupData) {
          const updatedGroupData = {
            ...groupData,
            addedUsers:
              groupData.addedUsers?.filter((user) => user._id !== memberId) ||
              [],
          };
          setGroupData(updatedGroupData);
        }
        showToast(
          "success",
          response?.message || "Member removed successfully"
        );
      } else {
        showToast("error", response?.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member from group:", error);
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    const currentUserId = normalizeUserId(user?._id || user?.id);
    const isGroupCreator =
      normalizeUserId(groupData?.createdBy?._id) === currentUserId;

    if (!groupId || !currentUserId) {
      showToast("error", "Missing required information");
      return;
    }

    if (isGroupCreator) {
      showToast(
        "error",
        "Group creators cannot leave. Transfer ownership or delete the group."
      );
      return;
    }

    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await removeUserFromGroup({
                groupId,
                userIdToRemove: currentUserId,
              });

              if (response?.success) {
                showToast(
                  "success",
                  response?.message || "You have left the group"
                );
                navigation.navigate(navigationStrings.BOTTOM_TAB, {
                  screen: navigationStrings.GROUP,
                  params: { screen: navigationStrings.GROUP },
                });
              } else {
                showToast("error", response?.message || "Failed to leave group");
              }
            } catch (error) {
              console.error("Error leaving group:", error);
              showToast("error", error?.message || "Something went wrong");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleInviteParticipants = async () => {
    try {
      const permissionGranted = await requestContactsPermission();
      if (permissionGranted) {
        // Fetch contacts after permission is granted
        try {
          const contacts = await Contacts.getAll();
          const phoneNumbers = contacts
            .flatMap((contact) => contact.phoneNumbers || [])
            .map((phone) => phone.number)
            .filter((phone) => phone && phone.trim() !== "") // Filter out empty phone numbers
            .map((phone) => phone.replace(/[()\s-]/g, "")); // Remove parentheses, spaces, and dashes (preserves + sign)

          console.log("📱 Phone Numbers Array:", phoneNumbers);
          if (phoneNumbers.length > 0) {
            try {
              setLoading(true);
              const response = await getTripBuddies({
                contacts: phoneNumbers,
              });
              navigation.navigate(navigationStrings.ADD_TO_TRIP, {
                groupId: groupId,
                selectedBuddyPhones: response?.data,
              });
            } catch (apiError) {
              console.error("Error calling getTripBuddies:", apiError);
              showToast(
                "error",
                apiError?.message || "Failed to fetch trip buddies"
              );
            } finally {
              setLoading(false);
            }
          }
        } catch (contactsError) {
          console.error("Error fetching contacts:", contactsError);
        }
      } else {
        showToast(
          "error",
          "Contacts permission is required to add participants"
        );
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      showToast("error", "Failed to request contacts permission");
    }
  };

  const handleChat = () => {
    if (!groupId) {
      console.warn("GroupDetails: groupId is missing, cannot navigate to Chat");
      return;
    }
    const tripId =
      groupData?.tripId ||
      groupData?.trip_id ||
      tripIdFromRoute ||
      null;
    if (!tripId) {
      showToast("error", "Trip not found for this group. Cannot open chat AI.");
    }
    navigation.navigate(navigationStrings.CHAT, { groupId, tripId });
  };

  const renderMemberItem = ({ item }) => {
    const currentUserId = user?._id || user?.id;
    const isCurrentUserAdmin = groupData?.createdBy?._id === currentUserId;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberLeft}>
          <View
            style={[styles.avatarContainer, { backgroundColor: item.avatarBg }]}
          >
            <OptimizedImage
              source={{ uri: item.avatar || DUMMY_USER_IMAGE }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: item.isOnline ? colors.green : colors.red },
              ]}
            />
          </View>
          <Text style={styles.memberName}>
            {item.name} {item.isYou && "(You)"}
          </Text>
        </View>
        <View style={styles.memberRight}>
          {item.isAdmin ? (
            <TouchableOpacity style={styles.adminButton}>
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          ) : (
            isCurrentUserAdmin && (
              <TouchableOpacity
                onPress={() => handleRemoveMember(item.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  const renderMembersContent = () => (
    <View style={styles.membersContainer}>
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: scrollPadding },
        ]}
        ListFooterComponent={() => (
          <View style={styles.footerButtons}>
            <ButtonComp
              title={"Invite Participants"}
              onPress={handleInviteParticipants}
              disabled={false}
              containerStyle={styles.inviteButton}
              textStyle={styles.inviteButtonText}
            />
            <ButtonComp
              title="Leave the Group"
              onPress={handleLeaveGroup}
              containerStyle={styles.leaveButton}
              textStyle={styles.leaveButtonText}
            />
          </View>
        )}
      />
    </View>
  );

  const renderCompareSelection = () => {
    const currentUser = members.find((m) => m.isYou);
    return (
      <View style={styles.compareContainer}>
        <View style={styles.youRow}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: currentUser?.avatarBg || "#FFE5E5" },
            ]}
          >
            <OptimizedImage
              source={{ uri: currentUser?.avatar || DUMMY_USER_IMAGE }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: colors.green },
              ]}
            />
          </View>
          <Text style={styles.youName}>{currentUser?.name || "You"} (You)</Text>
        </View>
        <Text style={styles.vsHeading}>V/S</Text>
        <Text style={styles.compareHint}>
          Select a user you want to compare your itinerary.
        </Text>
        <FlatList
          data={members.filter((m) => !m.isYou)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.compareListContent}
          renderItem={({ item }) => (
            <View style={styles.compareRow}>
              <View style={styles.compareUserLeft}>
                <View
                  style={[
                    styles.avatarContainer,
                    { backgroundColor: item.avatarBg },
                  ]}
                >
                  <OptimizedImage
                    source={{ uri: item.avatar || DUMMY_USER_IMAGE }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: item.isOnline
                          ? colors.green
                          : colors.red,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.memberName}>{item.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.comparePillRight}
                activeOpacity={0.8}
                onPress={() => setCompareUser(item)}
              >
                <Text style={styles.comparePillText}>Compare</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  const renderComparisonDetails = () => {
    const currentUser = members.find((m) => m.isYou);
    const currentUserId = user?._id || user?.id;

    // Extract data from API response
    // Note: userId1 is always the current user (you), userId2 is the compare user
    // API response structure:
    // - common_activities: array of activities both users have
    // - uncommon_activities.added_by_user1: activities only user1 (current user) has
    // - uncommon_activities.added_by_user2: activities only user2 (compare user) has
    // - user1: user1 info (current user)
    // - user2: user2 info (compare user)
    const commonActivities = comparisonData?.common_activities || [];
    const currentUserActivities =
      comparisonData?.uncommon_activities?.added_by_user1 || [];
    const compareUserActivities =
      comparisonData?.uncommon_activities?.added_by_user2 || [];

    // Get user info from API response (more accurate than members list)
    const user1Info = comparisonData?.user1;
    const user2Info = comparisonData?.user2;

    // Use API response user info if available, otherwise fall back to members list
    const displayCurrentUser = user1Info || currentUser;
    const displayCompareUser = user2Info || compareUser;

    if (comparisonLoading) {
      return (
        <View style={styles.compareDetails}>
          <Loader />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.compareDetails}
        contentContainerStyle={styles.compareDetailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.compareHeader}>
          <View style={styles.compareHeaderSide}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: currentUser?.avatarBg || "#FFE5E5" },
              ]}
            >
              <OptimizedImage
                source={{
                  uri:
                    getImageUrl(displayCurrentUser?.image) ||
                    currentUser?.avatar ||
                    DUMMY_USER_IMAGE,
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: colors.green },
                ]}
              />
            </View>
            <Text style={styles.compareHeaderName}>
              {displayCurrentUser?.name || "You"}
            </Text>
          </View>
          <Text style={styles.vsHeader}>V/S</Text>
          <View style={styles.compareHeaderSide}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: compareUser?.avatarBg },
              ]}
            >
              <OptimizedImage
                source={{
                  uri:
                    getImageUrl(displayCompareUser?.image) ||
                    compareUser?.avatar ||
                    DUMMY_USER_IMAGE,
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: compareUser?.isOnline
                      ? colors.green
                      : colors.red,
                  },
                ]}
              />
            </View>
            <Text style={styles.compareHeaderName}>
              {displayCompareUser?.name || compareUser?.name}
            </Text>
          </View>
        </View>

        {/* Common Activities Section */}
        {commonActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Activities</Text>
            <Text style={styles.sectionNote}>
              {comparisonData?.note ||
                "Note: Dates and tickets may vary, it is recommended to review"}
            </Text>
            {commonActivities.map((activity, index) => (
              <View
                key={`common-${activity?._id || activity?.id || index}`}
                style={styles.cardRow}
              >
                {activity?.image ? (
                  <OptimizedImage
                    source={{ uri: getImageUrl(activity.image) }}
                    style={styles.cardThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cardThumb} />
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {activity?.name || activity?.title || "Activity"}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {activity?.date
                      ? `${new Date(activity.date).toLocaleDateString()} • `
                      : ""}
                    {activity?.price
                      ? `$${activity.price}`
                      : activity?.cost
                        ? `$${activity.cost}`
                        : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Uncommon Activities Section */}
        {(currentUserActivities.length > 0 ||
          compareUserActivities.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uncommon Activities</Text>
              <Text style={styles.sectionNote}>
                {comparisonData?.note ||
                  "Note: Dates and tickets may vary, it is recommended to review"}
              </Text>

              {/* Activities added by current user */}
              {currentUserActivities.length > 0 && (
                <>
                  <Text style={styles.subSectionTitle}>Added by You</Text>
                  {currentUserActivities.map((activity, index) => (
                    <View
                      key={`you-${activity?._id || activity?.id || index}`}
                      style={styles.cardRow}
                    >
                      {activity?.image ? (
                        <OptimizedImage
                          source={{ uri: getImageUrl(activity.image) }}
                          style={styles.cardThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.cardThumb} />
                      )}
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>
                          {activity?.name || activity?.title || "Activity"}
                        </Text>
                        <Text style={styles.cardMeta}>
                          {activity?.date
                            ? `${new Date(activity.date).toLocaleDateString()} • `
                            : ""}
                          {activity?.price
                            ? `$${activity.price}`
                            : activity?.cost
                              ? `$${activity.cost}`
                              : ""}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.removePill}>
                        <Text style={styles.removePillText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Activities added by compare user */}
              {compareUserActivities.length > 0 && (
                <>
                  <Text style={styles.subSectionTitle}>
                    Added by {displayCompareUser?.name || compareUser?.name}
                  </Text>
                  {compareUserActivities.map((activity, index) => (
                    <View
                      key={`compare-${activity?._id || activity?.id || index}`}
                      style={styles.cardRow}
                    >
                      {activity?.image ? (
                        <OptimizedImage
                          source={{ uri: getImageUrl(activity.image) }}
                          style={styles.cardThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.cardThumb} />
                      )}
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>
                          {activity?.name || activity?.title || "Activity"}
                        </Text>
                        <Text style={styles.cardMeta}>
                          {activity?.date
                            ? `${new Date(activity.date).toLocaleDateString()} • `
                            : ""}
                          {activity?.price
                            ? `$${activity.price}`
                            : activity?.cost
                              ? `$${activity.cost}`
                              : ""}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.addPill}>
                        <Text style={styles.addPillText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

        {/* Empty state */}
        {commonActivities.length === 0 &&
          currentUserActivities.length === 0 &&
          compareUserActivities.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No activities to compare
              </Text>
            </View>
          )}

        <View style={{ height: getHeight(120) }} />
      </ScrollView>
    );
  };

  const renderWishlistedItem = ({ item }) => {
    const likeCount = item?.like_count || 0;
    const activityImage = item?.image || "";

    const processedImage =
      activityImage && activityImage.startsWith("/")
        ? getImageUrl(activityImage)
        : activityImage || undefined;

    const cardItem = {
      id: item?.activity_id,
      name: item?.name || "Activity",
      image: processedImage,
      isLiked: item?.is_liked_by_current_user || false,
      like_count: likeCount,
      price: item?.price,
      currency: item?.currency,
      location: item?.location,
      city_name: item?.city_name,
      description: item?.description,
      duration: item?.duration,
      ...item, // Spread to include any other fields
    };

    return (
      <View style={styles.wishItem}>
        <ForYouCard
          item={cardItem}
          onPress={() =>
            navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
              eventData: item,
              selectedTrip: null,
            })
          }
        />
        <TouchableOpacity
          style={styles.likedRow}
          activeOpacity={0.7}
          onPress={() => {
            if (item?.liked_by_members && item.liked_by_members.length > 0) {
              setSelectedActivity(item);
              setShowLikedByModal(true);
            }
          }}
        >
          <Text style={styles.likedText}>
            Liked by {likeCount} {likeCount === 1 ? "member" : "members"}
          </Text>
          <Image
            source={icons.RIGHT_ICON}
            style={styles.likedArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderWishlistedContent = () => {
    if (wishlistLoading) {
      return (
        <View style={styles.wishContainer}>
          <Loader />
        </View>
      );
    }

    if (wishlisted.length === 0) {
      return (
        <View style={styles.wishContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No wishlisted activities</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.wishContainer}>
        <FlatList
          data={wishlisted}
          keyExtractor={(it, idx) =>
            String(it?.activity_id || it?._id || it?.id || idx)
          }
          renderItem={renderWishlistedItem}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: getHoriPadding(4) }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.wishListContent,
            { paddingBottom: scrollPadding + getHeight(24) },
          ]}
        />
      </View>
    );
  };

  const handleCrewTripPress = (trip) => {
    const status = trip.participationStatus;
    if (status === "joined" && trip.memberTripId) {
      navigation.navigate(navigationStrings.TRIP_DETAILS, {
        tripId: trip.memberTripId,
      });
    } else {
      navigation.navigate(navigationStrings.TRIP_BRIEF, {
        canonicalTripId: trip._id,
      });
    }
  };

  const handleCreateCrewTrip = () => {
    if (!groupId) {
      showToast("error", "Missing group. Open the crew again and try.");
      return;
    }
    navigation.navigate(navigationStrings.CREATE_TRIP, {
      groupId,
      groupName: groupData?.groupName,
    });
  };

  const renderTripsContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.tripsContainer,
        { paddingBottom: scrollPadding + getHeight(100) },
      ]}
    >
      <View style={styles.tripsToolbar}>
        <View style={styles.segmentRow}>
          {["active", "past"].map((seg) => (
            <TouchableOpacity
              key={seg}
              style={[
                styles.segmentBtn,
                tripSegment === seg && styles.segmentBtnActive,
              ]}
              onPress={() => setTripSegment(seg)}
            >
              <Text
                style={[
                  styles.segmentText,
                  tripSegment === seg && styles.segmentTextActive,
                ]}
              >
                {seg === "active" ? "Active" : "Past"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.createTripBtn}
          onPress={handleCreateCrewTrip}
          activeOpacity={0.85}
        >
          <Text style={styles.createTripText}>Create Trip</Text>
        </TouchableOpacity>
      </View>

      {crewTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No {tripSegment} trips in this crew
          </Text>
        </View>
      ) : (
        crewTrips.map((trip) => (
          <CrewTripCard
            key={trip._id}
            trip={trip}
            onPress={handleCrewTripPress}
          />
        ))
      )}
    </ScrollView>
  );

  return (
    <MainContainer>
      <View style={styles.crewHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.crewHeaderBackBtn}
          activeOpacity={0.7}
        >
          <Image
            tintColor={colors.black}
            source={icons.BACK_ICON}
            style={styles.crewHeaderBackIcon}
          />
        </TouchableOpacity>
        <OptimizedImage
          source={{ uri: crewAvatarUri }}
          style={styles.crewHeaderAvatar}
          resizeMode="cover"
        />
        <View style={styles.crewHeaderText}>
          <Text style={styles.crewHeaderName} numberOfLines={1}>
            {groupData?.groupName || "Crew"}
          </Text>
          <Text style={styles.crewHeaderMeta}>
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
      <TopTab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content per tab */}
      {loading ? (
        <Loader />
      ) : (
        <View style={styles.contentContainer}>
          {activeTab === "Trips" && renderTripsContent()}
          {activeTab === "Members" && renderMembersContent()}
          {!mockEnabled && activeTab === "Compare" &&
            (compareUser
              ? renderComparisonDetails()
              : renderCompareSelection())}
          {!mockEnabled && activeTab === "Wishlisted" && renderWishlistedContent()}
          {activeTab === "Settings" && (
            <Text style={styles.contentText}>Settings content</Text>
          )}
        </View>
      )}

      {!loading &&
        (activeTab === "Members" ||
          activeTab === "Trips" ||
          (!mockEnabled &&
            (activeTab === "Compare" || activeTab === "Wishlisted"))) && (
          <View style={[styles.fixedChatContainer, { bottom: bottomInset }]}>
            <TouchableOpacity
              style={styles.chatBar}
              onPress={handleChat}
              activeOpacity={0.85}
            >
              <View style={styles.chatBarIconWrap}>
                <Image source={icons.CHAT_ICON} style={styles.chatBarIcon} />
              </View>
              <View style={styles.chatBarText}>
                <Text style={styles.chatBarTitle}>Group Chat</Text>
                {chatPreview ? (
                  <Text style={styles.chatBarPreview} numberOfLines={1}>
                    {chatPreview}
                  </Text>
                ) : null}
              </View>
              <View style={styles.chatBarChevronWrap}>
                <Image
                  source={icons.RIGHT_ICON}
                  style={styles.chatBarChevron}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

      {/* Liked By Modal */}
      <Modal
        visible={showLikedByModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLikedByModal(false)}
      >
        <View style={styles.modalOverlay}>
          {(() => {
            const screenHeight = Dimensions.get("window").height;
            const memberCount = selectedActivity?.liked_by_members?.length || 0;
            // Calculate height: base height + (member count * item height)
            // Each member item is approximately 76px (12px padding * 2 + 50px avatar + 2px spacing)
            const headerHeight = 60; // Approximate header height
            const itemHeight = 76;
            const calculatedHeight = headerHeight + memberCount * itemHeight;
            const minHeight = screenHeight * 0.4;
            const maxHeight = screenHeight * 0.7;
            const modalHeight = Math.min(
              Math.max(calculatedHeight, minHeight),
              maxHeight
            );

            return (
              <View
                style={[
                  styles.likedByModal,
                  {
                    height: modalHeight,
                  },
                ]}
              >
                <View style={styles.likedByModalHeader}>
                  <Text style={styles.likedByModalTitle}>Liked by</Text>
                  <TouchableOpacity
                    style={styles.likedByModalClose}
                    onPress={() => {
                      setShowLikedByModal(false);
                      setSelectedActivity(null);
                    }}
                  >
                    <Text style={styles.likedByModalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={selectedActivity?.liked_by_members || []}
                  keyExtractor={(member, index) =>
                    String(member?._id || member?.id || index)
                  }
                  renderItem={({ item: member }) => {
                    const memberImage = member?.image || "";
                    const avatarBgColors = [
                      "#FFE5E5",
                      "#FFF5C4",
                      "#E5D5FF",
                      "#E5F5FF",
                      "#FFE5F5",
                    ];
                    const avatarBg =
                      avatarBgColors[
                      (member?._id?.length || 0) % avatarBgColors.length
                      ];

                    return (
                      <View style={styles.likedByMemberItem}>
                        <View
                          style={[
                            styles.likedByAvatarContainer,
                            { backgroundColor: avatarBg },
                          ]}
                        >
                          <OptimizedImage
                            source={{
                              uri: getImageUrl(memberImage) || DUMMY_USER_IMAGE,
                            }}
                            style={styles.likedByAvatar}
                            resizeMode="cover"
                          />
                          <View
                            style={[
                              styles.likedByStatusIndicator,
                              {
                                backgroundColor: member?.isOnline
                                  ? colors.green
                                  : colors.red,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.likedByMemberName}>
                          {member?.name || "Unknown"}
                        </Text>
                      </View>
                    );
                  }}
                  contentContainerStyle={styles.likedByListContent}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            );
          })()}
        </View>
      </Modal>
    </MainContainer>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  membersContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: getHeight(8),
  },
  footerButtons: {
    paddingTop: getHeight(8),
  },
  inviteButton: {
    marginTop: getHeight(16),
    marginBottom: getHeight(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: getRadius(12),
  },
  inviteButtonText: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
  },
  leaveButton: {
    marginBottom: getHeight(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: getRadius(12),
  },
  leaveButtonText: {
    color: colors.red,
    fontFamily: fonts.RobotoMedium,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getHeight(12),
    paddingHorizontal: getHoriPadding(4),
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getWidth(20),
    marginRight: getWidth(12),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatar: {
    width: getWidth(38),
    height: getWidth(38),
    borderRadius: getWidth(19),
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: getWidth(12),
    height: getWidth(12),
    borderRadius: getWidth(6),
    borderWidth: 2,
    borderColor: colors.white,
  },
  memberName: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    // flex: 1,
  },
  memberRight: {
    alignItems: "flex-end",
  },
  adminButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(16),
  },
  adminButtonText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  removeButton: {
    paddingVertical: getVertiPadding(4),
    paddingHorizontal: getHoriPadding(8),
  },
  removeText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.red,
  },
  inviteButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: getVertiPadding(14),
    borderRadius: getRadius(12),
    alignItems: "center",
    justifyContent: "center",
    marginTop: getHeight(16),
    marginBottom: getHeight(12),
  },
  inviteButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  chatButton: {
    backgroundColor: colors.secondary,
    paddingVertical: getVertiPadding(14),
    borderRadius: getRadius(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeight(16),
  },
  chatButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  fixedChatContainer: {
    position: "absolute",
    left: getHoriPadding(16),
    right: getHoriPadding(16),
    zIndex: 10,
  },
  wishContainer: {
    flex: 1,
  },
  wishListContent: {
    paddingVertical: getHeight(8),
  },
  wishItem: {
    flex: 1,
    marginBottom: getHeight(12),
  },
  likedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getHoriPadding(8),
    marginTop: getHeight(4),
  },
  likedText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  likedArrow: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.black,
  },
  compareContainer: {
    flex: 1,
  },
  vsHeading: {
    fontSize: getFontSize(36),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
    marginTop: getHeight(12),
    marginBottom: getHeight(8),
  },
  compareHint: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginTop: getHeight(8),
    marginBottom: getHeight(16),
  },
  compareListContent: {
    paddingBottom: getHeight(120),
    // paddingRight: getHoriPadding(16),
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getHeight(14),
    paddingHorizontal: getHoriPadding(4),
  },
  compareUserLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightCapsule: {
    width: getWidth(36),
    height: getHeight(42),
    borderRadius: getRadius(20),
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcon: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.black,
  },
  comparePillRight: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(18),
    paddingVertical: getVertiPadding(10),
    borderRadius: getRadius(20),
    minWidth: getWidth(110),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  comparePillText: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(14),
  },
  youRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(10),
    marginTop: getHeight(12),
  },
  youName: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  compareDetails: {
    flex: 1,
  },
  compareDetailsContent: {
    paddingBottom: getHeight(16),
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: getHeight(8),
    marginBottom: getHeight(12),
  },
  compareHeaderSide: {
    alignItems: "center",
    flexDirection: "row",
  },
  compareHeaderName: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  vsHeader: {
    fontSize: getFontSize(22),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  section: {
    marginBottom: getHeight(16),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  sectionNote: {
    fontSize: getFontSize(10),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginBottom: getHeight(8),
  },
  subSectionTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginVertical: getHeight(8),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: getHoriPadding(10),
    borderRadius: getRadius(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: getHeight(10),
  },
  cardThumb: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getRadius(8),
    backgroundColor: colors.lightGray,
    marginRight: getWidth(10),
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  cardMeta: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    marginTop: getHeight(2),
  },
  removePill: {
    borderWidth: 1,
    borderColor: colors.red,
    paddingHorizontal: getHoriPadding(14),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
  },
  removePillText: {
    color: colors.red,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(12),
  },
  addPill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(18),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
  },
  addPillText: {
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(12),
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getHeight(40),
  },
  emptyStateText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  likedByModal: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopLeftRadius: getRadius(20),
    borderTopRightRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  likedByModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  likedByModalTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  likedByModalClose: {
    padding: getHoriPadding(4),
  },
  likedByModalCloseText: {
    fontSize: getFontSize(20),
    color: colors.black,
    fontWeight: "bold",
  },
  likedByListContent: {
    paddingVertical: getHeight(8),
  },
  likedByMemberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(16),
    paddingVertical: getVertiPadding(12),
  },
  likedByAvatarContainer: {
    width: getWidth(50),
    height: getWidth(50),
    borderRadius: getWidth(25),
    marginRight: getWidth(12),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  likedByAvatar: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getWidth(24),
  },
  likedByStatusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: getWidth(14),
    height: getWidth(14),
    borderRadius: getWidth(7),
    borderWidth: 2,
    borderColor: colors.white,
  },
  likedByMemberName: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    flex: 1,
  },
  tripsContainer: {
    paddingHorizontal: getHoriPadding(16),
    paddingTop: getHeight(8),
  },
  tripsToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getHeight(14),
    gap: getWidth(10),
  },
  segmentRow: {
    flexDirection: "row",
    gap: getWidth(8),
    flexShrink: 1,
  },
  segmentBtn: {
    paddingVertical: getHeight(8),
    paddingHorizontal: getWidth(16),
    borderRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  segmentBtnActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  segmentText: {
    fontFamily: fonts.RobotoMedium,
    fontSize: getFontSize(13),
    color: colors.lightText,
  },
  segmentTextActive: {
    color: colors.black,
  },
  createTripBtn: {
    backgroundColor: colors.black,
    borderRadius: getRadius(22),
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(14),
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(6),
  },
  createTripIcon: {
    width: getWidth(14),
    height: getWidth(14),
    tintColor: colors.white,
  },
  createTripText: {
    color: colors.white,
    fontFamily: fonts.RobotoBold,
    fontSize: getFontSize(13),
  },
  crewHeader: {
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: getVertiPadding(12),
    paddingBottom: getVertiPadding(12),
    paddingHorizontal: getHoriPadding(12),
    gap: getWidth(10),
  },
  crewHeaderBackBtn: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  crewHeaderBackIcon: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
  },
  crewHeaderAvatar: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getWidth(24),
    backgroundColor: colors.lightGray,
    flexShrink: 0,
  },
  crewHeaderText: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  crewHeaderName: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  crewHeaderMeta: {
    marginTop: getHeight(2),
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  chatBar: {
    backgroundColor: colors.secondary,
    borderRadius: getRadius(16),
    paddingVertical: getVertiPadding(14),
    paddingHorizontal: getHoriPadding(16),
    flexDirection: "row",
    alignItems: "center",
    gap: getWidth(12),
    overflow: "visible",
  },
  chatBarIconWrap: {
    width: getWidth(40),
    height: getWidth(40),
    borderRadius: getRadius(12),
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chatBarIcon: {
    width: getWidth(22),
    height: getWidth(22),
  },
  chatBarText: {
    flex: 1,
    minWidth: 0,
  },
  chatBarTitle: {
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  chatBarPreview: {
    marginTop: getHeight(2),
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  chatBarChevronWrap: {
    width: getWidth(32),
    height: getHeight(32),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chatBarChevron: {
    width: getWidth(20),
    height: getHeight(20),
    resizeMode: "contain",
  },
});
