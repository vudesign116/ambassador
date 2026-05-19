#!/bin/bash

echo "🚀 MerapLion Ambassador - Firebase Deployment Script"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"
echo ""

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Logging in..."
    firebase login
fi

echo -e "${GREEN}✅ Firebase authentication verified${NC}"
echo ""

# Pull latest changes (optional)
read -p "Pull latest changes from git? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
    echo -e "${GREEN}✅ Git pull completed${NC}"
fi
echo ""

# Install/update dependencies
read -p "Update dependencies? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

# Build production
echo "🏗️  Building production files..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

# Copy static pages into build
echo "📁 Copying static pages into build..."
cp -r loyalty-2026 build/
echo -e "${GREEN}✅ Static pages copied${NC}"
echo ""

# Check build size
BUILD_SIZE=$(du -sh build | cut -f1)
echo "📊 Build size: $BUILD_SIZE"
echo ""

# Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json" npx -y firebase-tools deploy --only hosting --project ambassador-7849e

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "===================================================="
echo "🌐 Your site is live!"
echo ""
echo "View deployment:"
firebase hosting:channel:list
echo ""
echo "===================================================="
