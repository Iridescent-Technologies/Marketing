# ZAVMO Weekly Marketing Tracker — Q2 2026

A glassmorphic, interactive marketing dashboard for tracking Zavmo's weekly growth metrics, built in full Zavmo brand guidelines. Sends automatic notifications to Google Chat when weekly data is updated.

## How to Use

### For Shalini (Weekly Data Entry)

1. Open the dashboard at your GitHub Pages URL
2. Select the current week from the dropdown
3. Click the **Data Entry** tab
4. Fill in your actual numbers — targets are shown beside each field
5. Click **Save** — the dashboard updates automatically and notifies the team via Google Chat
6. Check the **Achievements** tab to see what you've unlocked!

### Where to Find Your Numbers

| Metric | Source |
|--------|--------|
| LinkedIn followers | LinkedIn Company Page > Analytics > Followers |
| LinkedIn impressions | LinkedIn Company Page > Analytics > Updates |
| Engagement rate | LinkedIn Company Page > Analytics > Updates |
| Profile visits | LinkedIn Company Page > Analytics > Visitors |
| Website visitors | Google Analytics > Audience > Overview |
| Session duration | Google Analytics > Audience > Overview |
| Form submissions | Website CRM / form plugin |
| Content downloads | Website CRM / download tracking |
| Newsletter sign-ups | Email platform (Mailchimp, HubSpot) |
| Demo meetings | Calendar / CRM — confirm with Xavier |
| JLT Newsletter | Juliette Learning Tribe send records |
| Zavmo Newsletter | Zavmo newsletter send records |

## Hosting on GitHub Pages

1. Go to your repo **Settings** > **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch and **/ (root)** folder
4. Click **Save**
5. Your dashboard will be live at: `https://iridescent-technologies.github.io/Marketing/`

## Setting Up Google Chat Notifications

When Shalini saves her weekly data, a formatted notification is sent to your Google Chat space with a summary of targets hit, key metrics, and any new achievements unlocked. Here's how to set it up:

### Step 1: Create a Google Chat Space

1. Open Google Chat (chat.google.com)
2. Click the **+** next to **Spaces** and create a new space (e.g. "Zavmo Marketing Tracker")
3. Add the team: Juliette, Gary, Harry, Rik, and Shalini

### Step 2: Create an Incoming Webhook

1. Open the space you just created
2. Click the space name at the top > **Apps & integrations** > **Manage webhooks**
3. Click **Add another** (or **Create** if none exist)
4. Name it "Zavmo Tracker" and optionally add an avatar
5. Click **Save** and **copy the webhook URL**

### Step 3: Set Up the Google Apps Script Bridge

1. Go to [script.google.com](https://script.google.com) and click **New project**
2. Delete any existing code and paste the contents of `google-apps-script.js` from this repo
3. Replace `YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE` with the webhook URL you copied in Step 2
4. Click **Deploy** > **New deployment**
5. Click the gear icon and select **Web app**
6. Set **Execute as** to "Me" and **Who has access** to "Anyone"
7. Click **Deploy**, then **Authorise access** when prompted
8. Copy the **Web App URL** that appears

### Step 4: Configure the Dashboard

1. Open your Zavmo tracker dashboard
2. Click the **Settings** tab
3. Paste the Web App URL into the **Google Apps Script Web App URL** field
4. Toggle on **Send Google Chat notification when weekly data is saved**
5. Click **Save Settings**
6. Click **Test Notification** to verify it works — check your Google Chat space

## Data Storage

Data is stored in your browser's local storage. This means:

- Data persists between visits on the same device and browser
- Different devices will have separate data
- Clearing browser data will reset the tracker

To export your data at any time, use the **Export CSV** button on the Full History tab.

## Features

- Target vs Actual tracking for 25 marketing metrics across 12 weeks
- Interactive charts showing trends over time
- 16 unlockable achievements with confetti celebrations
- Google Chat notifications to Juliette, Gary, Harry, Rik, and Shalini
- Full Zavmo glassmorphic branding with aurora background effects
- CSV export for reporting
- Responsive design for mobile and desktop

---

*Making learning as unique as you are*
