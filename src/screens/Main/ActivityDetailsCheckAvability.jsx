import {
  addEventInTrip,
  getEventDates,
  getEventDatesDetails,
  updateCart,
} from "@api/services/mainServices";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import imagePath from "@assets/icons";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import MainContainer from "@components/container/MainContainer";
import CustomDropdown from "@components/CustomDropdown";
import Header from "@components/Header";
import { navigateToTripDetails } from "@navigation/helpers/nestedTabNavigation";
import navigationStrings from "@navigation/navigationStrings";
import { toYmd } from "@utils/formatDate";
import {
  canIncrementTicket,
  effectiveProductMinBuy,
  getPartySizeError,
  nextTicketQuantity,
} from "@utils/musementPartySize";
import { getFontSize, getHeight, getRadius, getWidth } from "@utils/responsive";
import { getTripId, normalizeTripDetails } from "@utils/tripHelpers";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuth from "@hooks/useAuth";
import { Calendar } from "react-native-calendars";

const ActivityDetailsCheckAvability = ({ navigation, route }) => {
  const { requireAuth } = useAuth();
  const { eventData, from } = route?.params || {};
  const [eventDate, setEventDate] = useState([]);
  const [dateDetails, setDateDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({});

  const tripStartYmd = useMemo(
    () => toYmd(eventData?.tripStartAt || eventData?.start_at),
    [eventData?.tripStartAt, eventData?.start_at],
  );
  const tripEndYmd = useMemo(
    () => toYmd(eventData?.tripEndAt || eventData?.end_at),
    [eventData?.tripEndAt, eventData?.end_at],
  );

  // Musement dates that fall within the associated trip window (when known).
  const selectableDates = useMemo(() => {
    if (!tripStartYmd || !tripEndYmd) {
      return eventDate;
    }
    return eventDate.filter((event) => {
      const day = toYmd(event?.day);
      return day && day >= tripStartYmd && day <= tripEndYmd;
    });
  }, [eventDate, tripStartYmd, tripEndYmd]);

  console.log("Event Data:", eventData);
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
  const fetchEventDatesDetails = async (dateValue) => {
    try {
      setIsLoading(true);

      // Format date to YYYY-MM-DD when coming from cart
      let formattedDate = dateValue;
      if (from === "cart" && dateValue) {
        // Convert ISO string or any date format to YYYY-MM-DD
        formattedDate = toYmd(dateValue) || dateValue;
      }

      const requestData = {
        activityUuid: eventData?.activityUuid,
        date: formattedDate,
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
    if (selectableDates.length === 0) {
      return;
    }

    const selectedYmd = toYmd(selectedDate);
    const isStillSelectable =
      selectedYmd &&
      selectableDates.some((event) => toYmd(event.day) === selectedYmd);

    if (isStillSelectable) {
      fetchEventDatesDetails(selectedYmd);
      return;
    }

    // Prefer cart date when it is still within the trip window
    if (from === "cart" && eventData?.selectedDate) {
      const cartDay = toYmd(eventData.selectedDate);
      const cartStillValid = selectableDates.some(
        (event) => toYmd(event.day) === cartDay,
      );
      if (cartStillValid && cartDay) {
        setSelectedDate(cartDay);
        fetchEventDatesDetails(cartDay);
        return;
      }
    }

    const firstDay = selectableDates[0].day;
    setSelectedDate(firstDay);
    fetchEventDatesDetails(firstDay);
  }, [selectableDates, from, eventData?.selectedDate]);

  useEffect(() => {
    if (
      eventDate.length > 0 &&
      tripStartYmd &&
      tripEndYmd &&
      selectableDates.length === 0
    ) {
      showToast(
        "error",
        "No available dates fall within your trip dates",
      );
    }
  }, [eventDate, selectableDates, tripStartYmd, tripEndYmd]);

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

  // Normalize cart selected date early (before Musement list loads)
  useEffect(() => {
    if (from === "cart" && eventData?.selectedDate && !selectedDate) {
      const cartDay = toYmd(eventData.selectedDate);
      if (cartDay) {
        setSelectedDate(cartDay);
      }
    }
  }, [from, eventData?.selectedDate]);

  // Get time slots from selected group
  const getTimeSlotsForSelectedGroup = () => {
    if (!selectedOption || !dateDetails) return [];
    const selectedGroup = dateDetails.find(
      (group) => group.name === selectedOption,
    );
    if (!selectedGroup || !selectedGroup.slots) return [];

    return selectedGroup.slots.map((slot) => ({
      label: slot.time,
      value: slot.time,
      slot: slot,
    }));
  };

  // Get products for selected time slot
  const getSelectedSlot = () => {
    if (!selectedOption || !selectedTime || !dateDetails) return null;
    const selectedGroup = dateDetails.find(
      (group) => group.name === selectedOption,
    );
    if (!selectedGroup || !selectedGroup.slots) return null;
    return (
      selectedGroup.slots.find((slot) => slot.time === selectedTime.value) ||
      null
    );
  };

  const getProductsForSelectedTime = () => {
    const selectedSlot = getSelectedSlot();
    if (!selectedSlot) return [];
    const products = selectedSlot.products || [];

    const fallbackPrice = eventData?.price ?? 0;
    const fallbackFormatted =
      eventData?.currency === "EUR"
        ? `€${fallbackPrice}`
        : `$${fallbackPrice}`;

    // When API returns no products but we have price (e.g. from wishlist), show one fallback ticket
    if (products.length === 0 && fallbackPrice > 0) {
      return [
        {
          id: "fallback-price",
          name: "Standard",
          price: fallbackPrice,
          formatted_price: fallbackFormatted,
          max: 10,
          min: 1,
          type: "musement",
        },
      ];
    }

    return products.map((product) => ({
      id: product.product_id,
      name: product.name,
      type: product.type || "musement",
      price: product.retail_price?.value ?? fallbackPrice,
      formatted_price:
        product.retail_price?.formatted_value ||
        (product.retail_price?.value != null
          ? `$${product.retail_price.value}`
          : fallbackFormatted),
      max: product.max_buy,
      min: product.min_buy,
    }));
  };

  // Time options from API
  const timeOptions = getTimeSlotsForSelectedGroup();

  // Products from API
  const ticketTypes = getProductsForSelectedTime();
  const selectedSlot = getSelectedSlot();

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setTicketQuantities({});
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
    setTicketQuantities({});
  };

  const handleQuantityChange = (ticketId, change) => {
    const ticket = ticketTypes.find((item) => item.id === ticketId);
    if (!ticket) return;

    setTicketQuantities((prev) => {
      const currentQuantity = prev[ticketId] || 0;
      const nextQuantity = nextTicketQuantity(
        currentQuantity,
        change,
        ticket.min,
        ticket.max,
      );

      if (change > 0) {
        const othersTotal = ticketTypes.reduce((sum, item) => {
          if (item.id === ticketId) return sum;
          return sum + (prev[item.id] || 0);
        }, 0);
        const slotMax = selectedSlot?.max_buy;
        const maxAllowed =
          slotMax == null || Number(slotMax) < 0
            ? Number.POSITIVE_INFINITY
            : Number(slotMax);
        if (Number.isFinite(maxAllowed) && othersTotal + nextQuantity > maxAllowed) {
          return prev;
        }
      }

      return {
        ...prev,
        [ticketId]: nextQuantity,
      };
    });
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const onDayPress = async (day) => {
    const isAvailable = selectableDates.some(
      (event) => event.day === day.dateString,
    );

    if (isAvailable) {
      setSelectedDate(day.dateString);
      setTicketQuantities({});
      setShowCalendar(false);
      await fetchEventDatesDetails(day.dateString);
    } else {
      showToast("error", "This date is not available for booking");
    }
  };

  // Create marked dates for react-native-calendars
  const getMarkedDates = () => {
    const markedDates = {};

    selectableDates.forEach((event) => {
      markedDates[event.day] = {
        marked: true,
        dotColor: colors.primary,
        activeOpacity: 0.7,
      };
    });

    // Mark selected date
    if (selectedDate) {
      const selectedYmd = toYmd(selectedDate) || selectedDate;
      markedDates[selectedYmd] = {
        ...markedDates[selectedYmd],
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
    if (!requireAuth()) {
      return;
    }
    try {
      if (!selectedDate || !selectedOption || !selectedTime) {
        showToast("error", "Please complete all selections");
        return;
      }

      // Collect selected data for booking
      const selectedProducts = ticketTypes
        .filter((ticket) => (ticketQuantities[ticket.id] || 0) > 0)
        .map((ticket) => {
          const baseProduct = {
            product_id: ticket.id,
            product_name: ticket.name,
            type: ticket?.type || "musement",
            quantity: ticketQuantities[ticket.id] || 0,
            retail_price: ticket.price,
            total_price: ticket.price * (ticketQuantities[ticket.id] || 0),
            min_buy: ticket.min,
            max_buy: ticket.max,
            slot_min_buy: selectedSlot?.min_buy,
            slot_max_buy: selectedSlot?.max_buy,
          };

          // Only add id field (cart_id) when coming from cart (for updateCart API)
          // The id should be the cart item ID (item?._id from Cart.jsx)
          if (from === "cart" && eventData?.cart_id) {
            baseProduct.id = eventData.cart_id;
          }

          return baseProduct;
        });

      // Check if any products are selected
      if (selectedProducts.length === 0) {
        showToast("error", "Please select at least one ticket");
        return;
      }

      const partySizeError = getPartySizeError({
        tickets: ticketTypes,
        quantities: ticketQuantities,
        slotMinBuy: selectedSlot?.min_buy,
        slotMaxBuy: selectedSlot?.max_buy,
      });
      if (partySizeError) {
        showToast("error", partySizeError);
        return;
      }

      setIsLoading(true);

      // Format date to YYYY-MM-DD for API
      // Use selectedDate state (from eventData.selectedDate = item?.activities?.[0]?.date in Cart.jsx)
      const dateToFormat = selectedDate || eventData?.selectedDate;

      if (!dateToFormat) {
        showToast("error", "Date is required");
        setIsLoading(false);
        return;
      }

      // Format date: extract YYYY-MM-DD from any valid date format
      let formattedDate;
      try {
        const dateObj = new Date(dateToFormat);
        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date");
        }
        formattedDate = dateObj.toISOString().split("T")[0];
      } catch (error) {
        showToast("error", "Invalid date selected");
        setIsLoading(false);
        return;
      }

      if (from === "cart") {
        // Update cart when coming from cart
        const updateCartData = {
          city_id: String(eventData?.cityId || ""),
          event_id: eventData?.activityUuid,
          start_date: formattedDate,
          trip_id: String(eventData?.tripId || eventData?.trip_id || ""),
          products: selectedProducts,
        };

        // Ensure start_date is always included
        if (!updateCartData.start_date) {
          console.error("❌ start_date is missing!");
          showToast("error", "Date is required for cart update");
          setIsLoading(false);
          return;
        }

        console.log(
          "updateCart requestData",
          JSON.stringify(updateCartData, null, 2),
        );
        const response = await updateCart(updateCartData);
        showToast("success", response?.message || "Cart updated successfully");
        navigation.reset({
          index: 1,
          routes: [
            { name: navigationStrings.BOTTOM_TAB },
            {
              name: navigationStrings.CART,
              params: {
                tripId: eventData?.tripId || eventData?.trip_id,
              },
            },
          ],
        });
      } else {
        if (!eventData?.tripId) {
          showToast("error", "Trip not selected. Please choose a trip first.");
          setIsLoading(false);
          return;
        }

        // Add to trip when coming from normal flow
        const requestData = {
          city_id: String(eventData?.cityId || ""), // Ensure city_id is a string
          event_id: eventData?.activityUuid,
          start_date: formattedDate,
          products: selectedProducts,
          instant_confirmation: eventData?.instant_confirmation,
          free_cancellation: eventData?.free_cancellation ? true : false,
          duration: eventData?.duration,
          trip_id: String(eventData.tripId),
          ...(eventData?.pickupPointId && { pickup_point: eventData.pickupPointId }),
          ...(eventData?.language && { language: eventData.language }),
        };

        console.log("addEventInTrip requestData", requestData);
        const response = await addEventInTrip(requestData);
        showToast("success", response?.message);
        const addedTrip = normalizeTripDetails(response?.data ?? response);
        const addedTripId = getTripId(addedTrip) || String(eventData.tripId);
        navigateToTripDetails(navigation, {
          trip: addedTrip,
          tripId: addedTripId,
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMessage =
        from === "cart"
          ? "Failed to update cart"
          : "Failed to add event to trip";
      showToast("error", error?.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render function for FlatList date items
  const renderDateItem = ({ item }) => {
    const isSelected = (toYmd(selectedDate) || selectedDate) === item.day;
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.selectedDateItem]}
        onPress={() => handleDateSelect(item.day)}
      >
        <Text
          style={[styles.dateText, isSelected && styles.selectedDateText]}
        >
          {formatDate(item.day)}
        </Text>
      </TouchableOpacity>
    );
  };

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
              data={selectableDates}
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
                  {ticketTypes.map((ticket) => {
                    const quantity = ticketQuantities[ticket.id] || 0;
                    const minBuy = effectiveProductMinBuy(ticket.min);
                    const canIncrement = canIncrementTicket({
                      ticket,
                      quantities: ticketQuantities,
                      ticketTypes,
                      slotMaxBuy: selectedSlot?.max_buy,
                    });
                    return (
                    <View key={ticket.id} style={styles.ticketRow}>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.ticketLabel}>{ticket.name}</Text>
                        <Text style={styles.ticketPrice}>
                          {ticket.formatted_price}
                          {minBuy > 1 ? ` · min ${minBuy}` : ""}
                        </Text>
                      </View>
                      <View style={styles.quantitySelector}>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            quantity === 0 && styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, -1)}
                          disabled={quantity === 0}
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              quantity === 0 && styles.disabledButtonText,
                            ]}
                          >
                            -
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>
                          {quantity}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.quantityButton,
                            !canIncrement && styles.disabledButton,
                          ]}
                          onPress={() => handleQuantityChange(ticket.id, 1)}
                          disabled={!canIncrement}
                        >
                          <Text
                            style={[
                              styles.quantityButtonText,
                              !canIncrement && styles.disabledButtonText,
                            ]}
                          >
                            +
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    );
                  })}
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
              current={toYmd(selectedDate) || tripStartYmd || undefined}
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              minDate={tripStartYmd || undefined}
              maxDate={tripEndYmd || undefined}
              disableAllTouchEventsForDisabledDays={true}
              enableSwipeMonths={true}
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
          title={
            isLoading
              ? from === "cart"
                ? "Updating Cart..."
                : "Adding to Trip..."
              : from === "cart"
                ? "Update Cart"
                : "Add to Trip"
          }
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
