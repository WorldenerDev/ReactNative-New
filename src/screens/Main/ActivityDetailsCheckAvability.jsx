import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getFontSize, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";

const ActivityDetailsCheckAvability = ({ navigation, route }) => {
  const { eventData } = route?.params || {};

  // State management
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    label: "09:30",
    value: "09:30",
  });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({
    adult: 1,
    student: 9,
    youth: 0,
  });

  // Generate dates from current date
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const dayName = dayNames[date.getDay()];

      const label = `${month} ${day}\n${dayName}`;
      const value = `${month} ${day} ${dayName}`;

      dates.push({
        id: (i + 1).toString(),
        label,
        value,
        date: new Date(date),
      });
    }

    return dates;
  };

  const dates = generateDates();

  // Set initial selected date to today
  React.useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].value);
    }
  }, []);

  // Time options
  const timeOptions = [
    { label: "09:30", value: "09:30" },
    { label: "10:00", value: "10:00" },
    { label: "10:30", value: "10:30" },
    { label: "11:00", value: "11:00" },
    { label: "11:30", value: "11:30" },
    { label: "12:00", value: "12:00" },
  ];

  // Ticket types
  const ticketTypes = [
    { id: "adult", label: "Adult (30-64)", price: 99, max: 10 },
    { id: "student", label: "Student", price: 30, max: 10 },
    { id: "youth", label: "Youth (11-29)", price: 25, max: 10 },
  ];

  // Option data
  const options = [
    { id: "1", title: "Option 1" },
    { id: "2", title: "Option 2" },
    { id: "3", title: "Option 3" },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeDropdown(false);
  };

  const handleQuantityChange = (ticketId, change) => {
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, Math.min(10, prev[ticketId] + change)),
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving booking details...");
    navigation.goBack();
  };

  const handleCalendarPress = () => {
    // Handle calendar icon press - could open a full calendar modal
    console.log("Calendar icon pressed - could open full calendar");
    // You can implement a full calendar modal here if needed
  };

  return (
    <MainContainer>
      <Header title="Eiffel Tower Guided Tour by Elevator" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionTitle}>Select a date</Text>
          <View style={styles.dateContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            >
              {dates.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dateItem,
                    selectedDate === item.value && styles.selectedDateItem,
                  ]}
                  onPress={() => handleDateSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      selectedDate === item.value && styles.selectedDateText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.calendarIcon}
              onPress={handleCalendarPress}
            >
              <Image
                source={imagePath.CALENDER_ICON}
                style={styles.calendarIconImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Option Selection */}
        <View style={styles.optionSection}>
          <Text style={styles.sectionTitle}>Select your option</Text>

          {options.map((option) => (
            <View key={option.id} style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleOptionSelect(option.id)}
              >
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === option.id &&
                        styles.selectedRadioButton,
                    ]}
                  >
                    {selectedOption === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
              </TouchableOpacity>

              {/* Expanded content for Option 1 */}
              {selectedOption === "1" && option.id === "1" && (
                <View style={styles.expandedContent}>
                  {/* Time Selection */}
                  <View style={styles.timeSelectorContainer}>
                    <TouchableOpacity
                      style={styles.timeSelector}
                      onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                    >
                      <Image
                        source={imagePath.CALENDER_ICON}
                        style={styles.clockIcon}
                      />
                      <Text style={styles.timeText}>
                        {selectedTime ? selectedTime.label : "09:30"}
                      </Text>
                      <Image
                        source={imagePath.ARROW_DOWN_ICON}
                        style={[
                          styles.arrowIcon,
                          showTimeDropdown && styles.arrowIconRotated,
                        ]}
                      />
                    </TouchableOpacity>

                    {showTimeDropdown && (
                      <View style={styles.timeDropdown}>
                        {timeOptions.map((time) => (
                          <TouchableOpacity
                            key={time.value}
                            style={[
                              styles.timeOption,
                              selectedTime?.value === time.value &&
                                styles.selectedTimeOption,
                            ]}
                            onPress={() => handleTimeSelect(time)}
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                selectedTime?.value === time.value &&
                                  styles.selectedTimeOptionText,
                              ]}
                            >
                              {time.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Ticket Quantity Selectors */}
                  {ticketTypes.map((ticket) => (
                    <View key={ticket.id} style={styles.ticketRow}>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.ticketLabel}>{ticket.label}</Text>
                        <Text style={styles.ticketPrice}>${ticket.price}</Text>
                      </View>
                      <View style={styles.quantitySelector}>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            ticketQuantities[ticket.id] === 0 &&
                              styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, -1)}
                          disabled={ticketQuantities[ticket.id] === 0}
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              ticketQuantities[ticket.id] === 0 &&
                                styles.disabledButtonText,
                            ]}
                          >
                            -
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {ticketQuantities[ticket.id]}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            ticketQuantities[ticket.id] === ticket.max &&
                              styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, 1)}
                          disabled={ticketQuantities[ticket.id] === ticket.max}
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              ticketQuantities[ticket.id] === ticket.max &&
                                styles.disabledButtonText,
                            ]}
                          >
                            +
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </MainContainer>
  );
};

export default ActivityDetailsCheckAvability;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Date Section Styles
  dateSection: {
    paddingVertical: getHeight(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateSectionTitle: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(15),
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateList: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    marginRight: getWidth(10),
  },
  dateItem: {
    paddingHorizontal: getWidth(6),
    paddingVertical: getHeight(8),
    borderRadius: getRadius(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: getHeight(45),
    marginHorizontal: getWidth(1),
  },
  selectedDateItem: {
    backgroundColor: "#d9f0ff",
    borderColor: "#d9f0ff",
    borderBottomWidth: 3,
    borderBottomColor: "#4A90E2",
  },
  dateText: {
    fontSize: getFontSize(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textAlign: "center",
    lineHeight: getHeight(12),
  },
  selectedDateText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  calendarIcon: {
    width: getWidth(45),
    height: getHeight(45),
    backgroundColor: colors.white,
    borderRadius: getRadius(8),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIconImage: {
    width: getWidth(18),
    height: getHeight(18),
    tintColor: colors.black,
  },

  // Option Section Styles
  optionSection: {
    paddingHorizontal: getWidth(20),
    paddingVertical: getHeight(20),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(20),
  },
  optionContainer: {
    marginBottom: getHeight(15),
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getHeight(12),
  },
  radioContainer: {
    marginRight: getWidth(12),
  },
  radioButton: {
    width: getWidth(20),
    height: getHeight(20),
    borderRadius: getRadius(10),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    borderColor: "#4A90E2",
  },
  radioInner: {
    width: getWidth(10),
    height: getHeight(10),
    borderRadius: getRadius(5),
    backgroundColor: "#4A90E2",
  },
  optionText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },

  // Expanded Content Styles
  expandedContent: {
    marginTop: getHeight(10),
    paddingLeft: getWidth(32),
  },
  timeSelectorContainer: {
    position: "relative",
    marginBottom: getHeight(15),
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(10),
    borderRadius: getRadius(8),
    borderWidth: 1,
    borderColor: colors.border,
  },
  clockIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: colors.lightText,
    marginRight: getWidth(8),
  },
  timeText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    flex: 1,
  },
  arrowIcon: {
    width: getWidth(12),
    height: getHeight(12),
    tintColor: colors.lightText,
  },
  arrowIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  timeDropdown: {
    position: "absolute",
    top: getHeight(45),
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: getRadius(8),
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 1000,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeOption: {
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedTimeOption: {
    backgroundColor: "#f0f8ff",
  },
  timeOptionText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
  },
  selectedTimeOptionText: {
    color: "#4A90E2",
    fontFamily: fonts.RobotoMedium,
  },

  // Ticket Row Styles
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: getHeight(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(2),
  },
  ticketPrice: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: getWidth(8),
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  quantityButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  disabledButtonText: {
    color: colors.lightText,
  },
  quantityText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    minWidth: getWidth(20),
    textAlign: "center",
  },

  // Bottom Container Styles
  bottomContainer: {
    paddingHorizontal: getWidth(20),
    paddingVertical: getHeight(20),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: "#d9f0ff",
    paddingVertical: getHeight(14),
    borderRadius: getRadius(8),
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
});
