import { URL } from "@api/apiClient";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import ResponsiveContainer from "@components/container/ResponsiveContainer";
import OptimizedImage from "@components/OptimizedImage";
import ProfileButton from "@components/ProfileButton";
import navigationStrings from "@navigation/navigationStrings";
import { logoutUser } from "@redux/slices/authSlice";
import {
  getFontSize,
  getHeight,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import { removeItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Account = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Get user profile image URI
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

  const imageUri = getUserImageUri();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await dispatch(logoutUser());
          await removeItem(STORAGE_KEYS.USER_DATA);
          await removeItem(STORAGE_KEYS.TOKEN);
        },
      },
    ]);
  };
  const handleSavedCards = () => {
    navigation.navigate(navigationStrings.PAYMENT);
  };

  const handleEditProfile = () => {
    navigation.navigate(navigationStrings.EDIT_PROFILE);
  };

  const handleMyUpcomingBookings = () => {
    navigation.navigate(navigationStrings.BOOKING, {
      screen: navigationStrings.BOOKING,
      params: { initialTab: "Upcoming" },
    });
  };

  const handleTransactionHistory = () => {
    // TODO: Navigate to transaction history screen
  };

  const handleNotificationSettings = () => {
    navigation.navigate(navigationStrings.NOTIFICATION_SETTINGS);
  };

  const handleNotificationIcon = () => {
    navigation.navigate(navigationStrings.NOTIFICATION_SCREEN);
  };

  const handleTermsOfService = () => {
    navigation.navigate(navigationStrings.PRIVACYTERMS, {
      type: "term-condition",
    });
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate(navigationStrings.PRIVACYTERMS, {
      type: "privacy-policy",
    });
  };

  const handleFAQs = () => {
    // TODO: Navigate to FAQs screen
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Handle account deletion
          },
        },
      ]
    );
  };

  return (
    <ResponsiveContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            {imageUri ? (
              <OptimizedImage
                source={{ uri: imageUri }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={imagePath.DUMMY_ICON}
                style={styles.profileImage}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Title and Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Account, bookings and payments.</Text>
          </View>
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

      {/* Essentials Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Essentials</Text>
        <ProfileButton title="Edit Profile" onPress={handleEditProfile} />
        <ProfileButton title="Sign Out" onPress={handleLogout} />
      </View>

      {/* My Bookings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        <ProfileButton
          title="My Upcoming Bookings"
          onPress={handleMyUpcomingBookings}
        />
        <ProfileButton
          title="Transaction History"
          onPress={handleTransactionHistory}
        />
        <ProfileButton title="Saved Cards" onPress={handleSavedCards} />
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <ProfileButton
          title="Interests"
          onPress={() => navigation.navigate(navigationStrings.UPDATE_INTERESTS)}
        />

        <ProfileButton
          title="Notification Settings"
          onPress={handleNotificationSettings}
        />
      </View>

      {/* Legal & Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>
        <ProfileButton
          title="Terms of Service"
          onPress={handleTermsOfService}
        />
        <ProfileButton title="Privacy Policy" onPress={handlePrivacyPolicy} />
        <ProfileButton title="FAQs" onPress={handleFAQs} />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <ProfileButton title="Delete Account" onPress={handleDeleteAccount} />
      </View>
    </ResponsiveContainer>
  );
};

export default Account;

const styles = StyleSheet.create({
  header: {
    paddingTop: getVertiPadding(16),
    paddingBottom: getVertiPadding(20),
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: getWidth(60), // Space for notification icon
  },
  profileImageContainer: {
    width: getWidth(50),
    height: getWidth(50),
    borderRadius: getWidth(25),
    backgroundColor: colors.border,
    marginRight: getWidth(16),
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
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
    position: "absolute",
    top: getVertiPadding(20),
    right: 0,
    alignItems: "center",
  },
  notificationIcon: {
    width: getWidth(50),
    height: getHeight(50),
  },
  section: {
    marginBottom: getVertiPadding(8),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    fontWeight: "600",
    color: colors.black,
    marginBottom: getVertiPadding(10),
  },
});
