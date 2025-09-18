import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import OptimizedImage from "@components/OptimizedImage";
import {
  getHeight,
  getWidth,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";

const EditTrip = ({ navigation, route }) => {
  const { trip } = route?.params || {};

  // Form state
  const [tripName, setTripName] = useState(trip?.city?.name || "Tokyo Trip");
  const [fromDate, setFromDate] = useState(trip?.start_at?.slice(0, 10) || "");
  const [toDate, setToDate] = useState(trip?.end_at?.slice(0, 10) || "");
  const [coverPhoto, setCoverPhoto] = useState(trip?.city?.image || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      if (!tripName.trim()) {
        showToast("error", "Please enter a trip name");
        return;
      }
      if (!fromDate) {
        showToast("error", "Please select a start date");
        return;
      }
      if (!toDate) {
        showToast("error", "Please select an end date");
        return;
      }
      if (new Date(fromDate) > new Date(toDate)) {
        showToast("error", "End date must be after start date");
        return;
      }

      setIsLoading(true);

      // TODO: Implement API call to update trip
      console.log("Updating trip:", {
        name: tripName,
        start_at: fromDate,
        end_at: toDate,
        cover_photo: coverPhoto,
      });

      showToast("success", "Trip updated successfully!");
      navigation.goBack();
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
              setIsLoading(true);
              // TODO: Implement API call to delete trip
              console.log("Deleting trip:", trip?.id);
              showToast("success", "Trip deleted successfully!");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting trip:", error);
              showToast("error", error?.message || "Failed to delete trip");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCoverPhotoPress = () => {
    // TODO: Implement image picker
    showToast("info", "Cover photo selection coming soon!");
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
    <MainContainer loader={isLoading}>
      <Header title="Edit Trip" showBack={true} />

      <View style={styles.container}>
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
          >
            {coverPhoto ? (
              <OptimizedImage
                source={{ uri: coverPhoto }}
                style={styles.coverPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPhotoPlaceholder}>
                <Image
                  source={imagePath.CAMERA_ICON}
                  style={styles.cameraIcon}
                />
                <Text style={styles.placeholderText}>Add Cover Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <ButtonComp
            title="Delete Trip"
            onPress={handleDelete}
            disabled={isLoading}
            containerStyle={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />

          <ButtonComp title="Save" onPress={handleSave} />
        </View>
      </View>

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
  container: {
    flex: 1,
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
    paddingVertical: getHeight(14),
    paddingHorizontal: getWidth(12),
    justifyContent: "center",
  },
  textInput: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
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
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
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
  coverPhotoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.input,
  },
  cameraIcon: {
    width: getWidth(40),
    height: getHeight(40),
    tintColor: colors.lightText,
    marginBottom: getHeight(8),
  },
  placeholderText: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  buttonsContainer: {
    marginTop: getHeight(40),
    gap: getHeight(12),
    marginTop: getVertiPadding(150),
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
