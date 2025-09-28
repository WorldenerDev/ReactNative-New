import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { getHeight, getWidth, getRadius } from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { getTripDetails } from "@api/services/mainServices";

const CalendarViewTripDetail = ({ navigation, route }) => {
  const { trip, tripId } = route?.params || {};
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [activitiesForSelectedDate, setActivitiesForSelectedDate] = useState(
    []
  );

  const currentTripId = tripId || trip?.id || trip?._id;

  useEffect(() => {
    if (trip && trip.start_at && trip.end_at) {
      setTripData(trip);
      setLoading(false);
    } else if (currentTripId) {
      fetchTripDetails();
    } else {
      setError("Trip ID not found");
      setLoading(false);
    }
  }, [currentTripId, trip]);

  useEffect(() => {
    if (error) {
      navigation.goBack();
    }
  }, [error, navigation]);

  useEffect(() => {
    if (tripData && !selectedDate) {
      const startDate = new Date(tripData?.start_at || tripData?.startDate);
      if (!isNaN(startDate.getTime())) {
        setSelectedDate(startDate);
        updateActivitiesForDate(startDate);
        setupMarkedDates();
      }
    }
  }, [tripData]);

  useEffect(() => {
    if (tripData && selectedDate) {
      updateActivitiesForDate(selectedDate);
    }
  }, [tripData]);

  useEffect(() => {
    if (tripData && selectedDate) {
      setupMarkedDates();
    }
  }, [selectedDate]);

  const setupMarkedDates = () => {
    if (!tripData) return;

    const marked = {};
    const startDate = new Date(tripData.start_at);
    const endDate = new Date(tripData.end_at);
    const activities = tripData?.activities || [];

    const datesWithActivities = new Set();
    activities.forEach((activity) => {
      if (activity.date) {
        const activityDateString = activity.date.split("T")[0];
        datesWithActivities.add(activityDateString);
      }
    });

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      const hasActivities = datesWithActivities.has(dateString);

      marked[dateString] = {
        marked: hasActivities,
        dotColor: hasActivities ? colors.primary : colors.lightText,
        disabled: false,
        color: colors.secondary,
        textColor: colors.black,
        startingDay: currentDate.getTime() === startDate.getTime(),
        endingDay: currentDate.getTime() === endDate.getTime(),
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split("T")[0];
      if (marked[selectedDateString]) {
        marked[selectedDateString] = {
          ...marked[selectedDateString],
          selected: true,
          selectedColor: colors.primary,
          selectedTextColor: colors.white,
          color: colors.primary,
          textColor: colors.white,
        };
      }
    }

    setMarkedDates(marked);
  };

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTripDetails(currentTripId);
      if (response?.success) {
        setTripData(response?.data);
      } else {
        setError(response?.message || "Failed to fetch trip details");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day) => {
    if (!markedDates[day.dateString]) return;
    const selectedDate = new Date(day.dateString);
    setSelectedDate(selectedDate);
    updateActivitiesForDate(selectedDate);
    setupMarkedDates();
  };

  const updateActivitiesForDate = (date) => {
    if (!tripData?.activities) {
      setActivitiesForSelectedDate([]);
      return;
    }

    const activities = tripData.activities;
    const selectedDateISO = date.toISOString();

    const activitiesForDate = activities.filter((activity) => {
      return activity.date === selectedDateISO;
    });

    setActivitiesForSelectedDate(activitiesForDate);
  };

  const handleActivityPress = () => {
    // TODO: Navigate to activity details
  };

  const formatSelectedDate = (date) => {
    if (!date) return "";
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <MainContainer loader={loading}>
      <Header
        title={tripData?.destination || tripData?.city?.name || "Trip Details"}
        showBack={true}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            markingType="period"
            enableSwipeMonths={true}
            hideExtraDays={true}
            firstDay={0}
            showWeekNumbers={false}
            disableMonthChange={false}
            disableArrowLeft={false}
            disableArrowRight={false}
            disableAllTouchEventsForDisabledDays={true}
            minDate={
              tripData?.start_at
                ? new Date(tripData.start_at).toISOString().split("T")[0]
                : undefined
            }
            maxDate={
              tripData?.end_at
                ? new Date(tripData.end_at).toISOString().split("T")[0]
                : undefined
            }
            theme={{
              backgroundColor: colors.white,
              calendarBackground: colors.white,
              textSectionTitleColor: colors.lightText,
              todayTextColor: colors.primary,
              dayTextColor: colors.black,
              textDisabledColor: colors.lightText,
              arrowColor: colors.primary,
              monthTextColor: colors.black,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              textDayFontFamily: fonts.RobotoRegular,
              textMonthFontFamily: fonts.RobotoBold,
              textDayHeaderFontFamily: fonts.RobotoMedium,
              textDayFontSize: getHeight(14),
              textMonthFontSize: getHeight(18),
              textDayHeaderFontSize: getHeight(12),
              "stylesheet.day.basic": {
                disabled: {
                  opacity: 0.3,
                },
              },
            }}
            style={styles.calendar}
          />
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.activitiesTitle}>
            {selectedDate
              ? `Activities for ${formatSelectedDate(selectedDate)}`
              : "Select a date with activities"}
          </Text>
          {selectedDate && (
            <Text style={styles.activitiesSubtitle}>
              {activitiesForSelectedDate.length} activity
              {activitiesForSelectedDate.length !== 1 ? "ies" : ""} found
            </Text>
          )}

          {selectedDate ? (
            activitiesForSelectedDate.length > 0 ? (
              <FlatList
                data={activitiesForSelectedDate}
                keyExtractor={(item, index) =>
                  `activity-${index}-${item.id || item._id || index}`
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item: activity }) => (
                  <TouchableOpacity
                    style={styles.activityCard}
                    onPress={handleActivityPress}
                  >
                    <OptimizedImage
                      source={{
                        uri:
                          activity.image ||
                          activity.product_image ||
                          activity.thumbnail ||
                          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&w=150&q=80",
                      }}
                      style={styles.activityImage}
                      resizeMode="cover"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>
                        {activity.title ||
                          activity.name ||
                          activity.product_name ||
                          "Activity"}
                      </Text>
                      <Text style={styles.activityDetails}>
                        {formatActivityDate(
                          activity.date || activity.time || selectedDate
                        )}{" "}
                        • ${activity.price || activity.retail_price || 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.noActivitiesContainer}>
                <Text style={styles.noActivitiesText}>
                  No activities scheduled for this date
                </Text>
                <Text style={styles.noActivitiesSubtext}>
                  Try selecting a different date from the calendar
                </Text>
              </View>
            )
          ) : (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>
                Select a date with activities to view them
              </Text>
              <Text style={styles.noActivitiesSubtext}>
                Only dates with dots have scheduled activities
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </MainContainer>
  );
};

export default CalendarViewTripDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  calendarContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: getWidth(10),
    paddingVertical: getHeight(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calendar: {
    borderRadius: getRadius(8),
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activitiesContainer: {
    flex: 1,
    paddingHorizontal: getWidth(20),
    paddingVertical: getHeight(20),
  },
  activitiesTitle: {
    fontSize: getHeight(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  activitiesSubtitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginBottom: getHeight(16),
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: colors.light_white,
    borderRadius: getRadius(8),
    padding: getHeight(12),
    marginBottom: getHeight(8),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  activityImage: {
    width: getWidth(50),
    height: getWidth(50),
    borderRadius: getRadius(6),
    marginRight: getWidth(12),
  },
  activityInfo: {
    flex: 1,
    justifyContent: "center",
  },
  activityTitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(4),
  },
  activityDetails: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeight(40),
  },
  noActivitiesText: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: getHeight(8),
  },
  noActivitiesSubtext: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
    opacity: 0.7,
  },
});
