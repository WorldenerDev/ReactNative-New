import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import ScreenWapper from "@components/container/ScreenWapper";
import OptimizedImage from "@components/OptimizedImage";
import ImagePlaceholder from "@components/ImagePlaceholder";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import {
  getFontSize,
  getVertiPadding,
  getHoriPadding,
  getRadius,
  getWidth,
  getHeight,
} from "@utils/responsive";
import imagePath from "@assets/icons";
import {
  getCityActivities,
  activityLikeUnlike,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";
import Loader from "@components/Loader";
import navigationStrings from "@navigation/navigationStrings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const ROTATION_DEG = 10;

const Surprises = ({ navigation, route }) => {
  const { cityData } = route.params || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [surprises, setSurprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const isAnimating = useRef(false);
  const currentPosition = useRef({ x: 0, y: 0 });
  const hasInitialized = useRef(false);
  const surprisesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const pendingAdvance = useRef(false);
  const isPanning = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    surprisesRef.current = surprises;
  }, [surprises]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const cityId = cityData?.city_id || cityData?.id || cityData?.cityId || 1;
  const cityName = cityData?.name || "Paris";
  const cityImage =
    cityData?.image ||
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800";
  const limit = 10;

  // Fetch city activities from API
  const fetchCityActivities = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getCityActivities({
        cityId: cityId,
        limit: limit,
        page: pageNum,
      });

      if (response?.success && response?.data) {
        const activities = Array.isArray(response.data)
          ? response.data
          : response.data?.activities || response.data?.data || [];

        const transformedActivities = activities.map((activity, index) => ({
          id:
            activity._id ||
            activity.id ||
            activity.uuid ||
            `activity-${pageNum}-${index}`,
          name:
            activity.name ||
            activity.title ||
            activity.activityName ||
            "Activity",
          image:
            activity.image ||
            activity.cover_image_url ||
            activity.images?.[0] ||
            activity.thumbnail ||
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
          description:
            activity.description || activity.shortDescription || "Lorem Ipsum",
          subtitle:
            activity.subtitle ||
            activity.location ||
            activity.address ||
            "Lorem Ipsum is simply dummy",
        }));

        if (append) {
          setSurprises((prev) => [...prev, ...transformedActivities]);
        } else {
          setSurprises(transformedActivities);
        }

        const hasMoreItems = transformedActivities.length === limit;
        setHasMore(hasMoreItems);
      } else {
        showToast("error", response?.message || "Failed to fetch activities");
      }
    } catch (error) {
      showToast("error", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load - only once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchCityActivities(1, false);
    }
  }, []);

  // Load more when we reach the end of the current list
  const loadMoreIfNeeded = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCityActivities(nextPage, true);
    }
  };

  // Auto-advance to next card when new items are loaded and we're waiting
  useEffect(() => {
    if (
      pendingAdvance.current &&
      !loadingMore &&
      surprises.length > currentIndex + 1
    ) {
      pendingAdvance.current = false;
      setCurrentIndex((prev) => prev + 1);
    }
  }, [surprises.length, loadingMore, currentIndex]);

  useEffect(() => {
    position.stopAnimation();
    position.setValue({ x: 0, y: 0 });
    position.setOffset({ x: 0, y: 0 });
    position.flattenOffset();
    currentPosition.current = { x: 0, y: 0 };
    isAnimating.current = false;
  }, [currentIndex]);

  useEffect(() => {
    const listenerX = position.x.addListener(({ value }) => {
      currentPosition.current.x = value;
    });
    const listenerY = position.y.addListener(({ value }) => {
      currentPosition.current.y = value;
    });
    return () => {
      position.x.removeListener(listenerX);
      position.y.removeListener(listenerY);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating.current,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          !isAnimating.current &&
          (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5)
        );
      },
      onPanResponderGrant: () => {
        isPanning.current = false;
        position.stopAnimation();
        position.setOffset({
          x: currentPosition.current.x,
          y: currentPosition.current.y,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isAnimating.current) return;
        isPanning.current = true;
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isAnimating.current) return;

        position.flattenOffset();

        const swipeDistance = Math.abs(gestureState.dx);
        const swipeVelocity = Math.abs(gestureState.vx);
        const wasPanning = isPanning.current;
        const isTap =
          !wasPanning && swipeDistance < 15 && Math.abs(gestureState.dy) < 15;

        if (isTap) {
          handleCardPress();
        } else if (swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 0.5) {
          handleSwipe(gestureState.dx > 0 ? "right" : "left");
        } else {
          isAnimating.current = true;
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start(() => {
            isAnimating.current = false;
          });
        }

        isPanning.current = false;
      },
      onPanResponderTerminate: () => {
        isPanning.current = false;
      },
    })
  ).current;

  const handleCardPress = () => {
    const currentIdx = currentIndexRef.current;
    const currentSurprises = surprisesRef.current;
    const safeIdx = Math.min(currentIdx, currentSurprises.length - 1);
    const currentCardData = currentSurprises[safeIdx];

    if (!currentCardData?.id) return;

    const eventData = {
      id: currentCardData.id,
      name: currentCardData.name,
      image: currentCardData.image,
      cover_image_url: currentCardData.image,
      description: currentCardData.description,
      subtitle: currentCardData.subtitle,
    };

    navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
      eventData: eventData,
    });
  };

  const handleSwipe = (direction) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const exitX =
      direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

    const currentIdx = currentIndexRef.current;
    const currentSurprises = surprisesRef.current;
    const safeIdx = Math.min(currentIdx, currentSurprises.length - 1);
    const currentCardData = currentSurprises[safeIdx];

    if (currentCardData?.id) {
      activityLikeUnlike({
        activity_id: currentCardData.id,
        is_liked: direction === "right",
        city_id: cityData?.city_id,
      }).catch(() => {
        // Error handling is done in API interceptor
      });
    }

    Animated.timing(position, {
      toValue: { x: exitX, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.flattenOffset();
      nextCard();
    });
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      const total = surprisesRef.current.length;

      // Preload more items when approaching the end (2 cards before the end)
      if (nextIndex >= total - 2 && hasMore && !loadingMore) {
        loadMoreIfNeeded();
      }

      // Still have items in the current loaded list
      if (nextIndex < total) {
        pendingAdvance.current = false;
        return nextIndex;
      }

      // We are at the end of the current list
      // Try to load more (if available) and keep showing the last card
      if (total > 0 && hasMore && !loadingMore) {
        pendingAdvance.current = true;
        loadMoreIfNeeded();
        return prevIndex;
      }

      // No more data
      pendingAdvance.current = false;
      return prevIndex;
    });
  };

  const onLikePress = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    position.stopAnimation();
    position.flattenOffset();
    position.setValue({ x: 0, y: 0 });
    position.setOffset({ x: 0, y: 0 });
    currentPosition.current = { x: 0, y: 0 };

    if (currentCard?.id) {
      activityLikeUnlike({
        activity_id: currentCard.id,
        is_liked: true,
        city_id: cityData?.city_id,
      }).catch(() => {
        // Error handling is done in API interceptor
      });
    }

    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      nextCard();
    });
  };

  const onUnlikePress = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    position.stopAnimation();
    position.flattenOffset();
    position.setValue({ x: 0, y: 0 });
    position.setOffset({ x: 0, y: 0 });
    currentPosition.current = { x: 0, y: 0 };

    if (currentCard?.id) {
      activityLikeUnlike({
        activity_id: currentCard.id,
        is_liked: false,
        city_id: cityData?.city_id,
      }).catch(() => {
        // Error handling is done in API interceptor
      });
    }

    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      nextCard();
    });
  };

  const rotateCard = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [`-${ROTATION_DEG}deg`, "0deg", `${ROTATION_DEG}deg`],
    extrapolate: "clamp",
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.7, 1, 0.7],
    extrapolate: "clamp",
  });

  // Ensure currentIndex is always valid
  const safeCurrentIndex = Math.min(currentIndex, surprises.length - 1);
  const currentCard = surprises[safeCurrentIndex];

  if (loading && surprises.length === 0) {
    return (
      <ScreenWapper>
        <View style={styles.container}>
          <Loader />
        </View>
      </ScreenWapper>
    );
  }

  if (!currentCard && surprises.length === 0) {
    return (
      <ScreenWapper>
        <View style={styles.container}>
          <Text style={styles.emptyText}>No activities available!</Text>
        </View>
      </ScreenWapper>
    );
  }

  if (!currentCard && !loadingMore) {
    return (
      <ScreenWapper>
        <View style={styles.container}>
          <Text style={styles.emptyText}>No more surprises!</Text>
        </View>
      </ScreenWapper>
    );
  }

  // If we're loading more but don't have a current card, show loader
  if (!currentCard && loadingMore) {
    return (
      <ScreenWapper>
        <View style={styles.container}>
          <Loader />
        </View>
      </ScreenWapper>
    );
  }

  return (
    <ScreenWapper>
      <View style={styles.container}>
        <View>
          <OptimizedImage
            source={{
              uri: cityImage,
            }}
            style={styles.banner}
            placeholder={
              <ImagePlaceholder
                style={styles.banner}
                text="Loading city image..."
              />
            }
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Image source={imagePath.BACK_ICON} style={styles.iconStyle} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cityBtn} activeOpacity={0.7}>
            <Text style={styles.cityName}>{cityName} ⌄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Surprises for you!</Text>

          <View style={styles.cardContainer}>
            <Animated.View
              key={currentCard.id}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate: rotateCard },
                  ],
                  opacity: cardOpacity,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <OptimizedImage
                source={{ uri: currentCard.image }}
                style={styles.cardImage}
                placeholder={
                  <ImagePlaceholder
                    style={styles.cardImage}
                    text="Loading..."
                  />
                }
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {currentCard.name}
                </Text>
                <View style={styles.separator} />
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {currentCard.description}
                </Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onUnlikePress}
              activeOpacity={0.7}
              disabled={loadingMore}
            >
              <View style={styles.unlikeButton}>
                <Text style={styles.unlikeIcon}>✕</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onLikePress}
              activeOpacity={0.7}
              disabled={loadingMore}
            >
              <View style={styles.likeButton}>
                <Image
                  source={imagePath.UN_LIKE_ICON}
                  style={styles.likeIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenWapper>
  );
};

export default Surprises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  banner: {
    width: "100%",
    height: getHeight(230),
  },
  iconBtn: {
    width: getWidth(32),
    height: getHeight(32),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    position: "absolute",
    top: getVertiPadding(45),
    left: getHoriPadding(16),
    paddingVertical: getVertiPadding(6),
    paddingHorizontal: getHoriPadding(10),
  },
  iconStyle: {
    height: getHeight(20),
    width: getWidth(20),
    resizeMode: "contain",
  },
  cityBtn: {
    position: "absolute",
    top: getVertiPadding(48),
    left: getHoriPadding(56),
    paddingVertical: getVertiPadding(6),
    paddingHorizontal: getHoriPadding(10),
    borderRadius: getRadius(20),
  },
  cityName: {
    color: colors.white,
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoBold,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: getHoriPadding(20),
    paddingTop: getVertiPadding(16),
    paddingBottom: getVertiPadding(20),
  },
  sectionTitle: {
    fontSize: getFontSize(20),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(18),
    letterSpacing: -0.5,
    alignSelf: "flex-start",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: getVertiPadding(16),
  },
  card: {
    width: SCREEN_WIDTH - getHoriPadding(40),
    height: getHeight(380),
    borderRadius: getRadius(20),
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: getHeight(8),
    left: getHoriPadding(12),
    right: getHoriPadding(12),
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    paddingTop: getVertiPadding(16),
    paddingBottom: getVertiPadding(18),
    paddingHorizontal: getHoriPadding(18),
    borderRadius: getRadius(16),
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  cardTitle: {
    fontSize: getFontSize(26),
    fontFamily: fonts.RobotoBold,
    color: colors.black,
    marginBottom: getVertiPadding(12),
    lineHeight: getFontSize(30),
    letterSpacing: -0.3,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.lightGray,
    marginBottom: getVertiPadding(12),
  },
  cardDescription: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
    lineHeight: getFontSize(18),
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: getVertiPadding(16),
    marginTop: getVertiPadding(8),
    gap: getWidth(56),
    paddingHorizontal: getHoriPadding(20),
  },
  actionButton: {
    width: getWidth(68),
    height: getHeight(68),
  },
  unlikeButton: {
    width: "100%",
    height: "100%",
    borderRadius: getRadius(34),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.red,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  unlikeIcon: {
    fontSize: getFontSize(28),
    fontFamily: fonts.RobotoMedium,
    color: colors.red,
    lineHeight: getFontSize(28),
  },
  likeButton: {
    width: "100%",
    height: "100%",
    borderRadius: getRadius(34),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.secondary,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  likeIcon: {
    width: getWidth(32),
    height: getHeight(32),
    resizeMode: "contain",
    tintColor: colors.secondary,
  },
  emptyText: {
    fontSize: getFontSize(18),
    fontFamily: fonts.RobotoMedium,
    color: colors.lightText,
    textAlign: "center",
    marginTop: getVertiPadding(100),
  },
  loadingMoreContainer: {
    alignItems: "center",
    paddingVertical: getVertiPadding(12),
  },
  loadingMoreText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.gray,
  },
});
