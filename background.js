// Initialize stats and badge
async function initializeExtension() {
    console.log("AdXGuard installed and running!");
    
    // Initialize stats
    const stats = await chrome.storage.local.get(['stats']);
    if (!stats.stats) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
        await chrome.storage.local.set({
            stats: {
                monthly: 0,
                lastReset: currentMonth,
                websites: {} // Per-website blocked ads count
            }
        });
    }
    
    // Initialize custom blocked URLs
    const customUrls = await chrome.storage.local.get(['customBlockedUrls']);
    if (customUrls.customBlockedUrls && customUrls.customBlockedUrls.length > 0) {
        await initializeCustomRules(customUrls.customBlockedUrls);
    }
    
    // Initialize ad blocker state
    const settings = await chrome.storage.sync.get(['adBlockerEnabled']);
    if (settings.adBlockerEnabled === undefined) {
        await chrome.storage.sync.set({ adBlockerEnabled: true });
    }
    
    // Update badge
    const isEnabled = settings.adBlockerEnabled !== false;
    chrome.action.setBadgeText({
        text: isEnabled ? '' : 'OFF'
    });
    chrome.action.setBadgeBackgroundColor({
        color: '#ff0000'
    });
    chrome.action.setTitle({
        title: isEnabled ? 'AdXGuard - Ad Blocker Active' : 'AdXGuard - Ad Blocker Disabled'
    });
}

// Initialize custom blocking rules
async function initializeCustomRules(blockedUrls) {
    try {
        const rules = blockedUrls.map((url, index) => {
            const ruleId = 1000 + index;
            let urlFilter = url;
            
            // Normalize URL format
            if (!url.includes('*') && !url.startsWith('http')) {
                urlFilter = `*${url}*`;
            } else if (!url.includes('*')) {
                urlFilter = `${url}*`;
            }
            
            return {
                id: ruleId,
                priority: 1,
                action: { type: 'block' },
                condition: {
                    urlFilter: urlFilter,
                    resourceTypes: [
                        'main_frame',
                        'sub_frame',
                        'script',
                        'image',
                        'xmlhttprequest',
                        'stylesheet',
                        'font',
                        'media',
                        'websocket',
                        'other'
                    ]
                }
            };
        });
        
        if (rules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: rules
            });
            console.log(`AdXGuard: Initialized ${rules.length} custom blocking rules`);
        }
    } catch (error) {
        console.error('AdXGuard: Error initializing custom rules:', error);
    }
}

chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.runtime.onStartup.addListener(initializeExtension);

// Function to update stats when a request is blocked
async function updateBlockedStats(tabId, requestUrl) {
    try {
        // Only track if ad blocker is enabled
        const settings = await chrome.storage.sync.get(['adBlockerEnabled']);
        if (settings.adBlockerEnabled === false) {
            return;
        }
        
        // Get the tab where the request was blocked
        let domain = null;
        try {
            if (tabId) {
                const tab = await chrome.tabs.get(tabId);
                if (tab && tab.url) {
                    const url = new URL(tab.url);
                    domain = url.hostname;
                }
            }
        } catch (e) {
            // Tab might not be available, try to get from request URL
            if (requestUrl) {
                try {
                    const url = new URL(requestUrl);
                    domain = url.hostname;
                } catch (e2) {
                    // Can't determine domain
                }
            }
        }
        
        // Update stats
        const result = await chrome.storage.local.get(['stats']);
        const stats = result.stats || { 
            monthly: 0, 
            lastReset: null,
            websites: {}
        };
        
        // Reset monthly count if it's a new month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
        if (stats.lastReset !== currentMonth) {
            stats.monthly = 0;
            stats.lastReset = currentMonth;
            stats.websites = {}; // Reset per-website stats monthly
        }
        
        // Increment counters
        stats.monthly = (stats.monthly || 0) + 1;
        
        // Increment per-website counter
        if (domain) {
            if (!stats.websites) {
                stats.websites = {};
            }
            stats.websites[domain] = (stats.websites[domain] || 0) + 1;
        } else {
            // If no domain, still count monthly but not per-website
            console.log('AdXGuard: Blocked ad counted (no domain info)');
        }
        
        await chrome.storage.local.set({ stats });
        
        // Notify popup if open
        try {
            chrome.runtime.sendMessage({ action: 'updateStats' }).catch(() => {});
        } catch (e) {
            // Popup might not be open, ignore error
        }
    } catch (error) {
        console.error('Error updating blocked stats:', error);
    }
}

// Track blocked requests using onRuleMatchedDebug
// This API is available when the extension is loaded in developer mode
try {
    if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
        chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async (details) => {
            try {
                console.log('AdXGuard: Blocked request detected', details);
                
                // Try different possible structures of the details object
                let tabId = null;
                let requestUrl = null;
                
                // Structure 1: details.request.tabId and details.request.url
                if (details.request) {
                    tabId = details.request.tabId;
                    requestUrl = details.request.url;
                }
                
                // Structure 2: details.tabId and details.url (direct)
                if (!tabId && details.tabId) {
                    tabId = details.tabId;
                }
                if (!requestUrl && details.url) {
                    requestUrl = details.url;
                }
                
                // Structure 3: Check rule for URL info
                if (!requestUrl && details.rule && details.rule.condition) {
                    // Can't get URL from rule, but we can still track
                }
                
                if (tabId || requestUrl) {
                    await updateBlockedStats(tabId, requestUrl);
                } else {
                    // Even without tabId/url, we can still count the block
                    console.log('AdXGuard: Blocked request without tabId/url, counting anyway');
                    await updateBlockedStats(null, null);
                }
            } catch (error) {
                console.error('AdXGuard: Error processing blocked request:', error);
            }
        });
        console.log('AdXGuard: Blocked request tracking enabled via onRuleMatchedDebug');
    } else {
        console.warn('AdXGuard: onRuleMatchedDebug API not available.');
        console.warn('AdXGuard: Using alternative tracking method via content script.');
    }
} catch (error) {
    console.warn('AdXGuard: Could not set up onRuleMatchedDebug tracking:', error);
}

// Test function to manually increment stats (for testing)
// You can call this from the console: chrome.runtime.sendMessage({action: 'testBlock'})

// Initialize domain stats when pages load
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
            const url = new URL(tab.url);
            const domain = url.hostname;
            const result = await chrome.storage.local.get(['stats']);
            const stats = result.stats || { 
                monthly: 0, 
                lastReset: null,
                websites: {}
            };
            
            if (!stats.websites) {
                stats.websites = {};
            }
            if (stats.websites[domain] === undefined) {
                stats.websites[domain] = 0;
                await chrome.storage.local.set({ stats });
            }
        } catch (e) {
            // Ignore errors for invalid URLs
        }
    }
});

// Alternative: Track using webRequest API if available
// For now, we'll simulate stats updates - in production, you'd want to use
// the actual blocked request events

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleAdBlocker') {
        const enabled = message.enabled;
        
        // Note: Static rulesets can't be easily toggled in Manifest V3
        // We'll track the state and update the badge
        // For full functionality, you'd need to use dynamic rules
        
        // Update badge
        chrome.action.setBadgeText({
            text: enabled ? '' : 'OFF'
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#ff0000'
        });
        
        // Update icon title
        chrome.action.setTitle({
            title: enabled ? 'AdXGuard - Ad Blocker Active' : 'AdXGuard - Ad Blocker Disabled'
        });
        
        sendResponse({ success: true });
        return true; // Keep channel open for async response
    }
    
    // Handle page loaded messages from content script
    if (message.action === 'pageLoaded') {
        const domain = message.domain;
        if (domain) {
            chrome.storage.local.get(['stats']).then(result => {
                const stats = result.stats || { 
                    monthly: 0, 
                    lastReset: null,
                    websites: {}
                };
                
                if (!stats.websites) {
                    stats.websites = {};
                }
                if (stats.websites[domain] === undefined) {
                    stats.websites[domain] = 0;
                    chrome.storage.local.set({ stats });
                }
            });
        }
        sendResponse({ success: true });
        return true;
    }
    
    // Handle ad blocked messages from content script (alternative tracking method)
    if (message.action === 'adBlocked') {
        const count = message.count || 1;
        const domain = message.domain;
        const url = message.url;
        
        // Update stats
        chrome.storage.local.get(['stats']).then(result => {
            const stats = result.stats || { 
                monthly: 0, 
                lastReset: null,
                websites: {}
            };
            
            // Reset monthly count if it's a new month
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
            if (stats.lastReset !== currentMonth) {
                stats.monthly = 0;
                stats.lastReset = currentMonth;
                stats.websites = {};
            }
            
            // Increment counters
            stats.monthly = (stats.monthly || 0) + count;
            
            // Increment per-website counter
            if (domain) {
                if (!stats.websites) {
                    stats.websites = {};
                }
                stats.websites[domain] = (stats.websites[domain] || 0) + count;
            }
            
            chrome.storage.local.set({ stats });
            
            // Notify popup if open
            chrome.runtime.sendMessage({ action: 'updateStats' }).catch(() => {});
        });
        
        sendResponse({ success: true });
        return true;
    }
    
    // Test function to manually increment stats
    if (message.action === 'testBlock') {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs[0]) {
                const tab = tabs[0];
                const url = new URL(tab.url);
                const domain = url.hostname;
                await updateBlockedStats(tab.id, tab.url);
                sendResponse({ success: true, message: 'Test block counted' });
            } else {
                sendResponse({ success: false, message: 'No active tab' });
            }
        });
        return true;
    }
    
    // Handle custom rules update from custom-block page
    if (message.action === 'updateCustomRules') {
        const blockedUrls = message.blockedUrls || [];
        initializeCustomRules(blockedUrls).then(() => {
            sendResponse({ success: true });
        }).catch(error => {
            console.error('Error updating custom rules:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    
    // Handle VPN connection events
    if (message.action === 'vpnConnected') {
        const server = message.server;
        const proxyConfig = message.proxyConfig;
        
        console.log('AdXGuard: VPN connecting to', server);
        console.log('AdXGuard: Proxy config:', proxyConfig);
        
        // Keep the service worker alive by setting up a response handler immediately
        // This prevents the message port from closing
        const respond = (success, error = null) => {
            try {
                sendResponse({ 
                    success: success, 
                    error: error,
                    message: success ? 'Connected to ' + proxyConfig.host + ':' + proxyConfig.port : error
                });
            } catch (e) {
                console.error('AdXGuard: Error sending response:', e);
            }
        };
        
        try {
            if (!proxyConfig) {
                console.warn('AdXGuard: No proxy config provided');
                respond(false, 'No proxy configuration provided');
                return true;
            }
            
            if (!proxyConfig.host || !proxyConfig.port) {
                console.warn('AdXGuard: Invalid proxy config - missing host or port');
                respond(false, 'Invalid proxy configuration - missing host or port');
                return true;
            }
            
            // Validate port
            const port = parseInt(proxyConfig.port);
            if (isNaN(port) || port <= 0 || port > 65535) {
                console.warn('AdXGuard: Invalid proxy port:', proxyConfig.port);
                respond(false, 'Invalid proxy port');
                return true;
            }
            
            // Set up proxy using Chrome proxy API
            const config = {
                mode: 'fixed_servers',
                rules: {
                    singleProxy: {
                        scheme: proxyConfig.scheme || 'http',
                        host: proxyConfig.host.trim(),
                        port: port
                    },
                    bypassList: ['localhost', '127.0.0.1', '<local>']
                }
            };
            
            console.log('AdXGuard: Setting proxy config:', config);
            
            // Check if proxy API is available
            if (!chrome.proxy || !chrome.proxy.settings) {
                console.error('AdXGuard: Proxy API not available');
                respond(false, 'Proxy API not available. Make sure the extension has proxy permission.');
                return true;
            }
            
            // Set proxy with immediate response handling
            chrome.proxy.settings.set(
                { value: config, scope: 'regular' },
                () => {
                    if (chrome.runtime.lastError) {
                        const errorMsg = chrome.runtime.lastError.message || 'Failed to set proxy';
                        console.error('AdXGuard: Proxy setup error:', chrome.runtime.lastError);
                        respond(false, errorMsg);
                    } else {
                        console.log('AdXGuard: VPN proxy connected successfully to', proxyConfig.host + ':' + port);
                        respond(true);
                    }
                }
            );
        } catch (error) {
            console.error('AdXGuard: Error setting up VPN proxy:', error);
            respond(false, error.message || 'Unknown error occurred');
        }
        return true; // Keep channel open for async response
    }
    
    if (message.action === 'vpnDisconnected') {
        console.log('AdXGuard: VPN disconnecting');
        
        try {
            // Clear proxy settings
            chrome.proxy.settings.clear(
                { scope: 'regular' },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error('AdXGuard: Proxy clear error:', chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        console.log('AdXGuard: VPN proxy disconnected successfully');
                        sendResponse({ success: true });
                    }
                }
            );
        } catch (error) {
            console.error('AdXGuard: Error clearing VPN proxy:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }
    
    // Handle payment verification
    if (message.action === 'verifyPayment') {
        const sessionId = message.sessionId;
        
        // Verify payment with backend API
        verifyPaymentWithBackend(sessionId).then(async (verified) => {
            if (verified) {
                // Activate premium
                await chrome.storage.sync.set({
                    isPremium: true,
                    premiumPurchaseDate: new Date().toISOString(),
                    paymentSessionId: sessionId,
                    paymentVerified: true
                });
                
                sendResponse({ success: true, message: 'Premium activated' });
            } else {
                sendResponse({ success: false, error: 'Payment verification failed' });
            }
        }).catch((error) => {
            console.error('Payment verification error:', error);
            sendResponse({ success: false, error: error.message });
        });
        
        return true; // Keep channel open for async response
    }
});

// Verify payment with backend API
async function verifyPaymentWithBackend(sessionId) {
    try {
        // Replace with your actual backend API endpoint
        const apiEndpoint = 'https://your-api-domain.com/api/verify-payment';
        
        // For demo/testing: allow if sessionId starts with 'demo_'
        if (sessionId && sessionId.startsWith('demo_')) {
            return true;
        }
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: sessionId,
                extensionId: chrome.runtime.id
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.verified === true;
        }
        return false;
    } catch (error) {
        console.error('Error verifying payment:', error);
        return false;
    }
}

  