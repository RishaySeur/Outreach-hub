# Outreach Hub — Deployment Guide
## From folder to live web app on your phone in ~45 minutes

---

## What you're deploying
A private, password-protected web app that lives at your own URL.
Accessible from your phone (add to home screen) and laptop.
All your leads and drafts are saved permanently in your browser.

---

## Step 1 — Create a GitHub account (if you don't have one)
1. Go to github.com → Sign up
2. Choose a free account
3. Verify your email

---

## Step 2 — Create a new GitHub repository
1. Click the "+" icon top right → New repository
2. Name it: `outreach-hub`
3. Set to **Private**
4. Click "Create repository"
5. GitHub will show you an empty repo page — keep it open

---

## Step 3 — Upload your project files
1. Click "uploading an existing file" on the repo page
2. Drag the entire `outreach-hub` folder contents into the upload area:
   ```
   package.json
   vite.config.js
   index.html
   src/
     main.jsx
     App.jsx
   public/
     manifest.json
     sw.js
     icon-192.png   ← create this (see Step 3b below)
     icon-512.png   ← create this
   ```
3. Click "Commit changes"

### Step 3b — Create your app icons
You need two PNG icons for the home screen shortcut.
- Go to: https://favicon.io/favicon-generator/
- Text: "22"  |  Background: #C49B37  |  Font color: #0B0F17
- Download, rename the files to `icon-192.png` and `icon-512.png`
- Upload them to the `public/` folder in your GitHub repo

---

## Step 4 — Deploy to Cloudflare Pages
1. Go to: https://pages.cloudflare.com
2. Sign in / sign up (free)
3. Click "Create a project" → "Connect to Git"
4. Connect your GitHub account → Select `outreach-hub` repo
5. Configure build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click "Save and Deploy"
7. Wait ~2 minutes — Cloudflare builds and deploys it
8. You'll get a URL like: `outreach-hub.pages.dev`

### Custom domain (optional)
In Cloudflare Pages → Custom Domains → Add `outreach.twentytwomedia.co.za`
(You'll need your domain on Cloudflare DNS — takes 5 min)

---

## Step 5 — Password protect it (Cloudflare Access)
This puts a Google login gate on your app so only you can access it.

1. In Cloudflare dashboard → "Zero Trust" → "Access" → "Applications"
2. Click "Add an application" → "Self-hosted"
3. Name: `Outreach Hub`
4. Domain: `outreach-hub.pages.dev` (or your custom domain)
5. Under "Policies" → Add policy:
   - Policy name: Owner only
   - Action: Allow
   - Include: Emails → your personal Gmail address
6. Save
7. Now when you visit the URL, it asks you to sign in with Google first

---

## Step 6 — Add API key
1. Open your app URL in the browser
2. Go to ☰ More → Settings
3. Paste your Anthropic API key (get it at console.anthropic.com → API Keys)
4. Click Save — it's stored locally on your device

---

## Step 7 — Add to home screen (iPhone)
1. Open the app URL in Safari (must be Safari, not Chrome)
2. Tap the Share button (box with arrow)
3. Scroll down → "Add to Home Screen"
4. Name it "Outreach Hub" → Add
5. It now lives on your home screen and opens full screen like a native app

### Android
1. Open in Chrome
2. Tap the 3-dot menu → "Add to Home screen"
3. Done

---

## Future updates
Whenever you want to update the app:
1. Edit the files in your GitHub repo
2. Cloudflare Pages automatically rebuilds and redeploys in ~2 minutes
3. Refresh the app — updates are live

---

## Your data
- All leads, drafts, sequences, and WhatsApp logs are saved in your browser's localStorage
- Data persists across sessions and page reloads
- Data is device-specific — if you use the app on your phone AND laptop, they have separate data
- To back up: Go to browser dev tools → Application → Local Storage → copy the ttm_* keys

---

## Optional: Cloudflare Worker API proxy (advanced)
If you want your Anthropic API key to stay server-side (more secure), 
create a Cloudflare Worker with this code:

```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://your-app.pages.dev',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST',
        }
      });
    }
    const body = await request.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://your-app.pages.dev',
      }
    });
  }
}
```

Then in Settings, set your API endpoint to your Worker URL instead of the direct Anthropic URL.
Store your key as a Worker secret: `wrangler secret put ANTHROPIC_KEY`
