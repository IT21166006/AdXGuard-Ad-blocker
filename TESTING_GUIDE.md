# 🧪 AdXGuard Testing Guide

## Quick Test Steps

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select your extension folder
5. Make sure the extension is **enabled** (toggle should be ON)

### 2. Test the Extension Popup
1. Click the AdXGuard icon in the Chrome toolbar
2. You should see:
   - ✅ Logo and extension name
   - ✅ Current website URL displayed
   - ✅ Dark/Light mode toggle button
   - ✅ Ad Blocker ON/OFF switch (should be ON)
   - ✅ "This Website" blocked count (starts at 0)
   - ✅ "This Month" blocked count (starts at 0)
   - ✅ VIP section with buttons

### 3. Test Ad Blocking

#### Method 1: Use the Test Page
1. Open `test.html` in your browser (file:// protocol)
2. Click the test buttons
3. Check if resources are blocked (should show ✅ BLOCKED)
4. Open extension popup - counts should increase

#### Method 2: Test on Real Websites
Visit these sites and check if ads are blocked:

**Test Sites:**
- **CNN.com** - https://www.cnn.com
- **Forbes.com** - https://www.forbes.com
- **YouTube.com** - https://www.youtube.com
- **ESPN.com** - https://www.espn.com

**What to check:**
- ✅ Ads should NOT appear on the page
- ✅ Page should load faster
- ✅ Extension popup shows increasing blocked counts
- ✅ No broken images/placeholders where ads were

#### Method 3: Check Browser Console
1. Open a website (e.g., CNN.com)
2. Press `F12` to open Developer Tools
3. Go to **Network** tab
4. Reload the page
5. Look for blocked requests:
   - Requests to `doubleclick.net` should be blocked (red/canceled)
   - Requests to `googlesyndication.com` should be blocked
   - Requests to `googletagservices.com` should be blocked
   - Check the status column - blocked requests show as "blocked" or "failed"

#### Method 4: Check Extension Console
1. Go to `chrome://extensions`
2. Find AdXGuard extension
3. Click **"service worker"** or **"background page"** link
4. Check the console for messages:
   - ✅ "AdXGuard: Blocked request tracking enabled"
   - ✅ "AdXGuard: Blocked request detected" (when ads are blocked)

### 4. Verify Stats Tracking

1. Visit a website with ads
2. Open the extension popup
3. Check the counts:
   - **This Website**: Should show number of ads blocked on current site
   - **This Month**: Should show total ads blocked this month
4. Visit another website
5. Check again - "This Website" should reset, "This Month" should continue increasing

### 5. Test Toggle Functionality

1. Open extension popup
2. Toggle the Ad Blocker switch to **OFF**
3. Badge on extension icon should show **"OFF"**
4. Visit a website - ads should now appear
5. Toggle back to **ON**
6. Reload the page - ads should be blocked again

### 6. Test Theme Toggle

1. Open extension popup
2. Click the theme toggle button (🌙/☀️)
3. Interface should switch between dark and light mode
4. Close and reopen popup - theme should be saved

## Troubleshooting

### Ads are NOT being blocked:
1. ✅ Check extension is enabled in `chrome://extensions`
2. ✅ Check Ad Blocker toggle is ON in popup
3. ✅ Reload the extension (click reload icon)
4. ✅ Reload the webpage
5. ✅ Check `rules.json` file is valid JSON
6. ✅ Check browser console for errors

### Stats are NOT updating:
1. ✅ Make sure extension is loaded in **Developer mode**
2. ✅ Check background script console for errors
3. ✅ Verify `onRuleMatchedDebug` API is available
4. ✅ Check storage permissions in manifest

### Extension popup not showing:
1. ✅ Check `popup.html` file exists
2. ✅ Check `manifest.json` has correct popup path
3. ✅ Reload the extension
4. ✅ Check for JavaScript errors in popup console (right-click popup → Inspect)

## Expected Behavior

### ✅ Working Correctly:
- Ads from blocked domains don't load
- Extension popup shows current URL
- Blocked counts increase when ads are blocked
- Toggle switch works
- Theme switching works and persists
- Badge shows "OFF" when disabled

### ❌ Not Working:
- Ads still appear on pages
- Counts stay at 0
- Popup doesn't open
- Toggle doesn't work
- Console shows errors

## Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Current URL is shown in popup
- [ ] Theme toggle works
- [ ] Ad blocker toggle works
- [ ] Ads are blocked on test websites
- [ ] Blocked counts increase
- [ ] Stats persist after closing popup
- [ ] Badge updates when toggled off
- [ ] VIP buttons are clickable

## Need Help?

If testing shows issues:
1. Check browser console for errors
2. Check extension background console
3. Verify all files are in correct locations
4. Make sure manifest.json is valid
5. Ensure rules.json is valid JSON

