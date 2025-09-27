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
import { getHeight, getRadius, getFontSize, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import Accordion from "@components/Accordion";
import navigationStrings from "@navigation/navigationStrings";
import {
  activityLikeUnlike,
  getEventDetails,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import RadioCheckbox from "@components/RadioCheckbox";

const ActivityDetails = ({ navigation, route }) => {
  const { eventData } = route?.params || {};
  console.log(
    "Event data in Activity detail screen before call api ",
    eventData
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Initialize like state from event data
  useEffect(() => {
    if (eventData?.isLiked !== undefined) {
      setIsLiked(eventData.isLiked);
    }
  }, [eventData]);

  // Fetch event details (locations) when component mounts
  useEffect(() => {
    if (eventData?.id) {
      fetchEventDetails();
    }
  }, [eventData]);

  const fetchEventDetails = async () => {
    try {
      const response = await getEventDetails({
        activityUuid: eventData?.id,
      });
      console.log("Event details response:", response?.data);
      setEventDetail(response?.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleCheckAvailability = () => {
    const data = {
      activityUuid: eventData?.id,
      pickupPointId: selectedPoint,
      activityName: eventData?.name,
      cityId: eventData?.city_data?.id,
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
            <Text style={styles.text}>Free Cancellation</Text>
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
            <Text style={styles.text}>Duration: 1.5 hours</Text>
          </View>

          {/* Instant Confirmation */}
          <View style={styles.featureRow}>
            <Image source={imagePath.INSTANT_ICON} style={styles.likeIcon} />
            <Text style={styles.text}>Instant Confirmation</Text>
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

        <Accordion
          title={"Not Included"}
          key={"Not Included"}
          defaultOpen={false}
        >
          {eventDetail?.inclusions?.notIncluded &&
          eventDetail.inclusions.notIncluded.length > 0 ? (
            eventDetail.inclusions.notIncluded.map((item, index) => (
              <Text key={index} style={styles.content}>
                {"\u2022 "} {item}
              </Text>
            ))
          ) : (
            <Text style={styles.content}>No exclusions listed.</Text>
          )}
        </Accordion>

        <Accordion title={"Where"} key={"Where"} defaultOpen={false}>
          <View style={styles.listContainer}>
            {eventDetail?.pickup_points?.length > 0 ? (
              eventDetail?.pickup_points.map((point, index) => (
                <RadioCheckbox
                  key={index}
                  label={point.name || point.address || "Unnamed Point"}
                  selected={selectedPoint === point.id} // assumes each point has unique id
                  onPress={() => setSelectedPoint(point.id)}
                />
              ))
            ) : (
              <Text style={styles.content}>Pickup not available</Text>
            )}
          </View>
        </Accordion>
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
    width: "48%", // two per row
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
    flexDirection: "column", // ensures vertical stacking
  },
});
