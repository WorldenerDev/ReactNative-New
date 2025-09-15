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

const CreateTrip = ({ navigation, route }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeField, setActiveField] = useState(null);

  // Get city name directly from route params
  const city = route?.params?.cityData?.name || "";

  const handleContinue = () => {
    console.log("Continue pressed", { city, fromDate, toDate });
  };

  const handleAddParticipants = () => {
    navigation.navigate(navigationStrings.ADD_TO_TRIP);
  };

  const handleCityPress = () => {
    navigation.navigate(navigationStrings.SEARCH_CITY, {
      mode: "cityOnly",
      fromScreen: "CreateTrip",
    });
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

  return (
    <MainContainer>
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
          <Text style={styles.inputText}>{city || "Enter City"}</Text>
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
        disabled={false}
        containerStyle={styles.continueButton}
      />

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={onDayPress}
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
