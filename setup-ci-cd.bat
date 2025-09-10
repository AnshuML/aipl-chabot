@echo off
echo ========================================
echo Setting up CI/CD Pipeline for Local Server
echo ========================================

echo.
echo Step 1: Creating GitHub Secrets...
echo Please add these secrets to your GitHub repository:
echo.
echo OPENAI_API_KEY=your_openai_api_key_here
echo.
echo To add secrets:
echo 1. Go to your GitHub repository
echo 2. Click Settings ^> Secrets and variables ^> Actions
echo 3. Click "New repository secret"
echo 4. Add the secret name and value
echo.

echo Step 2: Setting up local environment...
if not exist ".env" (
    echo Creating .env file...
    echo OPENAI_API_KEY=your_openai_api_key_here > .env
    echo EMBEDDING_MODEL=text-embedding-3-large >> .env
    echo CHAT_MODEL=gpt-4o-mini >> .env
    echo ALLOWED_DEPARTMENTS=IT,HR,Accounts,Factory,Marketing >> .env
    echo VITE_API_URL=http://localhost:8000 >> .env
    echo VITE_ADMIN_API_URL=http://localhost:8000 >> .env
    echo.
    echo Please update .env file with your actual API key!
)

echo.
echo Step 3: Testing CI/CD Pipeline...
echo Running test deployment...
call deploy-local.bat

echo.
echo ========================================
echo CI/CD Setup Complete!
echo ========================================
echo.
echo Available Commands:
echo - deploy-local.bat     : Manual deployment
echo - auto-deploy.bat      : Auto-deploy with monitoring
echo - start_all_services.bat : Start services only
echo.
echo GitHub Actions will automatically:
echo 1. Test your code on every push
echo 2. Build frontend applications
echo 3. Deploy to local server
echo.
pause
