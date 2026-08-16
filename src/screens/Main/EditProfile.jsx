import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { getImageUrl } from "@api/apiClient";
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
import {
  sendLinkPhoneOtp,
  verifyLinkPhone,
} from "@api/services/authService";
import { setUser } from "@redux/slices/authSlice";
import { showToast } from "@components/AppToast";
import SocialPhonePromptModal from "@components/SocialPhonePromptModal";
import useStickyBottomInset, {
  useStickyScrollPadding,
} from "@hooks/useStickyBottomInset";
import OptimizedImage from "@components/OptimizedImage";
import navigationStrings from "@navigation/navigationStrings";
import {
  buildUpdateProfileFormData,
  extractProfileImagePath,
} from "@utils/formDataHelper";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { hasUsablePhone } from "@utils/socialLoginPayload";

const PencilIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke={colors.lightText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={colors.lightText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


const EditProfile = ({ navigation }) => {
  useGuestScreenGuard();
  const dispatch = useDispatch();
  const bottomInset = useStickyBottomInset();
  const scrollPadding = useStickyScrollPadding();
  const { user } = useSelector((state) => state.auth);
  const { pickImage } = useImagePicker();

  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(null);
  const [phonePromptVisible, setPhonePromptVisible] = useState(false);
  const [phonePromptLoading, setPhonePromptLoading] = useState(false);
  const hasPhone = hasUsablePhone(user?.phone_number);
  const mobileNumber = user?.phone_number || "";

  // Construct image URI: if user has image, use URL + image path, otherwise null
  const getUserImageUri = () => getImageUrl(user?.image || user?.profileImage) || null;

  const [imageUri, setImageUri] = useState(getUserImageUri());
  const [loading, setLoading] = useState(false);

  const persistUser = async (updatedUser) => {
    dispatch(setUser(updatedUser));
    await setItem(STORAGE_KEYS.USER_DATA, updatedUser);
  };

  const handleSaveChanges = async () => {
    if (!name) {
      showToast("error", "Please enter your name");
      return;
    }

    try {
      setLoading(true);

      const formData = buildUpdateProfileFormData({
        name,
        phone_number: hasPhone ? mobileNumber : undefined,
        gender: user?.gender,
        dob: user?.dob,
        nationality: user?.nationality,
        image: profileImage,
      });

      const response = await updateProfile(formData);

      if (response?.success || response?.data) {
        const responseImage = extractProfileImagePath(response);
        const finalImageUri = responseImage
          ? getImageUrl(responseImage)
          : imageUri;

        const updatedUser = {
          ...user,
          name,
          phone_number: hasPhone ? mobileNumber : user?.phone_number || "",
          image: responseImage || user?.image,
          profileImage: responseImage || user?.profileImage,
        };

        await persistUser(updatedUser);
        setImageUri(finalImageUri);
        setProfileImage(null);
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

  const handleSendLinkPhoneOtp = async (phoneNumber) => {
    setPhonePromptLoading(true);
    try {
      await sendLinkPhoneOtp({ phone_number: phoneNumber });
      showToast("success", "OTP sent to your mobile number");
      return true;
    } catch (error) {
      return false;
    } finally {
      setPhonePromptLoading(false);
    }
  };

  const handleVerifyLinkPhone = async (phoneNumber, otp) => {
    setPhonePromptLoading(true);
    try {
      const res = await verifyLinkPhone({
        phone_number: phoneNumber,
        otp,
      });
      const updated = res?.data || {};
      await persistUser({
        ...user,
        ...updated,
        phone_number: updated.phone_number || phoneNumber,
        accessToken: user?.accessToken,
        token: user?.token || user?.accessToken,
      });
      setPhonePromptVisible(false);
      showToast("success", "Mobile number added");
    } catch (error) {
      // apiClient already toasts
    } finally {
      setPhonePromptLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const result = await pickImage();

      if (!result?.uri) {
        return;
      }

      setProfileImage(result);
      setImageUri(result.uri);
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("error", error?.message || "Failed to pick image");
    }
  };
  const handleNotificationIcon = () => {
    navigation.navigate(navigationStrings.NOTIFICATION_SCREEN);
  };

  return (
    <>
    <ResponsiveContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={[styles.container, { paddingBottom: scrollPadding }]}>
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
                {imageUri.startsWith("file://") ||
                imageUri.startsWith("content://") ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <OptimizedImage
                    source={{ uri: imageUri }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                )}
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
            rightElement={<PencilIcon />}
          />

          <CustomInput
            label="Mobile Number"
            placeholder={hasPhone ? "Enter mobile number" : "Not added yet"}
            value={hasPhone ? mobileNumber : ""}
            keyboardType="phone-pad"
            editable={false}
          />
          {!hasPhone ? (
            <TouchableOpacity
              style={styles.addPhoneButton}
              onPress={() => setPhonePromptVisible(true)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.addPhoneText}>
                Add a number so friends can find you
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Save Changes Button */}
        <View style={[styles.buttonContainer, { bottom: bottomInset }]}>
          <ButtonComp
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSaveChanges}
            disabled={loading}
          />
        </View>
      </View>
    </ResponsiveContainer>
      <SocialPhonePromptModal
        visible={phonePromptVisible}
        loading={phonePromptLoading}
        allowSkip={false}
        onSendOtp={handleSendLinkPhoneOtp}
        onVerifyOtp={handleVerifyLinkPhone}
        onResendOtp={handleSendLinkPhoneOtp}
        onClose={() => setPhonePromptVisible(false)}
      />
    </>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  addPhoneButton: {
    marginTop: getVertiPadding(8),
    alignSelf: "flex-start",
  },
  addPhoneText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: getHoriPadding(20),
    paddingVertical: getVertiPadding(16),
    backgroundColor: colors.white,
  },
});
