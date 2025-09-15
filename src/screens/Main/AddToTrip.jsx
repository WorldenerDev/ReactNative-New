import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import ButtonComp from "@components/ButtonComp";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";

const AddToTrip = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allData, setAllData] = useState([
    {
      id: "1",
      name: "John Doe",
      phone: "+41-132-12312",
      isAdded: false,
      type: "buddy",
    },
    {
      id: "2",
      name: "John Doe",
      phone: "+41-132-12312",
      isAdded: false,
      type: "buddy",
    },
    {
      id: "3",
      name: "John Doe",
      phone: "+41-132-12312",
      isAdded: false,
      type: "buddy",
    },
    {
      id: "4",
      name: "John Doe",
      phone: "+41-132-12312",
      isInvited: false,
      type: "contact",
    },
    {
      id: "5",
      name: "John Doe",
      phone: "+41-132-12312",
      isInvited: false,
      type: "contact",
    },
    {
      id: "6",
      name: "John Doe",
      phone: "+41-132-12312",
      isInvited: false,
      type: "contact",
    },
  ]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const handleToggleItem = (id) => {
    setAllData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.type === "buddy") {
            return { ...item, isAdded: !item.isAdded };
          } else {
            return { ...item, isInvited: !item.isInvited };
          }
        }
        return item;
      })
    );
  };

  // Check if any buddies are selected
  const selectedBuddies = allData.filter(
    (item) => item.type === "buddy" && item.isAdded
  );
  const hasSelectedBuddies = selectedBuddies.length > 0;

  const handleDone = () => {
    // Get phone numbers of selected buddies only
    const selectedBuddyPhones = selectedBuddies.map((item) => item.phone);

    // Pass data back to CreateTrip screen
    navigation.navigate(navigationStrings.CREATE_TRIP, {
      selectedBuddyPhones,
    });
  };

  const renderListItem = ({ item, index }) => {
    const isFirstBuddy =
      item.type === "buddy" &&
      allData.findIndex((i) => i.type === "buddy") === index;
    const isFirstContact =
      item.type === "contact" &&
      allData.findIndex((i) => i.type === "contact") === index;
    const isLastItem = index === allData.length - 1;

    return (
      <View>
        {isFirstBuddy && <Text style={styles.sectionTitle}>Your Buddies</Text>}
        {isFirstContact && (
          <Text style={[styles.sectionTitle, styles.contactSectionTitle]}>
            From Your Contacts
          </Text>
        )}
        <View style={[styles.listItem, isLastItem && styles.lastItem]}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleItem(item.id)}
          >
            {item.type === "buddy" ? (
              item.isAdded ? (
                <View style={styles.statusContainer}>
                  <View style={styles.checkIcon}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <Text style={styles.statusText}>Added</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Add</Text>
              )
            ) : item.isInvited ? (
              <View style={styles.statusContainer}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.statusText}>Invited</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Invite</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <MainContainer>
      <Header />
      <StepTitle
        title="Add Buddies"
        subtitle="Add your trip buddies to the group to chat, compare itineraries and plan the trips together"
      />
      <FlatList
        data={allData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={() => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.searchContainer}
            onPress={handleSearch}
          >
            <Text style={styles.searchText}>Where are you going?</Text>
            <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            <ButtonComp
              title="Done"
              disabled={!hasSelectedBuddies}
              onPress={handleDone}
              containerStyle={styles.doneButton}
            />
          </View>
        )}
        renderItem={renderListItem}
      />
    </MainContainer>
  );
};

export default AddToTrip;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D6ECF6",
    borderRadius: 12,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(12),
    marginBottom: getHeight(24),
  },
  searchText: {
    flex: 1,
    fontSize: getHeight(16),
    color: colors.gray,
    fontFamily: fonts.RobotoRegular,
  },
  searchIcon: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.gray,
    resizeMode: "contain",
  },
  sectionTitle: {
    fontSize: getHeight(18),
    fontWeight: "700",
    color: colors.black,
    marginBottom: getHeight(16),
    fontFamily: fonts.RobotoBold,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getHeight(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: getHeight(16),
    fontWeight: "600",
    color: colors.black,
    marginBottom: getHeight(2),
    fontFamily: fonts.RobotoMedium,
  },
  userPhone: {
    fontSize: getHeight(14),
    color: colors.gray,
    fontFamily: fonts.RobotoRegular,
  },
  actionButton: {
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
  },
  buttonText: {
    fontSize: getHeight(14),
    fontWeight: "500",
    color: "#2E86DE",
    fontFamily: fonts.RobotoMedium,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    width: getWidth(20),
    height: getHeight(20),
    borderRadius: getWidth(10),
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: getWidth(6),
  },
  checkMark: {
    color: colors.white,
    fontSize: getHeight(12),
    fontWeight: "bold",
    fontFamily: fonts.RobotoBold,
  },
  statusText: {
    fontSize: getHeight(14),
    fontWeight: "500",
    color: colors.black,
    fontFamily: fonts.RobotoMedium,
  },
  lastItem: {
    marginBottom: getHeight(32),
  },
  contactSectionTitle: {
    marginTop: getHeight(24),
  },
  flatListContent: {
    paddingBottom: getHeight(20),
  },
  footerContainer: {
    marginBottom: getHeight(20),
  },
});
