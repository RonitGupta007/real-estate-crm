@echo off
title Deploy EstateInt to Vercel
color 0b
cls

echo =====================================================================
echo               DEPLOY ESTATEINT TO VERCEL
echo =====================================================================
echo.
echo Step 1: Authenticating with Vercel...
echo (Select your login provider below, e.g. GitHub or Email, and approve in your browser)
echo.

call npx vercel login

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vercel login failed or was cancelled.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo Step 2: Deploying EstateInt to Vercel Production...
echo =====================================================================
echo.

call npx vercel --prod --yes

echo.
echo =====================================================================
echo Deployment complete! Click or copy the URL above to view your live app.
echo =====================================================================
echo.
pause
