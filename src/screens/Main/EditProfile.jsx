import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
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

const EditProfile = ({ navigation }) => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSaveChanges = () => {
    // Handle save changes logic here
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    // Handle change photo logic here
    console.log("Change photo pressed");
  };

  return (
    <ResponsiveContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Update your profile information.</Text>
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => console.log("Notification pressed")}
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
            <View style={styles.profileImagePlaceholder}>
              <Image
                source={imagePath.LOGO}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
          >
            <Image
              source={imagePath.CAMERA_ICON} // Using calendar icon as camera placeholder
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
          />

          <CustomInput
            label="Mobile Number"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>

        {/* Save Changes Button */}
        <View style={styles.buttonContainer}>
          <ButtonComp
            title="Save Changes"
            onPress={handleSaveChanges}
            disabled={false}
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
    paddingTop: getVertiPadding(20),
    paddingBottom: getVertiPadding(30),
    position: "relative",
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
    position: "absolute",
    top: getVertiPadding(20),
    right: 0,
    alignItems: "center",
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
  },
  logoImage: {
    width: getWidth(40),
    height: getHeight(40),
    marginBottom: getVertiPadding(5),
  },
  logoText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
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
  inputContainer: {
    marginBottom: getVertiPadding(20),
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
