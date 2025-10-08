import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import React, { useEffect, useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import CustomDropdown from "@components/CustomDropdown";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getRadius, getFontSize, getWidth } from "@utils/responsive";
import imagePath from "@assets/icons";
import {
  getEventDates,
  getEventDatesDetails,
  addEventInTrip,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import navigationStrings from "@navigation/navigationStrings";

const ActivityDetailsCheckAvability = ({ navigation, route }) => {
  const { eventData } = route?.params || {};
  const [eventDate, setEventDate] = useState([]);
  const [dateDetails, setDateDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({});

  // API call to get event dates
  const fetchEventDates = async () => {
    try {
      setIsLoading(true);
      const requestData = {
        activityUuid: eventData?.activityUuid,
        ...(eventData?.pickupPointId && { pickup: eventData?.pickupPointId }),
      };
      const response = await getEventDates(requestData);
      if (response?.data?.length > 0) {
        setIsLoading(false);
        setEventDate(response?.data);
      } else {
        setEventDate([]);
        showToast("No dates found");
      }
    } catch (error) {
      console.error("❌ Error fetching event dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // API call to get event dates details
  const fetchEventDatesDetails = async (selectedDate) => {
    try {
      setIsLoading(true);
      const requestData = {
        activityUuid: eventData?.activityUuid,
        date: selectedDate,
        ...(eventData?.pickupPointId && { pickup: eventData?.pickupPointId }),
      };
      console.log(" Calling getEventDatesDetails with data:", requestData);
      const response = await getEventDatesDetails(requestData);
      setIsLoading(false);
      console.log(" getEventDatesDetails response:", response);
      setDateDetails(response?.data?.groups || response?.groups);
      return response;
    } catch (error) {
      console.error("❌ Error fetching event dates details:", error);
      showToast("error", "Failed to fetch event details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDate && eventDate.length > 0) {
      setSelectedDate(eventDate[0].day);
      // Call the API with the first available date
      fetchEventDatesDetails(eventDate[0].day);
    }
  }, [eventDate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    return `${month} ${day} ${weekday}`;
  };

  // Call API to get event dates
  useEffect(() => {
    fetchEventDates();
  }, []);

  // Get time slots from selected group
  const getTimeSlotsForSelectedGroup = () => {
    if (!selectedOption || !dateDetails) return [];
    const selectedGroup = dateDetails.find(
      (group) => group.name === selectedOption
    );
    if (!selectedGroup || !selectedGroup.slots) return [];

    return selectedGroup.slots.map((slot) => ({
      label: slot.time,
      value: slot.time,
      slot: slot,
    }));
  };

  // Get products for selected time slot
  const getProductsForSelectedTime = () => {
    if (!selectedOption || !selectedTime || !dateDetails) return [];
    const selectedGroup = dateDetails.find(
      (group) => group.name === selectedOption
    );
    if (!selectedGroup || !selectedGroup.slots) return [];

    const selectedSlot = selectedGroup.slots.find(
      (slot) => slot.time === selectedTime.value
    );
    if (!selectedSlot || !selectedSlot.products) return [];

    return selectedSlot.products.map((product) => ({
      id: product.product_id,
      name: product.name,
      price: product.retail_price?.value || 0,
      formatted_price:
        product.retail_price?.formatted_value ||
        `$${product.retail_price?.value || 0}`,
      max: product.max_buy,
      min: product.min_buy,
    }));
  };

  // Time options from API
  const timeOptions = getTimeSlotsForSelectedGroup();

  // Products from API
  const ticketTypes = getProductsForSelectedTime();

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    // Call the new API when a date is selected
    await fetchEventDatesDetails(date);
  };

  const handleOptionSelect = (optionName) => {
    setSelectedOption(optionName);

    // Reset time and quantities when group changes
    setSelectedTime(null);
    setTicketQuantities({});
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleQuantityChange = (ticketId, change) => {
    setTicketQuantities((prev) => {
      const currentQuantity = prev[ticketId] || 0;
      const newQuantity = currentQuantity + change;

      return {
        ...prev,
        [ticketId]: Math.max(0, newQuantity),
      };
    });
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const onDayPress = async (day) => {
    // Check if the selected date is available in the API data
    const isAvailable = eventDate.some((event) => event.day === day.dateString);

    if (isAvailable) {
      setSelectedDate(day.dateString);
      setShowCalendar(false);
      // Call the new API when a date is selected from calendar
      await fetchEventDatesDetails(day.dateString);
    } else {
      showToast("error", "This date is not available for booking");
    }
  };

  // Create marked dates for react-native-calendars
  const getMarkedDates = () => {
    const markedDates = {};

    // Mark available dates
    eventDate.forEach((event) => {
      markedDates[event.day] = {
        marked: true,
        dotColor: colors.primary,
        activeOpacity: 0.7,
      };
    });

    // Mark selected date
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return markedDates;
  };

  // Calculate total price using retail_price
  const getTotalPrice = () => {
    let total = 0;
    ticketTypes.forEach((ticket) => {
      const quantity = ticketQuantities[ticket.id] || 0;
      total += ticket.price * quantity;
    });
    return total;
  };

  const handleSave = async () => {
    try {
      // Collect selected data for booking
      const selectedProducts = ticketTypes
        .filter((ticket) => (ticketQuantities[ticket.id] || 0) > 0)
        .map((ticket) => ({
          product_id: ticket.id,
          product_name: ticket.name,
          type: ticket?.type || "musement", // Based on the API example
          quantity: ticketQuantities[ticket.id] || 0,
          retail_price: ticket.price,
          total_price: ticket.price * (ticketQuantities[ticket.id] || 0),
        }));

      // Check if any products are selected
      if (selectedProducts.length === 0) {
        showToast("error", "Please select at least one ticket");
        return;
      }

      // Check if required fields are present
      if (!selectedDate || !selectedOption || !selectedTime) {
        showToast("error", "Please complete all selections");
        return;
      }

      // Prepare API request data
      const requestData = {
        city_id: String(eventData?.cityId || ""), // Ensure city_id is a string
        event_id: eventData?.activityUuid,
        start_date: selectedDate,
        products: selectedProducts,
      };
      setIsLoading(true);
      const response = await addEventInTrip(requestData);
      showToast("success", response?.message);
      navigation.navigate(navigationStrings.TRIP_DETAILS, {
        trip: response?.data,
        tripId: response?.data?.id || response?.data?._id,
      });
    } catch (error) {
      console.error("❌ Error adding event to trip:", error);
      showToast("error", error?.message || "Failed to add event to trip");
    } finally {
      setIsLoading(false);
    }
  };

  // Render function for FlatList date items
  const renderDateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        selectedDate === item.day && styles.selectedDateItem,
      ]}
      onPress={() => handleDateSelect(item.day)}
    >
      <Text
        style={[
          styles.dateText,
          selectedDate === item.day && styles.selectedDateText,
        ]}
      >
        {formatDate(item.day)}
      </Text>
    </TouchableOpacity>
  );

  // Separator component for FlatList
  const ItemSeparator = () => <View style={{ width: getWidth(2) }} />;

  return (
    <MainContainer loader={isLoading}>
      <Header title={eventData?.activityName} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionTitle}>Select a date</Text>
          <View style={styles.dateContainer}>
            <FlatList
              data={eventDate.slice(0, 10)}
              renderItem={renderDateItem}
              keyExtractor={(item, index) => item.day || index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
              ItemSeparatorComponent={ItemSeparator}
              scrollEnabled={true}
              bounces={false}
            />
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={handleCalendarToggle}
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

          {dateDetails?.map((option) => (
            <View key={option?.name} style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleOptionSelect(option.name)}
              >
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === option?.name &&
                        styles.selectedRadioButton,
                    ]}
                  >
                    {selectedOption === option?.name && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.optionText}>{option.name}</Text>
              </TouchableOpacity>

              {/* Expanded content for selected option */}
              {selectedOption === option?.name && (
                <View style={styles.expandedContent}>
                  {/* Time Selection */}
                  <View style={styles.timeSelectorContainer}>
                    <CustomDropdown
                      placeholder={
                        timeOptions.length > 0
                          ? "Please select the time"
                          : "No time slots available"
                      }
                      options={timeOptions}
                      selectedValue={selectedTime}
                      onValueChange={handleTimeSelect}
                      containerStyle={styles.timeDropdownContainer}
                      dropdownWrapperStyle={styles.timeSelector}
                      customIcon={imagePath.CALENDER_ICON}
                      iconStyle={styles.clockIcon}
                      textStyle={styles.timeText}
                      arrowIconStyle={styles.arrowIcon}
                    />
                  </View>

                  {/* Ticket Quantity Selectors */}
                  {ticketTypes.map((ticket) => (
                    <View key={ticket.id} style={styles.ticketRow}>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.ticketLabel}>{ticket.name}</Text>
                        <Text style={styles.ticketPrice}>
                          {ticket.formatted_price}
                        </Text>
                      </View>
                      <View style={styles.quantitySelector}>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            (ticketQuantities[ticket.id] || 0) === 0 &&
                              styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, -1)}
                          disabled={(ticketQuantities[ticket.id] || 0) === 0}
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              (ticketQuantities[ticket.id] || 0) === 0 &&
                                styles.disabledButtonText,
                            ]}
                          >
                            -
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {ticketQuantities[ticket.id] || 0}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            (ticketQuantities[ticket.id] || 0) === ticket.max &&
                              styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, 1)}
                          disabled={
                            (ticketQuantities[ticket.id] || 0) === ticket.max
                          }
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              (ticketQuantities[ticket.id] || 0) ===
                                ticket.max && styles.disabledButtonText,
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

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                textSectionTitleColor: colors.black,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                todayTextColor: colors.primary,
                dayTextColor: colors.black,
                textDisabledColor: colors.lightText,
                dotColor: colors.primary,
                selectedDotColor: colors.white,
                arrowColor: colors.primary,
                monthTextColor: colors.black,
                indicatorColor: colors.primary,
                textDayFontFamily: fonts.RobotoRegular,
                textMonthFontFamily: fonts.RobotoBold,
                textDayHeaderFontFamily: fonts.RobotoMedium,
                textDayFontSize: getFontSize(14),
                textMonthFontSize: getFontSize(16),
                textDayHeaderFontSize: getFontSize(12),
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

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <ButtonComp
          title={isLoading ? "Adding to Trip..." : "Add to Trip"}
          onPress={handleSave}
          disabled={isLoading}
          containerStyle={{ width: "100%" }}
        />
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
    flex: 1,
  },
  dateList: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidth(1),
    paddingRight: getWidth(10),
  },
  dateItem: {
    paddingHorizontal: getWidth(6),
    paddingVertical: getHeight(8),
    borderRadius: getRadius(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    width: getWidth(60),
    alignItems: "center",
    justifyContent: "center",
    height: getHeight(45),
  },
  selectedDateItem: {
    backgroundColor: "#d9f0ff",
    borderColor: "#d9f0ff",
    borderBottomWidth: 3,
    borderBottomColor: "#4A90E2",
  },
  dateText: {
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textAlign: "center",
    lineHeight: getHeight(12),
  },
  selectedDateText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  calendarIconImage: {
    width: getWidth(18),
    height: getHeight(18),
    tintColor: colors.black,
  },
  calendarButton: {
    width: getWidth(45),
    height: getHeight(45),
    backgroundColor: colors.white,
    borderRadius: getRadius(8),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: getWidth(10),
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
    marginBottom: getHeight(15),
  },
  timeDropdownContainer: {
    paddingVertical: 0,
    top: 0,
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
    height: undefined,
    minHeight: getHeight(40),
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
  disabledSaveButton: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },

  // Calendar Modal Styles
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
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
  },
});
