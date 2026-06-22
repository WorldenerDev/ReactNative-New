import { getProfile } from "@api/services/authService";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import { showToast } from "@components/AppToast";
import ButtonComp from "@components/ButtonComp";
import useStickyBottomInset, {
  useStickyScrollPadding,
} from "@hooks/useStickyBottomInset";
import MainContainer from "@components/container/MainContainer";
import StepTitle from "@components/StepTitle";
import { fetchCategoriesTree, postCategory, setUser } from "@redux/slices/authSlice";
import { fetchEventForYou } from "@redux/slices/cityTripSlice";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import { setItem } from "@utils/storage";
import { STORAGE_KEYS } from "@utils/storageKeys";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const normalizePreferenceIds = (preferences = []) =>
  preferences.map((id) => String(id));

const formatCategoriesWithSelections = (categories, selectedIds) => {
  const selectedSet = new Set(selectedIds);

  return categories.map((item) => ({
    ...item,
    cover_image_url: item.cover_image_url || item.event_image_url,
    selected: selectedSet.has(String(item.id)),
  }));
};

const UpdateInterests = ({ navigation }) => {
  const bottomInset = useStickyBottomInset();
  const scrollPadding = useStickyScrollPadding();
  const dispatch = useDispatch();
  const { user, categories } = useSelector((state) => state.auth);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const interests = useMemo(
    () => formatCategoriesWithSelections(categories, selectedInterests),
    [categories, selectedInterests]
  );

  const loadSavedPreferences = useCallback(async () => {
    try {
      const profileResult = await getProfile();
      return normalizePreferenceIds(
        profileResult?.data?.preferences ?? user?.preferences ?? []
      );
    } catch {
      return normalizePreferenceIds(user?.preferences ?? []);
    }
  }, [user?.preferences]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadScreenData = async () => {
        setFetchingCategories(true);
        setPreferencesLoaded(false);

        const categoryPromise = dispatch(fetchCategoriesTree({ level: 2 })).finally(() => {
          if (isActive) {
            setFetchingCategories(false);
          }
        });

        const preferencesPromise = loadSavedPreferences().then((prefs) => {
          if (isActive) {
            setSelectedInterests(prefs);
            setPreferencesLoaded(true);
          }
          return prefs;
        });

        try {
          await Promise.all([categoryPromise, preferencesPromise]);
        } catch (error) {
          console.error("Failed to load interests screen data", error);
          if (isActive) {
            showToast("error", "Could not load interests.");
          }
        }
      };

      loadScreenData();

      return () => {
        isActive = false;
      };
    }, [dispatch, loadSavedPreferences])
  );

  const toggleInterest = (id) => {
    const idStr = String(id);

    setSelectedInterests((prev) =>
      prev.includes(idStr)
        ? prev.filter((item) => item !== idStr)
        : [...prev, idStr]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      showToast("error", "Please select at least one interest.");
      return;
    }

    try {
      setSaving(true);
      const result = await dispatch(
        postCategory({ preferences: selectedInterests })
      );

      if (result?.meta?.requestStatus === "rejected") {
        return;
      }

      if (result?.payload?.success) {
        const updatedUser = {
          ...user,
          preferences: selectedInterests,
          isPreference: true,
        };
        await setItem(STORAGE_KEYS.USER_DATA, updatedUser);
        dispatch(setUser(updatedUser));
        await dispatch(
          fetchEventForYou({
            preferencesKey: JSON.stringify(selectedInterests),
          })
        );
        showToast("success", "Interests updated successfully.");
        navigation.goBack();
      } else {
        showToast(
          "error",
          result?.payload?.message || "Failed to update interests."
        );
      }
    } catch (error) {
      console.error("Error updating interests", error);
      showToast("error", "Failed to update interests.");
    } finally {
      setSaving(false);
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

  const showInlineLoader = fetchingCategories && interests.length === 0;
  const showEmptyState =
    !fetchingCategories && preferencesLoaded && interests.length === 0;

  return (
    <MainContainer loader={saving}>
      <StepTitle
        title="Select Interests"
        subtitle="Choose your interests to personalize your experience"
      />

      <View style={styles.container}>
        {showInlineLoader ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="large" color={colors.black} />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={interests}
            renderItem={renderInterestItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: scrollPadding, flexGrow: 1 },
            ]}
            ListEmptyComponent={
              showEmptyState ? (
                <Text style={styles.emptyText}>No interests available.</Text>
              ) : null
            }
          />
        )}
      </View>

      {selectedInterests.length > 0 && (
        <View style={[styles.floatingButton, { bottom: bottomInset }]}>
          <ButtonComp
            disabled={saving}
            title={saving ? "Saving..." : "Continue"}
            onPress={handleContinue}
            containerStyle={styles.continueButtonStyle}
          />
        </View>
      )}
    </MainContainer>
  );
};

export default UpdateInterests;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: getVertiPadding(20),
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: getVertiPadding(20),
  },
  inlineLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    marginTop: getVertiPadding(40),
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
