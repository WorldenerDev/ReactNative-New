import { getImageUrl } from "@api/apiClient";
import {
  activityLikeUnlike,
  getEventDetails,
  getGroupList,
  shareActivityWithGroups,
} from "@api/services/mainServices";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import Accordion from "@components/Accordion";
import { showToast } from "@components/AppToast";
import ScreenWapper from "@components/container/ScreenWapper";
import CustomDropdown from "@components/CustomDropdown";
import ImagePlaceholder from "@components/ImagePlaceholder";
import OptimizedImage from "@components/OptimizedImage";
import RadioCheckbox from "@components/RadioCheckbox";
import navigationStrings from "@navigation/navigationStrings";
import { fetchTripByCity } from "@redux/slices/cityTripSlice";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import { isoDurationToHours } from "@utils/uiUtils";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Helper function to get city name only
const getCityName = (trip) => {
  return trip?.city_id?.name || "Trip";
};

// Helper function to format trip label with date (for dropdown options)
const formatTripLabel = (trip) => {
  const cityName = trip?.city_id?.name || "Trip";
  const startDate = trip?.start_at
    ? new Date(trip.start_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : "";
  return cityName + (startDate ? ` - ${startDate}` : "");
};

const ActivityDetails = ({ navigation, route }) => {
  const { eventData, selectedTrip: selectedTripFromRoute } =
    route?.params || {};
  console.log("eventData", eventData);
  const dispatch = useDispatch();
  const { tripsByCity } = useSelector((state) => state.cityTrip);

  // Support both getEventsForYou shape (id, city_data) and wishlist shape (activity_id, city_id)
  const activityId = eventData?.id || eventData?.activity_id;
  const cityId =
    eventData?.city_data?.id ?? eventData?.city_id ?? undefined;

  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const currentCityTrips = tripsByCity[cityId] || [];

  useEffect(() => {
    if (eventData?.isLiked !== undefined) {
      setIsLiked(eventData.isLiked);
    }
    if (eventData?.is_liked_by_current_user !== undefined) {
      setIsLiked(eventData.is_liked_by_current_user);
    }
  }, [eventData]);

  useEffect(() => {
    if (selectedTripFromRoute) {
      setSelectedTrip(selectedTripFromRoute);
    }
  }, [selectedTripFromRoute]);

  useEffect(() => {
    if (cityId) {
      getTripsByCity();
    }
  }, [cityId]);

  useEffect(() => {
    if (activityId) {
      fetchEventDetails();
    }
  }, [eventData, activityId]);

  const getTripsByCity = async () => {
    try {
      await dispatch(fetchTripByCity(cityId));
    } catch (error) {
      console.warn("fetchTripByCity error:", error);
    }
  };

  const fetchEventDetails = async () => {
    if (!activityId) return;
    try {
      const response = await getEventDetails({
        activityUuid: activityId,
      });
      console.log("GetEventDetails response:", response);
      setEventDetail(response?.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleCheckAvailability = () => {
    if (
      eventDetail?.pickupPointsIsExist &&
      eventDetail?.pickup_points?.length > 0 &&
      !selectedPoint
    ) {
      showToast(
        "error",
        "Please select a pickup point before checking availability",
      );
      return;
    }

    const languagesAvailable = eventDetail?.tourDetails?.languagesAvailable;
    if (
      languagesAvailable &&
      Array.isArray(languagesAvailable) &&
      languagesAvailable.length > 0 &&
      !selectedLanguage
    ) {
      showToast(
        "error",
        "Please select a language before checking availability",
      );
      return;
    }

    const data = {
      activityUuid: activityId,
      pickupPointId: selectedPoint,
      ...(selectedLanguage && { language: selectedLanguage }),
      activityName: eventData?.name,
      cityId: cityId,
      instant_confirmation: eventDetail?.bookingPolicies?.maxConfirmationTime,
      free_cancellation: eventDetail?.bookingPolicies?.freeCancellation,
      duration: eventDetail?.tourDetails?.duration?.[0],
      tripId: selectedTrip?.value,
      // Pass price/currency (wishlist has these; getEventsForYou has price)
      price: eventData?.price ?? eventDetail?.price,
      currency: eventData?.currency ?? "USD",
    };
    navigation.navigate(navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY, {
      eventData: data,
    });
  };

  const handleLikeToggle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await activityLikeUnlike({
        activity_id: activityId,
        is_liked: !isLiked,
      });

      if (response) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePress = async () => {
    setShowShareModal(true);
    if (groups.length === 0 && activityId) {
      fetchGroups();
    }
  };

  const fetchGroups = async () => {
    if (!activityId) {
      showToast("error", "Activity information not available");
      return;
    }

    try {
      setGroupsLoading(true);
      const response = await getGroupList({
        activityUuid: activityId,
      });

      if (response?.success && response?.data) {
        const transformedGroups = (
          Array.isArray(response.data) ? response.data : []
        ).map((group) => ({
          id: group._id || group.id,
          name: group.groupName || group.cityId?.name || "Trip",
          image:
            group.groupImage ||
            group.cityId?.image ||
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
        }));
        setGroups(transformedGroups);
      } else {
        setGroups([]);
        if (response?.message) {
          showToast("error", response.message);
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showToast("error", error?.message || "Failed to load groups");
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleShare = async () => {
    if (selectedGroups.length === 0) {
      showToast("error", "Please select at least one group");
      return;
    }

    if (!activityId) {
      showToast("error", "Activity information not available");
      return;
    }

    try {
      setSharing(true);
      const response = await shareActivityWithGroups({
        activityUuid: activityId,
        groupIds: selectedGroups,
      });

      if (response?.success) {
        setShowShareModal(false);
        setSelectedGroups([]);
      } else {
        showToast("error", response?.message || "Failed to share activity");
      }
    } catch (error) {
      console.error("Error sharing activity:", error);
      showToast("error", error?.message || "Failed to share activity");
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScreenWapper>
      <View style={styles.headerImage}>
        <OptimizedImage
          source={{
            uri:
              eventData?.image ||
              eventData?.cover_image_url ||
              "https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg",
          }}
          style={styles.headerImage}
          placeholder={
            <ImagePlaceholder
              style={styles.headerImage}
              text="Loading activity image..."
            />
          }
        />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Image source={imagePath.BACK_ICON} style={styles.backIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeBtn, isLoading && styles.likeBtnDisabled]}
          onPress={handleLikeToggle}
          disabled={isLoading}
        >
          <Image
            source={isLiked ? imagePath.LIKE_ICON : imagePath.UN_LIKE_ICON}
            style={[styles.likeIcon, isLoading && styles.likeIconDisabled]}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>...</Text>
            </View>
          )}
        </TouchableOpacity>
        {cityId && (
          <View style={styles.tripDropdownContainer}>
            <CustomDropdown
              placeholder="Trip Name"
              options={currentCityTrips.map((trip) => ({
                label: formatTripLabel(trip),
                value: trip._id,
              }))}
              selectedValue={selectedTrip}
              onValueChange={(item) => {
                const selectedTripObj = {
                  label: getCityName(item),
                  value: item._id,
                };
                setSelectedTrip(selectedTripObj);
              }}
              containerStyle={styles.tripDropdownWrapper}
              dropdownWrapperStyle={styles.tripDropdown}
              textStyle={styles.tripDropdownText}
              arrowIconStyle={styles.tripArrowIcon}
              showIcon={true}
              disabled={currentCityTrips.length === 0}
            />
          </View>
        )}
        <View style={styles.blackStrip}>
          <Text numberOfLines={2} style={styles.title}>
            {eventData?.name || eventData?.title}
          </Text>
          <Text style={styles.rating}>
            ★ {eventDetail?.reviews?.reviewsAvg || "0"} (
            {eventDetail?.reviews?.reviewsNumber || "0"})
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shareIconContainer}>
          <TouchableOpacity onPress={handleSharePress}>
            <Image source={imagePath.SHARE_ICON} style={styles.shareIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <View style={styles.featureRow}>
            <Image source={imagePath.CHECK_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              {eventDetail?.bookingPolicies?.freeCancellation
                ? "Free Cancellation"
                : "Need confirmation"}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Image source={imagePath.LANGUAGE_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              {eventDetail?.tourDetails?.languagesAvailable &&
                eventDetail.tourDetails.languagesAvailable.length > 0
                ? eventDetail.tourDetails.languagesAvailable
                  .map((lang) => lang.name)
                  .join(", ")
                : "Language not available"}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Image source={imagePath.DURATION_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              Duration:{" "}
              {isoDurationToHours(eventDetail?.tourDetails?.duration?.[0])}{" "}
              hours
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Image source={imagePath.INSTANT_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              {eventDetail?.bookingPolicies?.maxConfirmationTime === "P0D"
                ? "Instant confirmation"
                : "Need confirmation"}
            </Text>
          </View>
        </View>
        <Accordion
          title={"What makes this special"}
          key={"What makes this special"}
          defaultOpen={false}
        >
          {eventDetail?.generalInfo?.highlights &&
            eventDetail.generalInfo.highlights.length > 0 ? (
            eventDetail.generalInfo.highlights.map((item, index) => (
              <Text key={index} style={styles.content}>
                {"\u2022 "} {item}
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No details available.</Text>
          )}
        </Accordion>
        <Accordion
          title={"Before you go"}
          key={"Before you go"}
          defaultOpen={false}
        >
          <Text style={styles.content}>
            {eventDetail?.generalInfo?.aboutSummary[0] || ""}
          </Text>
        </Accordion>

        <Accordion title={"Included"} key={"Included"} defaultOpen={false}>
          {eventDetail?.inclusions?.included &&
            eventDetail.inclusions.included.length > 0 ? (
            eventDetail.inclusions.included.map((item, index) => (
              <Text key={index} style={styles.content}>
                {"\u2022 "} {item}
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No inclusions available.</Text>
          )}
        </Accordion>
        {eventDetail?.inclusions?.notIncluded &&
          eventDetail.inclusions.notIncluded.length > 0 && (
            <Accordion
              title={"Not Included"}
              key={"Not Included"}
              defaultOpen={false}
            >
              {eventDetail.inclusions.notIncluded.map((item, index) => (
                <Text key={index} style={styles.content}>
                  {"\u2022 "} {item}
                </Text>
              ))}
            </Accordion>
          )}

        {eventDetail?.pickupPointsIsExist && (
          <Accordion title={"Where"} key={"Where"} defaultOpen={false}>
            <View style={styles.listContainer}>
              {eventDetail?.pickup_points?.length > 0 ? (
                eventDetail?.pickup_points.map((point, index) => (
                  <RadioCheckbox
                    key={index}
                    label={point.name || point.address || "Unnamed Point"}
                    selected={selectedPoint === point.uuid}
                    onPress={() => setSelectedPoint(point.uuid)}
                  />
                ))
              ) : (
                <Text style={styles.content}>Pickup not available</Text>
              )}
            </View>
          </Accordion>
        )}

        {eventDetail?.tourDetails?.languagesAvailable?.length > 0 && (
          <Accordion title={"Language"} key={"Language"} defaultOpen={false}>
            <View style={styles.listContainer}>
              {eventDetail.tourDetails.languagesAvailable.map((lang, index) => (
                <RadioCheckbox
                  key={index}
                  label={lang.name || lang.code || "Unnamed"}
                  selected={selectedLanguage === lang.code}
                  onPress={() => setSelectedLanguage(lang.code)}
                />
              ))}
            </View>
          </Accordion>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.priceText}>
          from{" "}
          <Text style={styles.price}>
            {eventDetail?.pricing?.retailPrice?.formatted_value}
          </Text>
        </Text>
        <TouchableOpacity
          style={styles.availabilityBtn}
          onPress={handleCheckAvailability}
        >
          <Text style={styles.availabilityText}>Check availability</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          {(() => {
            const screenHeight = Dimensions.get("window").height;
            const groupCount = groups.length;
            const headerHeight = 56;
            const footerHeight = 72;
            const itemHeight = 60;
            const minHeight = screenHeight * 0.3;
            const maxHeight = screenHeight * 0.7;
            const calculatedHeight =
              headerHeight + footerHeight + groupCount * itemHeight;
            const modalHeight = Math.min(
              Math.max(calculatedHeight, minHeight),
              maxHeight,
            );

            return (
              <View style={[styles.modalContainer, { height: modalHeight }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Share to Group</Text>
                  <TouchableOpacity
                    style={styles.closeButtonContainer}
                    onPress={() => {
                      setShowShareModal(false);
                      setSelectedGroups([]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {groupsLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading groups...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={groups}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.groupListContent}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.groupItem,
                          selectedGroups.includes(item.id) &&
                          styles.groupItemSelected,
                        ]}
                        onPress={() => toggleGroupSelection(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.groupImageContainer}>
                          <Image
                            source={{ uri: getImageUrl(item.image) }}
                            style={styles.groupImage}
                          />
                        </View>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={styles.tickButtonContainer}>
                          {selectedGroups.includes(item.id) ? (
                            <Image
                              source={imagePath.CHECK_ICON}
                              style={styles.tickIcon}
                            />
                          ) : (
                            <View style={styles.tickButton} />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                          No groups available
                        </Text>
                      </View>
                    }
                  />
                )}

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowShareModal(false);
                      setSelectedGroups([]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.shareButton,
                      (selectedGroups.length === 0 || sharing) &&
                      styles.shareButtonDisabled,
                    ]}
                    onPress={handleShare}
                    disabled={selectedGroups.length === 0 || sharing}
                    activeOpacity={
                      selectedGroups.length === 0 || sharing ? 1 : 0.8
                    }
                  >
                    <Text
                      style={[
                        styles.shareButtonText,
                        (selectedGroups.length === 0 || sharing) &&
                        styles.shareButtonTextDisabled,
                      ]}
                    >
                      {sharing
                        ? "Sharing..."
                        : `Share${selectedGroups.length > 0
                          ? ` (${selectedGroups.length})`
                          : ""
                        }`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
        </View>
      </Modal>
    </ScreenWapper>
  );
};
export default ActivityDetails;
const styles = StyleSheet.create({
  headerImage: {
    height: getHeight(280),
    width: "100%",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 45,
    left: 15,
    zIndex: 2,
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  backIcon: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
    tintColor: colors.black,
  },
  likeBtn: { position: "absolute", top: 45, right: 15, zIndex: 2 },
  likeBtnDisabled: { opacity: 0.5 },
  likeIcon: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
  },
  likeIconDisabled: { opacity: 0.5 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  loadingText: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
  },
  blackStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
  rating: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    marginTop: 4,
    color: colors.white,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: getHeight(50),
  },
  shareIconContainer: {
    height: getHeight(30),
  },
  shareIcon: {
    height: getHeight(20),
    width: getWidth(20),
  },
  content: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkGray,
    marginTop: 5,
    lineHeight: 20,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: colors.black,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 18,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
    flexShrink: 1,
    lineHeight: 18,
    left: getWidth(10),
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
    bottom: getHeight(20),
  },
  priceText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkGray,
  },
  price: {
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  availabilityBtn: {
    backgroundColor: "#d9f0ff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: getRadius(20),
  },
  availabilityText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  listContainer: {
    flexDirection: "column",
  },
  tripDropdownContainer: {
    position: "absolute",
    top: getVertiPadding(35),
    right: getHoriPadding(10),
    maxWidth: getWidth(150),
    zIndex: 2,
  },
  tripDropdownWrapper: {
    backgroundColor: "transparent",
  },
  tripDropdown: {
    backgroundColor: "transparent",
    paddingHorizontal: getHoriPadding(10),
    paddingVertical: getVertiPadding(6),
    borderRadius: getRadius(20),
    height: "auto",
    minHeight: getHeight(32),
  },
  tripDropdownText: {
    color: colors.white,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
  },
  tripArrowIcon: {
    tintColor: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.white,
    width: "100%",
    borderTopLeftRadius: getRadius(20),
    borderTopRightRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderBottomWidth: 0,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  modalTitle: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    letterSpacing: 0.3,
  },
  closeButtonContainer: {
    width: getWidth(32),
    height: getWidth(32),
    borderRadius: getRadius(16),
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    fontSize: getFontSize(18),
    color: colors.black,
    fontWeight: "300",
  },
  loadingContainer: {
    padding: getVertiPadding(40),
    alignItems: "center",
  },
  loadingText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkGray,
  },
  groupListContent: {
    paddingVertical: getVertiPadding(8),
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  groupItemSelected: {
    backgroundColor: "#F0F8FF",
  },
  groupImageContainer: {
    width: getWidth(48),
    height: getHeight(48),
    borderRadius: getRadius(24),
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  groupImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  groupName: {
    flex: 1,
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginLeft: getHoriPadding(12),
  },
  tickButtonContainer: {
    marginLeft: getHoriPadding(12),
    width: getWidth(22),
    height: getHeight(22),
    justifyContent: "center",
    alignItems: "center",
  },
  tickButton: {
    width: getWidth(20),
    height: getHeight(20),
    borderRadius: getRadius(12),
    borderWidth: 2,
    borderColor: colors.gray,
    backgroundColor: colors.white,
  },
  tickIcon: {
    width: getWidth(24),
    height: getHeight(24),
    resizeMode: "contain",
    tintColor: "#007AFF",
  },
  emptyContainer: {
    padding: getVertiPadding(60),
    alignItems: "center",
  },
  emptyText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkGray,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(12),
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
    gap: getHoriPadding(12),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: getVertiPadding(12),
    borderRadius: getRadius(12),
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  shareButton: {
    flex: 1,
    paddingVertical: getVertiPadding(12),
    borderRadius: getRadius(12),
    backgroundColor: colors.secondary,
    alignItems: "center",
  },
  shareButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  shareButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  shareButtonTextDisabled: {
    color: colors.lightText,
  },
});
