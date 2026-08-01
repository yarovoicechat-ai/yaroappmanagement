#!/bin/bash

echo "🚀 Starting deployment..."

git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧹 Cleaning old build..."
rm -rf .next

echo "🏗️ Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "♻️ Restarting PM2..."
pm2 reload app-management --update-env

echo "✅ Deployment completed successfully!"