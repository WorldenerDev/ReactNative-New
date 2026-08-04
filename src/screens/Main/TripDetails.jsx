import { checkoutTrip, getTripBuddies } from "@api/services/mainServices";
import {
  fetchTripDetailsWithMock,
  isReusableGroupsMockEnabled,
  optInToTrip,
  optOutOfTrip,
} from "@api/services/crewGroupsService";
import TopTab from "@components/TopTab";
import TripCompareTab from "./tripDetails/TripCompareTab";
import TripWishlistTab from "./tripDetails/TripWishlistTab";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import OptimizedImage from "@components/OptimizedImage";
import usePermissions from "@hooks/usePermissions";
import navigationStrings from "@navigation/navigationStrings";
import {
  getHeight,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import {
  getActivityDateKey,
  getTripCityId,
  getTripId,
  normalizeTripDetails,
  toSelectedTripOption,
} from "@utils/tripHelpers";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Contacts from "react-native-contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CHECKOUT_BUTTON_HEIGHT = 16;
const BOTTOM_MARGIN = 20;
const EXTRA_SCROLL_PADDING = 10;

const TripDetails = ({ navigation, route }) => {
  const { trip, tripId } = route?.params || {};
  const [tripData, setTripData] = useState(() =>
    trip ? normalizeTripDetails(trip) : null
  );
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState("Itinerary");
  const showCrewTabs = Boolean(tripData?.groupId);
  const { requestContactsPermission } = usePermissions();
  const insets = useSafeAreaInsets();
  const scrollContentBottomPadding =
    insets.bottom + getHeight(BOTTOM_MARGIN) + CHECKOUT_BUTTON_HEIGHT + getHeight(EXTRA_SCROLL_PADDING);

  const currentTripId = tripId || getTripId(trip);

  const fetchTripDetails = useCallback(async () => {
    if (!currentTripId) {
      showToast("error", "Trip ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchTripDetailsWithMock(currentTripId);
      const normalized = normalizeTripDetails(response);

      if (normalized) {
        setTripData(normalized);
      } else if (response?.success === false) {
        showToast("error", response?.message || "Failed to fetch trip details");
      } else {
        showToast("error", "Failed to fetch trip details");
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
      showToast("error", err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentTripId]);

  useFocusEffect(
    useCallback(() => {
      fetchTripDetails();
    }, [fetchTripDetails])
  );

  const handleEditPress = () => {
    navigation.navigate(navigationStrings.EDIT_TRIP, { trip: tripData });
  };

  const handleViewGroup = () => {
    if (!tripData?.groupId) {
      showToast("error", "No crew linked to this trip");
      return;
    }
    navigation.navigate(navigationStrings.GROUP_DETAILS, {
      groupId: tripData.groupId,
    });
  };

  const handleOptOut = async () => {
    const canonicalId = tripData?.canonicalTripId || tripData?._id;
    if (!canonicalId) return;
    try {
      setLoading(true);
      await optOutOfTrip(canonicalId);
      showToast("success", "You opted out of this trip");
      navigation.goBack();
    } catch (error) {
      showToast("error", error?.message || "Failed to opt out");
    } finally {
      setLoading(false);
    }
  };

  const handleRejoinTrip = async () => {
    const canonicalId = tripData?.canonicalTripId || tripData?._id;
    if (!canonicalId) return;
    try {
      setLoading(true);
      const res = await optInToTrip(canonicalId);
      if (res?.success) {
        showToast("success", "Welcome back!");
        fetchTripDetails();
      }
    } catch (error) {
      showToast("error", error?.message || "Failed to rejoin");
    } finally {
      setLoading(false);
    }
  };

  const handleExploreMore = () => {
    if (!tripData) return;

    const cityId = getTripCityId(tripData);
    const selectedTrip = toSelectedTripOption(tripData);

    if (cityId && selectedTrip) {
      navigation.navigate(navigationStrings.CITY_DETAIL, {
        cityData: {
          city_id: cityId,
          name:
            tripData?.city?.name ||
            tripData?.name ||
            tripData?.destination ||
            "City",
          image: tripData?.image || tripData?.city?.image || null,
        },
        selectedTripId: currentTripId,
        selectedTrip,
      });
    } else {
      showToast("error", "City information not available");
    }
  };

  const handleInviteParticipants = async () => {
    if (!tripData?.groupId) {
      showToast("error", "Group ID not found");
      return;
    }

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

          if (phoneNumbers.length > 0) {
            try {
              setLoading(true);
              const response = await getTripBuddies({
                contacts: phoneNumbers,
              });
              const cityName = tripData?.city?.name || tripData?.destination || "Trip";
              navigation.navigate(navigationStrings.ADD_TO_TRIP, {
                name: cityName,
                groupId: tripData.groupId,
                selectedBuddyPhones: response?.data,
              });
            } catch (apiError) {
              console.error("Error calling getTripBuddies:", apiError);
              showToast("error", apiError?.message || "Failed to fetch trip buddies");
            } finally {
              setLoading(false);
            }
          }
        } catch (contactsError) {
          console.error("Error fetching contacts:", contactsError);
        }
      } else {
        showToast("error", "Contacts permission is required to add participants");
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      showToast("error", "Failed to request contacts permission");
    }
  };

  const handleActivityPress = () => {
    // TODO: Navigate to activity details
  };

  const handleCheckout = async () => {
    if (!tripData?._id) {
      showToast("error", "Trip ID not found");
      return;
    }

    try {
      setLoading(true);
      const checkoutData = {
        trip_id: tripData?._id,
      };

      const response = await checkoutTrip(checkoutData);

      if (response?.success) {
        navigation.navigate(navigationStrings.CART, {
          tripId: tripData?._id,
        });
      } else {
        showToast("error", response?.message);
      }
    } catch (error) {
      showToast("error", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarView = () => {
    navigation.navigate(navigationStrings.CALENDAR_VIEW_TRIP_DETAIL, {
      trip: tripData,
      tripId: currentTripId,
    });
  };

  const formatGroupDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Group activities by date
  const groupActivitiesByDate = () => {
    if (!tripData?.activities) return {};

    const activities = tripData.activities;
    const grouped = {};

    activities.forEach((activity) => {
      const activityDate = getActivityDateKey(activity);
      if (!grouped[activityDate]) {
        grouped[activityDate] = [];
      }
      grouped[activityDate].push(activity);
    });
    return grouped;
  };

  const groupedActivities = groupActivitiesByDate();
  const activityDates = Object.keys(groupedActivities).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const renderItineraryContent = () => (
    <View style={styles.activitiesContainer}>
      <View style={styles.activitiesHeader}>
        <Text style={styles.activitiesTitle}>Activities</Text>
        <View style={styles.activitiesHeaderIcons}>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleCheckout}
          >
            <Image
              source={imagePath.CART_ICON}
              style={styles.calendarIcon1}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleCalendarView}
          >
            <Image
              source={imagePath.CALENDER_ICON}
              style={styles.calendarIcon1}
            />
          </TouchableOpacity>
        </View>
      </View>

      {activityDates.length > 0 ? (
        <FlatList
          data={activityDates}
          keyExtractor={(item, index) => `date-${index}-${item}`}
          showsVerticalScrollIndicator={false}
          style={styles.activitiesList}
          contentContainerStyle={[
            styles.activitiesListContent,
            { paddingBottom: scrollContentBottomPadding },
          ]}
          renderItem={({ item: date, index: dateIndex }) => {
            const activitiesForDate = groupedActivities[date] || [];

            return (
              <View style={styles.dateGroup} key={`date-${dateIndex}-${date}`}>
                <Text style={styles.dateHeader}>
                  {formatGroupDate(date)}
                </Text>
                {activitiesForDate.map((activity, index) => (
                  <TouchableOpacity
                    key={`activity-${dateIndex}-${index}-${activity.product_id || activity.id || activity._id || index}`}
                    style={styles.activityCard}
                    onPress={handleActivityPress}
                  >
                    <OptimizedImage
                      source={{
                        uri:
                          activity.image ||
                          activity.product_image ||
                          activity.thumbnail ||
                          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&w=150&q=80",
                      }}
                      style={styles.activityImage}
                      resizeMode="cover"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>
                        {activity.title ||
                          activity.name ||
                          activity.product_name ||
                          "Activity"}
                      </Text>
                      <Text style={styles.activityDetails}>
                        {formatActivityDate(
                          activity.date || activity.time || "TBD"
                        )}{" "}
                        • Qty: {activity.quantity || 1} • $
                        {activity.total_price ||
                          activity.price ||
                          activity.retail_price ||
                          0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.noActivitiesContainer}>
          <Text style={styles.noActivitiesText}>No activities found</Text>
        </View>
      )}
    </View>
  );

  return (
    <MainContainer loader={loading}>
      <Header
        title="Trip Details"
        rightIconImage={imagePath.THREE_DOTS_ICON}
        onRightIconPress={handleEditPress}
        showBack={true}
      />
      <View style={styles.contentContainer}>
        {tripData && (
          <>
            <View style={styles.tripCard}>
              {/* Hero Image */}
              <View style={styles.imageContainer}>
                <OptimizedImage
                  source={{
                    uri:
                      tripData?.image ||
                      tripData?.city?.image ||
                      "https://images.unsplash.com/photo-1513639766991-4c7b0b0b0b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                  }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Destination and Status Row */}
                <View style={styles.destinationRow}>
                  <View style={styles.destinationInfo}>
                    <Image
                      source={imagePath.LOCATION_PIN}
                      style={styles.pinIcon}
                    />
                    <Text style={styles.destinationText}>
                      {tripData?.destination ||
                        tripData?.name ||
                        tripData?.city?.name ||
                        tripData?.city_id?.name ||
                        "Unknown Destination"}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Image
                      source={imagePath.CHECK_ICON}
                      style={styles.statusIndicator}
                    />
                    <Text style={styles.statusText}>
                      {tripData?.tripStatus || ""}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={styles.datesContainer}>
                  <Image
                    source={imagePath.CALENDER_ICON}
                    style={styles.calendarIcon}
                  />
                  <Text style={styles.datesText}>
                    {tripData?.startDate ||
                      tripData?.start_at?.slice(0, 10) ||
                      "TBD"}{" "}
                    -{" "}
                    {tripData?.endDate ||
                      tripData?.end_at?.slice(0, 10) ||
                      "TBD"}
                  </Text>
                </View>

                {/* Participants Section */}
                <View style={styles.participantsSection}>
                  {tripData?.groupId ? (
                    <View style={styles.participantsBlock}>
                      <View style={styles.participantsInfo}>
                        <Text style={styles.participantsCount}>
                          {tripData?.groupName
                            ? `${tripData.groupName} · `
                            : ""}
                          {tripData?.participants || 0} joined
                        </Text>
                      </View>
                      <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                          style={styles.viewGroupButton}
                          onPress={handleViewGroup}
                        >
                          <Text style={styles.viewGroupText}>View Group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.exploreMoreButton}
                          onPress={handleExploreMore}
                        >
                          <Text style={styles.exploreMoreButtonText}>
                            Explore More
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (tripData?.participants ||
                    tripData?.participantsList?.length ||
                    0) > 0 ? (
                    // Show participants info, View Group, and Explore More
                    <View style={styles.participantsBlock}>
                      <View style={styles.participantsInfo}>
                        <View style={styles.avatarContainer}>
                          {(tripData?.participantsList || []).map(
                            (participant, index) => (
                              <View
                                key={`participant-${index}-${participant.id || participant._id || index
                                  }`}
                                style={[
                                  styles.avatar,
                                  {
                                    zIndex:
                                      (tripData?.participantsList || [])
                                        .length - index,
                                  },
                                ]}
                              >
                                <OptimizedImage
                                  source={{
                                    uri:
                                      participant.avatar ||
                                      participant.profileImage,
                                  }}
                                  style={styles.avatarImage}
                                  resizeMode="cover"
                                />
                              </View>
                            )
                          )}
                          {(tripData?.participants ||
                            tripData?.participantsList?.length ||
                            0) > 3 && (
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                  +
                                  {(tripData?.participants ||
                                    tripData?.participantsList?.length ||
                                    0) - 3}
                                </Text>
                              </View>
                            )}
                        </View>
                        <Text style={styles.participantsCount}>
                          {tripData?.participants ||
                            tripData?.participantsList?.length ||
                            0}{" "}
                          people
                        </Text>
                      </View>
                      <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                          style={styles.viewGroupButton}
                          onPress={handleViewGroup}
                        >
                          <Text style={styles.viewGroupText}>View Group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.exploreMoreButton}
                          onPress={handleExploreMore}
                        >
                          <Text style={styles.exploreMoreButtonText}>
                            Explore More
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Show Invite Participants and Explore More buttons when no participants
                    <View style={styles.buttonsContainer}>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={handleInviteParticipants}
                      >
                        <Text style={styles.inviteButtonText}>
                          Invite Participants
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exploreMoreButton}
                        onPress={handleExploreMore}
                      >
                        <Text style={styles.exploreMoreButtonText}>
                          Explore More
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Activities and Budget Buttons */}
                <View style={styles.actionsRow}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                      {(() => {
                        const count =
                          tripData?.activities?.length ||
                          tripData?.totalActivities ||
                          0;
                        return count === 1
                          ? "1 Activity"
                          : `${count} Activities`;
                      })()}
                    </Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                      $
                      {(
                        tripData?.totalBudget ||
                        tripData?.budget ||
                        0
                      ).toLocaleString()}{" "}
                      Budget
                    </Text>
                  </View>
                </View>

                {showCrewTabs && tripData?.participationStatus === "joined" ? (
                  <TouchableOpacity
                    style={styles.optOutLink}
                    onPress={handleOptOut}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optOutLinkText}>
                      Not this time — opt out of this trip
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {showCrewTabs &&
                tripData?.participationStatus === "opted_out" ? (
                  <TouchableOpacity
                    style={styles.rejoinLink}
                    onPress={handleRejoinTrip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.rejoinLinkText}>Rejoin this trip</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {showCrewTabs ? (
              <TopTab
                tabs={["Itinerary", "Compare", "Wishlist"]}
                activeTab={detailTab}
                onTabChange={setDetailTab}
                containerStyle={styles.detailTabs}
              />
            ) : null}

            {(!showCrewTabs || detailTab === "Itinerary") && renderItineraryContent()}
            {showCrewTabs && detailTab === "Compare" ? (
              <TripCompareTab
                groupId={tripData?.groupId}
                tripId={tripData?.canonicalTripId || tripData?._id}
              />
            ) : null}
            {showCrewTabs && detailTab === "Wishlist" ? (
              <TripWishlistTab
                canonicalTripId={
                  tripData?.canonicalTripId || tripData?._id
                }
                groupId={tripData?.groupId}
                cityId={tripData?.city_id || tripData?.city?.city_id}
              />
            ) : null}

            {/* Floating Checkout Button */}
            {/* <View style={styles.floatingButtonContainer}>
              <ButtonComp
                disabled={loading}
                title="Checkout"
                onPress={handleCheckout}
              />
            </View> */}
          </>
        )}
      </View>
    </MainContainer>
  );
};

export default TripDetails;

const styles = StyleSheet.create({
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    width: "100%",
    maxWidth: getWidth(350),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    marginTop: getVertiPadding(15),
    borderBottomWidth: 1,
  },
  imageContainer: {
    height: getHeight(120),
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: getHeight(16),
  },
  destinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(8),
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: colors.red,
    marginRight: getWidth(6),
  },
  destinationText: {
    fontSize: getHeight(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(10),
    paddingVertical: getHeight(4),
    borderRadius: getRadius(12),
  },
  statusIndicator: {
    width: getWidth(12),
    height: getHeight(12),
    tintColor: colors.green,
    marginRight: getWidth(2),
    marginLeft: getWidth(-4),
  },
  statusText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(16),
  },
  calendarIcon: {
    width: getWidth(14),
    height: getHeight(14),
    tintColor: colors.lightText,
    marginRight: getWidth(6),
  },
  calendarIcon1: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.lightText,
  },
  datesText: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  participantsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(16),
    borderRadius: getRadius(8),
  },
  participantsBlock: {
    width: "100%",
    gap: getHeight(10),
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    marginRight: getWidth(10),
  },
  avatar: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    borderWidth: 2,
    borderColor: colors.white,
    marginLeft: -getWidth(6),
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: getWidth(12),
  },
  avatarText: {
    fontSize: getHeight(9),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  participantsCount: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  viewGroupButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(10),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  viewGroupText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: getWidth(8),
    width: "100%",
  },
  inviteButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(10),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  inviteButtonText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  exploreMoreButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(10),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  exploreMoreButtonText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(8),
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.input,
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(12),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  activitiesContainer: {
    flex: 1,
    marginTop: getHeight(20),
  },
  activitiesList: {
    flex: 1,
  },
  activitiesListContent: {
    paddingTop: getHeight(8),
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(16),
  },
  activitiesHeaderIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  activitiesTitle: {
    fontSize: getHeight(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  calendarButton: {
    padding: getWidth(8),
  },
  dateGroup: {
    marginBottom: getHeight(16),
  },
  dateHeader: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: colors.input,
    borderRadius: getRadius(8),
    padding: getHeight(8),
    marginBottom: getHeight(4),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: getHeight(60),
    alignItems: "center",
  },
  activityImage: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getRadius(6),
    marginRight: getWidth(12),
    flexShrink: 0,
  },
  activityInfo: {
    flex: 1,
    justifyContent: "center",
    minHeight: getHeight(44),
  },
  activityTitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(4),
    flexWrap: "wrap",
  },
  activityDetails: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    flexWrap: "wrap",
  },
  contentContainer: {
    flex: 1,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: getHeight(20),
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeight(40),
  },
  noActivitiesText: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    textAlign: "center",
  },
  detailTabs: {
    marginHorizontal: getWidth(16),
    marginTop: getHeight(12),
    marginBottom: getHeight(8),
  },
  optOutLink: {
    marginTop: getHeight(14),
    alignItems: "center",
    paddingVertical: getHeight(6),
  },
  optOutLinkText: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    textDecorationLine: "underline",
  },
  rejoinLink: {
    marginTop: getHeight(14),
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: getRadius(20),
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(16),
  },
  rejoinLinkText: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
});
