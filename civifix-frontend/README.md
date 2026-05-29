# CiviFix Mobile App - React Native + Expo

A modern citizen engagement platform built with React Native, Expo, and NativeWind (Tailwind CSS).

## 🎯 Features

### Authentication
- **User Registration** - Create account with name, mobile, email, password
- **Login** - Secure login with mobile number and password
- **OTP Verification** - Email/SMS verification for security
- **Token Management** - JWT token with auto-refresh capability
- **Secure Logout** - Clear all auth tokens and session data

### Dashboard
- **Quick Actions** - Raise complaints, track status, find nearby offices, notifications
- **Recent Complaints** - View your recent complaint submissions
- **User Greeting** - Personalized welcome message
- **Pull-to-refresh** - Update dashboard data

### Profile Management
- **User Profile** - View profile information
- **Account Settings** - Manage personal preferences
- **Complaint History** - Track all submissions
- **Notifications** - Receive real-time updates
- **Help & Support** - Get assistance
- **Logout** - Secure logout option

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo Go** - Easy deployment and testing
- **NativeWind** - Tailwind CSS for React Native
- **React Navigation** - App navigation (stack + bottom tabs)
- **Axios** - HTTP client with interceptors
- **AsyncStorage** - Secure local storage
- **JWT Decode** - Token management
- **React Native Vector Icons** - Material Design icons

## 📁 Project Structure

```
civifix-frontend/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── VerifyLoginScreen.js
│   │   │   └── VerifyRegisterScreen.js
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.js
│   │   └── Profile/
│   │       └── ProfileScreen.js
│   ├── components/
│   │   ├── Button.js
│   │   ├── TextField.js
│   │   ├── Card.js
│   │   ├── Header.js
│   │   ├── GradientBackground.js
│   │   └── index.js
│   ├── services/
│   │   ├── api.js (Axios instance with interceptors)
│   │   └── authService.js (Auth API calls)
│   ├── context/
│   │   └── AuthContext.js (Global auth state)
│   ├── navigation/
│   │   ├── AuthStack.js
│   │   ├── AppStack.js
│   │   └── RootNavigator.js
│   └── constants/
│       ├── theme.js (Colors, spacing, shadows)
│       └── endpoints.js (API endpoints)
├── App.js
├── app.json
├── package.json
└── tailwind.config.js
```

## 🎨 Design System

### Color Palette (Theme 1 - Civic Blue)
- **Primary** - #2563EB (Blue)
- **Secondary** - #06B6D4 (Teal)
- **Accent** - #FF9500 (Orange)
- **Background** - #F9FAFB (Light Gray)
- **Card** - #FFFFFF (White)
- **Text Dark** - #1F2937 (Dark Gray)
- **Text Light** - #6B7280 (Medium Gray)
- **Border** - #E5E7EB (Light Border)
- **Success** - #10B981 (Green)
- **Error** - #EF4444 (Red)
- **Warning** - #F59E0B (Amber)

### Component Styles
- Rounded corners (12-16px radius)
- Soft shadows for elevation
- Gradient backgrounds
- Responsive card layouts
- Bottom tab navigation
- Clean typography with Poppins font

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo CLI installed globally: `npm install -g expo-cli`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
EXPO_PUBLIC_API_URL=http://your-backend-api:8000/api/v1
```

3. Start the app:
```bash
npm start
```

4. Open in Expo Go:
   - iOS: Press 'i'
   - Android: Press 'a'
   - Web: Press 'w'

## 📱 Available Screens

### Authentication Screens
- **LoginScreen** - Mobile + Password login
- **RegisterScreen** - Full registration with validation
- **VerifyLoginScreen** - OTP verification after login
- **VerifyRegisterScreen** - OTP verification after registration

### Main App Screens
- **DashboardScreen** - Home page with quick actions and recent complaints
- **ProfileScreen** - User profile with account menu options

### Tab Navigation
- Home (Dashboard)
- Complaints (Placeholder)
- Status (Placeholder)
- Profile

## 🔐 Security Features

- JWT token-based authentication
- Token auto-refresh on expiry
- Secure password storage (bcrypt)
- AsyncStorage for secure token persistence
- API interceptors for error handling
- OTP verification for registration

## 🔄 API Integration

The app connects to the FastAPI backend at configured endpoint. All API calls include:
- Authorization headers with JWT token
- Automatic token refresh on 401 responses
- Centralized error handling
- Request/response logging

### Key API Endpoints

```
POST   /auth/register         - User registration
POST   /auth/login            - User login
POST   /auth/verify-login     - Verify login OTP
POST   /auth/verify-register  - Verify registration OTP
POST   /auth/logout           - Logout user
GET    /users/me              - Get user profile
PUT    /users/me              - Update profile
GET    /complaints            - Get user complaints
```

## 🎯 Authentication Flow

1. **Register** → User creates account
2. **Verify Register** → OTP verification
3. **Login** → Mobile + password credentials
4. **Verify Login** → OTP verification
5. **Dashboard** → Access main app features
6. **Profile** → Manage account settings
7. **Logout** → Secure session termination

## 📝 Validation

- **Mobile**: 10-digit Indian format
- **Email**: Standard email format
- **Password**: Minimum 8 characters
- **Name**: Non-empty string
- **OTP**: 6 digits

## 🧪 Testing

To test the app:

1. Use Expo Go app or emulator
2. Test auth flows with test credentials
3. Verify token persistence with app restart
4. Test logout functionality
5. Check responsive design on different screen sizes

## 📦 Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## 🤝 Contributing

1. Create feature branch
2. Make changes with proper code style
3. Test thoroughly
4. Submit pull request

## 📄 License

This project is part of the CiviFix platform.

## 📧 Support

For issues and questions, contact the development team.
