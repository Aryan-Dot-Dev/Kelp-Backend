# Kelp Deployment Guide

## Prerequisites
- GitHub account
- Expo account (for mobile builds)
- Database (TiDB Cloud already set up)

---

## Part 1: Deploy Backend (Node.js API)

### Option A: Railway (Recommended)

1. **Prepare Repository**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Push to GitHub
   git remote add origin https://github.com/yourusername/kelp.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will detect Node.js and deploy automatically

3. **Configure Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add these variables:
     ```
     DATABASE_URL=your-tidb-connection-string
     JWT_SECRET=your-super-secret-key
     NODE_ENV=production
     PORT=5000
     ```

4. **Set Root Directory** (Important!)
   - In Railway settings, set Root Directory to: `server`
   - Or update package.json with workspace info

5. **Get Your Backend URL**
   - Railway will provide a URL like: `https://kelp-production.up.railway.app`
   - Copy this URL - you'll need it for frontend

### Option B: Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: kelp-backend
   - **Root Directory**: server
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)

---

## Part 2: Update Frontend to Use Production Backend

1. **Create Environment Config**
   ```bash
   cd d:\Kelp
   ```

2. **Update API URLs**
   - Replace all `http://localhost:5000` with your backend URL
   - Files to update:
     - `app/auth/*.tsx`
     - `app/dashboard/*.tsx`
     - `app/teacher/*.tsx`
     - `services/auth.service.ts`

3. **Create Environment Variables**
   ```bash
   # Create .env file
   echo "EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app" > .env
   ```

---

## Part 3: Deploy Frontend

### For Web Deployment (Vercel - Easiest)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build for Web**
   ```bash
   npx expo export --platform web
   ```

3. **Deploy**
   ```bash
   vercel deploy
   ```

4. **Set Environment Variables in Vercel**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add: `EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app`

### For Mobile App (EAS Build)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Update eas.json** (already created)
   - Replace `your-backend-url.railway.app` with your actual backend URL

5. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```
   - First build takes ~15-20 minutes
   - You'll get an APK/AAB file

6. **Build for iOS** (Requires Apple Developer Account - $99/year)
   ```bash
   eas build --platform ios --profile production
   ```

7. **Submit to Stores**
   ```bash
   # Google Play Store
   eas submit --platform android
   
   # Apple App Store
   eas submit --platform ios
   ```

---

## Part 4: Database Migration

Your TiDB database is already hosted, but ensure:

1. **Run Migrations in Production**
   ```bash
   # From your local machine, pointing to production DB
   cd server
   npx prisma migrate deploy
   ```

2. **Or via Railway/Render**
   - Add to build command: `npx prisma migrate deploy`

---

## Quick Start Commands

```bash
# 1. Deploy Backend (Railway)
# - Push to GitHub
# - Connect repo to Railway
# - Add env vars

# 2. Build Web App
cd d:\Kelp
npx expo export --platform web
vercel deploy

# 3. Build Mobile App
eas build --platform android
eas build --platform ios

# 4. Submit to Stores
eas submit --platform android
eas submit --platform ios
```

---

## Cost Estimation

- **Railway/Render**: Free tier (upgrades from $5/month)
- **Vercel**: Free tier (plenty for small apps)
- **TiDB Cloud**: Already set up (check their pricing)
- **Expo EAS**: Free tier (30 builds/month)
- **Google Play Store**: $25 one-time fee
- **Apple App Store**: $99/year

**Total for hobby project**: ~$0-10/month

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Frontend updated with production API URL
- [ ] Web app deployed
- [ ] Mobile apps built (optional)
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled (automatic on Railway/Vercel)
- [ ] Test registration/login flow
- [ ] Test file upload (File.io integration)

---

## Troubleshooting

**Backend won't start:**
- Check logs in Railway/Render dashboard
- Ensure DATABASE_URL is correct
- Run `npx prisma generate` in build command

**Frontend can't connect:**
- Check CORS settings in backend
- Verify API URL in environment variables
- Check network requests in browser console

**Mobile build fails:**
- Check `app.config.js` bundle identifiers are unique
- Ensure all required permissions are in config
- Check EAS build logs for specific errors

---

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=mysql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

Need help with any specific step? Let me know!
