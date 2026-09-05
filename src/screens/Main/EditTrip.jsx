import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import OptimizedImage from "@components/OptimizedImage";
import {
  getFontSize,
  getHeight,
  getWidth,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import { updateTrip } from "@api/services/mainServices";
import { optOutOfTrip } from "@api/services/crewGroupsService";
import { getTripCityId, getTripImage, canDeleteTrip } from "@utils/tripHelpers";
import { appendFileToFormData } from "@utils/formDataHelper";
import { getImageUrl } from "@api/apiClient";
import useImagePicker from "@hooks/useImagePicker";
import { useDispatch } from "react-redux";
import { deleteUserTrip } from "@redux/slices/cityTripSlice";
import navigationStrings from "@navigation/navigationStrings";
import useStickyBottomInset from "@hooks/useStickyBottomInset";
import useAuth from "@hooks/useAuth";

const EditTrip = ({ navigation, route }) => {
  const { trip } = route?.params || {};
  const dispatch = useDispatch();
  const { user } = useAuth();
  const bottomInset = useStickyBottomInset();
  const { pickImage } = useImagePicker();
  // Form state
  const [tripName, setTripName] = useState(
    trip?.name || trip?.city?.name || trip?.destination || "Trip"
  );
  const [fromDate, setFromDate] = useState(trip?.start_at?.slice(0, 10) || "");
  const [toDate, setToDate] = useState(trip?.end_at?.slice(0, 10) || "");
  const existingCover = getTripImage(trip);
  const [coverPhotoUri, setCoverPhotoUri] = useState(
    getImageUrl(existingCover) || existingCover || ""
  );
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canOptOut =
    Boolean(trip?.groupId || trip?.group_id) &&
    trip?.participationStatus === "joined";
  const canDelete = canDeleteTrip(trip, user?._id || user?.id);

  const handleSave = async () => {
    try {
      if (!trip?.id && !trip?._id) {
        showToast("error", "Trip ID not found");
        return;
      }

      setIsLoading(true);

      // Get trip ID (handle both id and _id formats)
      const tripId = trip?.id || trip?._id;

      // Prepare FormData for API call
      const formData = new FormData();
      formData.append("name", tripName);
      formData.append("city_id", String(getTripCityId(trip) || ""));
      formData.append("start_at", fromDate);
      formData.append("end_at", toDate);
      appendFileToFormData(formData, "image", coverPhotoFile);

      // Call the API
      await updateTrip(tripId, formData);
      showToast("success", "Trip updated successfully!");
      navigation.navigate(navigationStrings.BOTTOM_TAB, {
        screen: navigationStrings.TRIPS,
        params: { screen: navigationStrings.TRIPS },
      });
    } catch (error) {
      console.error("Error updating trip:", error);
      showToast("error", error?.message || "Failed to update trip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteLoading(true);
              const tripId = trip?._id || trip?.id;
              // Call the Redux action
              await dispatch(deleteUserTrip(tripId));
              showToast("success", "Trip deleted successfully!");
              navigation.navigate(navigationStrings.BOTTOM_TAB, {
                screen: navigationStrings.TRIPS,
                params: { screen: navigationStrings.TRIPS },
              });
            } catch (error) {
              console.error("Error deleting trip:", error);
              showToast("error", error?.message || "Failed to delete trip");
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOptOut = () => {
    Alert.alert(
      "Opt out of this trip",
      "You will leave this crew trip. You can rejoin later from Trip Details.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Opt out",
          style: "destructive",
          onPress: async () => {
            const canonicalId = trip?.canonicalTripId || trip?._id || trip?.id;
            if (!canonicalId) {
              showToast("error", "Trip ID not found");
              return;
            }
            try {
              setIsLoading(true);
              await optOutOfTrip(canonicalId);
              showToast("success", "You opted out of this trip");
              const groupId = trip?.groupId || trip?.group_id;
              if (groupId) {
                navigation.navigate(navigationStrings.GROUP_DETAILS, {
                  groupId,
                });
              } else {
                navigation.navigate(navigationStrings.BOTTOM_TAB, {
                  screen: navigationStrings.TRIPS,
                  params: { screen: navigationStrings.TRIPS },
                });
              }
            } catch (error) {
              showToast("error", error?.message || "Failed to opt out");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCoverPhotoPress = async () => {
    try {
      const result = await pickImage();
      if (!result?.uri) return;
      setCoverPhotoFile(result);
      setCoverPhotoUri(result.uri);
      setCoverFailed(false);
    } catch (error) {
      console.error("Error picking cover photo:", error);
      showToast("error", error?.message || "Failed to pick image");
    }
  };

  const openCalendar = (field) => {
    setActiveField(field);
    setShowCalendar(true);
  };

  const onDayPress = (day) => {
    if (activeField === "from") {
      setFromDate(day.dateString);
    } else if (activeField === "to") {
      setToDate(day.dateString);
    }
    setShowCalendar(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Select Date";
    return dateString;
  };

  return (
    <MainContainer loader={isLoading || deleteLoading}>
      <Header title="Edit Trip" showBack={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + getHeight(24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip Name Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Trip Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={tripName}
              onChangeText={setTripName}
              placeholder="Enter trip name"
              placeholderTextColor={colors.lightText}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        {/* Date Selection Section */}
        <View style={styles.section}>
          <View style={styles.dateRow}>
            {/* From Date */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openCalendar("from")}
              >
                <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openCalendar("to")}
              >
                <Text style={styles.dateText}>{formatDate(toDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cover Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Cover Photo</Text>
          <TouchableOpacity
            style={styles.coverPhotoContainer}
            onPress={handleCoverPhotoPress}
            activeOpacity={0.85}
          >
            {coverPhotoUri && !coverFailed ? (
              coverPhotoUri.startsWith("file://") ||
              coverPhotoUri.startsWith("content://") ? (
                <Image
                  source={{ uri: coverPhotoUri }}
                  style={styles.coverPhoto}
                  resizeMode="cover"
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <OptimizedImage
                  source={{ uri: coverPhotoUri }}
                  style={styles.coverPhoto}
                  resizeMode="cover"
                  onError={() => setCoverFailed(true)}
                />
              )
            ) : (
              <Image
                source={imagePath.DUMMY_ICON}
                style={styles.coverPhoto}
                resizeMode="cover"
              />
            )}
            <View style={styles.coverPhotoOverlay} pointerEvents="none">
              <Image
                source={imagePath.CAMERA_ICON}
                style={styles.coverCameraIcon}
                resizeMode="contain"
              />
              <Text style={styles.coverPhotoHint}>
                {coverPhotoUri && !coverFailed
                  ? "Change cover photo"
                  : "Add cover photo"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {canOptOut ? (
            <ButtonComp
              title="Opt out of this trip"
              onPress={handleOptOut}
              disabled={isLoading || deleteLoading}
              containerStyle={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          ) : null}

          {canDelete ? (
            <ButtonComp
              title="Delete Trip"
              onPress={handleDelete}
              disabled={isLoading || deleteLoading}
              containerStyle={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          ) : null}

          <ButtonComp
            disabled={deleteLoading}
            title="Save"
            onPress={handleSave}
          />
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [fromDate]: { selected: true, selectedColor: colors.primary },
                [toDate]: { selected: true, selectedColor: colors.green },
              }}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MainContainer>
  );
};

export default EditTrip;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getHeight(20),
  },
  section: {
    marginBottom: getHeight(24),
  },
  label: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  inputContainer: {
    backgroundColor: colors.secondary,
    borderRadius: getRadius(10),
    paddingHorizontal: getWidth(12),
    justifyContent: "center",
    ...Platform.select({
      ios: {
        paddingVertical: getHeight(14),
      },
      android: {
        height: getHeight(48),
        paddingVertical: 0,
      },
    }),
  },
  textInput: {
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    ...Platform.select({
      ios: {
        fontSize: getHeight(16),
      },
      android: {
        fontSize: getFontSize(14),
        paddingVertical: 0,
        margin: 0,
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(12),
  },
  fieldWrapper: {
    flex: 1,
  },
  dateText: {
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    ...Platform.select({
      ios: {
        fontSize: getHeight(16),
      },
      android: {
        fontSize: getFontSize(14),
        includeFontPadding: false,
      },
    }),
  },
  coverPhotoContainer: {
    height: getHeight(120),
    borderRadius: getRadius(10),
    overflow: "hidden",
    backgroundColor: colors.input,
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverCameraIcon: {
    width: getWidth(28),
    height: getHeight(28),
    tintColor: colors.white,
    marginBottom: getHeight(6),
  },
  coverPhotoHint: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.white,
  },
  buttonsContainer: {
    marginTop: getHeight(32),
    gap: getHeight(12),
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.red,
  },
  deleteButtonText: {
    color: colors.red,
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    borderRadius: getRadius(10),
  },
  saveButtonText: {
    color: colors.black,
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    width: "90%",
    borderRadius: getRadius(12),
    backgroundColor: colors.white,
    padding: getWidth(10),
  },
  closeBtn: {
    marginTop: getHeight(10),
    alignSelf: "flex-end",
    paddingVertical: getHeight(6),
    paddingHorizontal: getWidth(12),
    backgroundColor: colors.primary,
    borderRadius: getRadius(6),
  },
  closeText: {
    color: colors.white,
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
  },
});
