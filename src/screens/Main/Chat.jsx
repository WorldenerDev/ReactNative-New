import imagePath from "@assets/icons";
import MainContainer from "@components/container/MainContainer";
import Header from "@components/Header";
import navigationStrings from "@navigation/navigationStrings";
import { getHeight } from "@utils/responsive";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import { GiftedChat, Message, MessageText } from "react-native-gifted-chat";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import {
  transformServerMessage,
  transformServerMessages,
  processSocketPayload,
} from "@utils/messageTransform";
import {
  fetchGroupMessages,
  addMessage,
  updateMessage,
} from "@redux/slices/chatSlice";
import {
  reportUser,
  blockUser,
  addUpdateEmoji,
} from "@api/services/mainServices";
import { showToast } from "@components/AppToast";

const MOCK_USERS = [
  { _id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john" },
  { _id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=jane" },
  { _id: 3, name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?u=mike" },
  { _id: 4, name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?u=sarah" },
];

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];
const BASEURL = "https://api.worldener.com";

const Chat = ({ navigation, route }) => {
  const { groupId } = route?.params || {};
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages: reduxMessages, loading: messagesLoading } = useSelector(
    (state) => state.chat
  );
  // Normalize userId to string for consistent comparison
  const userId = user?._id || user?.id;
  const normalizedUserId = userId ? String(userId) : null;
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  // Get messages from Redux state for this group
  const groupMessages = reduxMessages[groupId] || [];

  // Transform Redux messages to GiftedChat format
  const messages = useMemo(() => {
    if (!Array.isArray(groupMessages) || groupMessages.length === 0) {
      return [];
    }
    return transformServerMessages(groupMessages, normalizedUserId);
  }, [groupMessages, normalizedUserId]);

  const [text, setText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const [showUserActions, setShowUserActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // Get current user for GiftedChat
  const CURRENT_USER = useMemo(
    () => ({
      _id: normalizedUserId || "1",
      name: user?.name || "User",
      avatar: user?.avatar || user?.profileImage || undefined,
    }),
    [normalizedUserId, user?.name, user?.avatar, user?.profileImage]
  );

  // Check if selected user is the current user
  const isSelectedUserCurrentUser = useMemo(() => {
    if (!selectedMessage?.user) return false;
    const selectedUserId = String(selectedMessage.user._id || "");
    const currentUserId = String(CURRENT_USER._id || "");
    return selectedUserId === currentUserId;
  }, [selectedMessage, CURRENT_USER]);

  // Step 1: Fetch messages from API first
  useEffect(() => {
    if (!groupId) {
      console.warn("Chat: groupId is missing from route params");
      return;
    }
    dispatch(fetchGroupMessages(groupId));
  }, [groupId, dispatch]);

  // Step 2: Connect socket and join group after messages are loaded
  useEffect(() => {
    if (!normalizedUserId || !groupId || !socketReady) return;

    const socket = io(BASEURL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      query: { userId: normalizedUserId },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
      // Join group after socket is connected
      socket.emit(
        "join_group",
        { groupId, userId: normalizedUserId },
        (response) => {
          console.log("Joined group response:", response);
        }
      );
    });

    // Receive group message
    socket.on("receive_group_message", (payload) => {
      console.log("receive_group_message payload ===>", payload);
      const serverMessage = processSocketPayload(
        payload,
        normalizedUserId,
        user
      );

      if (serverMessage) {
        console.log(
          "Transformed server message ===>",
          JSON.stringify(serverMessage, null, 2)
        );

        // Add message to Redux store (in server format)
        dispatch(addMessage({ groupId, message: serverMessage }));
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error", err);
    });

    return () => {
      socket.off("connect");
      socket.off("receive_group_message");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [normalizedUserId, groupId, socketReady, dispatch, user]);

  // Set socket ready after messages are loaded (or loading is complete)
  useEffect(() => {
    if (!messagesLoading && groupId) {
      setSocketReady(true);
    }
  }, [messagesLoading, groupId]);

  const onSend = useCallback(
    (newMessages = []) => {
      const socket = socketRef.current;
      if (!socket || !connected) {
        console.warn("Socket not connected");
        return;
      }

      // Handle manual send from custom composer
      if (text.trim()) {
        const messageToSend = {
          groupId: groupId,
          senderId: normalizedUserId,
          message: text.trim(),
          messageType: "text",
          mediaUrl: null,
          createdAt: new Date().toISOString(),
        };

        console.log(
          "Sending message to socket:",
          JSON.stringify(messageToSend, null, 2)
        );

        // Emit send_group_message event
        // Message will be added via receive_group_message event
        socket.emit("send_group_message", messageToSend, (response) => {
          console.log("Send message response:", response, messageToSend);
        });

        // Clear text input - message will appear via receive_group_message
        setText("");
      } else if (newMessages.length > 0) {
        // Handle send from default composer
        const message = newMessages[0];
        const messageToSend = {
          groupId: groupId,
          senderId: normalizedUserId,
          message: message.text || "",
          messageType: message.image ? "image" : "text",
          mediaUrl: message.image || null,
          createdAt: message.createdAt
            ? new Date(message.createdAt).toISOString()
            : new Date().toISOString(),
        };

        console.log(
          "Sending message to socket:",
          JSON.stringify(messageToSend, null, 2)
        );

        // Emit send_group_message event
        // Message will be added via receive_group_message event
        socket.emit("send_group_message", messageToSend, (response) => {
          console.log("Send message response:", response);
        });
      }
    },
    [text, groupId, normalizedUserId, connected]
  );

  // Mention
  const handleTextChange = useCallback((newText) => {
    setText(newText);
    const cursor = newText.length;
    setCursorPosition(cursor);

    const lastAt = newText.lastIndexOf("@", cursor - 1);
    if (lastAt >= 0) {
      const query = newText.slice(lastAt + 1, cursor);
      const suggestions = MOCK_USERS.filter((u) =>
        u.name.toLowerCase().startsWith(query.toLowerCase())
      );
      setMentionSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  }, []);

  const insertMention = (user) => {
    const before = text.slice(0, cursorPosition);
    const after = text.slice(cursorPosition);
    const lastAt = before.lastIndexOf("@");
    const newText = before.slice(0, lastAt) + "@" + user.name + " " + after;
    setText(newText);
    setShowSuggestions(false);
    setMentionSuggestions([]);
  };

  // Emoji
  const handleEmojiReaction = useCallback(
    async (emoji, message = selectedMessage) => {
      if (!message || !groupId) return;

      // Find the original message in Redux state to get reactions
      const originalMessage = groupMessages.find((msg) => {
        const transformed = transformServerMessage(msg, normalizedUserId);
        return transformed._id === message._id;
      });

      if (!originalMessage?._id) {
        console.warn("Could not find original message for emoji reaction");
        return;
      }

      const currentReactions = originalMessage?.reactions || {};
      const reactions = { ...currentReactions };
      const emojiUsers = reactions[emoji] || [];
      const userAlreadyReacted = emojiUsers.some(
        (u) => u._id === CURRENT_USER._id || u === CURRENT_USER._id
      );

      // Update reactions locally
      if (userAlreadyReacted) {
        reactions[emoji] = emojiUsers.filter(
          (u) => u._id !== CURRENT_USER._id && u !== CURRENT_USER._id
        );
      } else {
        reactions[emoji] = [...emojiUsers, CURRENT_USER._id];
      }

      // Remove empty reaction arrays
      Object.keys(reactions).forEach((key) => {
        if (!reactions[key] || reactions[key].length === 0) {
          delete reactions[key];
        }
      });

      // Convert reactions object to emoji array (only emojis with non-empty arrays)
      const emojiArray = Object.keys(reactions).filter(
        (key) => reactions[key] && reactions[key].length > 0
      );

      try {
        // Call API to update emoji reactions
        await addUpdateEmoji({
          messageId: originalMessage._id,
          emoji: emojiArray,
        });

        // Update message in Redux after successful API call
        dispatch(
          updateMessage({
            groupId,
            messageId: originalMessage._id,
            updates: { reactions },
          })
        );
      } catch (error) {
        console.error("Error updating emoji reaction:", error);
        showToast("error", error?.message || "Failed to update reaction");
        // Optionally revert the local change on error
      }

      setShowEmojiPicker(false);
      setSelectedMessage(null);
    },
    [
      selectedMessage,
      groupId,
      groupMessages,
      normalizedUserId,
      CURRENT_USER,
      dispatch,
    ]
  );

  const renderReactions = (currentMessage, position) => {
    if (!currentMessage.reactions) return null;
    const containerStyle =
      position === "right" ? styles.reactionsRight : styles.reactionsLeft;

    return (
      <View style={containerStyle}>
        {Object.entries(currentMessage.reactions).map(([emoji, users]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => handleEmojiReaction(emoji, currentMessage)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{users.length}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmojiPickerAbove = (currentMessage) => {
    if (
      !currentMessage ||
      currentMessage._id !== selectedMessage?._id ||
      !showEmojiPicker
    )
      return null;
    return (
      <View style={styles.emojiPickerAbove}>
        <View style={styles.emojiGrid}>
          {EMOJI_REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => handleEmojiReaction(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // User actions
  const onUserAvatarPress = useCallback(
    (user) => {
      // Check if the clicked user is the current user
      const clickedUserId = String(user?._id || "");
      const currentUserId = String(CURRENT_USER._id || "");

      // Don't show modal if user clicks on their own profile
      if (clickedUserId === currentUserId) {
        return;
      }

      setSelectedMessage({ user });
      setShowUserActions(true);
    },
    [CURRENT_USER]
  );

  const handleBlockUser = useCallback(async (user) => {
    if (!user?._id) return;

    setBlockLoading(true);

    try {
      const blockData = {
        blockedUserId: String(user._id),
      };

      await blockUser(blockData);
      showToast("success", `Blocked ${user.name || "user"} successfully`);
      setShowUserActions(false);
    } catch (error) {
      console.error("Error blocking user:", error);
      showToast("error", error?.message || "Failed to block user");
    } finally {
      setBlockLoading(false);
    }
  }, []);

  const handleUserAction = useCallback(
    (action, user) => {
      // Prevent users from reporting/blocking themselves (safety check)
      const clickedUserId = String(user?._id || "");
      const currentUserId = String(CURRENT_USER._id || "");

      if (clickedUserId === currentUserId) {
        setShowUserActions(false);
        return;
      }

      if (action === "report") {
        // Close user actions modal and open report modal
        setShowUserActions(false);
        setShowReportModal(true);
        setReportReason("");
        setReportDescription("");
      } else if (action === "block") {
        handleBlockUser(user);
      }
    },
    [CURRENT_USER, handleBlockUser]
  );

  const submitReport = useCallback(async () => {
    if (!selectedMessage?.user || !groupId) return;

    // Validate inputs
    if (!reportReason.trim()) {
      showToast("error", "Please provide a reason for reporting");
      return;
    }

    if (!reportDescription.trim()) {
      showToast("error", "Please provide a description");
      return;
    }

    setReportLoading(true);

    try {
      const reportData = {
        reportedUserId: String(selectedMessage.user._id),
        groupId: groupId,
        reason: reportReason.trim(),
        description: reportDescription.trim(),
      };

      await reportUser(reportData);
      showToast("success", "User reported successfully");
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error reporting user:", error);
      showToast("error", error?.message || "Failed to report user");
    } finally {
      setReportLoading(false);
    }
  }, [selectedMessage, groupId, reportReason, reportDescription]);

  // Render message
  const renderMessage = (props) => {
    const { currentMessage, position } = props;
    // Use String() comparison to handle type mismatches (number vs string)
    const isCurrentUser =
      String(currentMessage.user._id) === String(CURRENT_USER._id);

    return (
      <View style={{ marginVertical: 2 }}>
        <Message
          {...props}
          onLongPress={() =>
            setSelectedMessage(currentMessage) || setShowEmojiPicker(true)
          }
          onPressAvatar={() => onUserAvatarPress(currentMessage.user)}
          renderMessageText={(msgProps) => (
            <MessageText
              {...msgProps}
              parsePatterns={(linkStyle) => [
                {
                  pattern: /@[\w\s]+/g,
                  style: {
                    color: isCurrentUser ? "#fff" : "#0b93f6",
                    fontWeight: "bold",
                  },
                },
              ]}
            />
          )}
        />
        {renderReactions(currentMessage, position)}
        {renderEmojiPickerAbove(currentMessage)}
      </View>
    );
  };

  const renderSend = (props) => {
    const hasText = text.trim().length > 0;
    return (
      <TouchableOpacity
        style={[styles.sendButton, !hasText && styles.sendButtonDisabled]}
        onPress={() => {
          if (hasText) {
            onSend();
          }
        }}
        disabled={!hasText}
      >
        <Text style={styles.sendButtonIcon}>→</Text>
      </TouchableOpacity>
    );
  };

  const renderInputToolbar = (props) => (
    <View style={styles.inputToolbar}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type you message"
          placeholderTextColor="#999"
          value={text}
          onChangeText={handleTextChange}
          multiline
        />
        {renderSend(props)}
      </View>
    </View>
  );

  return (
    <MainContainer loader={messagesLoading}>
      <Header
        title="Group Chat"
        rightIconImage={imagePath.AI_ICON}
        onRightIconPress={() => navigation.navigate(navigationStrings.AI_CHAT)}
      />

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={CURRENT_USER}
        renderMessage={renderMessage}
        renderInputToolbar={renderInputToolbar}
        showUserAvatar
      />

      {showSuggestions && (
        <View style={styles.mentionPopup}>
          <FlatList
            data={mentionSuggestions}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.mentionItem}
                onPress={() => insertMention(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View style={{ height: getHeight(20) }} />

      <Modal
        visible={showUserActions && !isSelectedUserCurrentUser}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.userActionsModal}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {selectedMessage?.user?.name || "Unknown User"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUserActions(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                selectedMessage?.user &&
                handleUserAction("report", selectedMessage.user)
              }
            >
              <Text style={styles.actionButtonText}>🚨 Report User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.blockButton,
                blockLoading && styles.actionButtonDisabled,
              ]}
              onPress={() =>
                selectedMessage?.user &&
                handleUserAction("block", selectedMessage.user)
              }
              disabled={blockLoading}
            >
              <Text style={[styles.actionButtonText, styles.blockButtonText]}>
                {blockLoading ? "Blocking..." : "🚫 Block User"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report User Modal */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Report User</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDescription("");
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.reportLabel}>Reason *</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Enter reason for reporting"
              placeholderTextColor="#999"
              value={reportReason}
              onChangeText={setReportReason}
              multiline={false}
            />

            <Text style={styles.reportLabel}>Description *</Text>
            <TextInput
              style={[styles.reportInput, styles.reportTextArea]}
              placeholder="Provide additional details"
              placeholderTextColor="#999"
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.reportButtonContainer}>
              <TouchableOpacity
                style={[styles.reportCancelButton]}
                onPress={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDescription("");
                }}
                disabled={reportLoading}
              >
                <Text style={styles.reportCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reportSubmitButton,
                  reportLoading && styles.reportSubmitButtonDisabled,
                ]}
                onPress={submitReport}
                disabled={reportLoading}
              >
                <Text style={styles.reportSubmitButtonText}>
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
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
  sendButtonText: { color: "#fff", fontWeight: "600" },
  reactionsLeft: { flexDirection: "row", marginTop: 4, marginLeft: 60 },
  reactionsRight: {
    flexDirection: "row",
    marginTop: 4,
    marginLeft: "auto",
    marginRight: 60,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  reactionEmoji: { fontSize: 12, marginRight: 2 },
  reactionCount: { fontSize: 10, color: "#666" },
  emojiPickerAbove: { marginBottom: 10, alignItems: "center" },
  emojiGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  emojiText: { fontSize: 20 },
  mentionPopup: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 150,
  },
  mentionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  userActionsModal: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: { fontWeight: "bold", fontSize: 16 },
  closeButton: { padding: 4 },
  closeButtonText: { fontSize: 16 },
  actionButton: { paddingVertical: 8 },
  actionButtonDisabled: { opacity: 0.5 },
  actionButtonText: { fontSize: 16 },
  blockButton: { marginTop: 4 },
  blockButtonText: { color: "red" },
  reportModal: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  reportInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 44,
  },
  reportTextArea: {
    minHeight: 100,
    maxHeight: 150,
    paddingTop: 12,
  },
  reportButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  reportCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  reportCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  reportSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
  },
  reportSubmitButtonDisabled: {
    opacity: 0.5,
  },
  reportSubmitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});

export default Chat;
