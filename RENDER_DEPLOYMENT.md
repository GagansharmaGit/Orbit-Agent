# Deploying Orbit to Render (Free Tier) & Configuring Google Login

Follow these step-by-step instructions to deploy your Orbit application for free on Render and ensure Google Authentication works flawlessly in production.

## 1. Push Your Code to GitHub
Render pulls your code directly from a Git repository.
1. Make sure your local changes are committed.
2. Push your `orbit` project to a new repository on your GitHub account.

## 2. Prepare a Production Database
Render offers a free PostgreSQL database, but it expires after 90 days. For a permanently free database, we recommend using **Neon** or **Supabase**.
1. Create a free PostgreSQL project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the **Database Connection String** (it starts with `postgresql://...`). You will need this for Render.

## 3. Create a Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New** -> **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your GitHub account.
3. Select your `orbit` repository.
4. Fill in the deployment details:
   * **Name**: `orbit-app` (or whatever you prefer)
   * **Region**: Choose the one closest to your users.
   * **Branch**: `main`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Instance Type**: Select the **Free** tier.

## 4. Set Up Environment Variables in Render
Before you hit "Create Web Service", scroll down and click **Advanced** to add your Environment Variables. Add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | The connection string from your Neon/Supabase database. |
| `NEXTAUTH_SECRET` | *(Random String)* | Run `openssl rand -base64 32` in your terminal to generate one, or just mash your keyboard. |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` | Your Render URL (Render will tell you the URL at the top of the dashboard). |
| `GOOGLE_CLIENT_ID` | `your-client-id` | Find this in your local `.env` file. |
| `GOOGLE_CLIENT_SECRET` | `your-client-secret` | Find this in your local `.env` file. |

Click **Create Web Service**. Render will begin building your app.

## 5. Update Google Cloud Console for Login
Since your app is now hosted on a new URL (`https://your-app-name.onrender.com`), Google will block login attempts until you whitelist the new URL.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** -> **Credentials**.
3. Under *OAuth 2.0 Client IDs*, click the pencil icon to edit your existing credential.
4. **Authorized JavaScript origins**:
   * Add your new Render URL: `https://your-app-name.onrender.com`
5. **Authorized redirect URIs**:
   * Add your new NextAuth callback URL: `https://your-app-name.onrender.com/api/auth/callback/google`
6. Click **Save**.

> Note: It can sometimes take 5-10 minutes for Google to update these changes across their servers.

## 6. Run Database Migrations
Once your app is live, you need to push your database schema to your new production database. 
If you used Drizzle, run the following locally on your computer (make sure you temporarily swap your local `.env` `DATABASE_URL` to the production one, or pass it inline):

```bash
DATABASE_URL="your-production-db-url" npm run db:push
```

## You're Done!
Visit your Render URL. You should be able to click "Sign In", authenticate via Google, and immediately access your Orbit dashboard!
