# 🌐 Test Websites for AdXGuard Ad Blocker

## Quick Test Websites

### 📰 News Websites (Best for Testing - Heavy Ads)

1. **CNN.com** - https://www.cnn.com
   - Many banner ads, video ads
   - Good for testing Google AdSense blocking

2. **Forbes.com** - https://www.forbes.com
   - Business news with heavy ad load
   - Tests multiple ad networks

3. **BBC.com** - https://www.bbc.com
   - International news
   - Moderate ad presence

4. **Reuters.com** - https://www.reuters.com
   - Financial news
   - Banner and sidebar ads

5. **TheGuardian.com** - https://www.theguardian.com
   - UK news site
   - Multiple ad placements

6. **DailyMail.co.uk** - https://www.dailymail.co.uk
   - Heavy ad usage
   - Good stress test

7. **NYTimes.com** - https://www.nytimes.com
   - Premium news site
   - Various ad formats

8. **WashingtonPost.com** - https://www.washingtonpost.com
   - News with ads
   - Good for testing

### 🎬 Video & Entertainment

9. **YouTube.com** - https://www.youtube.com
   - Video pre-roll ads
   - Banner ads
   - Overlay ads

10. **Twitch.tv** - https://www.twitch.tv
    - Streaming platform ads
    - Banner ads

11. **Hulu.com** - https://www.hulu.com
    - Video streaming ads
    - Pre-roll ads

12. **IMDB.com** - https://www.imdb.com
    - Movie database
    - Banner ads

### ⚽ Sports Websites

13. **ESPN.com** - https://www.espn.com
    - Sports news
    - Heavy ad presence

14. **Yahoo Sports** - https://sports.yahoo.com
    - Sports coverage
    - Multiple ad networks

15. **SkySports.com** - https://www.skysports.com
    - UK sports
    - Banner ads

16. **BleacherReport.com** - https://www.bleacherreport.com
    - Sports media
    - Video and banner ads

### 🛒 Shopping & E-commerce

17. **Amazon.com** - https://www.amazon.com
    - Product recommendation ads
    - Sponsored products

18. **eBay.com** - https://www.ebay.com
    - Auction site
    - Promoted listings

19. **AliExpress.com** - https://www.aliexpress.com
    - Online shopping
    - Product ads

20. **Walmart.com** - https://www.walmart.com
    - Retail ads
    - Product promotions

### 💻 Tech & Gaming

21. **TechCrunch.com** - https://www.techcrunch.com
    - Tech news
    - Banner ads

22. **TheVerge.com** - https://www.theverge.com
    - Tech reviews
    - Multiple ad formats

23. **IGN.com** - https://www.ign.com
    - Gaming news
    - Video and banner ads

24. **Polygon.com** - https://www.polygon.com
    - Gaming & culture
    - Various ads

### 📚 Blogs & Content Sites

25. **BuzzFeed.com** - https://www.buzzfeed.com
    - Content with heavy ads
    - Native ads

26. **Medium.com** - https://www.medium.com
    - Blogging platform
    - Sponsored content

27. **HuffPost.com** - https://www.huffpost.com
    - News & opinion
    - Banner ads

28. **Vice.com** - https://www.vice.com
    - Alternative media
    - Various ad formats

## 🧪 Testing Checklist

When visiting these sites, check:

- [ ] **No banner ads** appear at top/bottom/sides
- [ ] **No popup ads** appear
- [ ] **No video ads** play before content
- [ ] **Page loads faster** than without blocker
- [ ] **Extension popup** shows increasing blocked counts
- [ ] **Network tab** (F12) shows blocked requests
- [ ] **Clean layout** without ad placeholders

## 🔍 How to Verify Blocking

### Method 1: Visual Check
- Visit website
- Look for ad spaces - should be empty or show "Ad blocked" message
- Page should look cleaner

### Method 2: Extension Popup
1. Click AdXGuard icon
2. Check "This Website" count - should increase
3. Check "This Month" count - should increase

### Method 3: Browser Developer Tools
1. Press `F12` to open DevTools
2. Go to **Network** tab
3. Reload page (`Ctrl+R`)
4. Look for:
   - Requests to `doubleclick.net` - should be blocked (red)
   - Requests to `googlesyndication.com` - should be blocked
   - Requests to `googletagservices.com` - should be blocked
   - Status shows "blocked" or "failed"

### Method 4: Extension Console
1. Go to `chrome://extensions`
2. Find AdXGuard
3. Click **"service worker"** link
4. Check console for:
   - "AdXGuard: Blocked request detected"
   - Blocked request details

## ⚡ Quick Test (5 minutes)

1. **CNN.com** - Check for banner ads (should be gone)
2. **YouTube.com** - Check for video ads (should be blocked)
3. **Forbes.com** - Check for multiple ad types
4. Open extension popup - verify counts increased
5. Check Network tab - verify blocked requests

## 🎯 Best Sites for Quick Testing

**Top 5 Recommended:**
1. **CNN.com** - Most ads, easiest to see difference
2. **Forbes.com** - Heavy ad load
3. **YouTube.com** - Video ads clearly visible
4. **ESPN.com** - Sports site with many ads
5. **DailyMail.co.uk** - Very heavy ad usage

## 📊 Expected Results

### ✅ Working Correctly:
- Ads don't appear on pages
- Page loads faster
- Extension popup shows blocked counts
- Network tab shows blocked requests
- Console shows "Blocked request detected"

### ❌ Not Working:
- Ads still visible
- Counts stay at 0
- No blocked requests in Network tab
- Console shows errors

## 🔧 Troubleshooting

If ads are not blocked:
1. Reload extension in `chrome://extensions`
2. Reload the webpage
3. Check toggle is ON in popup
4. Verify rules.json is valid
5. Check browser console for errors

