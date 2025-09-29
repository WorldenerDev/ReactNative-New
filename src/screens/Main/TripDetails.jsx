import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import ButtonComp from "@components/ButtonComp";
import imagePath from "@assets/icons";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getHeight,
  getWidth,
  getRadius,
  getVertiPadding,
} from "@utils/responsive";
import OptimizedImage from "@components/OptimizedImage";
import { getTripDetails } from "@api/services/mainServices";
import navigationStrings from "@navigation/navigationStrings";

const TripDetails = ({ navigation, route }) => {
  const { trip, tripId } = route?.params || {};
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get trip ID from route params or trip object
  const currentTripId = tripId || trip?.id || trip?._id;

  useEffect(() => {
    if (currentTripId) {
      fetchTripDetails();
    } else {
      setError("Trip ID not found");
      setLoading(false);
    }
  }, [currentTripId]);

  useEffect(() => {
    if (error) {
      navigation.goBack();
    }
  }, [error, navigation]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTripDetails(currentTripId);
      console.log("Trip details response:", response?.data);
      if (response?.success) {
        setTripData(response?.data);
      } else {
        setError(response?.message || "Failed to fetch trip details");
      }
    } catch (err) {
      console.error("Error fetching trip details:", err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    navigation.navigate(navigationStrings.EDIT_TRIP, { trip: tripData });
  };

  const handleViewGroup = () => {
    // TODO: Navigate to group details
  };

  const handleInviteParticipants = () => {
    // TODO: Navigate to invite participants screen
  };

  const handleActivityPress = () => {
    // TODO: Navigate to activity details
  };

  const handleCheckout = () => {
    navigation.navigate(navigationStrings.CART, {
      trip: tripData,
      tripId: currentTripId,
    });
  };

  const handleCalendarView = () => {
    navigation.navigate(navigationStrings.CALENDAR_VIEW_TRIP_DETAIL, {
      trip: tripData,
      tripId: currentTripId,
    });
  };

  const formatGroupDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Group activities by date
  const groupActivitiesByDate = () => {
    if (!tripData?.activities) return {};

    const activities = tripData.activities;
    const grouped = {};

    activities.forEach((activity) => {
      const activityDate = activity.date || "Unknown Date";
      if (!grouped[activityDate]) {
        grouped[activityDate] = [];
      }
      grouped[activityDate].push(activity);
    });
    return grouped;
  };

  const groupedActivities = groupActivitiesByDate();
  const activityDates = Object.keys(groupedActivities).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  return (
    <MainContainer loader={loading}>
      <Header
        title="Trip Details"
        rightIconImage={imagePath.THREE_DOTS_ICON}
        onRightIconPress={handleEditPress}
        showBack={true}
      />
      <View style={styles.contentContainer}>
        {tripData && (
          <>
            <View style={styles.tripCard}>
              {/* Hero Image */}
              <View style={styles.imageContainer}>
                <OptimizedImage
                  source={{
                    uri:
                      tripData?.image ||
                      tripData?.city?.image ||
                      "https://images.unsplash.com/photo-1513639766991-4c7b0b0b0b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                  }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Destination and Status Row */}
                <View style={styles.destinationRow}>
                  <View style={styles.destinationInfo}>
                    <Image
                      source={imagePath.LOCATION_PIN}
                      style={styles.pinIcon}
                    />
                    <Text style={styles.destinationText}>
                      {tripData?.destination ||
                        tripData?.city?.name ||
                        "Unknown Destination"}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusIndicator} />
                    <Text style={styles.statusText}>
                      {tripData?.status || "Planning"}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={styles.datesContainer}>
                  <Image
                    source={imagePath.CALENDER_ICON}
                    style={styles.calendarIcon}
                  />
                  <Text style={styles.datesText}>
                    {tripData?.startDate ||
                      tripData?.start_at?.slice(0, 10) ||
                      "TBD"}{" "}
                    -{" "}
                    {tripData?.endDate ||
                      tripData?.end_at?.slice(0, 10) ||
                      "TBD"}
                  </Text>
                </View>

                {/* Participants Section */}
                <View style={styles.participantsSection}>
                  {(tripData?.participants ||
                    tripData?.participantsList?.length ||
                    0) > 0 ? (
                    // Show participants info and View Group button when participants are available
                    <>
                      <View style={styles.participantsInfo}>
                        <View style={styles.avatarContainer}>
                          {(tripData?.participantsList || []).map(
                            (participant, index) => (
                              <View
                                key={`participant-${index}-${
                                  participant.id || participant._id || index
                                }`}
                                style={[
                                  styles.avatar,
                                  {
                                    zIndex:
                                      (tripData?.participantsList || [])
                                        .length - index,
                                  },
                                ]}
                              >
                                <OptimizedImage
                                  source={{
                                    uri:
                                      participant.avatar ||
                                      participant.profileImage,
                                  }}
                                  style={styles.avatarImage}
                                  resizeMode="cover"
                                />
                              </View>
                            )
                          )}
                          {(tripData?.participants ||
                            tripData?.participantsList?.length ||
                            0) > 3 && (
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                +
                                {(tripData?.participants ||
                                  tripData?.participantsList?.length ||
                                  0) - 3}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.participantsCount}>
                          {tripData?.participants ||
                            tripData?.participantsList?.length ||
                            0}{" "}
                          people
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewGroupButton}
                        onPress={handleViewGroup}
                      >
                        <Text style={styles.viewGroupText}>View Group</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Show Invite Participants button when no participants
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={handleInviteParticipants}
                    >
                      <Text style={styles.inviteButtonText}>
                        Invite Participants
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Activities and Budget Buttons */}
                <View style={styles.actionsRow}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                      {(() => {
                        const count =
                          tripData?.activities?.length ||
                          tripData?.totalActivities ||
                          0;
                        return count === 1
                          ? "1 Activity"
                          : `${count} Activities`;
                      })()}
                    </Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                      $
                      {(
                        tripData?.totalBudget ||
                        tripData?.budget ||
                        0
                      ).toLocaleString()}{" "}
                      Budget
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Activities Section */}
            <View style={styles.activitiesContainer}>
              <View style={styles.activitiesHeader}>
                <Text style={styles.activitiesTitle}>Activities</Text>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={handleCalendarView}
                >
                  <Image
                    source={imagePath.CALENDER_ICON}
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>

              {activityDates.length > 0 ? (
                <FlatList
                  data={activityDates}
                  keyExtractor={(item, index) => `date-${index}-${item}`}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: date, index: dateIndex }) => {
                    const activitiesForDate = groupedActivities[date] || [];

                    return (
                      <View style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>
                          {formatGroupDate(date)}
                        </Text>
                        <FlatList
                          data={activitiesForDate}
                          keyExtractor={(item, index) =>
                            `activity-${dateIndex}-${index}-${
                              item.product_id || item.id || item._id || index
                            }`
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
                                    activity.date || activity.time || "TBD"
                                  )}{" "}
                                  • Qty: {activity.quantity || 1} • $
                                  {activity.total_price ||
                                    activity.price ||
                                    activity.retail_price ||
                                    0}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    );
                  }}
                />
              ) : (
                <View style={styles.noActivitiesContainer}>
                  <Text style={styles.noActivitiesText}>
                    No activities found
                  </Text>
                </View>
              )}
            </View>

            {/* Floating Checkout Button */}
            <View style={styles.floatingButtonContainer}>
              <ButtonComp
                disabled={false}
                title="Checkout"
                onPress={handleCheckout}
              />
            </View>
          </>
        )}
      </View>
    </MainContainer>
  );
};

export default TripDetails;

const styles = StyleSheet.create({
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: getRadius(12),
    width: "100%",
    maxWidth: getWidth(350),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    marginTop: getVertiPadding(15),
    borderBottomWidth: 1,
  },
  imageContainer: {
    height: getHeight(120),
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: getHeight(16),
  },
  destinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(8),
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    width: getWidth(16),
    height: getHeight(16),
    tintColor: colors.red,
    marginRight: getWidth(6),
  },
  destinationText: {
    fontSize: getHeight(18),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(10),
    paddingVertical: getHeight(4),
    borderRadius: getRadius(12),
  },
  statusIndicator: {
    width: getWidth(6),
    height: getWidth(6),
    borderRadius: getWidth(3),
    backgroundColor: colors.green,
    marginRight: getWidth(4),
  },
  statusText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(16),
  },
  calendarIcon: {
    width: getWidth(14),
    height: getHeight(14),
    tintColor: colors.lightText,
    marginRight: getWidth(6),
  },
  datesText: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
  },
  participantsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(16),
    borderRadius: getRadius(8),
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    marginRight: getWidth(10),
  },
  avatar: {
    width: getWidth(28),
    height: getWidth(28),
    borderRadius: getWidth(14),
    borderWidth: 2,
    borderColor: colors.white,
    marginLeft: -getWidth(6),
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: getWidth(12),
  },
  avatarText: {
    fontSize: getHeight(9),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  participantsCount: {
    fontSize: getHeight(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  viewGroupButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
    borderRadius: getRadius(6),
  },
  viewGroupText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  inviteButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(10),
    borderRadius: getRadius(6),
    alignSelf: "center",
  },
  inviteButtonText: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(8),
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.input,
    paddingVertical: getHeight(10),
    paddingHorizontal: getWidth(12),
    borderRadius: getRadius(6),
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: getHeight(11),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  activitiesContainer: {
    flex: 1,
    marginTop: getHeight(20),
  },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeight(16),
  },
  activitiesTitle: {
    fontSize: getHeight(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  calendarButton: {
    padding: getWidth(8),
  },
  dateGroup: {
    marginBottom: getHeight(16),
  },
  dateHeader: {
    fontSize: getHeight(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(8),
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: colors.light_white,
    borderRadius: getRadius(8),
    padding: getHeight(8),
    marginBottom: getHeight(4),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: getHeight(60),
    alignItems: "center",
  },
  activityImage: {
    width: getWidth(44),
    height: getWidth(44),
    borderRadius: getRadius(6),
    marginRight: getWidth(12),
    flexShrink: 0,
  },
  activityInfo: {
    flex: 1,
    justifyContent: "center",
    minHeight: getHeight(44),
  },
  activityTitle: {
    fontSize: getHeight(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    marginBottom: getHeight(4),
    flexWrap: "wrap",
  },
  activityDetails: {
    fontSize: getHeight(12),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    flexWrap: "wrap",
  },
  contentContainer: {
    flex: 1,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: getHeight(20),
    left: 0,
    right: 0,
    zIndex: 1000,
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
  },
});
