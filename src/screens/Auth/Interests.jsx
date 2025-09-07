import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import Routes from "@navigation/Routes";
import { useDispatch } from "react-redux";
import { category, postCategory, setUser } from "@redux/slices/authSlice";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";

const Interests = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { userData } = route?.params;
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [interests, setInterests] = useState([]);
  useEffect(() => {
    const getCategory = async () => {
      try {
        const result = await dispatch(category());
        console.log("category result payload", result);
        const formattedData = result?.payload?.data?.map((item) => ({
          ...item,
          cover_image_url: item.event_image_url,
          selected: false,
        }));

        setInterests(formattedData);
      } catch (err) {
        console.error("Failed to fetch category", err);
      }
    };
    getCategory();
  }, [dispatch]);

  const toggleInterest = (id) => {
    setInterests((prevInterests) =>
      prevInterests.map((interest) =>
        interest.id === id
          ? { ...interest, selected: !interest.selected }
          : interest
      )
    );

    setSelectedInterests((prev) => {
      if (prev.includes(String(id))) {
        return prev.filter((item) => item !== String(id));
      } else {
        return [...prev, String(id)];
      }
    });
  };

  const handleContinue = async () => {
    try {
      const data = {
        preferences: selectedInterests,
      };
      const result = await dispatch(postCategory(data));
      console.log("Post category result ", result);
      if (result?.payload?.success) {
        const loginData = {
          ...userData,
          isPreference: true,
        };
        await setItem(STORAGE_KEYS?.USER_DATA, loginData);
        dispatch(setUser(loginData));
      }
    } catch (error) {
      console.log("error on post category on interest screen ");
    }
  };

  const renderInterestItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.interestItem, item.selected && styles.selectedItem]}
      onPress={() => toggleInterest(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { backgroundColor: "cyan" }]}>
        <Image
          source={{
            uri: item?.cover_image_url
              ? item?.cover_image_url
              : "https://picsum.photos/200",
          }}
          style={styles.image}
        />
        {item.selected && (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.interestTitle}>{item?.name}</Text>
    </TouchableOpacity>
  );

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
            disabled={false}
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
  image: {
    resizeMode: "cover",
    width: getWidth(120),
    height: getWidth(120),
    borderRadius: getWidth(60),
  },
  checkmarkContainer: {
    position: "absolute",
    top: getHeight(5),
    right: getWidth(5),
    width: getWidth(25),
    height: getWidth(25),
    borderRadius: getWidth(12.5),
    backgroundColor: colors.secondary,
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
