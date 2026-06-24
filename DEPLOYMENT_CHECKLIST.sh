#!/usr/bin/env bash

# Cloud Deployment Checklist for Asset Manager

echo "🚀 Asset Manager Cloud Deployment Checklist"
echo "=============================================="
echo ""

echo "✓ Step 1: Verify builds"
echo "  Run locally: pnpm build"
echo "  Backend: artifacts/api-server/dist/index.mjs"
echo "  Frontend: artifacts/mariela-inmobiliaria/dist/public/index.html"
echo ""

echo "✓ Step 2: Set up Neon Database"
echo "  1. Create account at https://console.neon.tech"
echo "  2. Create project and save DATABASE_URL"
echo "  3. Run seed: DATABASE_URL=... pnpm run --filter @workspace/db seed"
echo ""

echo "✓ Step 3: Deploy Backend on Render"
echo "  1. Create Web Service on https://render.com"
echo "  2. Connect GitHub repository"
echo "  3. Set Build: pnpm install && pnpm --filter @workspace/api-server run build"
echo "  4. Set Start: pnpm --filter @workspace/api-server run start"
echo "  5. Add environment variables:"
echo "     - DATABASE_URL: from Neon"
echo "     - JWT_SECRET: random secure string"
echo "     - CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (optional)"
echo "  6. Deploy and save the Render URL"
echo ""

echo "✓ Step 4: Deploy Frontend on Vercel"
echo "  1. Create project on https://vercel.com"
echo "  2. Connect GitHub repository"
echo "  3. Set Root Directory: artifacts/mariela-inmobiliaria"
echo "  4. Set Build Command: pnpm --filter @workspace/mariela-inmobiliaria run build"
echo "  5. Set Output Directory: dist/public"
echo "  6. Add environment variables:"
echo "     - VITE_API_URL: from Render (e.g., https://your-api.onrender.com)"
echo "  7. Deploy"
echo ""

echo "✓ Step 5: Configure Cloudinary (Recommended for Production)"
echo "  1. Create account at https://cloudinary.com"
echo "  2. Get Cloud Name, API Key, API Secret"
echo "  3. Add to Render environment variables"
echo ""

echo "✓ Step 6: Test Deployment"
echo "  1. Test Backend API:"
echo "     curl https://your-api.onrender.com/api/properties"
echo "  2. Test Frontend:"
echo "     Visit https://your-app.vercel.app"
echo "  3. Login at /admin with default credentials"
echo "  4. Upload an image and verify it appears"
echo ""

echo "✓ All set! Your app is ready to deploy."
