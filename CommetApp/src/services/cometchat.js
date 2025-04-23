import { CometChat } from '@cometchat/chat-sdk-javascript';
// Removed unused import for fetchMessages

// Try to load environment variables with fallback to hardcoded values if needed
const appID = import.meta.env.VITE_COMETCHAT_APP_ID || "2736339a5806ff71";
const region = import.meta.env.VITE_COMETCHAT_REGION || "IN";
const apiKey = import.meta.env.VITE_COMETCHAT_API_KEY || "a65f9f0facbe171eab000806b8a9460923feb48c";

// Helper to validate credentials
const validateCredentials = () => {
  const missingCredentials = [];
  if (!appID) missingCredentials.push('VITE_COMETCHAT_APP_ID');
  if (!region) missingCredentials.push('VITE_COMETCHAT_REGION');
  if (!apiKey) missingCredentials.push('VITE_COMETCHAT_API_KEY');
  
  return {
    isValid: missingCredentials.length === 0,
    missingCredentials
  };
};

export const initCometChat = async () => {
  try {
    // Enhanced credentials validation
    const { isValid, missingCredentials } = validateCredentials();
    if (!isValid) {
      const errorMessage = `Missing CometChat credentials: ${missingCredentials.join(', ')}. Please check your .env file`;
      console.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
    
    console.log('Initializing CometChat with appID:', appID, 'region:', region);
    
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    
    await CometChat.init(appID, appSetting);
    console.log('CometChat initialization completed successfully');
    return { success: true };
  } catch (error) {
    // More detailed error logging
    console.error('CometChat initialization failed with error:', error);
    
    let errorMessage = 'Failed to initialize CometChat.';
    
    if (error.message) {
      console.error('Error message:', error.message);
      errorMessage += ` ${error.message}`;
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
      errorMessage += ` (Error code: ${error.code})`;
    }
    
    // Check for common errors
    if (error.message && error.message.includes('App ID not found')) {
      errorMessage = 'Invalid App ID. Please check your VITE_COMETCHAT_APP_ID in .env file.';
    } else if (error.message && error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid API Key. Please check your VITE_COMETCHAT_API_KEY in .env file.';
    } else if (error.message && error.message.includes('Invalid region')) {
      errorMessage = 'Invalid region. Please check your VITE_COMETCHAT_REGION in .env file.';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const loginWithUID = async (uid) => {
  try {
    const user = await CometChat.login(uid, apiKey);
    console.log('Login successful:', user);
    return user;
  } catch (error) {
    console.log('Login failed with error:', error);
    throw error;
  }
};

export const createUser = async (uid, name) => {
  try {
    const user = new CometChat.User(uid);
    user.setName(name);
    
    const createdUser = await CometChat.createUser(user, apiKey);
    console.log('User created successfully:', createdUser);
    return createdUser;
  } catch (error) {
    console.log('User creation failed with error:', error);
    throw error;
  }
};

export const getLoggedInUser = async () => {
  try {
    const user = await CometChat.getLoggedInUser();
    return user;
  } catch (error) {
    console.log('Error getting logged in user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await CometChat.logout();
    console.log('Logout successful');
    return true;
  } catch (error) {
    console.log('Logout failed with error:', error);
    return false;
  }
};

export const getUsers = async () => {
  try {
    // Debug user fetching start
    console.log('Starting to fetch users...');
    const loggedInUser = await CometChat.getLoggedInUser();
    console.log('Current logged in user:', loggedInUser);
    
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(30)
      .build();
    
    console.log('Users request built, fetching...');
    const users = await usersRequest.fetchNext();
    console.log('Users fetched successfully, count:', users?.length);
    
    // If no users found, create a test user for debugging
    if (!users || users.length === 0) {
      console.log('No users found, consider adding test users via CometChat dashboard');
    }
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const sendChatMessage = async (receiverID, messageText, receiverType = CometChat.RECEIVER_TYPE.USER) => {
  try {
    const textMessage = new CometChat.TextMessage(
      receiverID,
      messageText,
      receiverType
    );
    
    const sentMessage = await CometChat.sendMessage(textMessage);
    console.log("Message sent successfully:", sentMessage);
    return sentMessage;
  } catch (error) {
    console.log("Message sending failed with error:", error);
    throw error;
  }
};

export const getMessages = async (userID, limit = 50) => {
  try {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(userID)
      .setLimit(limit)
      .build();
    
    const messages = await messagesRequest.fetchPrevious();
    return messages;
  } catch (error) {
    console.log("Message fetching failed with error:", error);
    throw error;
  }
};

export const listenForMessages = (listenerID, callback) => {
  try {
    console.log(`Setting up message listener with ID: ${listenerID}`);
    
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: textMessage => {
          console.log(`Message received from: ${textMessage.sender.uid}`, textMessage);
          callback(textMessage);
        },
        onMediaMessageReceived: mediaMessage => {
          console.log(`Media message received from: ${mediaMessage.sender.uid}`, mediaMessage);
          callback(mediaMessage);
        },
        onCustomMessageReceived: customMessage => {
          console.log(`Custom message received from: ${customMessage.sender.uid}`, customMessage);
          callback(customMessage);
        }
      })
    );
    
    return () => {
      console.log(`Removing message listener: ${listenerID}`);
      CometChat.removeMessageListener(listenerID);
    };
  } catch (error) {
    console.error("Error setting up message listener:", error);
    // Return a no-op cleanup function in case of error
    return () => {};
  }
};

/**
 * Deletes all messages in a conversation with a user
 * @param {string} uid - The UID of the user
 * @param {string} type - The type of receiver (user or group)
 * @returns {Promise} - Promise representing the success/failure of the operation
 */
export const deleteConversation = (uid, type = CometChat.RECEIVER_TYPE.USER) => {
  return new Promise((resolve, reject) => {
    CometChat.deleteConversation(uid, type)
      .then(response => {
        console.log("Conversation deleted successfully:", response);
        resolve(response);
      })
      .catch(error => {
        console.error("Error deleting conversation:", error);
        reject(error);
      });
  });
};

// Add these two new functions to handle typing indicators

/**
 * Send typing indicator to recipient
 * @param {string} receiverID - The UID of the receiver
 * @param {string} receiverType - The type of receiver (user or group)
 */
export const sendTypingIndicator = (receiverID, receiverType = CometChat.RECEIVER_TYPE.USER) => {
  try {
    CometChat.startTyping(new CometChat.TypingIndicator(receiverID, receiverType));
  } catch (error) {
    console.error("Error sending typing indicator:", error);
  }
};

/**
 * End typing indicator
 * @param {string} receiverID - The UID of the receiver
 * @param {string} receiverType - The type of receiver (user or group)
 */
export const endTypingIndicator = (receiverID, receiverType = CometChat.RECEIVER_TYPE.USER) => {
  try {
    CometChat.endTyping(new CometChat.TypingIndicator(receiverID, receiverType));
  } catch (error) {
    console.error("Error ending typing indicator:", error);
  }
};

/**
 * Listen for typing indicators
 * @param {string} listenerID - Unique ID for the listener
 * @param {function} onTypingStarted - Callback when someone starts typing
 * @param {function} onTypingEnded - Callback when someone stops typing
 * @returns {function} Cleanup function to remove the listener
 */
export const listenForTypingIndicators = (listenerID, onTypingStarted, onTypingEnded) => {
  try {
    console.log(`Setting up typing indicator listener with ID: ${listenerID}`);
    
    CometChat.addTypingListener(
      listenerID,
      new CometChat.TypingListener({
        onTypingStarted: typingIndicator => {
          console.log(`Typing started by: ${typingIndicator.sender.uid}`);
          onTypingStarted(typingIndicator);
        },
        onTypingEnded: typingIndicator => {
          console.log(`Typing ended by: ${typingIndicator.sender.uid}`);
          onTypingEnded(typingIndicator);
        }
      })
    );
    
    return () => {
      console.log(`Removing typing indicator listener: ${listenerID}`);
      CometChat.removeTypingListener(listenerID);
    };
  } catch (error) {
    console.error("Error setting up typing indicator listener:", error);
    // Return a no-op cleanup function in case of error
    return () => {};
  }
};