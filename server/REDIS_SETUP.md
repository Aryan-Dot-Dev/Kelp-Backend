# Redis-Based OTP Authentication Setup

## 📦 Installation

Install the required dependencies:

```bash
cd server
pnpm add redis
```

## 🔧 Redis Setup

### Option 1: Install Redis Locally (Windows)

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Redis will run on `localhost:6379` by default

### Option 2: Use Docker

```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### Option 3: Use Redis Cloud (Free)

1. Go to https://redis.com/try-free/
2. Create a free account
3. Get your Redis connection URL
4. Add it to `.env` as `REDIS_URL`

## 🔐 Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

## 📝 API Endpoints

### 1. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email"
}
```

### 2. Register with OTP
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "STUDENT",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user",
    "name": "User Name",
    "email": "user@example.com",
    "role": "STUDENT"
  }
}
```

### 3. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully to your email"
}
```

### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user",
    "name": "User Name",
    "email": "user@example.com",
    "role": "STUDENT"
  }
}
```

## 🔄 OTP Flow

1. **User enters email/password** → Frontend calls `/send-otp`
2. **OTP stored in Redis** (expires in 10 minutes)
3. **User receives OTP email**
4. **User enters OTP** → Frontend calls `/register` with email, password, role, and OTP
5. **Backend verifies OTP** → Creates user and returns JWT token
6. **User logged in** → Can access protected routes

## ⏱️ OTP Features

- **10-minute expiry**: OTP automatically expires after 10 minutes
- **One-time use**: OTP is deleted after successful verification
- **Rate limiting**: Can't resend OTP if one already exists (must wait for expiry)
- **User validation**: Checks if email already exists before sending OTP

## 🚀 Start Server

```bash
cd server
pnpm run dev
```

## 🧪 Testing

You can test the endpoints using:
- Postman
- Thunder Client (VS Code extension)
- cURL commands

Example cURL:
```bash
# Send OTP
curl -X POST https://kelp-backend-fywm.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Register
curl -X POST https://kelp-backend-fywm.onrender.comywm.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"STUDENT","otp":"123456"}'
```
