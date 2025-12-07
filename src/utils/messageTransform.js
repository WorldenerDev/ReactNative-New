// utils/messageTransform.js

const BASEURL = "https://api.worldener.com";

/**
 * Transform server message to GiftedChat format
 * @param {Object} serverMessage - The message object from server
 * @param {string|number} currentUserId - Current user's ID
 * @returns {Object} Message in GiftedChat format
 */
export const transformServerMessage = (serverMessage, currentUserId) => {
  // Generate a unique ID if missing
  const messageId =
    serverMessage._id ||
    serverMessage.messageId ||
    serverMessage.id ||
    `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Parse createdAt, default to now if missing
  let createdAt;
  if (serverMessage.createdAt) {
    createdAt =
      serverMessage.createdAt instanceof Date
        ? serverMessage.createdAt
        : new Date(serverMessage.createdAt);
    // Validate date
    if (isNaN(createdAt.getTime())) {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }

  // Get sender info
  const senderId =
    serverMessage.senderId ||
    serverMessage.from ||
    serverMessage.userId ||
    currentUserId;
  const senderName = serverMessage.senderName || "User";
  const senderAvatar = serverMessage.senderAvatar || undefined;

  // Build message object
  const giftedMessage = {
    _id: messageId,
    text: serverMessage.message || serverMessage.text || "",
    createdAt: createdAt,
    user: {
      _id: senderId,
      name: senderName,
      avatar: senderAvatar,
    },
  };

  // Add image if message type is image
  if (serverMessage.messageType === "image" && serverMessage.mediaUrl) {
    giftedMessage.image = serverMessage.mediaUrl.startsWith("http")
      ? serverMessage.mediaUrl
      : `${BASEURL}${serverMessage.mediaUrl}`;
  }

  // Preserve reactions if they exist
  if (serverMessage.reactions) {
    giftedMessage.reactions = serverMessage.reactions;
  }

  return giftedMessage;
};

/**
 * Process socket payload and extract message data
 * Handles different payload structures from socket events
 * @param {Object} payload - The payload from socket event
 * @param {string|number} userId - Current user's ID (fallback for missing sender)
 * @param {Object} currentUser - Current user object from Redux (optional)
 * @returns {Object|null} Processed server message or null if invalid
 */
export const processSocketPayload = (payload, userId, currentUser = null) => {
  if (!payload) {
    console.warn("processSocketPayload: Empty payload received");
    return null;
  }

  // Handle different payload structures
  const messageData = payload?.message || payload?.data || payload;

  // Extract sender ID
  const extractedSenderId =
    messageData?.senderId ||
    messageData?.from ||
    messageData?.userId ||
    payload?.from ||
    userId;

  // Determine sender name - use current user's name if sender is current user
  let senderName =
    messageData?.senderName ||
    messageData?.sender?.name ||
    messageData?.user?.name ||
    payload?.sender?.name;

  // If sender is current user and no name found in payload, use current user's name
  if (!senderName && currentUser && String(extractedSenderId) === String(userId)) {
    senderName = currentUser?.name || "User";
  }

  // Fallback to "User" if still no name
  if (!senderName) {
    senderName = "User";
  }

  // Determine sender avatar - use current user's image if sender is current user
  let senderAvatar =
    messageData?.senderAvatar ||
    messageData?.sender?.avatar ||
    messageData?.user?.avatar ||
    payload?.sender?.avatar;

  // If sender is current user and no avatar found in payload, use current user's image
  if (!senderAvatar && currentUser && String(extractedSenderId) === String(userId)) {
    senderAvatar = currentUser?.image || currentUser?.avatar || currentUser?.profileImage;
  }

  const serverMessage = {
    _id:
      messageData?._id ||
      messageData?.messageId ||
      messageData?.id ||
      Math.random().toString(),
    message:
      messageData?.message || messageData?.text || payload?.message || "",
    createdAt:
      messageData?.createdAt ||
      messageData?.timestamp ||
      new Date().toISOString(),
    senderId: extractedSenderId,
    senderName: senderName,
    senderAvatar: senderAvatar,
    messageType: messageData?.messageType || payload?.messageType || "text",
    ...(messageData?.messageType === "image" || payload?.messageType === "image"
      ? {
          mediaUrl: (messageData?.mediaUrl || payload?.mediaUrl)?.startsWith(
            "http"
          )
            ? messageData?.mediaUrl || payload?.mediaUrl
            : `${BASEURL}${messageData?.mediaUrl || payload?.mediaUrl}`,
        }
      : {}),
  };

  // Only return message if it has valid content
  if (serverMessage.message || serverMessage.messageType === "image") {
    return serverMessage;
  }

  console.warn("processSocketPayload: Message has no valid content");
  return null;
};

/**
 * Transform multiple server messages to GiftedChat format
 * @param {Array} serverMessages - Array of message objects from server
 * @param {string|number} currentUserId - Current user's ID
 * @returns {Array} Array of messages in GiftedChat format
 */
export const transformServerMessages = (serverMessages, currentUserId) => {
  if (!Array.isArray(serverMessages)) {
    return [];
  }

  return serverMessages
    .map((msg) => transformServerMessage(msg, currentUserId))
    .filter((msg) => msg && msg.text !== undefined);
};

