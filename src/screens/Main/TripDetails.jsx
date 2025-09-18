import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import React from "react";
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

const TripDetails = ({ navigation, route }) => {
  const { trip } = route?.params || {};

  // Mock data for demonstration - replace with actual trip data
  const tripData = {
    image:
      trip?.city?.image ||
      "https://images.unsplash.com/photo-1513639766991-4c7b0b0b0b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    destination: trip?.city?.name || "Tokyo, Japan",
    status: "Planning",
    startDate: trip?.start_at?.slice(0, 10) || "Dec 15, 2024",
    endDate: trip?.end_at?.slice(0, 10) || "Jan 20, 2025",
    participants: 10,
    activities: 8,
    budget: 1230,
    participantsList: [
      {
        id: 1,
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&q=80",
      },
      {
        id: 2,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80",
      },
      {
        id: 3,
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80",
      },
    ],
    activitiesData: [
      {
        id: 1,
        title: "Tokyo Tower Visit",
        date: "15 Dec 2024",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&w=150&q=80",
        time: "Dec 16",
      },
      {
        id: 2,
        title: "Tokyo Tower Visit",
        date: "15 Dec 2024",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&w=150&q=80",
        time: "Dec 16",
      },
      {
        id: 3,
        title: "Tokyo Tower Visit",
        date: "19 Dec 2024",
        price: 129,
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&w=150&q=80",
        time: "Dec 16",
      },
    ],
  };

  const handleEditPress = () => {
    // Navigate to edit trip screen
    navigation.navigate("EditTrip", { trip });
  };

  const handleViewGroup = () => {
    // Navigate to group details
    console.log("View group pressed");
  };

  const handleInviteParticipants = () => {
    // Navigate to invite participants screen
    console.log("Invite participants pressed");
  };

  const handleActivitiesPress = () => {
    // Navigate to activities list
    console.log("Activities pressed");
  };

  const handleBudgetPress = () => {
    // Navigate to budget details
    console.log("Budget pressed");
  };

  const handleActivityPress = (activity) => {
    // Navigate to activity details
    console.log("Activity pressed:", activity);
  };

  const handleCheckout = () => {
    // Navigate to checkout screen
    console.log("Checkout pressed");
  };

  // Group activities by date
  const groupActivitiesByDate = () => {
    const grouped = {};
    tripData.activitiesData.forEach((activity) => {
      if (!grouped[activity.date]) {
        grouped[activity.date] = [];
      }
      grouped[activity.date].push(activity);
    });
    return grouped;
  };

  const groupedActivities = groupActivitiesByDate();
  const activityDates = Object.keys(groupedActivities);

  return (
    <MainContainer>
      <Header
        title="Trip Details"
        rightIconImage={imagePath.THREE_DOTS_ICON}
        onRightIconPress={handleEditPress}
        showBack={true}
      />
      <View style={styles.contentContainer}>
        <View style={styles.tripCard}>
          {/* Hero Image */}
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: tripData.image }}
              style={styles.cardImage}
              resizeMode="cover"
              priority="high"
              cache="immutable"
              showLoader={true}
              loaderColor={colors.primary}
            />
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Destination and Status Row */}
            <View style={styles.destinationRow}>
              <View style={styles.destinationInfo}>
                <Image source={imagePath.PIN_ICON} style={styles.pinIcon} />
                <Text style={styles.destinationText}>
                  {tripData.destination}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>{tripData.status}</Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.datesContainer}>
              <Image
                source={imagePath.CALENDER_ICON}
                style={styles.calendarIcon}
              />
              <Text style={styles.datesText}>
                {tripData.startDate} - {tripData.endDate}
              </Text>
            </View>

            {/* Participants Section */}
            <View style={styles.participantsSection}>
              {tripData.participants > 0 ? (
                // Show participants info and View Group button when participants are available
                <>
                  <View style={styles.participantsInfo}>
                    <View style={styles.avatarContainer}>
                      {tripData.participantsList.map((participant, index) => (
                        <View
                          key={participant.id}
                          style={[
                            styles.avatar,
                            {
                              zIndex: tripData.participantsList.length - index,
                            },
                          ]}
                        >
                          <OptimizedImage
                            source={{ uri: participant.avatar }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                          />
                        </View>
                      ))}
                      {tripData.participants > 3 && (
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            +{tripData.participants - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.participantsCount}>
                      {tripData.participants} people
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
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleActivitiesPress}
              >
                <Text style={styles.actionButtonText}>
                  {tripData.activities} Activities
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBudgetPress}
              >
                <Text style={styles.actionButtonText}>
                  ${tripData.budget.toLocaleString()} Budget
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesContainer}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.activitiesTitle}>Activities</Text>
            <TouchableOpacity style={styles.calendarButton}>
              <Image
                source={imagePath.CALENDER_ICON}
                style={styles.calendarIcon}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={activityDates}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: date }) => (
              <View style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                <FlatList
                  data={groupedActivities[date]}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: activity }) => (
                    <TouchableOpacity
                      style={styles.activityCard}
                      onPress={() => handleActivityPress(activity)}
                    >
                      <OptimizedImage
                        source={{ uri: activity.image }}
                        style={styles.activityImage}
                        resizeMode="cover"
                      />
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>
                          {activity.title}
                        </Text>
                        <Text style={styles.activityDetails}>
                          {activity.time} • ${activity.price}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          />
        </View>

        {/* Floating Checkout Button */}
        <View style={styles.floatingButtonContainer}>
          <ButtonComp
            title="Checkout"
            onPress={handleCheckout}
            // disabled={false}
          />
        </View>
      </View>
    </MainContainer>
  );
};

export default TripDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidth(20),
    backgroundColor: colors.input,
  },
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
});
