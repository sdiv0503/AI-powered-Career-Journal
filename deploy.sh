#!/bin/bash
# Deployment script for Career Journal

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test:coverage

if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Your app is live at: https://your-project.web.app"
else
  echo "❌ Deployment failed!"
  exit 1
fi

echo "🎉 Deployment complete!"
