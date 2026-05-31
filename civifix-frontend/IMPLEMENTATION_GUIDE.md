# CiviFix Frontend - Implementation Guide

## 📋 Overview

This guide covers the complete implementation of the CiviFix mobile frontend using React Native, Expo, and NativeWind (Tailwind CSS). The application provides a clean, modern interface for citizens to report issues, track status, and manage their profile.

## ✅ Completed Components

### 1. Project Setup ✓
- ✅ Package.json with all dependencies
- ✅ Tailwind CSS configuration
- ✅ Babel configuration
- ✅ Expo app.json configuration
- ✅ Proper directory structure

### 2. Design System ✓
- ✅ Theme constants (colors, spacing, shadows)
- ✅ API endpoints configuration
- ✅ Gradient color palette (Theme 1 - Civic Blue)
- ✅ Responsive typography

### 3. Base Components ✓
- **Button** - Primary, secondary, accent, outline, ghost variants
- **TextField** - With icons, error handling, password toggle
- **Card** - Default, elevated, primary, secondary variants
- **Header** - Back button, title, subtitle, right actions
- **GradientBackground** - Linear gradient support

### 4. Authentication Services ✓
- **API Layer** - Axios with interceptors and auto-refresh
- **AuthService** - All auth operations (login, register, verify, logout)
- **AuthContext** - Global auth state management with reducer
- **Token Management** - JWT storage and auto-refresh

### 5. Authentication Screens ✓

#### LoginScreen
- Mobile number input
- Password input with toggle
- Form validation
- Error display
- Navigation to register and verify screens
- Forgot password link

#### RegisterScreen
- Full name input
- Mobile number input
- Email input
- Password input with strength validation
- Confirm password field
- Terms & Conditions checkbox
- Form validation
- Error handling

#### VerifyLoginScreen
- OTP input field
- Timer with countdown
- Resend functionality
- Error handling
- Auto-navigation on success

#### VerifyRegisterScreen
- OTP input field
- Timer with countdown
- Resend functionality
- Error handling
- Auto-navigation on success

### 6. Main App Screens ✓

#### DashboardScreen
- User greeting
- Notification bell icon
- Quick Actions (4 cards):
  - Raise Complaint
  - Track Status
  - Nearby Offices
  - Notifications
- Recent Complaints list
- Pull-to-refresh functionality
- Loading state

#### ProfileScreen
- User profile card with avatar
- 6 Menu items:
  - Personal Information
  - My Complaints
  - Notifications
  - Settings
  - Help & Support
  - About CiviFix
- Logout button with confirmation
- App version info
- Proper icon styling

### 7. Navigation ✓
- **AuthStack** - Login, Register, Verify screens
- **AppStack** - Dashboard (Home, Complaints, Status) + Profile tabs
- **RootNavigator** - Conditional rendering based on auth state
- **Proper stack and tab navigation**

### 8. Configuration Files ✓
- ✅ .env.example with API configuration
- ✅ .gitignore with proper exclusions
- ✅ README.md with complete documentation

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
cd civifix-frontend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

### Step 3: Start Development Server
```bash
npm start
```

### Step 4: Run on Device
- **Expo Go**: Scan QR code with Expo Go app
- **iOS Simulator**: Press 'i'
- **Android Emulator**: Press 'a'

## 🔧 Key Features

### Authentication Flow
1. **Registration**: User creates account → OTP verification → Account created
2. **Login**: Mobile + password → OTP verification → Access dashboard
3. **Token Management**: Automatic refresh on expiry
4. **Secure Logout**: Clears all tokens and session data

### UI/UX Features
- **Gradient backgrounds** for visual appeal
- **Smooth animations** and transitions
- **Responsive design** for all screen sizes
- **Error handling** with user-friendly messages
- **Loading states** with activity indicators
- **Form validation** with real-time feedback
- **Pull-to-refresh** on dashboard

### Performance
- **Context API** for state management (lightweight)
- **AsyncStorage** for persistence
- **Interceptors** for API error handling
- **Proper navigation** without memory leaks

## 📱 Screen Navigation Map

```
AuthStack
├── Login
│   ├── → Register
│   ├── → VerifyLogin
│   └── → ForgotPassword
├── Register
│   └── → VerifyRegister
├── VerifyLogin
│   └── → Dashboard (AppStack)
└── VerifyRegister
    └── → Dashboard (AppStack)

AppStack (BottomTabNavigator)
├── Dashboard
│   ├── DashboardScreen
│   ├── RaiseComplaint
│   ├── TrackStatus
│   └── Notifications
├── Complaints
│   └── AllComplaints
├── Status
│   └── ComplaintStatus
└── Profile
    ├── ProfileScreen
    ├── EditProfile
    ├── Settings
    ├── HelpSupport
    └── About
```

## 🎨 Color Usage Guidelines

- **Primary (#2563EB)**: Main buttons, highlights, active states
- **Secondary (#06B6D4)**: Secondary actions, accents
- **Accent (#FF9500)**: Warnings, important notifications
- **Success (#10B981)**: Successful operations
- **Error (#EF4444)**: Errors, destructive actions
- **Light Background**: Page backgrounds
- **Card**: Component backgrounds

## 📝 Form Validation Rules

- **Mobile**: 10-digit Indian format (only digits)
- **Email**: Valid email format (xxx@xxx.xxx)
- **Password**: Minimum 8 characters
- **Name**: Non-empty string
- **OTP**: 6 digits
- **Terms**: Must be agreed

## 🔐 Security Best Practices Implemented

1. **JWT Authentication** - Secure token-based auth
2. **Token Refresh** - Auto-refresh on expiry
3. **Secure Storage** - AsyncStorage for tokens
4. **Password Visibility** - Toggle password visibility
5. **Logout Confirmation** - Prevent accidental logout
6. **Error Handling** - No sensitive info in errors
7. **API Interceptors** - Centralized security checks

## 🧪 Testing Checklist

- [ ] User registration with validation
- [ ] OTP verification (register)
- [ ] User login with credentials
- [ ] OTP verification (login)
- [ ] Token persistence on app restart
- [ ] Auto-refresh token on expiry
- [ ] Dashboard loads user data
- [ ] Quick actions navigation
- [ ] Recent complaints display
- [ ] Profile information display
- [ ] Logout functionality
- [ ] Navigation between screens
- [ ] Error handling and display
- [ ] Responsive design on different screen sizes
- [ ] Pull-to-refresh functionality

## 📚 Additional Screens to Implement

The following screens are scaffolded but need implementation:

1. **RaiseComplaint** - Form to submit new complaints
2. **TrackStatus** - View complaint status
3. **NearbyOffices** - Map view of nearby offices
4. **Notifications** - View all notifications
5. **MyComplaints** - All user complaints
6. **EditProfile** - Update user information
7. **Settings** - App preferences
8. **HelpSupport** - FAQs and contact
9. **About** - App information

## 🔄 API Integration Points

All API calls go through `authService`:

```javascript
// Example usage
import authService from './src/services/authService';

// Login
const response = await authService.login(mobile, password);

// Register
const response = await authService.register(userData);

// Get Profile
const user = await authService.getProfile();

// Get Complaints
const complaints = await authService.getComplaints();

// Logout
await authService.logout();
```

## 🐛 Debugging Tips

1. **API Issues**: Check `.env` file for correct API URL
2. **Token Issues**: Clear AsyncStorage: `await AsyncStorage.clear()`
3. **Navigation Issues**: Check navigation structure and params
4. **Styling Issues**: Verify NativeWind setup and Tailwind config
5. **Performance**: Use React DevTools Profiler

## 📦 Build & Deployment

### For Testing
```bash
npm start  # Start dev server
```

### For Android
```bash
eas build --platform android --profile preview
```

### For iOS
```bash
eas build --platform ios --profile preview
```

## 🤝 Contributing Guidelines

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add proper error handling
4. Test before committing
5. Update documentation if needed

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: `Module not found: nativewind`
- Solution: Run `npm install` again or clear node_modules

**Issue**: API calls returning 404
- Solution: Check API URL in .env file

**Issue**: Token not persisting
- Solution: Verify AsyncStorage is working (check app permissions)

**Issue**: Gradient not showing
- Solution: Ensure `expo-linear-gradient` is installed

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Configure .env with backend API URL
3. Run the app: `npm start`
4. Implement additional screens as needed
5. Test all user flows
6. Deploy to production

## 📄 Files Structure Reference

```
civifix-frontend/
├── App.js (Main app component)
├── babel.config.js (Babel configuration)
├── tailwind.config.js (Tailwind CSS config)
├── app.json (Expo configuration)
├── package.json (Dependencies)
├── .env.example (Environment template)
├── .gitignore (Git exclusions)
├── README.md (Main documentation)
└── src/
    ├── screens/
    │   ├── Auth/ (Login, Register, Verify)
    │   ├── Dashboard/ (Main app)
    │   └── Profile/ (User profile)
    ├── components/ (Base UI components)
    ├── services/ (API services)
    ├── context/ (Auth state)
    ├── navigation/ (Navigation stacks)
    └── constants/ (Theme & endpoints)
```

---

**Created**: May 2026
**Version**: 1.0.0
**Status**: Ready for development
