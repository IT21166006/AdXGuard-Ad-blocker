# 💳 Payment Gateway Setup Guide for Sri Lanka

## Overview
Since Stripe is not available in Sri Lanka, this guide covers payment gateways that work in Sri Lanka.

## Available Payment Methods

### 1. PayPal (Recommended - Works Globally)
✅ **Best Option** - Works in Sri Lanka, widely accepted

#### Setup Steps:
1. Create PayPal Business Account: https://www.paypal.com/business
2. Get your PayPal email or create a payment link
3. Update `premium.js`:
   ```javascript
   paypal: {
       paymentLink: 'https://www.paypal.com/paypalme/yourusername/9.99USD',
       businessEmail: 'your-email@example.com'
   }
   ```

#### Methods:
- **PayPal.me Link** (Easiest):
  - Go to https://www.paypal.com/paypalme
  - Create your link
  - Update `paymentLink` in config

- **PayPal Business** (More features):
  - Create business account
  - Get Client ID from Developer Dashboard
  - Integrate PayPal SDK

### 2. PayHere (Sri Lankan Payment Gateway)
✅ **Local Option** - Popular in Sri Lanka

#### Setup Steps:
1. Register at: https://www.payhere.lk
2. Complete merchant verification
3. Get Merchant ID and API keys
4. Update `premium.js`:
   ```javascript
   payhere: {
       merchantId: 'YOUR_MERCHANT_ID',
       apiEndpoint: 'https://your-api-domain.com/api/create-payhere-session'
   }
   ```

#### Features:
- Credit/Debit Cards (Visa, Mastercard, Amex)
- Bank Transfers
- Mobile Payments
- Supports LKR and USD

### 3. Bank Transfer (Manual)
✅ **Always Available** - Works for all users

#### Setup:
1. Update bank details in `premium.js`:
   ```javascript
   manual: {
       bankName: 'Your Bank Name',
       accountNumber: '1234567890',
       accountName: 'Your Business Name',
       swiftCode: 'YOURSWIFT',
       email: 'support@adxguard.com'
   }
   ```

2. Process:
   - User transfers money
   - You receive payment
   - Send activation code via email
   - User enters code to activate

## Quick Setup (PayPal - Easiest)

### Step 1: Create PayPal Account
1. Go to https://www.paypal.com
2. Sign up for Business account
3. Complete verification

### Step 2: Create Payment Link
1. Go to https://www.paypal.com/paypalme
2. Create your link (e.g., `paypal.me/yourname`)
3. Set amount: $9.99

### Step 3: Update Extension
Edit `premium.js` line 12:
```javascript
paymentLink: 'https://www.paypal.com/paypalme/yourname/9.99USD',
```

### Step 4: Test
1. Click "Purchase Premium"
2. Select PayPal
3. Complete test payment
4. Verify premium activates

## PayHere Integration (Advanced)

### Step 1: Register with PayHere
1. Visit https://www.payhere.lk
2. Click "Register as Merchant"
3. Complete business registration
4. Wait for approval

### Step 2: Get API Credentials
1. Login to PayHere Dashboard
2. Go to Settings > API
3. Copy Merchant ID and Secret Key

### Step 3: Create Backend API
You need a backend server to create PayHere sessions:

```javascript
// Example endpoint
app.post('/api/create-payhere-session', async (req, res) => {
    const payhere = require('payhere-nodejs-sdk');
    
    const session = await payhere.createCheckout({
        merchant_id: 'YOUR_MERCHANT_ID',
        return_url: 'https://your-site.com/success',
        cancel_url: 'https://your-site.com/cancel',
        notify_url: 'https://your-site.com/webhook',
        order_id: 'ORDER_' + Date.now(),
        items: 'AdXGuard Premium',
        currency: 'USD',
        amount: 9.99
    });
    
    res.json({ paymentUrl: session.payment_url });
});
```

### Step 4: Update Extension
Edit `premium.js`:
```javascript
payhere: {
    merchantId: 'YOUR_MERCHANT_ID',
    apiEndpoint: 'https://your-api-domain.com/api/create-payhere-session'
}
```

## Manual Payment Setup

### Step 1: Update Bank Details
Edit `premium.js` lines 35-40:
```javascript
manual: {
    bankName: 'Commercial Bank of Ceylon',
    accountNumber: '1234567890',
    accountName: 'Your Business Name',
    swiftCode: 'CBCYLKLX',
    email: 'support@adxguard.com'
}
```

### Step 2: Create Activation System
You can:
- Manually send codes after receiving payment
- Use a simple backend to generate codes
- Use email automation

### Step 3: Verification Endpoint (Optional)
Create API endpoint to verify activation codes:
```javascript
app.post('/api/verify-activation', async (req, res) => {
    const { code } = req.body;
    
    // Check code in database
    const isValid = await checkActivationCode(code);
    
    if (isValid) {
        res.json({ valid: true, sessionId: 'activation_' + code });
    } else {
        res.json({ valid: false });
    }
});
```

## Alternative Payment Methods

### 1. Cryptocurrency
- Accept Bitcoin, USDT, etc.
- Use services like Coinbase Commerce
- Manual verification after payment

### 2. Mobile Payments
- Dialog eZ Cash
- Mobitel mCash
- Integration via PayHere

### 3. Direct Bank Transfer
- Provide bank details
- Manual activation after verification

## Testing

### PayPal Test Mode
- Use PayPal Sandbox for testing
- Create test accounts
- Test payment flow

### PayHere Test Mode
- Use PayHere Sandbox
- Test with test cards
- Verify webhook handling

## Production Checklist

- [ ] Set up PayPal Business account
- [ ] Create PayPal payment link
- [ ] Update payment link in `premium.js`
- [ ] Test payment flow end-to-end
- [ ] Set up email for activation codes
- [ ] Configure bank details (if using manual)
- [ ] Test activation code system
- [ ] Set up customer support email

## Support

For payment issues:
- Email: support@adxguard.com
- Check payment status in PayPal/PayHere dashboard
- Verify activation codes are sent correctly

## Recommended Setup for Sri Lanka

**Best Option:** PayPal
- Easy to set up
- Works immediately
- No backend needed
- Global acceptance

**Alternative:** PayHere + Manual
- Local payment gateway
- Bank transfer option
- Mobile payment support


