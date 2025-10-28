import MainContainer from '@components/container/MainContainer';
import Header from '@components/Header';
import { getHeight } from '@utils/responsive';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { GiftedChat, Message, MessageText } from 'react-native-gifted-chat';

const MOCK_USERS = [
  { _id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
  { _id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
  { _id: 3, name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
  { _id: 4, name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?u=sarah' },
];

const CURRENT_USER = MOCK_USERS[0];
const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showUserActions, setShowUserActions] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hey everyone! Welcome to our group chat! 👋',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        user: MOCK_USERS[0],
      },
      {
        _id: 2,
        text: 'Thanks @John Doe! Excited to be here.',
        createdAt: new Date(Date.now() - 1000 * 60 * 110),
        user: MOCK_USERS[1],
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    // Handle manual send from custom composer
    if (text.trim()) {
      const newMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: text,
        createdAt: new Date(),
        user: CURRENT_USER,
      };
      setMessages(prev => GiftedChat.append(prev, [newMessage]));
      setText('');
    } else if (newMessages.length > 0) {
      // Handle send from default composer
      setMessages(prev => GiftedChat.append(prev, newMessages));
    }
  }, [text]);

  // Mention
  const handleTextChange = useCallback((newText) => {
    setText(newText);
    const cursor = newText.length;
    setCursorPosition(cursor);

    const lastAt = newText.lastIndexOf('@', cursor - 1);
    if (lastAt >= 0) {
      const query = newText.slice(lastAt + 1, cursor);
      const suggestions = MOCK_USERS.filter(u =>
        u.name.toLowerCase().startsWith(query.toLowerCase())
      );
      setMentionSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setMentionSuggestions([]);
    }
  }, []);

  const insertMention = user => {
    const before = text.slice(0, cursorPosition);
    const after = text.slice(cursorPosition);
    const lastAt = before.lastIndexOf('@');
    const newText = before.slice(0, lastAt) + '@' + user.name + ' ' + after;
    setText(newText);
    setShowSuggestions(false);
    setMentionSuggestions([]);
  };

  // Emoji
  const handleEmojiReaction = useCallback(
    (emoji, message = selectedMessage) => {
      if (!message) return;
      setMessages(prev =>
        prev.map(msg => {
          if (msg._id === message._id) {
            const reactions = { ...(msg.reactions || {}) };
            const emojiUsers = reactions[emoji] || [];
            const userAlreadyReacted = emojiUsers.some(u => u._id === CURRENT_USER._id);
            if (userAlreadyReacted) {
              reactions[emoji] = emojiUsers.filter(u => u._id !== CURRENT_USER._id);
            } else {
              reactions[emoji] = [CURRENT_USER];
            }
            Object.keys(reactions).forEach(key => {
              if (reactions[key].length === 0) delete reactions[key];
            });
            return { ...msg, reactions };
          }
          return msg;
        })
      );
      setShowEmojiPicker(false);
      setSelectedMessage(null);
    },
    [selectedMessage]
  );

  const renderReactions = (currentMessage, position) => {
    if (!currentMessage.reactions) return null;
    const containerStyle = position === 'right' ? styles.reactionsRight : styles.reactionsLeft;

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

  const renderEmojiPickerAbove = currentMessage => {
    if (!currentMessage || currentMessage._id !== selectedMessage?._id || !showEmojiPicker)
      return null;
    return (
      <View style={styles.emojiPickerAbove}>
        <View style={styles.emojiGrid}>
          {EMOJI_REACTIONS.map(emoji => (
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
  const onUserAvatarPress = useCallback(user => {
    setSelectedMessage({ user });
    setShowUserActions(true);
  }, []);

  const handleUserAction = useCallback((action, user) => {
    if (action === 'report') {
      alert(`Reported ${user.name}`);
    } else if (action === 'block') {
      alert(`Blocked ${user.name}`);
    }
    setShowUserActions(false);
  }, []);

  // Search
  const handleSearch = query => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMessages([]);
      setIsSearchMode(false);
    } else {
      const filtered = messages.filter(msg =>
        msg.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
      setIsSearchMode(true);
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <TouchableOpacity
        style={styles.searchCloseButton}
        onPress={() => {
          setSearchQuery('');
          setIsSearchMode(false);
          setFilteredMessages([]);
        }}
      >
        <Text style={styles.searchCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  // Render message
  const renderMessage = props => {
    const { currentMessage, position } = props;
    const isCurrentUser = currentMessage.user._id === CURRENT_USER._id;

    return (
      <View style={{ marginVertical: 2 }}>
        <Message
          {...props}
          onLongPress={() => setSelectedMessage(currentMessage) || setShowEmojiPicker(true)}
          onPressAvatar={() => onUserAvatarPress(currentMessage.user)}
          renderMessageText={msgProps => (
            <MessageText
              {...msgProps}
              parsePatterns={linkStyle => [
                {
                  pattern: /@[\w\s]+/g,
                  style: {
                    color: isCurrentUser ? '#fff' : '#0b93f6',
                    fontWeight: 'bold',
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

  const renderSend = props => {
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

  const renderInputToolbar = props => (
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
   <MainContainer loader={false}>
    <Header title="Group Chat" />
   
      <GiftedChat
        messages={isSearchMode ? filteredMessages : messages}
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
            keyExtractor={item => item._id.toString()}
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

      <Modal visible={showUserActions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.userActionsModal}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{selectedMessage?.user?.name || 'Unknown User'}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUserActions(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => selectedMessage?.user && handleUserAction('report', selectedMessage.user)}
            >
              <Text style={styles.actionButtonText}>🚨 Report User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.blockButton]}
              onPress={() => selectedMessage?.user && handleUserAction('block', selectedMessage.user)}
            >
              <Text style={[styles.actionButtonText, styles.blockButtonText]}>🚫 Block User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  searchButton: { padding: 8 },
  searchButtonText: { fontSize: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc', backgroundColor: '#f9f9f9' },
  searchInput: { flex: 1, height: 36, borderWidth: 1, borderColor: '#ccc', borderRadius: 18, paddingHorizontal: 12, backgroundColor: '#fff' },
  searchCloseButton: { marginLeft: 8, padding: 8 },
  searchCloseText: { fontSize: 18 },
  inputToolbar: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0', borderBottomWidth: 0 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#E0E0E0', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#000', borderWidth: 0 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#87CEEB', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  reactionsLeft: { flexDirection: 'row', marginTop: 4, marginLeft: 60 },
  reactionsRight: { flexDirection: 'row', marginTop: 4, marginLeft: 'auto', marginRight: 60 },
  reactionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 4 },
  reactionEmoji: { fontSize: 12, marginRight: 2 },
  reactionCount: { fontSize: 10, color: '#666' },
  emojiPickerAbove: { marginBottom: 10, alignItems: 'center' },
  emojiGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  emojiButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  emojiText: { fontSize: 20 },
  mentionPopup: { position: 'absolute', bottom: 60, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', maxHeight: 150 },
  mentionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  userActionsModal: { width: 250, backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  userInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userName: { fontWeight: 'bold', fontSize: 16 },
  closeButton: { padding: 4 },
  closeButtonText: { fontSize: 16 },
  actionButton: { paddingVertical: 8 },
  actionButtonText: { fontSize: 16 },
  blockButton: { marginTop: 4 },
  blockButtonText: { color: 'red' },
});

export default Chat;
