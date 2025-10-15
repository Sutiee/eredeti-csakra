# Vercel Environment Variables Setup

## 📍 Vercel Dashboard URL
https://vercel.com/sutiees-projects/eredeti-csakra/settings/environment-variables

## 🔑 Environment Variables to Add

Add the following environment variables in Vercel Dashboard → Settings → Environment Variables:

### 1. NEXT_PUBLIC_SUPABASE_URL
**Value:**
```
https://zvoaqnfxschflsoqnusg.supabase.co
```
**Environments:** Production, Preview, Development

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2b2FxbmZ4c2NoZmxzb3FudXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTc1OTMsImV4cCI6MjA3NTk5MzU5M30.0sScWgC9wFAGWq6FUTZMvjVi9OxtUvRRU-xblJhnC0U
```
**Environments:** Production, Preview, Development

---

### 3. SUPABASE_SERVICE_ROLE_KEY (Optional - for API routes)
**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2b2FxbmZ4c2NoZmxzb3FudXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxNzU5MywiZXhwIjoyMDc1OTkzNTkzfQ.nflEmQw9V1FHxSJzqyo1WtkRJsqa7PyOkedmPwmlYi4
```
**Environments:** Production, Preview, Development

---

## 📝 Step-by-Step Instructions

1. Go to: https://vercel.com/sutiees-projects/eredeti-csakra/settings/environment-variables

2. Click **"Add New"** for each variable

3. Enter:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: The value from above
   - **Environments**: Select all three (Production, Preview, Development)

4. Click **"Save"**

5. After adding all variables, **redeploy** your application:
   - Go to Deployments
   - Click the latest deployment
   - Click "Redeploy"

---

## ✅ Verification

After redeployment, your production site should be able to:
- Connect to Supabase
- Submit quiz results
- Retrieve quiz results

Test the production URL to ensure everything works!

---

## 🔒 Security Note

These environment variables contain sensitive API keys. Never commit them to git or share them publicly.
