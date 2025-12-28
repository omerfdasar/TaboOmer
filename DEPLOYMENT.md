# Deployment Guide - Taboo Game

Free deployment options for your Taboo PWA.

---

## Option 1: Vercel (Recommended)

Best for React apps. Automatic deployments from Git.

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/taboo-game.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your repository
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-project.vercel.app`

---

## Option 2: Netlify

Simple drag & drop or Git integration.

### Method A: Drag & Drop

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Sign up (free)
   - Drag the `dist` folder to the deploy area

3. **Done!** Get your URL instantly.

### Method B: Git Integration

1. Push to GitHub (see Vercel step 1)

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy"

---

## Option 3: GitHub Pages

Free hosting directly from your repository.

### Steps:

1. **Install gh-pages**
   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json** - Add these scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts** - Add base URL:
   ```typescript
   export default defineConfig({
     base: '/taboo-game/', // your repo name
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to your repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages` / `root`
   - Save

6. **Done!** Your app is at `https://YOUR_USERNAME.github.io/taboo-game/`

---

## Option 4: Cloudflare Pages

Fast global CDN, generous free tier.

### Steps:

1. Push to GitHub (see Vercel step 1)

2. **Connect to Cloudflare**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up (free)
   - Click "Create a project" → "Connect to Git"
   - Select your repository

3. **Configure build**
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`

4. **Deploy** - Click "Save and Deploy"

5. **Done!** Your app is at `https://your-project.pages.dev`

---

## After Deployment: PWA Installation

Once deployed with HTTPS, users can install the app:

### On Mobile (iOS/Android):
1. Open the site in browser
2. Tap "Share" → "Add to Home Screen"
3. The app will work like a native app (no URL bar!)

### On Desktop (Chrome/Edge):
1. Open the site
2. Click the install icon in the address bar
3. Click "Install"

---

## Comparison

| Platform | Setup | Custom Domain | Auto Deploy | Free Tier |
|----------|-------|---------------|-------------|-----------|
| Vercel | Easiest | Yes | Yes | Unlimited |
| Netlify | Easy | Yes | Yes | 100GB/month |
| GitHub Pages | Medium | Yes | Manual | Unlimited |
| Cloudflare | Easy | Yes | Yes | Unlimited |

---

## Recommended: Vercel

```bash
# Quick deploy with Vercel CLI
npm i -g vercel
vercel
```

Follow the prompts and your site is live in seconds!
