# 🌿 Kelp - Student Management System

A modern, full-stack mobile and web application for managing student attendance, assignments, exams, and timetables. Built with React Native (Expo), Node.js, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### For Students
- 📊 **Attendance Tracking** - View attendance by course with detailed statistics
- 📝 **Assignment Management** - Submit assignments and track deadlines
- 📅 **Timetable** - Access class schedules
- 📖 **Exam Schedule** - View upcoming exams and results
- 👤 **Profile Management** - Update personal information

### For Teachers
- ✅ **Attendance Management** - Mark and track student attendance
- 📋 **Assignment Creation** - Create and manage assignments
- 📊 **Student Dashboard** - View all students and their performance
- 📈 **Analytics** - Track class performance and attendance trends

### For Class Representatives (CR)
- 🌟 **Enhanced Permissions** - Combined student and teacher capabilities
- 📢 **Class Management** - Help manage class activities

## 🛠 Tech Stack

### Frontend (Mobile & Web)
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom theme
- **Fonts**: Cairo, Inter, Nunito (via @expo-google-fonts)
- **UI Components**: 
  - Expo Blur, Linear Gradient
  - React Native Gesture Handler & Reanimated
  - Custom components (SlideButton, etc.)

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer (Gmail SMTP)
- **Caching**: Redis
- **File Storage**: File.io integration

### DevOps
- **Mobile Build**: EAS Build
- **Backend Hosting**: Render.com
- **Database**: TiDB Cloud (MySQL-compatible)
- **Redis**: Redis Cloud

## 📁 Project Structure

```
Kelp-Backend/
├── app/                          # Mobile app (Expo Router)
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp.tsx
│   ├── dashboard/                # Student dashboard
│   │   ├── dashboard.tsx
│   │   ├── attendance.tsx
│   │   ├── assignments.tsx
│   │   ├── exams.tsx
│   │   └── timetable.tsx
│   ├── teacher/                  # Teacher dashboard
│   │   ├── dashboard.tsx
│   │   ├── assignments.tsx
│   │   └── students-attendance.tsx
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry point
│   ├── profile.tsx               # User profile
│   └── splash.tsx                # Splash screen
├── server/                       # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── redis.js          # Redis configuration
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── cr.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── attendance.route.js
│   │   │   ├── assignment.route.js
│   │   │   └── exams.route.js
│   │   ├── services/
│   │   │   ├── email.service.js
│   │   │   └── fileio.service.js
│   │   └── index.js              # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/
│   ├── .env                      # Environment variables (not in git)
│   └── package.json
├── assets/                       # Static assets
│   ├── images/
│   └── video/
├── components/                   # Reusable components
├── constants/                    # Theme and constants
├── services/                     # Frontend services
├── types/                        # TypeScript types
├── utils/                        # Utility functions
├── app.config.js                 # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- PostgreSQL database
- Redis instance (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aryan-Dot-Dev/Kelp-Backend.git
   cd Kelp-Backend
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   pnpm install
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**

   Create `server/.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database (TiDB Cloud)
   DB_URI=mysql://user:password@host:port/database?sslaccept=strict

   # JWT Secret
   JWT_SECRET=your-secret-key

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Redis Configuration
   REDIS_URL=your-redis-host.com
   REDIS_PORT=12572
   ```

4. **Set up database**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate deploy
   cd ..
   ```

5. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm start
   ```

   Terminal 2 (Frontend):
   ```bash
   npx expo start
   ```

## ⚙️ Configuration

### Expo Configuration (`app.config.js`)

```javascript
export default {
  expo: {
    name: "Kelp",
    slug: "kelp",
    version: "1.0.0",
    android: {
      package: "com.suspicious.kelp",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      usesCleartextTraffic: true
    },
    extra: {
      apiUrl: "https://kelp-backend-fywm.onrender.com"
    }
  }
};
```

### EAS Build Configuration (`eas.json`)

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://kelp-backend-fywm.onrender.com"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## 💻 Development

### Running Locally

**Start Backend:**
```bash
cd server
npm start
```
Server will run on http://localhost:5000

**Start Frontend:**
```bash
npx expo start
```

Options:
- Press `a` - Open on Android
- Press `i` - Open on iOS
- Press `w` - Open in web browser
- Scan QR code with Expo Go app

### Development Commands

```bash
# Run linter
npm run lint

# Reset project
npm run reset-project

# Run Android
npm run android

# Run iOS
npm run ios

# Run Web
npm run web
```

## 📦 Building for Production

### Build APK for Distribution

```bash
# Build APK (for direct distribution)
eas build --profile preview --platform android

# Build AAB (for Google Play Store)
eas build --profile production --platform android
```

### Convert AAB to APK (if needed)

```powershell
# Download bundletool
Invoke-WebRequest -Uri "https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar" -OutFile "bundletool.jar"

# Convert AAB to APK
java -jar bundletool.jar build-apks --bundle=app.aab --output=app.apks --mode=universal

# Extract universal APK
Expand-Archive -Path app.apks -DestinationPath output -Force
```

## 🌐 Deployment

### Backend (Render.com)

1. **Create new Web Service** on Render
2. **Connect GitHub repository**
3. **Configure service:**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Root Directory: Leave empty
4. **Add environment variables** from `server/.env`
5. **Deploy**

Backend URL: https://kelp-backend-fywm.onrender.com

### Database (TiDB Cloud)

- Managed PostgreSQL-compatible database
- Connection string in environment variables

### Redis (Redis Cloud)

- Managed Redis instance for OTP caching
- Configuration in environment variables

## 📚 API Documentation

### Base URL
```
Production: https://kelp-backend-fywm.onrender.com
Development: http://localhost:5000
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "otp": "123456"
}
```

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints

All protected endpoints require JWT token in Authorization header:
```http
Authorization: Bearer <token>
```

#### Attendance
- `GET /api/attendance` - Get user's attendance
- `POST /api/attendance` - Mark attendance (Teacher/CR only)

#### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (Teacher/CR only)
- `POST /api/assignments/:id/submit` - Submit assignment

#### Exams
- `GET /api/exams` - Get exams
- `POST /api/exams` - Create exam (Teacher/CR only)

## 🐛 Troubleshooting

### Common Issues

#### 1. "App not installed - package appears invalid"
**Solution:** Rebuild with proper signing
```bash
eas build --profile preview --platform android --clear-cache
```

#### 2. Network Error on Mobile
**Cause:** Android cleartext traffic policy or backend sleeping
**Solution:** 
- Ensure `usesCleartextTraffic: true` in `app.config.js`
- Wait 30-60 seconds for Render free tier to wake up
- Check backend logs on Render dashboard

#### 3. Redis Connection Error
**Cause:** Environment variables not loaded
**Solution:** Ensure `.env` file exists and has no quotes around values

#### 4. Email Service Error
**Cause:** Gmail app password incorrect
**Solution:** 
- Remove spaces from app password
- Ensure it's a Gmail App Password (not regular password)

#### 5. "expo-app-loading" Module Not Found
**Solution:** Already fixed - using `expo-splash-screen` instead

### Debug Commands

```bash
# Check Android device logs
adb logcat | grep -E "(Kelp|Network|fetch)"

# Test backend connectivity
curl https://kelp-backend-fywm.onrender.com/health

# Check Redis connection
redis-cli -h your-host -p your-port PING
```

## 👥 Team

- **Developer:** Aryan ([@Aryan-Dot-Dev](https://github.com/Aryan-Dot-Dev))

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For any issues or suggestions, please contact the development team.

---

**Built with ❤️ using React Native, Expo, and Node.js**