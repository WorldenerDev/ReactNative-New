import imagePath from "@assets/icons";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  getFontSize,
  getWidth,
  getHeight,
  getHoriPadding,
  getVertiPadding,
  getRadius,
  SCREEN_WIDTH,
} from "@utils/responsive";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import navigationStrings from "@navigation/navigationStrings";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";

const slides = [
  {
    id: "1",
    title: "AI-Powered Matching",
    description:
      "Quickly find the most qualified freelancers for your gigs using our advanced matching engine.",
    image: imagePath.ONBOARDING1,
  },
  {
    id: "2",
    title: "Secure Payments & Escrow",
    description:
      "Fund projects confidently with escrow and pay freelancers only when milestones are approved.",
    image: imagePath.ONBOARDING2,
  },
  {
    id: "3",
    title: "Monitor Progress in Real-Time",
    description:
      "Monitor progress, communicate instantly, and review final deliverables all in one place.",
    image: imagePath.ONBOARDING3,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await setItem(STORAGE_KEYS.HAS_LAUNCHED, "true");
      navigation.navigate(navigationStrings.ENABLENOTIFICATIONSCREEN);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await setItem(STORAGE_KEYS.HAS_LAUNCHED, "true");
    navigation.navigate(navigationStrings.ENABLENOTIFICATIONSCREEN);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.tittle}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <View style={styles.navButtons}>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentIndex === 0}
                style={styles.roundButton}
              >
                <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} style={styles.roundButton}>
                <Image source={imagePath.RIGHT_ICON} style={styles.iconStyle} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.getStartedIconWrapper}>
              <Image source={imagePath.RIGHT_ICON} style={styles.iconStyle} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: getHoriPadding(20),
    paddingTop: getHeight(80),
  },
  image: {
    width: getWidth(320),
    height: getHeight(320),
    marginBottom: getVertiPadding(30),
    alignSelf: "center",
  },
  tittle: {
    fontSize: getFontSize(24),
    color: colors.black,
    fontFamily: fonts.RobotoBold,
    marginTop: getVertiPadding(20),
    marginBottom: getVertiPadding(8),
    textAlign: "left",
    paddingHorizontal: getHoriPadding(10),
  },
  description: {
    fontSize: getFontSize(16),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "left",
    paddingHorizontal: getHoriPadding(10),
    paddingTop: getVertiPadding(10),
  },
  indicatorContainer: {
    position: "absolute",
    bottom: getHeight(100),
    flexDirection: "row",
    alignSelf: "center",
  },
  indicator: {
    height: getHeight(8),
    width: getWidth(8),
    borderRadius: getRadius(4),
    backgroundColor: "#335577",
    marginHorizontal: getWidth(5),
  },
  activeIndicator: {
    backgroundColor: "#00A8E8",
    width: getWidth(20),
  },
  footer: {
    position: "absolute",
    bottom: getHeight(40),
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  skipButton: {
    position: "absolute",
    left: getHoriPadding(20),
    bottom: getHeight(5),
    backgroundColor: colors.secondary,
    paddingHorizontal: getHoriPadding(15),
    paddingVertical: getVertiPadding(8),
    borderRadius: getRadius(9),
  },
  skipText: {
    color: colors.black,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoMedium,
  },
  navButtons: {
    flexDirection: "row",
    gap: getWidth(20),
    alignSelf: "flex-end",
    paddingRight: getWidth(25),
  },
  roundButton: {
    width: getWidth(45),
    height: getWidth(45),
    borderRadius: getRadius(25),
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: getHoriPadding(15),
    paddingVertical: getVertiPadding(2),
    borderRadius: getRadius(30),
    width: getWidth(300),
    justifyContent: "space-between",
    alignSelf: "center",
    marginTop: getHeight(20),
    borderWidth: 1,
    borderColor: colors.black,
  },
  getStartedText: {
    color: colors.black,
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoBold,
    marginRight: getWidth(8),
  },
  iconStyle: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
    tintColor: colors.white,
  },
  getStartedIconWrapper: {
    backgroundColor: colors.secondary,
    width: getWidth(35),
    height: getHeight(35),
    borderRadius: getRadius(25),
    justifyContent: "center",
    alignItems: "center",
  },
});
