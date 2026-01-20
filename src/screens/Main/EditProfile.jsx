import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import CustomInput from "@components/CustomInput";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import {
  getFontSize,
  getHeight,
  getRadius,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import useImagePicker from "@hooks/useImagePicker";
import { updateProfile } from "@api/services/mainServices";
import { setUser } from "@redux/slices/authSlice";
import { showToast } from "@components/AppToast";
import OptimizedImage from "@components/OptimizedImage";
import { URL } from "@api/apiClient";
import navigationStrings from "@navigation/navigationStrings";

const EditProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { pickImage } = useImagePicker();

  const [name, setName] = useState(user?.name || "");
  const [mobileNumber, setMobileNumber] = useState(user?.phone_number || "");
  const [profileImage, setProfileImage] = useState(null);

  // Construct image URI: if user has image, use URL + image path, otherwise null
  const getUserImageUri = () => {
    const userImage = user?.image || user?.profileImage;
    if (userImage && userImage.trim() !== "") {
      // If image already has http/https, use as is, otherwise prepend URL
      if (userImage.startsWith("http://") || userImage.startsWith("https://")) {
        return userImage;
      }
      return `${URL}${userImage}`;
    }
    return null;
  };

  const [imageUri, setImageUri] = useState(getUserImageUri());
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (!name || !mobileNumber) {
      showToast("error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("name", name);
      formData.append("phone_number", mobileNumber);

      if (profileImage) {
        formData.append("image", {
          uri: profileImage.uri,
          type: profileImage.type,
          name: profileImage.name,
        });
      }

      const response = await updateProfile(formData);

      if (response?.success || response?.data) {
        const responseImage =
          response?.data?.image || response?.data?.user?.image;
        let finalImageUri = imageUri;

        if (responseImage) {
          // If response image is a relative path, prepend URL
          if (
            responseImage.startsWith("http://") ||
            responseImage.startsWith("https://")
          ) {
            finalImageUri = responseImage;
          } else {
            finalImageUri = `${URL}${responseImage}`;
          }
        }

        const updatedUser = {
          ...user,
          name: name,
          phone_number: mobileNumber,
          image: responseImage || user?.image,
        };

        dispatch(setUser(updatedUser));
        setImageUri(finalImageUri);
        showToast(
          "success",
          response?.message || "Profile updated successfully"
        );
        navigation.goBack();
      } else {
        showToast("error", response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const result = await pickImage();

      if (result && result.uri) {
        setProfileImage(result);
        setImageUri(result.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("error", error?.message || "Failed to pick image");
    }
  };
  const handleNotificationIcon = () => {
    navigation.navigate(navigationStrings.NOTIFICATION_SCREEN);
  };

  return (
    <ResponsiveContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={imagePath.BACK_ICON}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Update your profile information.</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={handleNotificationIcon}
          >
            <Image
              source={imagePath.NOTIFICATION_ICON}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {imageUri ? (
              <View style={styles.profileImagePlaceholder}>
                <OptimizedImage
                  source={{ uri: imageUri }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Image
                  source={imagePath.LOGO}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
            disabled={loading}
          >
            <Image
              source={imagePath.CAMERA_ICON}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <CustomInput
            label="Name"
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <CustomInput
            label="Mobile Number"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        {/* Save Changes Button */}
        <View style={styles.buttonContainer}>
          <ButtonComp
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSaveChanges}
            disabled={loading}
          />
        </View>
      </View>
    </ResponsiveContainer>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: getVertiPadding(100), // Add padding to prevent content from being hidden behind fixed button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: getVertiPadding(20),
    paddingBottom: getVertiPadding(30),
    position: "relative",
  },
  backButton: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    marginRight: getWidth(12),
  },
  backIcon: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.black,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: getFontSize(19),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getVertiPadding(8),
  },
  subtitle: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  notificationContainer: {
    alignItems: "center",
    marginLeft: getWidth(12),
  },
  notificationIcon: {
    width: getWidth(50),
    height: getHeight(50),
  },
  profileSection: {
    alignItems: "center",
    marginBottom: getVertiPadding(40),
  },
  profileImageContainer: {
    marginBottom: getVertiPadding(20),
  },
  profileImagePlaceholder: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  logoImage: {
    width: getWidth(40),
    height: getHeight(40),
    marginBottom: getVertiPadding(5),
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.border,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(10),
    borderRadius: getRadius(20),
  },
  cameraIcon: {
    width: getWidth(16),
    height: getHeight(16),
    marginRight: getHoriPadding(8),
  },
  changePhotoText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.darkText,
  },
  inputsContainer: {
    marginBottom: getVertiPadding(40),
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: getVertiPadding(50),
    backgroundColor: colors.white,
  },
});
