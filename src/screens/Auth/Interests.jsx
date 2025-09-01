import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import MainContainer from "@components/container/MainContainer";
import StepTitle from "@components/StepTitle";
import ButtonComp from "@components/ButtonComp";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getHeight,
  getWidth,
  getVertiPadding,
  getHoriPadding,
} from "@utils/responsive";
import navigationStrings from "@navigation/navigationStrings";

const Interests = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interestsData = [
    {
      id: 1,
      title: "Food & Drinks",
      emoji: "🍔",
      color: "#FF6B6B",
      selected: false,
    },
    {
      id: 2,
      title: "Travel & Adventure",
      emoji: "✈️",
      color: "#4ECDC4",
      selected: false,
    },
    {
      id: 3,
      title: "Sports & Fitness",
      emoji: "⚽",
      color: "#45B7D1",
      selected: false,
    },
    {
      id: 4,
      title: "Music & Entertainment",
      emoji: "🎵",
      color: "#96CEB4",
      selected: false,
    },
    {
      id: 5,
      title: "Technology & Gaming",
      emoji: "🎮",
      color: "#FFEAA7",
      selected: false,
    },
    {
      id: 6,
      title: "Fashion & Beauty",
      emoji: "👗",
      color: "#DDA0DD",
      selected: false,
    },
    {
      id: 7,
      title: "Art & Culture",
      emoji: "🎨",
      color: "#FFB6C1",
      selected: false,
    },
    {
      id: 8,
      title: "Health & Wellness",
      emoji: "🧘",
      color: "#98D8C8",
      selected: false,
    },
  ];

  const [interests, setInterests] = useState(interestsData);

  const toggleInterest = (id) => {
    setInterests((prevInterests) =>
      prevInterests.map((interest) =>
        interest.id === id
          ? { ...interest, selected: !interest.selected }
          : interest
      )
    );

    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const renderInterestItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.interestItem, item.selected && styles.selectedItem]}
      onPress={() => toggleInterest(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        {item.selected && (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.interestTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      // Navigate to next screen with selected interests
      navigation.navigate(navigationStrings.MAIN_NAVIGATOR);
    }
  };

  return (
    <MainContainer>
      <StepTitle
        title="Select Interests"
        subtitle="Choose your interests to personalize your experience"
      />

      <View style={styles.container}>
        <FlatList
          data={interests}
          renderItem={renderInterestItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Floating Continue Button */}
      {selectedInterests.length > 0 && (
        <View style={styles.floatingButton}>
          <ButtonComp
            title="Continue"
            onPress={handleContinue}
            containerStyle={styles.continueButtonStyle}
          />
        </View>
      )}
    </MainContainer>
  );
};

export default Interests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: getVertiPadding(20),
  },
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },
  row: {
    justifyContent: "space-between",
    marginBottom: getVertiPadding(20),
  },
  interestItem: {
    width: getWidth(160),
    alignItems: "center",
    marginBottom: getVertiPadding(15),
  },
  selectedItem: {
    opacity: 1,
  },
  imageContainer: {
    position: "relative",
    marginBottom: getVertiPadding(10),
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: getFontSize(40),
  },
  checkmarkContainer: {
    position: "absolute",
    top: getHeight(5),
    right: getWidth(5),
    width: getWidth(25),
    height: getWidth(25),
    borderRadius: getWidth(12.5),
    backgroundColor: colors.primary || "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  checkmark: {
    color: colors.white,
    fontSize: getFontSize(14),
    fontWeight: "bold",
  },
  interestTitle: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textAlign: "center",
    marginTop: getVertiPadding(5),
  },
  floatingButton: {
    position: "absolute",
    bottom: getVertiPadding(30),
    left: getHoriPadding(20),
    right: getHoriPadding(20),
    zIndex: 1000,
  },
  continueButtonStyle: {
    backgroundColor: colors.black,
    borderRadius: getWidth(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
