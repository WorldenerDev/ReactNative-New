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

  // Get sender info - handle both direct ID and nested object structure
  // Note: serverMessage should always have senderId from processSocketPayload
  // But we keep fallback for messages loaded from API
  let senderId =
    serverMessage.senderId ||
    serverMessage.from ||
    serverMessage.userId ||
    currentUserId;

  // Handle case where senderId is an object (e.g., {_id: "123"})
  if (senderId && typeof senderId === 'object' && senderId._id) {
    senderId = senderId._id;
  }

  // Normalize to string for consistent comparison
  // Use currentUserId as fallback only for API-loaded messages (not socket messages)
  const normalizedSenderId = senderId ? String(senderId) : String(currentUserId || "");

  // Extract sender name - handle nested structure
  let senderName = serverMessage.senderName;
  if (!senderName && serverMessage.senderId && typeof serverMessage.senderId === 'object') {
    senderName = serverMessage.senderId.name || serverMessage.senderId.userName;
  }
  senderName = senderName || "User";

  // Extract sender avatar - handle nested structure
  let senderAvatar = serverMessage.senderAvatar;
  if (!senderAvatar && serverMessage.senderId && typeof serverMessage.senderId === 'object') {
    senderAvatar = serverMessage.senderId.avatar || serverMessage.senderId.profileImage || serverMessage.senderId.image;
  }

  // Build message object
  const giftedMessage = {
    _id: messageId,
    text: serverMessage.message || serverMessage.text || "",
    createdAt: createdAt,
    user: {
      _id: normalizedSenderId,
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

  // Handle reactions - convert emoji array to reactions object
  if (serverMessage.reactions) {
    giftedMessage.reactions = serverMessage.reactions;
  } else if (serverMessage.emoji && Array.isArray(serverMessage.emoji) && serverMessage.emoji.length > 0) {
    // Convert emoji array to reactions object format
    // Since API doesn't provide user info per emoji, create a simple reactions object
    const reactions = {};
    serverMessage.emoji.forEach((emoji) => {
      // Use a placeholder array with one user (could be enhanced later)
      reactions[emoji] = ["user"];
    });
    giftedMessage.reactions = reactions;
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

  // Extract sender ID - handle both direct ID and nested object structure
  // IMPORTANT: Check payload level first, then messageData level
  // Do NOT default to userId as that would make all messages appear from current user
  let extractedSenderId =
    payload?.senderId ||
    payload?.from ||
    messageData?.senderId ||
    messageData?.from ||
    messageData?.userId ||
    messageData?.sender?._id ||
    messageData?.sender?.id ||
    messageData?.user?._id ||
    messageData?.user?.id;

  // Handle case where senderId is an object (e.g., {_id: "123"})
  if (extractedSenderId && typeof extractedSenderId === 'object') {
    extractedSenderId = extractedSenderId._id || extractedSenderId.id;
  }

  // Normalize to string for consistent comparison
  // Only use userId as fallback if we truly can't find senderId (shouldn't happen for valid messages)
  const normalizedSenderId = extractedSenderId ? String(extractedSenderId) : null;
  const normalizedUserId = userId ? String(userId) : "";

  // Log warning if senderId is missing (this shouldn't happen for valid socket messages)
  if (!normalizedSenderId) {
    console.warn("processSocketPayload: Could not extract senderId from payload:", payload);
  }

  // Determine sender name - handle nested structures
  let senderName =
    messageData?.senderName ||
    messageData?.sender?.name ||
    messageData?.user?.name ||
    payload?.sender?.name;

  // Check if senderId is an object with name property
  if (!senderName) {
    const senderIdObj = messageData?.senderId || payload?.senderId;
    if (senderIdObj && typeof senderIdObj === 'object') {
      senderName = senderIdObj.name || senderIdObj.userName;
    }
  }

  // If sender is current user and no name found in payload, use current user's name
  if (!senderName && currentUser && normalizedSenderId && normalizedSenderId === normalizedUserId) {
    senderName = currentUser?.name || "User";
  }
  // Only use "User" as fallback if we have a senderId (don't create messages without valid sender)
  senderName = senderName || (normalizedSenderId ? "User" : "Unknown");

  // Determine sender avatar - handle nested structures
  let senderAvatar =
    messageData?.senderAvatar ||
    messageData?.sender?.avatar ||
    messageData?.user?.avatar ||
    payload?.sender?.avatar;

  // Check if senderId is an object with avatar property
  if (!senderAvatar) {
    const senderIdObj = messageData?.senderId || payload?.senderId;
    if (senderIdObj && typeof senderIdObj === 'object') {
      senderAvatar = senderIdObj.avatar || senderIdObj.profileImage || senderIdObj.image;
    }
  }

  // If sender is current user and no avatar found in payload, use current user's image
  if (!senderAvatar && currentUser && normalizedSenderId && normalizedSenderId === normalizedUserId) {
    senderAvatar = currentUser?.image || currentUser?.avatar || currentUser?.profileImage;
  }

  // Don't create message if we don't have a valid senderId
  if (!normalizedSenderId) {
    console.warn("processSocketPayload: Cannot create message without senderId. Payload:", payload);
    return null;
  }

  const serverMessage = {
    _id:
      messageData?._id ||
      messageData?.messageId ||
      messageData?.id ||
      `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message:
      messageData?.message || messageData?.text || payload?.message || "",
    createdAt:
      messageData?.createdAt ||
      messageData?.timestamp ||
      payload?.createdAt ||
      new Date().toISOString(),
    senderId: normalizedSenderId,
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
    // Include emoji array if present
    ...(messageData?.emoji || payload?.emoji
      ? { emoji: messageData?.emoji || payload?.emoji }
      : {}),
    // Include reactions if present
    ...(messageData?.reactions || payload?.reactions
      ? { reactions: messageData?.reactions || payload?.reactions }
      : {}),
  };

  // Only return message if it has valid content and senderId
  if ((serverMessage.message || serverMessage.messageType === "image") && serverMessage.senderId) {
    return serverMessage;
  }

  console.warn("processSocketPayload: Message has no valid content or senderId");
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

