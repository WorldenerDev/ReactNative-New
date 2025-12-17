import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
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

// Dummy image URL for users without images
const DUMMY_USER_IMAGE =
  "https://ui-avatars.com/api/?name=User&background=random&size=200";

const GroupDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useSelector((state) => state.auth);
  const { groupId } = route?.params || {};

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
  const tabs = ["Members", "Compare", "Wishlisted", "Settings"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [compareUser, setCompareUser] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

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

    const currentUserId = user?._id || user?.id;
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
      const isCurrentUser = data.createdBy._id === currentUserId;
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

        const isCurrentUser = addedUser._id === currentUserId;
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
        const response = await getGroupDetails(groupId);
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

  // Fetch wishlist data when Wishlisted tab is active
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!groupId || activeTab !== "Wishlisted") {
        return;
      }

      try {
        setWishlistLoading(true);
        const response = await getGroupWishlisted(groupId);

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
  }, [groupId, activeTab]);

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
    navigation.navigate(navigationStrings.CHAT, { groupId });
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
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.footerButtons}>
            <ButtonComp
              title={"Invite Participants"}
              onPress={handleInviteParticipants}
              disabled={false}
              containerStyle={{
                marginTop: getHeight(16),
                marginBottom: getHeight(12),
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.lightGray,
                borderRadius: getRadius(12),
              }}
              textStyle={{
                color: colors.black,
                fontFamily: fonts.RobotoMedium,
              }}
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
    // API response structure:
    // - activity_id: unique identifier
    // - name: activity name
    // - image: full URL or empty string
    // - like_count: number of likes
    // - is_liked_by_current_user: boolean
    // - liked_by_members: array of user objects
    // - price: price value
    // - currency: currency code

    const likeCount = item?.like_count || 0;
    const activityImage = item?.image || "";

    // Ensure item has proper structure for ForYouCard
    // ForYouCard expects: id, name, image, isLiked, like_count
    // API returns full URLs for images, but some might be empty strings
    // Only use getImageUrl if it's a relative path (starts with /)
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
      // Include additional fields that might be useful
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
        <ForYouCard item={cardItem} onPress={() => {}} />
        <View style={styles.likedRow}>
          <Text style={styles.likedText}>
            Liked by {likeCount} {likeCount === 1 ? "member" : "members"}
          </Text>
          <Image
            source={icons.RIGHT_ICON}
            style={styles.likedArrow}
            resizeMode="contain"
          />
        </View>
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
          contentContainerStyle={styles.wishListContent}
        />
      </View>
    );
  };

  return (
    <MainContainer>
      <Header title="Group Details" showBack={true} />
      <TopTab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content per tab */}
      {loading ? (
        <Loader />
      ) : (
        <View style={styles.contentContainer}>
          {activeTab === "Members" && renderMembersContent()}
          {activeTab === "Compare" &&
            (compareUser
              ? renderComparisonDetails()
              : renderCompareSelection())}
          {activeTab === "Wishlisted" && renderWishlistedContent()}
          {activeTab === "Settings" && (
            <Text style={styles.contentText}>Settings content</Text>
          )}
        </View>
      )}

      {/* Fixed bottom Chat button - only on Members tab */}
      {!loading &&
        (activeTab === "Members" ||
          activeTab === "Compare" ||
          activeTab === "Wishlisted") && (
          <View style={styles.fixedChatContainer}>
            <ButtonComp
              title={"Chat"}
              onPress={handleChat}
              disabled={false}
              containerStyle={{
                backgroundColor: colors.secondary,
                borderRadius: getRadius(30),
              }}
              textStyle={{ color: colors.black, fontFamily: fonts.RobotoBold }}
            />
          </View>
        )}
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
    paddingBottom: getHeight(100),
  },
  footerButtons: {
    paddingTop: getHeight(8),
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
    bottom: getHeight(36),
    zIndex: 10,
  },
  wishContainer: {
    flex: 1,
  },
  wishListContent: {
    paddingVertical: getHeight(8),
    paddingBottom: getHeight(120),
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
});
