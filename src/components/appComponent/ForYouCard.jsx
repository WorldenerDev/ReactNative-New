// components/ForYouCard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import {
  getWidth,
  getHeight,
  getFontSize,
  getHoriPadding,
  getVertiPadding,
  getRadius,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { activityLikeUnlike } from "@api/services/mainServices";

const ForYouCard = ({ item, onPress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(item?.isLiked || false);

  // Sync local state when item prop changes
  useEffect(() => {
    setLocalIsLiked(item?.isLiked || false);
  }, [item?.isLiked]);

  const handleLikePress = async () => {
    if (isLoading) return;

    // Update UI immediately for better UX
    const newLikeState = !localIsLiked;
    setLocalIsLiked(newLikeState);

    try {
      setIsLoading(true);
      const response = await activityLikeUnlike({
        activity_id: item?.id || item?.activity_id,
        is_liked: newLikeState,
      });

      // Handle success response
      console.log("Like/Unlike response:", response);
    } catch (error) {
      console.error("Error liking/unliking activity:", error);
      // Revert the UI change if API call failed
      setLocalIsLiked(!newLikeState);
      // Error handling is already done in the API interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <OptimizedImage
        source={{
          uri: item?.image || item?.city_data?.cover_image_url,
        }}
        style={styles.image}
        placeholder={
          <ImagePlaceholder style={styles.image} text="Loading..." />
        }
      />
      <View style={styles.overlay}>
        <Text numberOfLines={2} style={styles.title}>
          {item?.name}
        </Text>
        <TouchableOpacity
          onPress={handleLikePress}
          style={[styles.likeButton, isLoading && styles.disabledButton]}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Image
              source={
                localIsLiked ? imagePath.LIKE_ICON : imagePath.UN_LIKE_ICON
              }
              style={styles.likeIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ForYouCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: getVertiPadding(15),
    marginHorizontal: getWidth(5),
    borderRadius: getWidth(12),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: getHeight(120), // More rectangular like popular cards
    borderRadius: getWidth(12),
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: getHoriPadding(8),
    backgroundColor: colors.light_bg,
    borderTopRightRadius: getRadius(20),
    borderTopLeftRadius: getRadius(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.white,
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoBold,
    flex: 1,
    marginRight: getWidth(8),
  },
  likeButton: {
    padding: getWidth(4),
  },
  disabledButton: {
    opacity: 0.6,
  },
  likeIcon: {
    width: getWidth(20),
    height: getWidth(20),
  },
});
