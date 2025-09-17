import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React from "react";
import ScreenWapper from "@components/container/ScreenWapper";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getFontSize, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import Accordion from "@components/Accordion";
import navigationStrings from "@navigation/navigationStrings";
const ACCORDION_DATA = [
  {
    id: "1",
    title: "Highlights",
    content:
      "Discover Paris from its most iconic landmark! Skip the lines and ascend the world-famous Eiffel Tower with priority access. An expert guide shares fascinating stories about its history, engineering marvels, and cultural significance.",
    defaultOpen: true,
  },
  {
    id: "2",
    title: "Cancellation Policy",
    content: "Free cancellation up to 24 hours before the activity starts.",
  },
  {
    id: "3",
    title: "Operating Hours",
    content: "Open daily: 9:30 AM – 11:00 PM. Last admission 10:00 PM.",
  },
];
const ActivityDetails = ({ navigation, route }) => {
  const { eventData } = route?.params || {};
  console.log("eventData", eventData);

  const handleCheckAvailability = () => {
    navigation.navigate(navigationStrings.ACTIVITY_DETAILS_CHECK_AVAILABILITY, {
      eventData: eventData,
    });
  };

  const renderAccordionItem = ({ item }) => (
    <Accordion title={item.title} defaultOpen={item?.defaultOpen}>
      <Text style={styles.content}>{item.content}</Text>
    </Accordion>
  );
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
          priority="high"
        />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Image source={imagePath.BACK_ICON} style={styles.backIcon} />
        </TouchableOpacity>
        {/* Black strip with title & rating */}
        <View style={styles.blackStrip}>
          <Text numberOfLines={2} style={styles.title}>
            {eventData?.name ||
              eventData?.title ||
              "Eiffel Tower Guided Tour by Elevator"}
          </Text>
          <Text style={styles.rating}>
            ★ {eventData?.rating || "4.4"} (
            {eventData?.review_count || "23,144"})
          </Text>
        </View>
      </View>
      {/* Body */}
      <View style={styles.innerContainer}>
        <FlatList
          data={ACCORDION_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderAccordionItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.priceText}>
          from{" "}
          <Text style={styles.price}>
            ${eventData?.price || eventData?.starting_price || "89.99"}
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
  innerContainer: { flex: 1, backgroundColor: colors.white, padding: 20 },
  content: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.darkGray,
    marginTop: 5,
    lineHeight: 20,
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
});
