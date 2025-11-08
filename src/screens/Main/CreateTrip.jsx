import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { Calendar } from "react-native-calendars";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import StepTitle from "@components/StepTitle";
import navigationStrings from "@navigation/navigationStrings";
import { showToast } from "@components/AppToast";
import {
  validateForm,
  validateCity,
  validateFromDate,
  validateToDate,
  validateTripMembers,
} from "@utils/validators";
import { createTrip, getTripBuddies } from "@api/services/mainServices";
import usePermissions from "@hooks/usePermissions";
import Contacts from "react-native-contacts";

const CreateTrip = ({ navigation, route }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { requestContactsPermission } = usePermissions();

  // Get city name directly from route params
  const city = route?.params?.cityData || "";
  const selectedBuddyPhones = route?.params?.selectedBuddyPhones || [];

  console.log("selectedBuddyPhones", selectedBuddyPhones);

  const handleContinue = async () => {
    try {
      const error = validateForm([
        { validator: validateCity, values: [city?.name] },
        { validator: validateFromDate, values: [fromDate] },
        { validator: validateToDate, values: [toDate, fromDate] },
        // { validator: validateTripMembers, values: [selectedBuddyPhones] },
      ]);

      if (error) {
        showToast("error", error);
        return;
      }

      setIsLoading(true);

      // Prepare API payload
      const tripData = {
        city_id: String(city?.city_id),
        start_at: fromDate,
        end_at: toDate,
        groups: selectedBuddyPhones,
        isGroupTrip: true

      };

      console.log("Creating trip with data:", tripData);

      // Call the API
      const response = await createTrip(tripData);
      showToast("success", "Trip created successfully!");
      navigation.reset({
        index: 1,
        routes: [
          { name: navigationStrings.BOTTOM_TAB },
          {
            name: navigationStrings.TRIP_DETAILS,
            params: { tripId: response?.data?._id },
          },
        ],
      });
    } catch (error) {
      console.error("Error creating trip:", error);
      showToast("error", error?.message || "Failed to create trip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipants = async () => {
    try {
      const permissionGranted = await requestContactsPermission();
      if (permissionGranted) {
        // Fetch contacts after permission is granted
        try {
          const contacts = await Contacts.getAll();
          const phoneNumbers = contacts
            .flatMap(contact => contact.phoneNumbers || [])
            .map(phone => phone.number)
            .filter(phone => phone && phone.trim() !== ""); // Filter out empty phone numbers

          console.log("📱 Phone Numbers Array:", phoneNumbers);
          if (phoneNumbers.length > 0) {
            try {
              setIsLoading(true);
              const response = await getTripBuddies({
                contacts: phoneNumbers
              });
              navigation.navigate(navigationStrings.ADD_TO_TRIP, {
                cityData: city,
                selectedBuddyPhones: response?.data,
              });
            } catch (apiError) {
              console.error("Error calling getTripBuddies:", apiError);
              showToast("error", apiError?.message || "Failed to fetch trip buddies");
            } finally {
              setIsLoading(false);
            }
          }
        } catch (contactsError) {
          console.error("Error fetching contacts:", contactsError);
        }


      } else {
        showToast("error", "Contacts permission is required to add participants");
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      showToast("error", "Failed to request contacts permission");
    }
  };

  const handleCityPress = () => {
    navigation.navigate(navigationStrings.SEARCH_CITY, {
      mode: "cityOnly",
      fromScreen: "CreateTrip",
      cityData: city,
      selectedBuddyPhones: selectedBuddyPhones,
    });
  };

  const openCalendar = (field) => {
    // Check if trying to select "to" date without selecting "from" date first
    if (field === "to" && !fromDate) {
      showToast("error", "Please select a start date first");
      return;
    }

    setActiveField(field);
    setShowCalendar(true);
  };

  const onDayPress = (day) => {
    const today = new Date().toISOString().split("T")[0];

    if (activeField === "from") {
      // Prevent selection of dates before today for from field
      if (day.dateString < today) {
        showToast("error", "Cannot select a date before today");
        return;
      }
      setFromDate(day.dateString);
      // Clear to date if it's before the new from date
      if (toDate && day.dateString > toDate) {
        setToDate("");
      }
    } else if (activeField === "to") {
      // Prevent selection of dates before from date for to field
      if (day.dateString < fromDate) {
        showToast("error", "End date cannot be before start date");
        return;
      }
      setToDate(day.dateString);
    }
    setShowCalendar(false);
  };

  return (
    <MainContainer loader={isLoading}>
      <Header />
      <StepTitle
        title="Create Trip"
        subtitle="Create a trip to manage all your itineraries and events."
      />

      {/* Where Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={imagePath.LOCATION_ON_ICON} style={styles.icon} />
          <Text style={styles.sectionTitle}>Where?</Text>
        </View>
        {/* City Input */}
        <TouchableOpacity style={styles.inputBox} onPress={handleCityPress}>
          <Text style={styles.inputText}>{city?.name || "Enter City"}</Text>
        </TouchableOpacity>
      </View>

      {/* When Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={imagePath.CALENDER_ICON} style={styles.icon} />
          <Text style={styles.sectionTitle}>When?</Text>
        </View>

        <View style={styles.dateRow}>
          {/* From Date */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>From</Text>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => openCalendar("from")}
            >
              <Text style={styles.dateText}>{fromDate || "Select Date"}</Text>
            </TouchableOpacity>
          </View>

          {/* To Date */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>To</Text>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => openCalendar("to")}
            >
              <Text style={styles.dateText}>{toDate || "Select Date"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Who Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={imagePath.GROUP} style={styles.icon} />
          <Text style={styles.sectionTitle}>Who?</Text>
        </View>
        <TouchableOpacity
          style={styles.addParticipantsButton}
          onPress={handleAddParticipants}
        >
          <Text style={styles.addParticipantsText}>Start Adding →</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <ButtonComp
        title="Continue"
        onPress={handleContinue}
        disabled={isLoading}
        containerStyle={styles.continueButton}
      />

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={onDayPress}
              minDate={
                activeField === "from"
                  ? new Date().toISOString().split("T")[0]
                  : activeField === "to" && fromDate
                    ? fromDate
                    : undefined
              }
              markedDates={{
                [fromDate]: { selected: true, selectedColor: "#2E86DE" },
                [toDate]: { selected: true, selectedColor: "#20BF6B" },
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

export default CreateTrip;

const styles = StyleSheet.create({
  section: {
    marginBottom: getHeight(32),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(12),
  },
  icon: {
    width: getWidth(20),
    height: getHeight(20),
    marginRight: getWidth(8),
    tintColor: colors.black,
    resizeMode: "contain",
  },
  sectionTitle: {
    fontSize: getHeight(18),
    fontWeight: "700",
    color: colors.black,
  },
  inputBox: {
    backgroundColor: "#D6ECF6",
    borderRadius: 10,
    paddingVertical: getHeight(14),
    paddingHorizontal: getWidth(12),
    justifyContent: "center",
  },
  inputText: {
    fontSize: getHeight(16),
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
  label: {
    fontSize: getHeight(12),
    color: colors.black,
    marginBottom: getHeight(6),
    fontWeight: "500",
  },
  dateBox: {
    backgroundColor: "#D6ECF6",
    borderRadius: 10,
    paddingVertical: getHeight(14),
    paddingHorizontal: getWidth(12),
    justifyContent: "center",
  },
  dateText: {
    fontSize: getHeight(16),
    color: colors.black,
  },
  addParticipantsButton: {
    backgroundColor: "transparent",
    paddingVertical: getHeight(16),
    marginTop: getHeight(8),
  },
  addParticipantsText: {
    fontSize: getHeight(16),
    color: colors.black,
    fontWeight: "500",
  },
  continueButton: {
    marginTop: getHeight(40),
    marginBottom: getHeight(20),
    width: "100%",
    backgroundColor: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    width: "90%",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 10,
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2E86DE",
    borderRadius: 6,
  },
  closeText: {
    color: "#fff",
    fontSize: 14,
  },
});
