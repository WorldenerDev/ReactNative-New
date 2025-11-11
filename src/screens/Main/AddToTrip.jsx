import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import StepTitle from "@components/StepTitle";
import ButtonComp from "@components/ButtonComp";
import { getHeight, getWidth } from "@utils/responsive";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import Contacts from "react-native-contacts";

const AddToTrip = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allData, setAllData] = useState([]);
  const [contactsMap, setContactsMap] = useState({});

  // Get API response data from route params
  const apiResponse = route?.params?.selectedBuddyPhones || {};

  // Initialize data from API response
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Step 1: Get all device contacts to create a phone number -> name mapping
        // This allows us to display contact names instead of just phone numbers
        const contacts = await Contacts.getAll();
        const phoneToNameMap = {};

        // Helper function to normalize phone numbers for matching
        const normalizePhone = (phone) => {
          if (!phone) return "";
          // Remove all non-digit characters except keep digits only
          let normalized = phone.replace(/\D/g, "");
          // Remove leading country codes for better matching (US: 1, others vary)
          // Keep last 10 digits for US numbers, or full number if less than 10 digits
          if (normalized.length > 10 && normalized.startsWith("1")) {
            normalized = normalized.substring(1); // Remove US country code
          }
          return normalized;
        };

        // Build phone-to-name mapping from device contacts
        contacts.forEach((contact) => {
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            const contactName = contact.displayName ||
              `${contact.givenName || ""} ${contact.familyName || ""}`.trim() ||
              contact.givenName ||
              contact.familyName ||
              "Unknown";

            contact.phoneNumbers.forEach((phoneObj) => {
              const normalizedPhone = normalizePhone(phoneObj.number);
              if (normalizedPhone) {
                // Store normalized phone -> name mapping
                phoneToNameMap[normalizedPhone] = contactName;

                // Also store with country code if it's a US number (10 digits)
                if (normalizedPhone.length === 10) {
                  phoneToNameMap[`1${normalizedPhone}`] = contactName; // With US country code
                }

                // Store original format variations for better matching
                const originalPhone = phoneObj.number.replace(/\s/g, "");
                phoneToNameMap[normalizePhone(originalPhone)] = contactName;
              }
            });
          }
        });

        setContactsMap(phoneToNameMap);

        // Step 2: Process API response data
        // The API returns phone numbers, we match them with device contacts to get names
        // Process yourBuddies - filter out nulls
        const yourBuddies = (apiResponse?.yourBuddies || [])
          .filter((buddy) => buddy !== null && buddy !== undefined)
          .map((buddy, index) => {
            const phone = typeof buddy === "string" ? buddy : buddy?.phone || "";
            const normalizedPhone = normalizePhone(phone);
            // Try to find name from contact map, fallback to API name, then phone number
            const name = phoneToNameMap[normalizedPhone] ||
              phoneToNameMap[`1${normalizedPhone}`] || // Try with country code
              buddy?.name ||
              phone ||
              "Unknown";
            return {
              id: `buddy-${index}`,
              name: name,
              phone: phone,
              isAdded: false,
              type: "buddy",
            };
          });

        // Process fromYourContacts - array of phone numbers
        const fromYourContacts = (apiResponse?.fromYourContacts || []).map(
          (phone, index) => {
            const normalizedPhone = normalizePhone(phone);
            // Try to find name from contact map, fallback to phone number
            const name = phoneToNameMap[normalizedPhone] ||
              phoneToNameMap[`1${normalizedPhone}`] || // Try with country code
              phone;
            return {
              id: `contact-${index}`,
              name: name,
              phone: phone,
              isInvited: false,
              type: "contact",
            };
          }
        );

        setAllData([...yourBuddies, ...fromYourContacts]);
      } catch (error) {
        console.error("Error initializing data:", error);
        // Fallback: use API data directly without contact names
        const yourBuddies = (apiResponse?.yourBuddies || [])
          .filter((buddy) => buddy !== null && buddy !== undefined)
          .map((buddy, index) => ({
            id: `buddy-${index}`,
            name: typeof buddy === "string" ? buddy : buddy?.name || "Unknown",
            phone: typeof buddy === "string" ? buddy : buddy?.phone || "",
            isAdded: false,
            type: "buddy",
          }));

        const fromYourContacts = (apiResponse?.fromYourContacts || []).map(
          (phone, index) => ({
            id: `contact-${index}`,
            name: phone,
            phone: phone,
            isInvited: false,
            type: "contact",
          })
        );

        setAllData([...yourBuddies, ...fromYourContacts]);
      }
    };

    initializeData();
  }, [apiResponse]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return allData;
    }

    const query = searchQuery.toLowerCase().trim();
    return allData.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query)
    );
  }, [allData, searchQuery]);

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

  // Get selected buddies and invited contacts
  const selectedBuddies = allData.filter(
    (item) => item.type === "buddy" && item.isAdded
  );
  const invitedContacts = allData.filter(
    (item) => item.type === "contact" && item.isInvited
  );

  const hasSelections = selectedBuddies.length > 0 || invitedContacts.length > 0;

  const handleDone = () => {
    // Get phone numbers of selected buddies and invited contacts
    const selectedBuddyPhones = selectedBuddies.map((item) => item.phone);
    const invitedContactPhones = invitedContacts.map((item) => item.phone);

    // Get existing data from route params to pass back
    const cityData = route?.params?.cityData;
    const fromDate = route?.params?.fromDate;
    const toDate = route?.params?.toDate;

    navigation.navigate(navigationStrings.CREATE_TRIP, {
      selectedBuddyPhones: [...selectedBuddyPhones, ...invitedContactPhones],
      cityData: cityData,
      fromDate: fromDate,
      toDate: toDate,
    });
  };

  const renderListItem = ({ item, index }) => {
    // Check if this is the first buddy in filtered data
    const buddyIndex = filteredData.findIndex((i) => i.type === "buddy");
    const isFirstBuddy = item.type === "buddy" && buddyIndex === index;

    // Check if this is the first contact in filtered data
    const contactIndex = filteredData.findIndex((i) => i.type === "contact");
    const isFirstContact = item.type === "contact" && contactIndex === index;

    return (
      <View>
        {isFirstBuddy && <Text style={styles.sectionTitle}>Your Buddies</Text>}
        {isFirstContact && (
          <Text style={[styles.sectionTitle, styles.contactSectionTitle]}>
            From Your Contacts
          </Text>
        )}
        <View style={styles.listItem}>
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
      <View style={styles.container}>
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListHeaderComponent={() => (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Where are you going?"
                placeholderTextColor={colors.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Image source={imagePath.SEARCH_ICON} style={styles.searchIcon} />
            </View>
          )}
          renderItem={renderListItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          )}
        />
        {/* Floating Done Button */}
        <View style={styles.floatingButtonContainer}>
          <ButtonComp
            title="Done"
            disabled={!hasSelections}
            onPress={handleDone}
            containerStyle={styles.doneButton}
          />
        </View>
      </View>
    </MainContainer>
  );
};

export default AddToTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D6ECF6",
    borderRadius: 12,
    paddingHorizontal: getWidth(16),
    paddingVertical: getHeight(12),
    marginBottom: getHeight(24),
  },
  searchInput: {
    flex: 1,
    fontSize: getHeight(16),
    color: colors.black,
    fontFamily: fonts.RobotoRegular,
    padding: 0,
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
  contactSectionTitle: {
    marginTop: getHeight(24),
  },
  flatListContent: {
    paddingBottom: getHeight(100), // Space for floating button
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getWidth(16),
    paddingTop: getHeight(12),
    paddingBottom: getHeight(20),

  },
  doneButton: {
    width: "100%",
  },
  emptyContainer: {
    paddingVertical: getHeight(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize: getHeight(16),
    color: colors.gray,
    fontFamily: fonts.RobotoRegular,
  },
});
