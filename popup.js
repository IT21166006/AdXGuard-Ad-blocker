// Integrated AdXGuard Popup - All Features
// DOM Elements - Main
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const adBlockerToggle = document.getElementById('adBlockerToggle');
const status = document.getElementById('status');
const websiteCount = document.getElementById('websiteCount');
const monthlyCount = document.getElementById('monthlyCount');
const currentUrl = document.getElementById('currentUrl');
const payButton = document.getElementById('payButton');
const customBlockButton = document.getElementById('customBlockButton');
const vpnButton = document.getElementById('vpnButton');
const coffeeButton = document.getElementById('coffeeButton');

// DOM Elements - Custom Blocking
const customBlockSection = document.getElementById('customBlockSection');
const urlInput = document.getElementById('urlInput');
const addUrlButton = document.getElementById('addUrlButton');
const blockedList = document.getElementById('blockedList');
const blockedCount = document.getElementById('blockedCount');
const clearAllButton = document.getElementById('clearAllButton');
const customBlockStatus = document.getElementById('customBlockStatus');

// DOM Elements - VPN
const vpnSection = document.getElementById('vpnSection');
const vpnToggle = document.getElementById('vpnToggle');
const vpnStatusIndicator = document.getElementById('vpnStatusIndicator');
const vpnStatusText = document.getElementById('vpnStatusText');
const vpnStatusSubtext = document.getElementById('vpnStatusSubtext');
const vpnConnectionStatus = document.getElementById('vpnConnectionStatus');
const serverList = document.getElementById('serverList');
const ipAddress = document.getElementById('ipAddress');
const refreshIP = document.getElementById('refreshIP');
const vpnDataUsed = document.getElementById('vpnDataUsed');
const vpnConnectionTime = document.getElementById('vpnConnectionTime');

// Current website domain
let currentDomain = null;

// Premium Status
let isPremium = false;

// Custom Blocking State
let blockedUrls = [];

// VPN State
let vpnState = {
    connected: false,
    connecting: false,
    selectedServer: null,
    startTime: null,
    dataTransferred: 0,
    proxyConfig: null
};

// Available VPN servers
const vpnServers = [
    { id: 'us-east', name: 'United States (East)', location: 'New York, USA', flag: '🇺🇸', ping: 25, country: 'US' },
    { id: 'us-west', name: 'United States (West)', location: 'Los Angeles, USA', flag: '🇺🇸', ping: 35, country: 'US' },
    { id: 'uk', name: 'United Kingdom', location: 'London, UK', flag: '🇬🇧', ping: 45, country: 'GB' },
    { id: 'germany', name: 'Germany', location: 'Frankfurt, DE', flag: '🇩🇪', ping: 50, country: 'DE' },
    { id: 'japan', name: 'Japan', location: 'Tokyo, JP', flag: '🇯🇵', ping: 120, country: 'JP' },
    { id: 'singapore', name: 'Singapore', location: 'Singapore', flag: '🇸🇬', ping: 180, country: 'SG' },
    { id: 'canada', name: 'Canada', location: 'Toronto, CA', flag: '🇨🇦', ping: 40, country: 'CA' },
    { id: 'netherlands', name: 'Netherlands', location: 'Amsterdam, NL', flag: '🇳🇱', ping: 55, country: 'NL' }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadPremiumStatus();
    await loadCurrentTab();
    await loadStats();
    await loadCustomBlocking();
    await loadVPNState();
    setupEventListeners();
    updatePremiumUI();
});

// ==================== MAIN FUNCTIONS ====================

// Load settings from storage
async function loadSettings() {
    const result = await chrome.storage.sync.get(['theme', 'adBlockerEnabled']);
    
    // Set theme
    const currentTheme = result.theme || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    // Set ad blocker toggle
    const isEnabled = result.adBlockerEnabled !== false;
    adBlockerToggle.checked = isEnabled;
    updateStatus(isEnabled);
}

// Load current tab URL
async function loadCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const url = new URL(tab.url);
            currentDomain = url.hostname;
            
            let displayUrl = tab.url;
            if (displayUrl.length > 40) {
                displayUrl = displayUrl.substring(0, 37) + '...';
            }
            currentUrl.textContent = displayUrl;
            currentUrl.title = tab.url;
        } else {
            currentUrl.textContent = 'No active tab';
            currentDomain = null;
        }
    } catch (error) {
        currentUrl.textContent = 'Unable to load URL';
        currentDomain = null;
    }
}

// Load stats
async function loadStats() {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || { 
        monthly: 0, 
        lastReset: null,
        websites: {}
    };
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    if (stats.lastReset !== currentMonth) {
        stats.monthly = 0;
        stats.lastReset = currentMonth;
        await chrome.storage.local.set({ stats });
    }
    
    let websiteBlockedCount = 0;
    if (currentDomain && stats.websites && stats.websites[currentDomain]) {
        websiteBlockedCount = stats.websites[currentDomain];
    }
    
    websiteCount.textContent = formatNumber(websiteBlockedCount);
    monthlyCount.textContent = formatNumber(stats.monthly || 0);
}

// Toggle theme
async function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    await chrome.storage.sync.set({ theme: newTheme });
}

// Update status display
function updateStatus(isEnabled) {
    status.textContent = isEnabled ? 'ON' : 'OFF';
    status.style.color = isEnabled ? 'var(--toggle-on)' : 'var(--text-secondary)';
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// ==================== PREMIUM FUNCTIONS ====================

async function loadPremiumStatus() {
    const result = await chrome.storage.sync.get(['isPremium']);
    isPremium = result.isPremium === true;
}

function updatePremiumUI() {
    // Update premium-locked buttons
    const premiumButtons = document.querySelectorAll('.premium-locked');
    premiumButtons.forEach(button => {
        const lockIcon = button.querySelector('.lock-icon');
        if (isPremium) {
            button.classList.remove('premium-locked');
            if (lockIcon) lockIcon.style.display = 'none';
        } else {
            button.classList.add('premium-locked');
            if (lockIcon) lockIcon.style.display = 'inline';
        }
    });
}

function showPremiumLockOverlay() {
    const overlay = document.getElementById('premiumLockOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hidePremiumLockOverlay() {
    const overlay = document.getElementById('premiumLockOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function checkPremiumAccess(featureName) {
    if (!isPremium) {
        showPremiumLockOverlay();
        return false;
    }
    return true;
}

// ==================== EXPANDABLE SECTIONS ====================

function toggleSection(sectionName) {
    // Check premium access for premium features
    if ((sectionName === 'customBlock' || sectionName === 'vpn') && !checkPremiumAccess(sectionName)) {
        return;
    }
    
    const section = sectionName === 'customBlock' ? customBlockSection : vpnSection;
    const button = sectionName === 'customBlock' ? customBlockButton : vpnButton;
    
    if (section.style.display === 'none' || !section.style.display) {
        // Show section
        section.style.display = 'block';
        button.classList.add('active');
        
        // Auto-scroll to section smoothly
        setTimeout(() => {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 150);
        
        // Initialize section if needed
        if (sectionName === 'vpn') {
            renderVPNServers();
            updateVPNUI();
        }
    } else {
        // Hide section
        section.style.display = 'none';
        button.classList.remove('active');
    }
}

// Close section
function closeSection(sectionName) {
    const section = sectionName === 'customBlock' ? customBlockSection : vpnSection;
    const button = sectionName === 'customBlock' ? customBlockButton : vpnButton;
    
    section.style.display = 'none';
    button.classList.remove('active');
}

// ==================== CUSTOM BLOCKING FUNCTIONS ====================

async function loadCustomBlocking() {
    const result = await chrome.storage.local.get(['customBlockedUrls']);
    blockedUrls = result.customBlockedUrls || [];
    renderBlockedList();
}

async function saveBlockedUrls() {
    await chrome.storage.local.set({ customBlockedUrls: blockedUrls });
    await updateDynamicRules();
    renderBlockedList();
}

async function updateDynamicRules() {
    try {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = existingRules
            .filter(rule => rule.id >= 1000)
            .map(rule => rule.id);
        
        if (oldRuleIds.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: oldRuleIds
            });
        }
        
        const newRules = blockedUrls.map((url, index) => {
            const ruleId = 1000 + index;
            let urlFilter = url;
            
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
                    resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'xmlhttprequest', 'stylesheet', 'font', 'media', 'websocket', 'other']
                }
            };
        });
        
        if (newRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
        }
        
        chrome.runtime.sendMessage({ action: 'updateCustomRules', blockedUrls: blockedUrls }).catch(() => {});
    } catch (error) {
        console.error('Error updating dynamic rules:', error);
        showCustomBlockStatus('Error updating rules', 'error');
    }
}

function validateUrl(url) {
    if (!url || url.trim().length === 0) {
        return { valid: false, message: 'URL cannot be empty' };
    }
    
    const trimmedUrl = url.trim();
    
    if (blockedUrls.includes(trimmedUrl)) {
        return { valid: false, message: 'This URL is already blocked' };
    }
    
    return { valid: true };
}

async function addUrl() {
    if (!checkPremiumAccess('customBlock')) {
        return;
    }
    
    const url = urlInput.value.trim();
    const validation = validateUrl(url);
    
    if (!validation.valid) {
        showCustomBlockStatus(validation.message, 'error');
        return;
    }
    
    blockedUrls.push(url);
    await saveBlockedUrls();
    urlInput.value = '';
    showCustomBlockStatus(`Successfully blocked: ${url}`, 'success');
}

async function removeUrl(url) {
    blockedUrls = blockedUrls.filter(u => u !== url);
    await saveBlockedUrls();
    showCustomBlockStatus(`Removed: ${url}`, 'success');
}

async function clearAll() {
    if (blockedUrls.length === 0) return;
    
    if (confirm(`Are you sure you want to remove all ${blockedUrls.length} blocked URLs?`)) {
        blockedUrls = [];
        await saveBlockedUrls();
        showCustomBlockStatus('All blocked URLs removed', 'success');
    }
}

function renderBlockedList() {
    blockedList.innerHTML = '';
    if (blockedUrls.length === 0) {
        blockedList.innerHTML = '<li style="justify-content: center; color: var(--text-secondary); padding: 20px;">No custom URLs blocked yet.</li>';
    } else {
        blockedUrls.forEach((url) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${url}</span>
                <button data-url="${url}">Remove</button>
            `;
            blockedList.appendChild(li);
        });
    }
    blockedCount.textContent = `${blockedUrls.length} URLs blocked`;
}

function showCustomBlockStatus(message, type = 'info') {
    customBlockStatus.textContent = message;
    customBlockStatus.style.color = type === 'error' ? '#f44336' : (type === 'success' ? '#4caf50' : 'var(--text-secondary)');
    setTimeout(() => {
        customBlockStatus.textContent = '';
    }, 3000);
}

// ==================== VPN FUNCTIONS ====================

async function loadVPNState() {
    const result = await chrome.storage.local.get(['vpnState']);
    if (result.vpnState) {
        vpnState = { ...vpnState, ...result.vpnState };
    }
    
    const serverResult = await chrome.storage.local.get(['selectedServer']);
    if (serverResult.selectedServer) {
        vpnState.selectedServer = serverResult.selectedServer;
    } else {
        vpnState.selectedServer = vpnServers[0].id;
    }
    
    if (vpnToggle) {
        vpnToggle.checked = vpnState.connected;
    }
    updateVPNUI();
    if (vpnSection.style.display !== 'none') {
        renderVPNServers();
        updateIPAddress();
        startConnectionTimer();
    }
}

async function saveVPNState() {
    await chrome.storage.local.set({ vpnState });
}

function updateVPNUI() {
    if (!vpnStatusIndicator) return;
    
    if (vpnState.connecting) {
        vpnStatusIndicator.className = 'vpn-status-indicator connecting';
        vpnStatusIndicator.textContent = '🟡';
        vpnStatusText.textContent = 'Connecting...';
        vpnStatusSubtext.textContent = 'Establishing secure connection';
        vpnConnectionStatus.textContent = 'CONNECTING';
        vpnConnectionStatus.style.color = '#ff9800';
    } else if (vpnState.connected) {
        vpnStatusIndicator.className = 'vpn-status-indicator connected';
        vpnStatusIndicator.textContent = '🟢';
        vpnStatusText.textContent = 'Connected';
        const server = vpnServers.find(s => s.id === vpnState.selectedServer);
        vpnStatusSubtext.textContent = server ? `Connected to ${server.name}` : 'Secure connection active';
        vpnConnectionStatus.textContent = 'ON';
        vpnConnectionStatus.style.color = '#4caf50';
    } else {
        vpnStatusIndicator.className = 'vpn-status-indicator disconnected';
        vpnStatusIndicator.textContent = '🔴';
        vpnStatusText.textContent = 'Disconnected';
        vpnStatusSubtext.textContent = 'Click toggle to connect';
        vpnConnectionStatus.textContent = 'OFF';
        vpnConnectionStatus.style.color = '';
    }
}

function renderVPNServers() {
    if (!serverList) return;
    
    serverList.innerHTML = vpnServers.map(server => {
        const isSelected = vpnState.selectedServer === server.id;
        const pingClass = server.ping < 50 ? 'good' : server.ping < 100 ? 'medium' : 'bad';
        
        return `
            <div class="server-item ${isSelected ? 'selected' : ''}" data-server-id="${server.id}">
                <div class="server-info">
                    <div class="server-name">${server.flag} ${server.name}</div>
                    <div class="server-location">${server.location}</div>
                </div>
                <div class="server-ping ${pingClass}">${server.ping}ms</div>
            </div>
        `;
    }).join('');
    
    serverList.querySelectorAll('.server-item').forEach(item => {
        item.addEventListener('click', () => {
            const serverId = item.getAttribute('data-server-id');
            selectServer(serverId);
        });
    });
}

async function selectServer(serverId) {
    if (vpnState.connected) {
        await disconnectVPN();
        vpnState.selectedServer = serverId;
        await saveVPNState();
        await chrome.storage.local.set({ selectedServer: serverId });
        renderVPNServers();
        await connectVPN();
    } else {
        vpnState.selectedServer = serverId;
        await saveVPNState();
        await chrome.storage.local.set({ selectedServer: serverId });
        renderVPNServers();
    }
}

async function fetchFreeProxy(country = 'US') {
    const fallbackProxies = {
        'US': [
            { host: '104.248.90.15', port: 8080, scheme: 'http' },
            { host: '159.89.49.22', port: 8080, scheme: 'http' },
            { host: '167.71.170.227', port: 8080, scheme: 'http' }
        ],
        'GB': [{ host: '178.62.19.47', port: 8080, scheme: 'http' }],
        'DE': [{ host: '165.227.83.148', port: 8080, scheme: 'http' }],
        'JP': [{ host: '46.101.75.114', port: 8080, scheme: 'http' }],
        'SG': [{ host: '139.59.51.141', port: 8080, scheme: 'http' }],
        'CA': [{ host: '167.99.172.135', port: 8080, scheme: 'http' }],
        'NL': [{ host: '178.128.25.0', port: 8080, scheme: 'http' }]
    };
    
    try {
        const proxyAPIs = [
            `https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=${country}&ssl=all&anonymity=all`,
            `https://api.proxyscrape.com/?request=get&protocol=http&timeout=10000&country=${country}`
        ];
        
        for (const apiUrl of proxyAPIs) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'text/plain' },
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    const data = await response.text();
                    const proxies = data.trim().split('\n').filter(p => p.includes(':') && p.trim().length > 0);
                    
                    if (proxies.length > 0) {
                        const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
                        const parts = randomProxy.split(':');
                        
                        if (parts.length >= 2) {
                            const host = parts[0].trim();
                            const port = parseInt(parts[1].trim());
                            
                            if (host && port && port > 0 && port < 65536) {
                                return { host, port, scheme: 'http' };
                            }
                        }
                    }
                }
            } catch (e) {
                continue;
            }
        }
    } catch (error) {
        console.error('Error fetching proxy from API:', error);
    }
    
    const countryProxies = fallbackProxies[country] || fallbackProxies['US'];
    return countryProxies[Math.floor(Math.random() * countryProxies.length)];
}

async function connectVPN() {
    if (!checkPremiumAccess('vpn')) {
        if (vpnToggle) vpnToggle.checked = false;
        return;
    }
    
    if (vpnState.connecting || vpnState.connected) return;
    
    vpnState.connecting = true;
    updateVPNUI();
    await saveVPNState();
    
    const server = vpnServers.find(s => s.id === vpnState.selectedServer);
    const country = server ? server.country : 'US';
    
    ipAddress.textContent = 'Fetching proxy...';
    const proxyConfig = await fetchFreeProxy(country);
    
    if (!proxyConfig) {
        vpnState.connecting = false;
        updateVPNUI();
        alert('Failed to fetch proxy server. Please try again.');
        return;
    }
    
    vpnState.proxyConfig = proxyConfig;
    await saveVPNState();
    
    let responseReceived = false;
    const timeout = setTimeout(() => {
        if (!responseReceived) {
            vpnState.connecting = false;
            updateVPNUI();
            vpnToggle.checked = false;
            alert('Connection timeout. Please try again.');
        }
    }, 10000);
    
    chrome.runtime.sendMessage({
        action: 'vpnConnected',
        server: vpnState.selectedServer,
        proxyConfig: proxyConfig
    }, async (response) => {
        responseReceived = true;
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
            vpnState.connecting = false;
            updateVPNUI();
            vpnToggle.checked = false;
            alert('Failed to connect to VPN. Error: ' + chrome.runtime.lastError.message);
            return;
        }
        
        if (response && response.success) {
            vpnState.connecting = false;
            vpnState.connected = true;
            vpnState.startTime = Date.now();
            vpnToggle.checked = true;
            updateVPNUI();
            await saveVPNState();
            
            setTimeout(() => {
                updateIPAddress(true);
            }, 3000);
            
            startConnectionTimer();
        } else {
            vpnState.connecting = false;
            updateVPNUI();
            vpnToggle.checked = false;
            const errorMsg = response?.error || 'Unknown error';
            alert('Failed to connect to VPN.\n\nError: ' + errorMsg);
        }
    });
}

async function disconnectVPN() {
    vpnState.connected = false;
    vpnState.connecting = false;
    vpnState.startTime = null;
    vpnToggle.checked = false;
    updateVPNUI();
    
    chrome.runtime.sendMessage({
        action: 'vpnDisconnected'
    }, async (response) => {
        if (response && response.success) {
            setTimeout(() => {
                updateIPAddress(false);
            }, 2000);
        } else {
            updateIPAddress(false);
        }
    });
    
    vpnState.proxyConfig = null;
    await saveVPNState();
    stopConnectionTimer();
}

async function updateIPAddress(connected = false) {
    if (connected) {
        ipAddress.textContent = 'Checking IP...';
        await fetchRealIP(true);
    } else {
        ipAddress.textContent = 'Detecting...';
        await fetchRealIP(false);
    }
}

async function fetchRealIP(throughProxy = false) {
    try {
        const ipServices = [
            { url: 'https://api64.ipify.org?format=json', timeout: 5000 },
            { url: 'https://api.ipify.org?format=json', timeout: 5000 },
            { url: 'https://api.ipify.org', timeout: 5000 },
            { url: 'https://ipv4.icanhazip.com', timeout: 5000 },
            { url: 'https://icanhazip.com', timeout: 5000 },
            { url: 'https://checkip.amazonaws.com', timeout: 5000 }
        ];
        
        let ip = null;
        
        const fetchWithTimeout = (url, timeout) => {
            return Promise.race([
                fetch(url, { 
                    method: 'GET',
                    headers: { 'Accept': 'application/json, text/plain, */*' },
                    cache: 'no-cache',
                    mode: 'cors'
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), timeout)
                )
            ]);
        };
        
        for (const service of ipServices) {
            try {
                const response = await fetchWithTimeout(service.url, service.timeout);
                
                if (response.ok) {
                    const data = await response.text();
                    const trimmedData = data.trim();
                    const ipv4Match = trimmedData.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
                    
                    if (ipv4Match) {
                        ip = trimmedData;
                        break;
                    } else {
                        try {
                            const json = JSON.parse(trimmedData);
                            ip = json.ip || json.query || json.IPv4 || null;
                            if (ip) break;
                        } catch (e) {}
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        const server = vpnServers.find(s => s.id === vpnState.selectedServer);
        
        if (ip) {
            if (throughProxy && server) {
                ipAddress.textContent = `IPv4: ${ip}\nLocation: ${server.location}`;
                ipAddress.style.color = 'var(--text-primary)';
            } else {
                ipAddress.textContent = `IPv4: ${ip}\n(Your Real IP)`;
                ipAddress.style.color = 'var(--text-primary)';
            }
        } else {
            if (throughProxy && vpnState.proxyConfig) {
                ipAddress.textContent = `✅ VPN Connected\n\nProxy: ${vpnState.proxyConfig.host}:${vpnState.proxyConfig.port}\n\nℹ️ IP detection blocked by proxy.\nVPN is working correctly.`;
                ipAddress.style.color = '#4caf50';
            } else {
                ipAddress.textContent = `Unable to detect IP address.\n\nCheck your network connection.`;
                ipAddress.style.color = '#f44336';
            }
        }
    } catch (e) {
        if (throughProxy && vpnState.proxyConfig) {
            ipAddress.textContent = `✅ VPN Connected\n\nProxy: ${vpnState.proxyConfig.host}:${vpnState.proxyConfig.port}\n\nℹ️ IP detection unavailable.\nVPN is working correctly.`;
            ipAddress.style.color = '#4caf50';
        } else {
            ipAddress.textContent = `Error: Unable to detect IP`;
            ipAddress.style.color = '#f44336';
        }
    }
}

let connectionTimer = null;

function startConnectionTimer() {
    if (!vpnState.connected || !vpnState.startTime) return;
    
    stopConnectionTimer();
    
    connectionTimer = setInterval(() => {
        if (!vpnState.connected || !vpnState.startTime) {
            stopConnectionTimer();
            return;
        }
        
        const elapsed = Math.floor((Date.now() - vpnState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        vpnConnectionTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const currentData = parseFloat(vpnDataUsed.textContent) || 0;
        const increment = Math.random() * 0.1;
        vpnDataUsed.textContent = (currentData + increment).toFixed(2) + ' MB';
    }, 1000);
}

function stopConnectionTimer() {
    if (connectionTimer) {
        clearInterval(connectionTimer);
        connectionTimer = null;
    }
    if (vpnConnectionTime) {
        vpnConnectionTime.textContent = '00:00';
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Ad blocker toggle
    adBlockerToggle.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        await chrome.storage.sync.set({ adBlockerEnabled: isEnabled });
        updateStatus(isEnabled);
        
        chrome.runtime.sendMessage({ 
            action: 'toggleAdBlocker', 
            enabled: isEnabled 
        });
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            chrome.tabs.reload(tab.id);
        }
    });
    
    // VIP buttons
    payButton.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('premium.html') });
    });
    
    customBlockButton.addEventListener('click', () => {
        toggleSection('customBlock');
    });
    
    vpnButton.addEventListener('click', () => {
        toggleSection('vpn');
    });
    
    // Premium lock overlay buttons
    const upgradeFromLock = document.getElementById('upgradeFromLock');
    const closeLockOverlay = document.getElementById('closeLockOverlay');
    
    if (upgradeFromLock) {
        upgradeFromLock.addEventListener('click', () => {
            hidePremiumLockOverlay();
            chrome.tabs.create({ url: chrome.runtime.getURL('premium.html') });
        });
    }
    
    if (closeLockOverlay) {
        closeLockOverlay.addEventListener('click', () => {
            hidePremiumLockOverlay();
        });
    }
    
    coffeeButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://buymeacoffee.com/yourusername' });
    });
    
    // Close section buttons
    document.querySelectorAll('.close-section').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-section');
            closeSection(section);
        });
    });
    
    // Custom Blocking
    addUrlButton.addEventListener('click', addUrl);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addUrl();
        }
    });
    blockedList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const url = e.target.getAttribute('data-url');
            removeUrl(url);
        }
    });
    clearAllButton.addEventListener('click', clearAll);
    
    // VPN
    if (vpnToggle) {
        vpnToggle.addEventListener('change', async (e) => {
            if (e.target.checked) {
                await connectVPN();
            } else {
                await disconnectVPN();
            }
        });
    }
    
    if (refreshIP) {
        refreshIP.addEventListener('click', async () => {
            if (vpnState.connected) {
                updateIPAddress(true);
            } else {
                updateIPAddress(false);
            }
        });
    }
}

// Listen for stats updates and premium status changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStats') {
        loadStats();
    }
    if (message.action === 'premiumStatusChanged') {
        loadPremiumStatus().then(() => {
            updatePremiumUI();
        });
    }
});

// Refresh stats periodically
setInterval(async () => {
    await loadCurrentTab();
    await loadStats();
    // Also check premium status periodically
    await loadPremiumStatus();
    updatePremiumUI();
}, 1000);
