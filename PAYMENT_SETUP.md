# 💳 Payment Gateway Setup Guide

## Overview
This guide explains how to set up real payment processing for AdXGuard Premium using Stripe.

## Option 1: Stripe Checkout (Recommended)

### Step 1: Create Stripe Account
1. Go to https://stripe.com and create an account
2. Complete the account setup
3. Get your API keys from https://dashboard.stripe.com/apikeys

### Step 2: Create a Product and Price
1. Go to Stripe Dashboard > Products
2. Click "Add product"
3. Name: "AdXGuard Premium"
4. Price: $9.99 (one-time)
5. Copy the **Price ID** (starts with `price_...`)

### Step 3: Set Up Backend API

You need to create a backend server with these endpoints:

#### Endpoint 1: Create Checkout Session
```
POST /api/create-checkout-session
```

**Request:**
```json
{
  "priceId": "price_...",
  "successUrl": "chrome-extension://.../premium-success.html",
  "cancelUrl": "chrome-extension://.../premium.html",
  "extensionId": "..."
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Example (Node.js/Express):**
```javascript
const stripe = require('stripe')('sk_test_...'); // Your secret key

app.post('/api/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: req.body.priceId,
      quantity: 1,
    }],
    mode: 'payment',
    success_url: req.body.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: req.body.cancelUrl,
    metadata: {
      extensionId: req.body.extensionId
    }
  });
  
  res.json({ sessionId: session.id, url: session.url });
});
```

#### Endpoint 2: Verify Payment
```
POST /api/verify-payment
```

**Request:**
```json
{
  "sessionId": "cs_...",
  "extensionId": "..."
}
```

**Response:**
```json
{
  "verified": true,
  "sessionId": "cs_..."
}
```

**Example:**
```javascript
app.post('/api/verify-payment', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
  
  if (session.payment_status === 'paid') {
    // Store premium status in your database
    // Link extensionId with premium status
    
    res.json({ verified: true, sessionId: session.id });
  } else {
    res.json({ verified: false });
  }
});
```

#### Endpoint 3: Webhook Handler (Optional but Recommended)
```
POST /api/webhook
```

Handle Stripe webhooks to automatically activate premium when payment succeeds.

### Step 4: Update Extension Configuration

Edit `premium.js` and update:
```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_...', // Your publishable key
    apiEndpoint: 'https://your-api-domain.com/api/create-checkout-session',
    priceId: 'price_...', // Your price ID
    successUrl: chrome.runtime.getURL('premium-success.html'),
    cancelUrl: chrome.runtime.getURL('premium.html')
};
```

## Option 2: Stripe Payment Links (Simpler, No Backend)

### Step 1: Create Payment Link
1. Go to Stripe Dashboard > Payment Links
2. Click "Create payment link"
3. Select your product/price
4. Copy the payment link URL

### Step 2: Update Extension
Edit `premium.js`:
```javascript
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your-link';
```

### Step 3: Manual Verification
Since there's no backend, you'll need to:
- Manually verify payments in Stripe Dashboard
- Provide activation codes to users
- Or use a webhook service like Zapier to automate

## Option 3: PayPal Integration

### Step 1: Create PayPal Business Account
1. Go to https://www.paypal.com/business
2. Create a business account
3. Get your Client ID and Secret

### Step 2: Integrate PayPal SDK
Add PayPal JavaScript SDK to `premium.html`:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

### Step 3: Update premium.js
Use PayPal SDK to create payment buttons and handle callbacks.

## Security Notes

1. **Never expose secret keys** in extension code
2. **Always verify payments** on your backend
3. **Use HTTPS** for all API endpoints
4. **Validate extension IDs** to prevent fraud
5. **Store premium status** in your database
6. **Use webhooks** for automatic activation

## Testing

### Stripe Test Mode
- Use test keys: `pk_test_...` and `sk_test_...`
- Use test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC

### Test Flow
1. Click "Purchase Premium"
2. Complete test payment
3. Verify premium status is activated
4. Check that features unlock

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up production backend
- [ ] Configure webhooks
- [ ] Test payment flow end-to-end
- [ ] Set up error monitoring
- [ ] Add customer support contact
- [ ] Test refund process
- [ ] Set up analytics tracking

## Support

For issues with payment integration:
1. Check Stripe Dashboard > Logs
2. Check browser console for errors
3. Verify API endpoints are accessible
4. Test with Stripe test mode first


