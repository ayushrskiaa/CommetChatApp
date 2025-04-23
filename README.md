## Challenges faced and suggestions
Challenges:

1. Environment config gave me some trouble and affected authentication.
2. Message sender identification was a bit tricky — I had to throw in a few null checks.
3. Real-time listeners would occasionally drop when switching between users.
4. I also cleaned up some debug info that was showing up in the UI.

A few suggestions that might help future devs:

1. More examples for event listeners (especially around edge cases).
2. Clearer error messages for common issues.
3. Integration samples with state management tools like Redux or Context API would be awesome.
   
# CometChat React Application

A real-time chat application built with React and CometChat SDK, allowing users to communicate instantly with a clean and intuitive interface.
![image](https://github.com/user-attachments/assets/36458e62-015a-4f21-97dd-bbd99aad10c6)
![image](https://github.com/user-attachments/assets/d78e9514-7b53-4435-a29c-e10f6a105097)
![image](https://github.com/user-attachments/assets/362d497e-3dc5-4442-9eac-6f7e5004c297)

![CometChat App](https://www.cometchat.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcometchat-pro-ui-kit.7cf52791.png&w=1920&q=75)

## Features

- **User Authentication**: Simple login with CometChat UID
- **Real-time Messaging**: Instant message delivery using CometChat's infrastructure
- **Typing Indicators**: See when other users are typing
- **User Presence**: Online/offline status for all contacts
- **Conversation Management**: Delete conversations when needed
- **Message History**: Access previous messages in conversations
- **Responsive Design**: Works on both desktop and mobile



## Tech Stack

- React 18+
- Vite
- CometChat SDK
- CSS3

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- CometChat account (App ID, API Key, and Region)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cometchat-react-app.git
   cd cometchat-react-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your CometChat credentials:
   ```
   VITE_COMETCHAT_APP_ID="your-app-id"
   VITE_COMETCHAT_REGION="your-region"
   VITE_COMETCHAT_API_KEY="your-api-key"
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
CommetApp/
├── src/
│   ├── components/          # UI components
│   │   ├── ChatWindow.jsx   # Message display and input
│   │   ├── Dashboard.jsx    # Main layout
│   │   ├── Login.jsx        # Authentication
│   │   └── UserList.jsx     # Contacts list
│   ├── contexts/            # React Context
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── useAuth.jsx      # Custom auth hook
│   ├── services/
│   │   └── cometchat.js     # CometChat SDK integration
│   ├── App.jsx              # Main component
│   └── main.jsx             # Entry point
└── public/                  # Static assets
```

## Usage

1. **Login**: Enter your UID to authenticate with CometChat
2. **Select a User**: Click on a user from the contacts list
3. **Send Messages**: Type in the message box and hit send
4. **Delete Conversations**: Use the delete button in the chat header

## CometChat Integration

This application uses the CometChat SDK to handle:
- User authentication
- Message sending and receiving
- Typing indicators
- Presence updates
- Conversation history

## Customization

You can customize the UI by modifying the CSS in:
- `src/App.css` for global styles
- Component-specific styles within each component file

## Troubleshooting

**Login Issues**:
- Ensure your CometChat App ID, API Key, and Region are correct in the `.env` file
- Check browser console for specific error messages

**Message Delivery Problems**:
- Verify your internet connection
- Ensure the CometChat service is running properly
- Check if the user UID exists in your CometChat application

## License

[MIT](LICENSE)

## Acknowledgments

- [CometChat](https://www.cometchat.com/) for their powerful chat SDK
- [React](https://reactjs.org/) for the UI library
- [Vite](https://vitejs.dev/) for the build tool
