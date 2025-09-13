import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import CustomInput from "@components/CustomInput";
import ButtonComp from "@components/ButtonComp";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import StepTitle from "@components/StepTitle";

const CreateTrip = () => {
  const [city, setCity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleContinue = () => {
    // Handle continue button press
    console.log("Continue pressed", { city, fromDate, toDate });
  };

  const handleAddParticipants = () => {
    // Handle adding participants
    console.log("Add participants pressed");
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
        <CustomInput
          placeholder="Enter City"
          value={city}
          onChangeText={setCity}
          containerStyle={styles.inputContainer}
        />
      </View>

      {/* When Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Image source={imagePath.CALENDER_ICON} style={styles.icon} />
          <Text style={styles.sectionTitle}>When?</Text>
        </View>
        <View style={styles.dateRow}>
          <CustomInput
            placeholder="Date"
            label="From"
            value={fromDate}
            onChangeText={setFromDate}
            containerStyle={styles.dateInputContainer}
          />
          <CustomInput
            label="To"
            placeholder="Date"
            value={toDate}
            onChangeText={setToDate}
            containerStyle={styles.dateInputContainer}
          />
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
    </MainContainer>
  );
};

export default CreateTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: getWidth(20),
    paddingTop: getHeight(20),
  },
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
  inputContainer: {
    paddingVertical: 0,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(12),
  },
  dateInputContainer: {
    flex: 1,
    paddingVertical: 0,
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
});
