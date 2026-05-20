# Deployment Guide: Vercel (Frontend) + Railway (Backend)

## Overview
- **Frontend**: Static React app deployed on Vercel
- **Backend**: Express.js server deployed on Railway
- **Communication**: Frontend calls backend via `VITE_BACKEND_URL` environment variable

---

## Part 1: Deploy Backend on Railway

### Prerequisites
- Railway account (free, sign up at https://railway.app)
- Git repository (GitHub, GitLab, or Bitbucket)
- Your chatbot code pushed to Git

### Steps

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Log in to Railway**
   - Go to https://railway.app
   - Sign up with GitHub (recommended for easy Git integration)

3. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your chatbot repository
   - Railway auto-detects Node.js

4. **Configure environment variables**
   - In Railway dashboard, click on the **backend service** → "Variables"
   - Add the following:
     ```
     GROQ_API_KEY = your_groq_api_key
     GEMINI_API_KEY = your_gemini_api_key
     OPENROUTER_API_KEY = your_openrouter_api_key
     PORT = 5000
     ```
   - Save and deploy

5. **Get your backend URL**
   - In Railway dashboard, click the backend service
   - Under "Deployments", find your public URL (e.g., `https://chatbot-backend-prod.up.railway.app`)
   - Copy this URL — you'll need it for Vercel

6. **Optional: Update CORS on backend**
   - In `backend/server.js`, update the CORS line to restrict to your Vercel domain:
     ```javascript
     app.use(cors({ 
       origin: 'https://your-app.vercel.app',
       credentials: true 
     }));
     ```
   - Or keep it open (less secure):
     ```javascript
     app.use(cors());
     ```

---

## Part 2: Update Frontend for Backend URL

### The frontend now uses `frontend/src/api.js` which automatically:
- Uses `VITE_BACKEND_URL` environment variable in production
- Falls back to `http://localhost:5000` for local development

### No code changes needed if you're using the API utility already. If components directly call `/api/...`, update them:

**Before (old approach):**
```javascript
fetch('/api/chat', { method: 'POST', body: JSON.stringify({...}) })
```

**After (new approach):**
```javascript
import { chatAPI } from './api.js';
const response = await chatAPI(message, history);
```

---

## Part 3: Deploy Frontend on Vercel

### Prerequisites
- Vercel account (free, sign up at https://vercel.com)
- GitHub repo with frontend code

### Steps

1. **Log in to Vercel**
   - Go to https://vercel.com
   - Sign up/log in with GitHub

2. **Import your project**
   - Click "Add New..." → "Project"
   - Select your chatbot GitHub repository
   - Vercel auto-detects it's a Vite + React project

3. **Configure build settings**
   - **Framework**: Vite
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install --prefix frontend` (or just `npm install` if only one project)

4. **Set environment variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_FIREBASE_API_KEY = your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN = your_firebase_auth_domain
     VITE_FIREBASE_PROJECT_ID = your_firebase_project_id
     VITE_FIREBASE_STORAGE_BUCKET = your_firebase_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID = your_firebase_messaging_sender_id
     VITE_FIREBASE_APP_ID = your_firebase_app_id
     VITE_BACKEND_URL = https://chatbot-backend-prod.up.railway.app
     ```
     (Replace with your actual Railway backend URL from Part 1)

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys your frontend
   - You'll get a public URL (e.g., `https://my-chatbot.vercel.app`)

6. **Update CORS on Railway (if restricted)**
   - If you restricted CORS to a specific domain in Part 1, update it now:
     - In `backend/server.js`:
       ```javascript
       app.use(cors({ 
         origin: 'https://my-chatbot.vercel.app',
         credentials: true 
       }));
       ```
     - Push to GitHub → Railway auto-redeploys

---

## Part 4: Test Your Deployment

1. **Visit your Vercel URL** in a browser
2. **Log in with Firebase** (should work if env vars are set)
3. **Test chat API**: send a message → should reach Railway backend
4. **Test file upload**: upload a PDF → should work
5. **Check browser console** for any errors

---

## Troubleshooting

### Frontend can't reach backend
- Check `VITE_BACKEND_URL` is set correctly in Vercel (no trailing slash)
- Verify Railway backend is running (check Railway dashboard)
- Check browser console for CORS errors

### "Failed to generate response"
- Backend environment variables missing (GROQ_API_KEY, etc.)
- API keys are invalid or rate-limited
- Check Railway logs: click backend service → "Logs"

### Firebase login not working
- Firebase env vars (`VITE_FIREBASE_*`) not set or wrong
- Verify values in Vercel project settings

### High cold-start latency
- Railway has instant deploys; no cold-starts (good)
- First backend request should respond in <1s

---

## Cost Breakdown

- **Vercel**: Free tier (included bandwidth, auto-scaling)
- **Railway**: $5/month free credit (covers most small apps)
- **Firebase Auth**: Free tier (5k sign-ups/month)
- **API services** (Groq, Gemini, OpenRouter): Pay-as-you-go based on usage

---

## Next: Local Development

To test locally before deploying:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend** (in another terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access**: http://localhost:5173

The frontend proxy in `vite.config.js` will forward `/api` requests to `localhost:5000`, so no env var needed for local dev.

---

## Deployment Checklist

- [ ] Backend pushed to GitHub
- [ ] Frontend pushed to GitHub
- [ ] API keys set in Railway dashboard
- [ ] Firebase env vars set in Vercel dashboard
- [ ] `VITE_BACKEND_URL` set in Vercel to Railway URL
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway
- [ ] Test login, chat, and file upload
- [ ] Monitor logs for errors

---

Good luck! 🚀
