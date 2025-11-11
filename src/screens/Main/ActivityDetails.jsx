import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import ScreenWapper from "@components/container/ScreenWapper";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getFontSize, getWidth, getVertiPadding, getHoriPadding } from "@utils/responsive";
import imagePath from "@assets/icons";
import Accordion from "@components/Accordion";
import navigationStrings from "@navigation/navigationStrings";
import {
  activityLikeUnlike,
  getEventDetails,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import RadioCheckbox from "@components/RadioCheckbox";
import { isoDurationToHours } from "@utils/uiUtils";
import CustomDropdown from "@components/CustomDropdown";
import { useDispatch, useSelector } from "react-redux";
import { fetchTripByCity } from "@redux/slices/cityTripSlice";

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
  const { eventData, selectedTrip: selectedTripFromRoute } = route?.params || {};
  const dispatch = useDispatch();
  const { tripsByCity } = useSelector((state) => state.cityTrip);

  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Get trips for current city from Redux map
  const cityId = eventData?.city_data?.id;
  const currentCityTrips = tripsByCity[cityId] || [];

  // Initialize like state from event data
  useEffect(() => {
    if (eventData?.isLiked !== undefined) {
      setIsLiked(eventData.isLiked);
    }
  }, [eventData]);

  // Initialize selectedTrip from route params if available
  useEffect(() => {
    if (selectedTripFromRoute) {
      setSelectedTrip(selectedTripFromRoute);
    }
  }, [selectedTripFromRoute]);

  // Fetch trips for the city when component mounts
  useEffect(() => {
    if (cityId) {
      getTripsByCity();
    }
  }, [cityId]);

  // Fetch event details (locations) when component mounts
  useEffect(() => {
    if (eventData?.id) {
      fetchEventDetails();
    }
  }, [eventData]);

  const getTripsByCity = async () => {
    try {
      await dispatch(fetchTripByCity(cityId));
    } catch (error) {
      console.warn("fetchTripByCity error:", error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await getEventDetails({
        activityUuid: eventData?.id,
      });
      setEventDetail(response?.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleCheckAvailability = () => {
    // Check if pickup points exist and user needs to select one
    if (
      eventDetail?.pickupPointsIsExist &&
      eventDetail?.pickup_points?.length > 0
    ) {
      if (!selectedPoint) {
        showToast(
          "error",
          "Please select a pickup point before checking availability"
        );
        return;
      }
    }

    const data = {
      activityUuid: eventData?.id,
      pickupPointId: selectedPoint,
      activityName: eventData?.name,
      cityId: eventData?.city_data?.id,
      instant_confirmation: eventDetail?.bookingPolicies?.maxConfirmationTime,
      free_cancellation: eventDetail?.bookingPolicies?.freeCancellation,
      duration: eventDetail?.tourDetails?.duration?.[0],
      tripId: selectedTrip?.value,
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
        activity_id: eventData?.id || eventData?.activity_id,
        is_liked: !isLiked,
      });

      // Update the like state only if API call is successful
      if (response) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWapper>
      {/* Header */}
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
        {/* Trip Name Dropdown */}
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
        {/* Black strip with title & rating */}
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
      {/* Body */}
      <ScrollView style={styles.innerContainer}>
        <View style={styles.container}>
          {/* Free Cancellation */}
          <View style={styles.featureRow}>
            <Image source={imagePath.CHECK_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              {eventDetail?.bookingPolicies?.freeCancellation
                ? "Free Cancellation"
                : "Need confirmation"}
            </Text>
          </View>
          {/* Languages */}
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
          {/* Duration */}
          <View style={styles.featureRow}>
            <Image source={imagePath.DURATION_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>
              Duration:{" "}
              {isoDurationToHours(eventDetail?.tourDetails?.duration?.[0])}{" "}
              hours
            </Text>
          </View>

          {/* Instant Confirmation */}
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
      </ScrollView>

      {/* Bottom Bar */}
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
  backBtn: { position: "absolute", top: 45, left: 15, zIndex: 2 },
  backIcon: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
    tintColor: colors.white,
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
});
