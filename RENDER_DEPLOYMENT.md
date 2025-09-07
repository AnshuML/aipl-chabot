# 🚀 Render Cloud Deployment Guide

## **Step 1: GitHub Repository Setup**

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## **Step 2: Render Account Setup**

1. **Create Render Account**: https://render.com
2. **Connect GitHub**: Link your GitHub account
3. **Import Repository**: Select your chatbot repository

## **Step 3: Deploy Backend API**

1. **Create New Web Service**:
   - **Name**: `aipl-chatbot-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r api/requirements.txt`
   - **Start Command**: `cd api && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `EMBEDDING_MODEL`: `text-embedding-3-large`
   - `CHAT_MODEL`: `gpt-4o-mini`
   - `ALLOWED_DEPARTMENTS`: `IT,HR,Accounts,Factory,Marketing`

3. **Deploy**: Click "Create Web Service"

## **Step 4: Deploy Chat Frontend**

1. **Create New Static Site**:
   - **Name**: `aipl-chatbot-frontend`
   - **Build Command**: `cd chat-frontend && npm install && npm run build`
   - **Publish Directory**: `chat-frontend/dist`

2. **Environment Variables**:
   - `VITE_API_URL`: `https://your-api-url.onrender.com`

3. **Deploy**: Click "Create Static Site"

## **Step 5: Deploy Admin Frontend**

1. **Create New Static Site**:
   - **Name**: `aipl-chatbot-admin`
   - **Build Command**: `cd admin-frontend && npm install && npm run build`
   - **Publish Directory**: `admin-frontend/dist`

2. **Environment Variables**:
   - `VITE_ADMIN_API_URL`: `https://your-api-url.onrender.com`

3. **Deploy**: Click "Create Static Site"

## **Step 6: Test Deployment**

1. **Chat Frontend**: `https://aipl-chatbot-frontend.onrender.com`
2. **Admin Panel**: `https://aipl-chatbot-admin.onrender.com`
3. **API**: `https://aipl-chatbot-api.onrender.com`

## **Features Available After Deployment**

✅ **Chat Interface**: Users can chat with the bot
✅ **Document Upload**: Upload PDFs and documents
✅ **Admin Panel**: Manage documents and users
✅ **Analytics**: View usage statistics
✅ **Dark Theme**: Complete dark mode support
✅ **Multi-Department**: IT, HR, Accounts, Factory, Marketing
✅ **Login System**: Company email validation

## **Cost**

- **Free Tier**: 750 hours/month
- **Backend**: Free (with limitations)
- **Frontend**: Free (static sites)
- **Total Cost**: $0 for testing

## **Limitations of Free Tier**

- **Sleep Mode**: App sleeps after 15 minutes of inactivity
- **Cold Start**: 30-60 seconds to wake up
- **Memory**: 512MB RAM limit
- **Storage**: 1GB disk space

## **Production Recommendations**

For production use, consider upgrading to:
- **Starter Plan**: $7/month (always on, 512MB RAM)
- **Standard Plan**: $25/month (always on, 1GB RAM)

## **User Testing URLs**

Once deployed, share these URLs with your users:
- **Chat**: `https://aipl-chatbot-frontend.onrender.com`
- **Admin**: `https://aipl-chatbot-admin.onrender.com`

## **Monitoring**

- **Logs**: Available in Render dashboard
- **Metrics**: CPU, Memory, Response time
- **Uptime**: 99.9% SLA on paid plans
