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
import OptimizedImage from "@components/OptimizedImage";
import colors from "@assets/colors";
import imagePath from "@assets/icons";
import fonts from "@assets/fonts";
import {
  getHeight,
  getWidth,
  getFontSize,
  getVertiPadding,
  getHoriPadding,
  getRadius,
} from "@utils/responsive";

const MemberProfile = ({ route, navigation }) => {
  // Get user data from route params or use default
  const userData = route?.params?.userData || {
    name: "Alessandro",
    avatar: null,
    interests: [
      "Category 1",
      "Category 1",
      "Category 2",
      "Category 2",
      "Category 3",
      "Category 4",
      "Category 5",
      "Category 6",
      "Category 7",
      "Category 8",
      "Category 9",
      "Category 10",
    ],
    mutualGroups: [
      { id: "1", name: "Tokyo Trip" },
      { id: "2", name: "Rome Trip" },
      { id: "3", name: "Chicago Trip" },
    ],
  };

  const handleBlock = () => {
    // Handle block action
  };

  const handleInterestPress = (interest) => {
    // Handle interest press
  };

  const handleGroupPress = (group) => {
    // Navigate to group details
  };

  const interestChunks = React.useMemo(() => {
    const interests = userData.interests || [];
    const chunks = [];
    const itemsPerChunk = 4;
    for (let i = 0; i < interests.length; i += itemsPerChunk) {
      chunks.push({
        id: `chunk-${i}`,
        items: interests.slice(i, i + itemsPerChunk),
      });
    }
    return chunks;
  }, [userData.interests]);

  const renderInterestItem = ({ item }) => (
    <View style={styles.interestGridContainer}>
      {item.items.map((interest, idx) => (
        <TouchableOpacity
          key={`chip-${item.id}-${idx}`}
          style={styles.interestChip}
          onPress={() => handleInterestPress(interest)}
          activeOpacity={0.7}
        >
          <Text
            style={styles.interestChipText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {interest}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.groupItemText}>{item.name}</Text>
      <Image
        source={imagePath.RIGHT_ICON}
        style={styles.groupArrowIcon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  return (
    <MainContainer>
      <View style={styles.headerContainer}>
        <Header title="User Info" showBack={true} />
        <TouchableOpacity
          style={styles.blockButton}
          onPress={handleBlock}
          activeOpacity={0.7}
        >
          <Text style={styles.blockButtonText}>Block</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData.avatar ? (
              <OptimizedImage
                source={{ uri: userData.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <FlatList
            data={interestChunks}
            renderItem={renderInterestItem}
            keyExtractor={(item) => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.interestsContainer}
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mutual Groups</Text>
          <FlatList
            data={userData.mutualGroups || []}
            renderItem={renderGroupItem}
            keyExtractor={(item) => `group-${item.id}`}
            scrollEnabled={false}
            contentContainerStyle={styles.groupsContainer}
          />
        </View>

        <View style={{ height: getVertiPadding(20) }} />
      </ScrollView>
    </MainContainer>
  );
};

export default MemberProfile;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    backgroundColor: colors.white,
    marginHorizontal: -getHoriPadding(15),
    paddingHorizontal: getHoriPadding(15),
  },
  blockButton: {
    position: "absolute",
    right: getHoriPadding(15),
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  blockButtonText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoMedium,
    color: colors.red,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getVertiPadding(20),
  },
  profileSection: {
    alignItems: "center",
    marginBottom: getVertiPadding(30),
  },
  avatarContainer: {
    marginBottom: getVertiPadding(15),
  },
  avatar: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
  },
  avatarPlaceholder: {
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
    backgroundColor: colors.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: getFontSize(36),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
  },
  userName: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    textAlign: "center",
  },
  section: {
    marginBottom: getVertiPadding(30),
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(15),
  },
  interestsContainer: {
    paddingRight: getHoriPadding(16),
  },
  interestGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: getWidth(220),
    marginRight: getWidth(12),
    justifyContent: "space-between",
  },
  interestChip: {
    paddingHorizontal: getHoriPadding(12),
    paddingVertical: getVertiPadding(8),
    borderRadius: getRadius(20),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    width: getWidth(104),
    marginBottom: getVertiPadding(8),
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeight(36),
    overflow: "hidden",
  },
  interestChipText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    textAlign: "center",
    flexShrink: 1,
  },
  groupsContainer: {
    paddingBottom: getVertiPadding(8),
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: getVertiPadding(12),
    paddingHorizontal: getHoriPadding(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupItemText: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.black,
    flex: 1,
  },
  groupArrowIcon: {
    width: getWidth(20),
    height: getHeight(20),
    tintColor: colors.black,
  },
});
