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
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import { fetchTripByCity } from "@redux/slices/cityTripSlice";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import { getActivityDurationLabel } from "@utils/uiUtils";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const HERO_HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

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
  const insets = useSafeAreaInsets();
  const heroTop = insets.top + getVertiPadding(8);
  const bottomInset = useStickyBottomInset();
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
  const [languagesExpanded, setLanguagesExpanded] = useState(false);

  const LANGUAGE_PREVIEW_COUNT = 3;
  const languageNames =
    eventDetail?.tourDetails?.languagesAvailable?.map((lang) => lang.name) ??
    [];

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
    setLanguagesExpanded(false);
  }, [activityId, languageNames.length]);

  useEffect(() => {
    const languages = eventDetail?.tourDetails?.languagesAvailable;
    if (!languages?.length) {
      setSelectedLanguage(null);
      return;
    }
    if (languages.length === 1) {
      setSelectedLanguage(languages[0].code);
    } else {
      setSelectedLanguage(null);
    }
  }, [eventDetail?.tourDetails?.languagesAvailable, activityId]);

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
    if (!selectedTrip?.value) {
      showToast("error", "Please select a trip before adding activities");
      return;
    }

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
    const language =
      languagesAvailable?.length === 1
        ? languagesAvailable[0].code
        : selectedLanguage;
    if (
      languagesAvailable &&
      Array.isArray(languagesAvailable) &&
      languagesAvailable.length > 1 &&
      !language
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
      ...(language && { language }),
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

    const resolvedCityId =
      cityId ??
      eventData?.city_data?.id ??
      eventData?.city_id ??
      null;

    if (!isLiked && resolvedCityId == null) {
      showToast("error", "City information not available for this activity");
      return;
    }

    try {
      setIsLoading(true);
      const response = await activityLikeUnlike({
        activity_id: activityId,
        is_liked: !isLiked,
        ...(resolvedCityId != null && { city_id: String(resolvedCityId) }),
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

  const renderLanguagesContent = () => {
    if (languageNames.length === 0) {
      return <Text style={styles.text}>Language not available</Text>;
    }

    if (languageNames.length <= LANGUAGE_PREVIEW_COUNT) {
      return <Text style={styles.text}>{languageNames.join(", ")}</Text>;
    }

    const previewText = languageNames
      .slice(0, LANGUAGE_PREVIEW_COUNT)
      .join(", ");
    const remainingCount = languageNames.length - LANGUAGE_PREVIEW_COUNT;

    if (!languagesExpanded) {
      return (
        <Text style={styles.text}>
          {previewText},{" "}
          <Text
            style={styles.languageExpandLink}
            onPress={() => setLanguagesExpanded(true)}
          >
            {remainingCount}+
          </Text>
        </Text>
      );
    }

    return (
      <View style={styles.languageExpandedContent}>
        <Text style={styles.text}>{languageNames.join(", ")}</Text>
        <TouchableOpacity
          onPress={() => setLanguagesExpanded(false)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.languageCollapseLink}>Show less</Text>
        </TouchableOpacity>
      </View>
    );
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
        <View style={[styles.heroTopBar, { top: heroTop }]}>
          <TouchableOpacity
            style={styles.heroIconBtn}
            onPress={() => navigation.goBack()}
            hitSlop={HERO_HIT_SLOP}
            activeOpacity={0.7}
          >
            <Image source={imagePath.BACK_ICON} style={styles.heroIcon} />
          </TouchableOpacity>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroIconBtn}
              onPress={handleSharePress}
              hitSlop={HERO_HIT_SLOP}
              activeOpacity={0.7}
            >
              <Image source={imagePath.SHARE_ICON} style={styles.heroIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.heroIconBtn,
                isLoading && styles.heroIconBtnDisabled,
              ]}
              onPress={handleLikeToggle}
              disabled={isLoading}
              hitSlop={HERO_HIT_SLOP}
              activeOpacity={0.7}
            >
              <Image
                source={isLiked ? imagePath.LIKE_ICON : imagePath.UN_LIKE_ICON}
                style={[
                  styles.wishlistIcon,
                  isLiked
                    ? styles.wishlistIconLiked
                    : styles.wishlistIconOutline,
                  isLoading && styles.heroIconDisabled,
                ]}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
        {cityId && (
          <View style={styles.tripSelectorRow}>
            <CustomDropdown
              label="Select Trip to add this activity to:"
              placeholder="Select a trip"
              modalVariant="sheet"
              modalTitle="Select a trip"
              modalSubtitle="Choose which trip to add this activity to"
              emptyMessage="No trips found for this city. Create a trip first."
              options={currentCityTrips.map((trip) => ({
                label: formatTripLabel(trip),
                value: trip._id,
              }))}
              selectedValue={selectedTrip}
              onValueChange={setSelectedTrip}
              containerStyle={styles.tripSelectorWrapper}
              dropdownWrapperStyle={styles.tripSelectorDropdown}
              textStyle={styles.tripSelectorText}
              arrowIconStyle={styles.tripSelectorArrow}
              showIcon={true}
              disabled={currentCityTrips.length === 0}
            />
          </View>
        )}
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
            <View style={styles.languageTextContainer}>
              {renderLanguagesContent()}
            </View>
          </View>
          <View style={styles.featureRow}>
            <Image source={imagePath.DURATION_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              {getActivityDurationLabel(eventDetail?.tourDetails)}
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

        {eventDetail?.tourDetails?.languagesAvailable?.length > 1 && (
          <Accordion title={"Language"} key={"Language"} defaultOpen={true}>
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

      <View style={[styles.bottomBar, { marginBottom: bottomInset }]}>
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
  heroTopBar: {
    position: "absolute",
    left: getHoriPadding(15),
    right: getHoriPadding(15),
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: getHoriPadding(8),
  },
  heroIconBtn: {
    width: getWidth(36),
    height: getHeight(36),
    borderRadius: getRadius(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  heroIconBtnDisabled: {
    opacity: 0.5,
  },
  heroIcon: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
    tintColor: colors.black,
  },
  heroIconDisabled: {
    opacity: 0.5,
  },
  wishlistIcon: {
    height: getHeight(22),
    width: getWidth(22),
    resizeMode: "contain",
  },
  wishlistIconOutline: {
    tintColor: colors.black,
  },
  wishlistIconLiked: {
    tintColor: colors.red,
  },
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
    borderRadius: getRadius(18),
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
    paddingBottom: getHeight(15),
  },
  tripSelectorRow: {
    width: "100%",
    paddingVertical: getVertiPadding(12),
    marginBottom: getVertiPadding(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tripSelectorWrapper: {
    width: "100%",
    paddingVertical: 0,
  },
  tripSelectorDropdown: {
    backgroundColor: colors.input,
    paddingHorizontal: getHoriPadding(14),
    paddingVertical: getVertiPadding(10),
    borderRadius: getRadius(12),
    height: "auto",
    minHeight: getHeight(44),
    width: "100%",
    top: 0,
  },
  tripSelectorText: {
    color: colors.black,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoMedium,
    flex: 1,
  },
  tripSelectorArrow: {
    tintColor: colors.black,
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
  languageTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  languageExpandedContent: {
    flex: 1,
  },
  languageExpandLink: {
    color: colors.primary,
    fontFamily: fonts.RobotoMedium,
    fontWeight: "600",
  },
  languageCollapseLink: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.primary,
    marginTop: getVertiPadding(4),
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
