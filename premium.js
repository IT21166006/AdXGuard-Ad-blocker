// Premium Payment Page - Multi-Gateway Support (Sri Lanka Compatible)
const backButtonPremium = document.getElementById('backButtonPremium');
const purchaseButton = document.getElementById('purchaseButton');
const paypalBtn = document.getElementById('paypalBtn');
const payhereBtn = document.getElementById('payhereBtn');
const manualBtn = document.getElementById('manualBtn');
const manualPaymentInfo = document.getElementById('manualPaymentInfo');
const activateCodeButton = document.getElementById('activateCodeButton');
const activationCodeInput = document.getElementById('activationCodeInput');

// Current selected payment method
let selectedPaymentMethod = 'paypal';

// Payment Configuration
const PAYMENT_CONFIG = {
    // PayPal Configuration
    paypal: {
        // Option 1: PayPal Payment Link (easiest)
        paymentLink: 'https://www.paypal.com/paypalme/yourusername/9.99USD',
        
        // Option 2: PayPal Business Account (for buttons)
        businessEmail: 'your-email@example.com',
        
        // Option 3: PayPal API (requires backend)
        apiEndpoint: 'https://your-api-domain.com/api/create-paypal-order',
        clientId: 'YOUR_PAYPAL_CLIENT_ID'
    },
    
    // PayHere Configuration (Sri Lankan Payment Gateway)
    payhere: {
        merchantId: 'YOUR_MERCHANT_ID', // Get from PayHere dashboard
        apiEndpoint: 'https://your-api-domain.com/api/create-payhere-session',
        // PayHere Sandbox: https://sandbox.payhere.lk
        // PayHere Live: https://www.payhere.lk
    },
    
    // Manual Payment Configuration
    manual: {
        bankName: 'Commercial Bank of Ceylon',
        accountNumber: '1234567890',
        accountName: 'Your Business Name',
        swiftCode: 'CBCYLKLX',
        email: 'support@adxguard.com',
        verificationEndpoint: 'https://your-api-domain.com/api/verify-manual-payment'
    },
    
    // Backend API for verification
    verificationEndpoint: 'https://your-api-domain.com/api/verify-payment'
};

// Load theme
async function loadTheme() {
    const result = await chrome.storage.sync.get(['theme']);
    const theme = result.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

// Back button
backButtonPremium.addEventListener('click', () => {
    window.close();
});

// Payment method selection
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update button states
    [paypalBtn, payhereBtn, manualBtn].forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (method === 'paypal') {
        paypalBtn.classList.add('active');
        purchaseButton.textContent = 'Continue with PayPal';
        purchaseButton.style.display = 'block';
        manualPaymentInfo.classList.remove('active');
    } else if (method === 'payhere') {
        payhereBtn.classList.add('active');
        purchaseButton.textContent = 'Pay with PayHere';
        purchaseButton.style.display = 'block';
        manualPaymentInfo.classList.remove('active');
    } else if (method === 'manual') {
        manualBtn.classList.add('active');
        purchaseButton.style.display = 'none';
        manualPaymentInfo.classList.add('active');
        
        // Update bank details
        document.getElementById('bankName').textContent = PAYMENT_CONFIG.manual.bankName;
        document.getElementById('accountNumber').textContent = PAYMENT_CONFIG.manual.accountNumber;
        document.getElementById('accountName').textContent = PAYMENT_CONFIG.manual.accountName;
        document.getElementById('swiftCode').textContent = PAYMENT_CONFIG.manual.swiftCode;
    }
}

// Event listeners for payment method buttons
paypalBtn.addEventListener('click', () => selectPaymentMethod('paypal'));
payhereBtn.addEventListener('click', () => selectPaymentMethod('payhere'));
manualBtn.addEventListener('click', () => selectPaymentMethod('manual'));

// Activate premium after successful payment
async function activatePremium(paymentData) {
    try {
        await chrome.storage.sync.set({ 
            isPremium: true,
            premiumPurchaseDate: new Date().toISOString(),
            paymentMethod: selectedPaymentMethod,
            paymentSessionId: paymentData.sessionId || paymentData.transactionId || null,
            paymentVerified: true
        });
        
        chrome.runtime.sendMessage({ action: 'premiumStatusChanged' }).catch(() => {});
        return true;
    } catch (error) {
        console.error('Error activating premium:', error);
        return false;
    }
}

// PayPal Payment Methods
async function processPayPalPayment() {
    try {
        purchaseButton.textContent = 'Redirecting to PayPal...';
        purchaseButton.disabled = true;
        
        // Method 1: PayPal Payment Link (simplest)
        if (PAYMENT_CONFIG.paypal.paymentLink && PAYMENT_CONFIG.paypal.paymentLink !== 'https://www.paypal.com/paypalme/yourusername/9.99USD') {
            chrome.tabs.create({ 
                url: PAYMENT_CONFIG.paypal.paymentLink + '?note=AdXGuard+Premium'
            });
            
            // Show instructions
            alert('Complete payment on PayPal.\n\nAfter payment, you will receive an activation code via email.\n\nOr contact: ' + PAYMENT_CONFIG.manual.email);
            purchaseButton.textContent = 'Continue with PayPal';
            purchaseButton.disabled = false;
            return;
        }
        
        // Method 2: PayPal API (requires backend)
        if (PAYMENT_CONFIG.paypal.apiEndpoint && PAYMENT_CONFIG.paypal.apiEndpoint !== 'https://your-api-domain.com/api/create-paypal-order') {
            const response = await fetch(PAYMENT_CONFIG.paypal.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 9.99,
                    currency: 'USD',
                    extensionId: chrome.runtime.id
                })
            });
            
            if (response.ok) {
                const { orderId, approvalUrl } = await response.json();
                chrome.tabs.create({ url: approvalUrl });
                await chrome.storage.local.set({ pendingPayPalOrderId: orderId });
            } else {
                throw new Error('Failed to create PayPal order');
            }
            return;
        }
        
        // Fallback: Manual PayPal
        chrome.tabs.create({ 
            url: `https://www.paypal.com/sendmoney?amount=9.99&currency=USD&email=${PAYMENT_CONFIG.paypal.businessEmail}&note=AdXGuard+Premium`
        });
        
        alert('Send $9.99 via PayPal to: ' + PAYMENT_CONFIG.paypal.businessEmail + '\n\nAfter payment, you will receive an activation code.');
        purchaseButton.textContent = 'Continue with PayPal';
        purchaseButton.disabled = false;
        
    } catch (error) {
        console.error('PayPal payment error:', error);
        purchaseButton.textContent = 'Continue with PayPal';
        purchaseButton.disabled = false;
        alert('Payment initialization failed. Please try again.');
    }
}

// PayHere Payment (Sri Lankan Gateway)
async function processPayHerePayment() {
    try {
        purchaseButton.textContent = 'Redirecting to PayHere...';
        purchaseButton.disabled = true;
        
        // PayHere requires backend integration
        if (PAYMENT_CONFIG.payhere.apiEndpoint && PAYMENT_CONFIG.payhere.apiEndpoint !== 'https://your-api-domain.com/api/create-payhere-session') {
            const response = await fetch(PAYMENT_CONFIG.payhere.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 9.99,
                    currency: 'USD',
                    merchantId: PAYMENT_CONFIG.payhere.merchantId,
                    extensionId: chrome.runtime.id
                })
            });
            
            if (response.ok) {
                const { paymentUrl } = await response.json();
                chrome.tabs.create({ url: paymentUrl });
            } else {
                throw new Error('Failed to create PayHere session');
            }
        } else {
            // Direct PayHere link (if you have one)
            chrome.tabs.create({ 
                url: 'https://www.payhere.lk/pay/checkout' // Replace with your PayHere checkout URL
            });
            
            alert('Complete payment on PayHere.\n\nAfter payment, enter the activation code you receive.');
            purchaseButton.textContent = 'Pay with PayHere';
            purchaseButton.disabled = false;
        }
    } catch (error) {
        console.error('PayHere payment error:', error);
        purchaseButton.textContent = 'Pay with PayHere';
        purchaseButton.disabled = false;
        alert('Payment initialization failed. Please try again.');
    }
}

// Verify activation code
async function verifyActivationCode() {
    const code = activationCodeInput.value.trim();
    
    if (!code || code.length < 6) {
        alert('Please enter a valid activation code.');
        return;
    }
    
    activateCodeButton.textContent = 'Verifying...';
    activateCodeButton.disabled = true;
    
    try {
        // Verify with backend
        if (PAYMENT_CONFIG.verificationEndpoint && PAYMENT_CONFIG.verificationEndpoint !== 'https://your-api-domain.com/api/verify-payment') {
            const response = await fetch(PAYMENT_CONFIG.verificationEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    extensionId: chrome.runtime.id,
                    paymentMethod: 'manual'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.valid) {
                    await activatePremium({ transactionId: code });
                    alert('Premium activated successfully! Features are now unlocked.');
                    window.close();
                    return;
                }
            }
        }
        
        // Demo mode: accept codes starting with "DEMO"
        if (code.toUpperCase().startsWith('DEMO')) {
            await activatePremium({ transactionId: code });
            alert('Premium activated successfully! (Demo mode)');
            window.close();
            return;
        }
        
        alert('Invalid activation code. Please check and try again.\n\nIf you made a payment, contact: ' + PAYMENT_CONFIG.manual.email);
        
    } catch (error) {
        console.error('Activation error:', error);
        alert('Failed to verify activation code. Please check your internet connection.');
    } finally {
        activateCodeButton.textContent = 'Activate Premium';
        activateCodeButton.disabled = false;
    }
}

// Main purchase button handler
purchaseButton.addEventListener('click', async () => {
    if (selectedPaymentMethod === 'paypal') {
        await processPayPalPayment();
    } else if (selectedPaymentMethod === 'payhere') {
        await processPayHerePayment();
    }
});

// Activation code button
activateCodeButton.addEventListener('click', verifyActivationCode);

// Enter key on activation input
activationCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyActivationCode();
    }
});

// Check if returning from payment
async function checkReturnFromPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('order_id');
    const paymentId = urlParams.get('payment_id');
    
    if (sessionId || orderId || paymentId) {
        purchaseButton.textContent = 'Verifying payment...';
        purchaseButton.disabled = true;
        
        // Verify payment
        const verified = await verifyPayment(sessionId || orderId || paymentId);
        
        if (verified) {
            await activatePremium({ 
                sessionId: sessionId || orderId || paymentId 
            });
            alert('Payment verified! Premium features are now unlocked.');
            window.close();
        } else {
            purchaseButton.textContent = 'Purchase Premium';
            purchaseButton.disabled = false;
            alert('Payment verification failed. Please contact support if you were charged.');
        }
    }
}

// Verify payment with backend
async function verifyPayment(paymentId) {
    try {
        if (PAYMENT_CONFIG.verificationEndpoint && PAYMENT_CONFIG.verificationEndpoint !== 'https://your-api-domain.com/api/verify-payment') {
            const response = await fetch(PAYMENT_CONFIG.verificationEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentId: paymentId,
                    extensionId: chrome.runtime.id
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.verified === true;
            }
        }
        
        // Demo mode
        return paymentId && paymentId.startsWith('demo_');
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
}

// Initialize
loadTheme();
selectPaymentMethod('paypal'); // Default to PayPal
checkReturnFromPayment();
