// Backend API Example for AdXGuard Premium Payments
// This is a Node.js/Express example - you need to deploy this on your server

const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Your Stripe secret key
const app = express();

app.use(express.json());

// CORS middleware (allow extension to call API)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Store premium users (in production, use a database)
const premiumUsers = new Map();

// Endpoint 1: Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, successUrl, cancelUrl, extensionId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId, // e.g., 'price_1234567890'
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl,
            metadata: {
                extensionId: extensionId,
                product: 'AdXGuard Premium'
            }
        });
        
        res.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 2: Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { sessionId, extensionId } = req.body;
        
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            // Store premium status
            premiumUsers.set(extensionId, {
                premium: true,
                purchaseDate: new Date().toISOString(),
                sessionId: sessionId
            });
            
            res.json({
                verified: true,
                sessionId: sessionId
            });
        } else {
            res.json({
                verified: false,
                reason: 'Payment not completed'
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 3: Check Premium Status
app.post('/api/check-premium', async (req, res) => {
    try {
        const { extensionId } = req.body;
        const user = premiumUsers.get(extensionId);
        
        res.json({
            isPremium: user ? user.premium : false,
            purchaseDate: user ? user.purchaseDate : null
        });
    } catch (error) {
        console.error('Error checking premium:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint 4: Verify Activation Code (for manual activation)
app.post('/api/verify-activation', async (req, res) => {
    try {
        const { code, extensionId } = req.body;
        
        // In production, validate code against database
        // For now, example validation
        if (code && code.length >= 8) {
            premiumUsers.set(extensionId, {
                premium: true,
                purchaseDate: new Date().toISOString(),
                activationCode: code
            });
            
            res.json({
                valid: true,
                sessionId: 'activation_' + Date.now()
            });
        } else {
            res.json({
                valid: false,
                error: 'Invalid activation code'
            });
        }
    } catch (error) {
        console.error('Error verifying activation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe (recommended)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // From Stripe Dashboard
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const extensionId = session.metadata.extensionId;
        
        if (extensionId) {
            // Automatically activate premium
            premiumUsers.set(extensionId, {
                premium: true,
                purchaseDate: new Date().toISOString(),
                sessionId: session.id
            });
            
            console.log(`Premium activated for extension: ${extensionId}`);
        }
    }
    
    res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AdXGuard Payment API running on port ${PORT}`);
});

// To run:
// 1. npm install express stripe
// 2. Replace YOUR_SECRET_KEY with your Stripe secret key
// 3. Replace YOUR_WEBHOOK_SECRET with webhook secret from Stripe Dashboard
// 4. node backend-api-example.js
// 5. Deploy to a server (Heroku, AWS, etc.)


