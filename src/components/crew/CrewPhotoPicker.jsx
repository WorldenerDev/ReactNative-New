import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import OptimizedImage from "@components/OptimizedImage";
import useImagePicker from "@hooks/useImagePicker";
import { showToast } from "@components/AppToast";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import { getImageUrl } from "@api/apiClient";

const isLocalUri = (uri) =>
  uri?.startsWith("file://") || uri?.startsWith("content://");

const CrewPhotoPicker = ({
  imageUri,
  onImageSelected,
  variant = "banner",
  disabled = false,
  placeholderText = "Add photo (optional)",
  containerStyle,
  imageStyle,
  showCameraBadge = false,
}) => {
  const { pickImage } = useImagePicker();

  const handlePress = async () => {
    if (disabled) {
      return;
    }

    try {
      const result = await pickImage();
      if (result?.uri) {
        onImageSelected?.(result);
      }
    } catch (error) {
      console.error("Error picking crew photo:", error);
      showToast("error", error?.message || "Failed to pick image");
    }
  };

  const displayUri = imageUri ? getImageUrl(imageUri) || imageUri : null;

  const renderImage = (style) => {
    if (!displayUri) {
      return null;
    }

    if (isLocalUri(displayUri)) {
      return (
        <Image source={{ uri: displayUri }} style={style} resizeMode="cover" />
      );
    }

    return (
      <OptimizedImage
        source={{ uri: displayUri }}
        style={style}
        resizeMode="cover"
      />
    );
  };

  if (variant === "avatar") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[styles.avatarTouchable, containerStyle]}
      >
        {displayUri ? (
          renderImage([styles.avatar, imageStyle])
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty, imageStyle]} />
        )}
        {showCameraBadge && !disabled ? (
          <View style={styles.cameraBadge}>
            <Image
              source={imagePath.CAMERA_ICON}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.banner, containerStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {displayUri ? (
        renderImage([styles.bannerImage, imageStyle])
      ) : (
        <Text style={styles.bannerText}>{placeholderText}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CrewPhotoPicker;

const styles = StyleSheet.create({
  banner: {
    height: getHeight(120),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerText: {
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    fontSize: getHeight(14),
  },
  avatarTouchable: {
    position: "relative",
  },
  avatar: {
    width: getWidth(48),
    height: getWidth(48),
    borderRadius: getWidth(24),
    backgroundColor: colors.lightGray,
    flexShrink: 0,
  },
  avatarEmpty: {
    backgroundColor: colors.lightGray,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: getWidth(20),
    height: getWidth(20),
    borderRadius: getWidth(10),
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  cameraIcon: {
    width: getWidth(10),
    height: getWidth(10),
    tintColor: colors.white,
  },
});
