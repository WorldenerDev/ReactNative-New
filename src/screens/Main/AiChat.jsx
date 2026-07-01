import { chatbot, getChatbotHistory, getGroups } from "@api/services/mainServices";
import useGuestScreenGuard from "@hooks/useGuestScreenGuard";
import colors from "@assets/colors";
import fonts from "@assets/fonts";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import { navigateToTripDetails } from "@navigation/helpers/nestedTabNavigation";
import navigationStrings from "@navigation/navigationStrings";
import { useRoute } from "@react-navigation/native";
import {
  getFontSize,
  getHeight,
  getHoriPadding,
  getRadius,
  getVertiPadding,
  getWidth,
} from "@utils/responsive";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Bubble,
  GiftedChat,
  MessageImage,
  MessageText,
} from "react-native-gifted-chat";
import { useSelector } from "react-redux";

const BOT_USER = { _id: 2, name: "AI" };

const createActivityMessage = (activity, indexOffset) => ({
  _id: `activity-${activity?.uuid || indexOffset}-${Date.now()}`,
  text: `${activity?.title || "Activity"}\n${activity?.description || ""}\nPrice: ${activity?.retail_price_value ?? "N/A"}`,
  createdAt: new Date(Date.now() - indexOffset * 1000),
  image: activity?.cover_image_url || undefined,
  activityUuid: activity?.uuid || null,
  activityName: activity?.title || "Activity",
  activityImage: activity?.cover_image_url || null,
  user: BOT_USER,
});

const createTextMessage = ({ id, text, createdAt, user, indexOffset = 0 }) => ({
  _id: id || `msg-${Date.now()}-${indexOffset}`,
  text: text || "",
  createdAt: createdAt ? new Date(createdAt) : new Date(Date.now() - indexOffset * 1000),
  user,
});

const ACTIVITY_BUBBLE_WIDTH = 280;


const AiChat = ({ navigation }) => {
  useGuestScreenGuard();
  const route = useRoute();
  const { groupId, tripId, conversation_id, fromHistoryList } = route?.params || {};
  const { user } = useSelector((state) => state.auth);
  const currentUser = useMemo(
    () => ({
      _id: user?._id || user?.id || 1,
      name: user?.name || "You",
    }),
    [user]
  );

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [allActivities, setAllActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBotResponse, setHasBotResponse] = useState(false);
  const [tripTitle, setTripTitle] = useState("Trip");

  useEffect(() => {
    let isMounted = true;

    const loadGroupTripTitle = async () => {
      try {
        const response = await getGroups();
        const groups = response?.data || [];
        if (!Array.isArray(groups) || groups.length === 0) return;

        const matchedGroup =
          groups.find((item) => String(item?._id) === String(groupId)) ||
          groups.find((item) => String(item?.tripId) === String(tripId)) ||
          groups.find((item) => String(item?.trip_id) === String(tripId));

        const cityName = matchedGroup?.cityId?.name;
        if (isMounted && cityName) {
          setTripTitle(`${cityName} Trip`);
        }
      } catch (error) {
        // Keep fallback title if groups API fails.
      }
    };

    loadGroupTripTitle();

    return () => {
      isMounted = false;
    };
  }, [groupId, tripId]);

  useEffect(() => {
    let isMounted = true;

    const loadConversationHistory = async () => {
      if (!fromHistoryList || !conversation_id || !tripId) return;

      setIsLoading(true);
      try {
        const response = await getChatbotHistory(conversation_id, { trip_id: tripId });
        const historyItems = Array.isArray(response?.data) ? response.data : [];

        let extractedActivities = [];
        const mappedMessages = [];

        historyItems.forEach((item, index) => {
          const isUserRole = item?.role === "user";
          const baseUser = isUserRole ? currentUser : BOT_USER;
          const messageText = isUserRole
            ? item?.message
            : item?.message || "Recommendations generated";

          if (messageText) {
            mappedMessages.push(
              createTextMessage({
                id: item?.message_id,
                text: messageText,
                createdAt: item?.createdAt,
                user: baseUser,
                indexOffset: index,
              })
            );
          }

          const assistantActivities = item?.payload?.activities?.data;
          if (!isUserRole && Array.isArray(assistantActivities) && assistantActivities.length > 0) {
            extractedActivities = assistantActivities;
          }
        });

        const firstBatch = extractedActivities.slice(0, 5);
        const activityMessages = firstBatch.map((activity, index) =>
          createActivityMessage(activity, index + 1)
        );

        const combinedMessages = [...mappedMessages, ...activityMessages].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (isMounted) {
          setMessages(combinedMessages);
          setAllActivities(extractedActivities);
          setVisibleActivities(firstBatch.length);
          setHasBotResponse(true);
        }
      } catch (error) {
        if (isMounted) {
          setMessages([
            {
              _id: `ai-history-error-${Date.now()}`,
              text: error?.message || "Unable to load AI chat history.",
              createdAt: new Date(),
              user: BOT_USER,
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConversationHistory();

    return () => {
      isMounted = false;
    };
  }, [fromHistoryList, conversation_id, tripId, currentUser]);

  const onSend = useCallback(
    async () => {
      const prompt = text.trim();
    if (!prompt || !tripId || isLoading || fromHistoryList) return;

      const userMessage = {
        _id: `user-${Date.now()}`,
        text: prompt,
        createdAt: new Date(),
        user: currentUser,
      };
      setMessages((prev) => GiftedChat.append(prev, [userMessage]));
      setText("");
      setIsLoading(true);

      try {
        const response = await chatbot({ prompt, trip_id: tripId });
        const activities = response?.activities?.data || [];
        const firstBatch = activities.slice(0, 5);
        const activityMessages = firstBatch.map((item, index) =>
          createActivityMessage(item, index + 1)
        );
        const nextMessages =
          activityMessages.length > 0
            ? activityMessages
            : [
              {
                _id: `ai-empty-${Date.now()}`,
                text: "No activities found for your query.",
                createdAt: new Date(),
                user: BOT_USER,
              },
            ];
        setMessages((prev) => GiftedChat.append(prev, nextMessages));
        setAllActivities(activities);
        setVisibleActivities(firstBatch.length);
        setHasBotResponse(true);
      } catch (error) {
        const fallbackMessage = {
          _id: `ai-error-${Date.now()}`,
          text: error?.message || "Unable to fetch activities right now.",
          createdAt: new Date(),
          user: BOT_USER,
        };
        setMessages((prev) => GiftedChat.append(prev, [fallbackMessage]));
      } finally {
        setIsLoading(false);
      }
    },
    [text, tripId, isLoading, currentUser]
  );

  const handleLoadMore = useCallback(() => {
    if (visibleActivities >= allActivities.length) return;
    const nextSlice = allActivities.slice(visibleActivities, visibleActivities + 5);
    const newMessages = nextSlice.map((item, index) =>
      createActivityMessage(item, index + visibleActivities + 1)
    );
    setMessages((prev) => GiftedChat.append(prev, newMessages));
    setVisibleActivities((prev) => prev + nextSlice.length);
  }, [allActivities, visibleActivities]);

  const renderSend = () => {
    const hasText = text.trim().length > 0 && !isLoading;
    return (
      <TouchableOpacity
        style={[styles.sendButton, !hasText && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!hasText}
      >
        <Text style={styles.sendButtonIcon}>{isLoading ? "..." : "→"}</Text>
      </TouchableOpacity>
    );
  };

  const renderInputToolbar = () =>
    hasBotResponse ? null : (
      <View style={styles.inputToolbar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
          />
          {renderSend()}
        </View>
      </View>
    );

  const renderChatFooter = () => {
    const canLoadMore = hasBotResponse && visibleActivities < allActivities.length;
    if (!canLoadMore) return <View style={{ height: getHeight(10) }} />;

    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
          <Text style={styles.loadMoreButtonText}>Load More</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleViewAiChats = useCallback(() => {
    navigation.navigate(navigationStrings.VIEW_AI_CHAT, { groupId, tripId });
  }, [navigation, groupId, tripId]);

  const handleViewTrip = useCallback(() => {
    if (!tripId) return;
    navigateToTripDetails(navigation, { tripId });
  }, [navigation, tripId]);

  const handleGroupChat = useCallback(() => {
    if (!groupId) {
      console.warn("AiChat: groupId is missing, cannot navigate to Chat");
      // Optionally show an alert or toast to the user
      return;
    }
    navigation.navigate(navigationStrings.CHAT, { groupId });
  }, [navigation, groupId]);

  const handleActivityPress = useCallback(
    (activityUuid, activityName, activityImage) => {
      if (!activityUuid) return;

      const eventData = {
        id: activityUuid,
        name: activityName,
        image: activityImage,
        cover_image_url: activityImage,
      };

      navigation.navigate(navigationStrings.ACTIVITY_DETAILS, {
        eventData,
      });
    },
    [navigation]
  );

  const renderBubble = useCallback((props) => {
    const currentMessage = props?.currentMessage;
    const hasActivityImage = Boolean(currentMessage?.image);
    const canOpenActivity =
      String(currentMessage?.user?._id) === String(BOT_USER._id) &&
      Boolean(currentMessage?.activityUuid);

    return (
      <Bubble
        {...props}
        onPress={() => {
          if (!canOpenActivity) return;
          handleActivityPress(
            currentMessage?.activityUuid,
            currentMessage?.activityName,
            currentMessage?.activityImage
          );
        }}
        wrapperStyle={{
          left: [
            styles.leftBubble,
            hasActivityImage ? styles.bubbleWithActivity : null,
          ],
          right: [styles.rightBubble],
        }}
      />
    );
  }, [handleActivityPress]);

  const renderMessageImage = useCallback(
    (props) => <MessageImage {...props} imageStyle={styles.activityImage} />,
    []
  );

  const renderMessageText = useCallback(
    (props) => <MessageText {...props} textStyle={{ left: styles.activityText, right: styles.activityText }} />,
    []
  );

  const renderAvatar = useCallback((props) => {
    const isBot = String(props?.currentMessage?.user?._id) === String(BOT_USER._id);
    if (!isBot) {
      return <Avatar {...props} />;
    }

    return (
      <View style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>AI</Text>
      </View>
    );
  }, []);

  return (
      <MainContainer loader={isLoading && messages.length === 0}>
      <Header title="Plan with AI" />

      {/* Trip Title and Action Buttons */}
      <View style={styles.tripSection}>
        <Text style={styles.tripTitle}>{tripTitle}</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.tripActionButton}
            onPress={handleViewAiChats}
            activeOpacity={0.7}
          >
            <Text style={styles.tripActionButtonText}>View AI Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tripActionButton}
            onPress={handleViewTrip}
            activeOpacity={0.7}
          >
            <Text style={styles.tripActionButtonText}>View Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tripActionButton}
            onPress={handleGroupChat}
            activeOpacity={0.7}
          >
            <Text style={styles.tripActionButtonText}>Group Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <GiftedChat
        messages={messages}
        user={currentUser}
        renderInputToolbar={renderInputToolbar}
        renderChatFooter={renderChatFooter}
        renderBubble={renderBubble}
        renderMessageImage={renderMessageImage}
        renderMessageText={renderMessageText}
        renderAvatar={renderAvatar}
        showUserAvatar
      />

      <View style={{ height: getHeight(20) }} />
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  tripSection: {
    paddingTop: getVertiPadding(10),
    paddingBottom: getVertiPadding(10),
    paddingHorizontal: getHoriPadding(15),
  },
  tripTitle: {
    fontSize: getFontSize(15),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
    textAlign: "center",
    marginBottom: getVertiPadding(10),
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: getWidth(10),
  },
  tripActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: getRadius(8),
    paddingVertical: getVertiPadding(4),
    paddingHorizontal: getHoriPadding(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    minHeight: getHeight(10),
  },
  tripActionButtonText: {
    fontSize: getFontSize(14),
    fontFamily: fonts.RobotoRegular,
    color: colors.lightText,
    textAlign: "center",
  },
  inputToolbar: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    borderBottomWidth: 0,
  },
  inputContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    borderWidth: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonIcon: { fontSize: 20, color: "#000", fontWeight: "bold" },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: getHoriPadding(16),
    paddingVertical: getVertiPadding(8),
  },
  loadMoreButton: {
    minWidth: getWidth(90),
    borderRadius: getRadius(16),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getVertiPadding(8),
    paddingHorizontal: getHoriPadding(16),
    backgroundColor: "#87CEEB",
  },
  loadMoreButtonText: {
    fontSize: getFontSize(13),
    fontFamily: fonts.RobotoMedium,
    color: colors.black,
  },
  // Keep activity cards consistent so image spans same width as text bubble.
  bubbleWithActivity: {
    width: ACTIVITY_BUBBLE_WIDTH,
  },
  leftBubble: {
    backgroundColor: "#f4f4f4",
    overflow: "hidden",
  },
  rightBubble: {
    backgroundColor: "#87CEEB",
    overflow: "hidden",
  },
  activityImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  activityText: {
    paddingHorizontal: getHoriPadding(10),
    paddingVertical: getVertiPadding(8),
    fontSize: getFontSize(13),
    color: colors.black,
    lineHeight: getFontSize(18),
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2ecc71",
    alignItems: "center",
    justifyContent: "center",
  },
  botAvatarText: {
    color: "#fff",
    fontSize: getFontSize(12),
    fontFamily: fonts.RobotoMedium,
  },
});

export default AiChat;
