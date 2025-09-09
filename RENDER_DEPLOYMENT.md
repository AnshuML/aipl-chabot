# 🚀 Render Deployment Guide

## Prerequisites
- Render account (free tier available)
- GitHub repository with your code
- OpenAI API key

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done)
2. **Ensure all files are committed** including:
   - `render.yaml`
   - `api/requirements-prod.txt`
   - `api/Dockerfile.prod`

## Step 2: Create Render Services

### Backend API Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `aipl-chatbot-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd api && pip install -r requirements-prod.txt`
   - **Start Command**: `cd api && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Starter (Free) or Paid

### Environment Variables for API
Add these environment variables in Render dashboard:
```
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-large
CHAT_MODEL=gpt-4o-mini
ALLOWED_DEPARTMENTS=IT,HR,Accounts,Factory,Marketing
```

### Frontend Services
1. **Chat Frontend**:
   - Type: Static Site
   - Build Command: `cd chat-frontend && npm install && npm run build`
   - Publish Directory: `chat-frontend/dist`
   - Environment Variable: `VITE_API_URL=https://your-api-url.onrender.com`

2. **Admin Frontend**:
   - Type: Static Site
   - Build Command: `cd admin-frontend && npm install && npm run build`
   - Publish Directory: `admin-frontend/dist`
   - Environment Variable: `VITE_ADMIN_API_URL=https://your-api-url.onrender.com`

## Step 3: Persistent Storage

For vector database persistence, you have two options:

### Option 1: Render Disk (Recommended for Paid Plans)
- Add a disk to your API service
- Mount path: `/opt/render/project/api`
- Size: 1GB (minimum)

### Option 2: External Storage (Free Tier)
- Use cloud storage (AWS S3, Google Cloud Storage)
- Modify code to store vector database in cloud

## Step 4: Domain Configuration

1. **Custom Domain** (Optional):
   - Go to your service settings
   - Add custom domain
   - Update CORS settings in API

2. **CORS Configuration**:
   - Update `app/main.py` to include your frontend URLs
   - Add your domain to allowed origins

## Step 5: Testing

1. **API Health Check**:
   - Visit: `https://your-api-url.onrender.com/health`
   - Should return: `{"status": "healthy"}`

2. **Frontend Testing**:
   - Visit your frontend URL
   - Test login and chat functionality
   - Upload documents through admin panel

## Step 6: Monitoring

1. **Logs**: Check Render dashboard for logs
2. **Metrics**: Monitor CPU, memory usage
3. **Uptime**: Set up uptime monitoring

## Cost Estimation

### Free Tier
- API: 750 hours/month (free)
- Static sites: Unlimited
- **Total**: $0/month

### Paid Plans
- API: $7/month (Starter plan)
- Static sites: Free
- **Total**: $7/month

## Troubleshooting

### Common Issues
1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Issues**: Update CORS settings in API
4. **Memory Issues**: Upgrade to paid plan for more resources

### Support
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com

## Security Notes

1. **API Keys**: Never commit API keys to repository
2. **Environment Variables**: Use Render's environment variable system
3. **CORS**: Configure CORS properly for production
4. **HTTPS**: Render provides HTTPS by default

## Performance Optimization

1. **Caching**: Implement Redis caching for better performance
2. **CDN**: Use Render's CDN for static assets
3. **Database**: Consider external database for large datasets
4. **Monitoring**: Set up proper monitoring and alerting
