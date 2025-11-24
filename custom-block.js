// Custom URL Blocking Management

const urlInput = document.getElementById('urlInput');
const addButton = document.getElementById('addButton');
const blockedList = document.getElementById('blockedList');
const blockedCount = document.getElementById('blockedCount');
const clearAllButton = document.getElementById('clearAllButton');
const statusMessage = document.getElementById('statusMessage');

let blockedUrls = [];
let nextRuleId = 1000; // Start custom rules from 1000 to avoid conflicts

// Load theme
async function loadTheme() {
    const result = await chrome.storage.sync.get(['theme']);
    const theme = result.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

// Load blocked URLs
async function loadBlockedUrls() {
    const result = await chrome.storage.local.get(['customBlockedUrls', 'nextCustomRuleId']);
    blockedUrls = result.customBlockedUrls || [];
    nextRuleId = result.nextCustomRuleId || 1000;
    renderBlockedList();
}

// Save blocked URLs
async function saveBlockedUrls() {
    await chrome.storage.local.set({ 
        customBlockedUrls: blockedUrls,
        nextCustomRuleId: nextRuleId
    });
    await updateDynamicRules();
    renderBlockedList();
}

// Update dynamic rules in Chrome
async function updateDynamicRules() {
    try {
        // Get existing dynamic rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        
        // Remove old custom rules (IDs >= 1000)
        const oldRuleIds = existingRules
            .filter(rule => rule.id >= 1000)
            .map(rule => rule.id);
        
        if (oldRuleIds.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: oldRuleIds
            });
        }
        
        // Create new rules from blocked URLs
        const newRules = blockedUrls.map((url, index) => {
            const ruleId = 1000 + index;
            let urlFilter = url;
            
            // Normalize URL format
            if (!url.includes('*') && !url.startsWith('http')) {
                // Domain format - add wildcards
                urlFilter = `*${url}*`;
            } else if (!url.includes('*')) {
                // Full URL - add wildcard at end
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
        
        // Add new rules
        if (newRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
        }
        
        console.log(`AdXGuard: Updated ${newRules.length} custom blocking rules`);
    } catch (error) {
        console.error('AdXGuard: Error updating dynamic rules:', error);
        showStatus('Error updating blocking rules', 'error');
    }
}

// Validate URL
function validateUrl(url) {
    if (!url || url.trim().length === 0) {
        return { valid: false, message: 'URL cannot be empty' };
    }
    
    const trimmedUrl = url.trim();
    
    // Check if already blocked
    if (blockedUrls.includes(trimmedUrl)) {
        return { valid: false, message: 'This URL is already blocked' };
    }
    
    // Basic validation
    if (trimmedUrl.length > 500) {
        return { valid: false, message: 'URL is too long' };
    }
    
    // Check if it's a valid format (domain or URL)
    try {
        // Try to parse as URL
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            new URL(trimmedUrl);
        } else {
            // Domain format - check basic structure
            if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(trimmedUrl) && 
                !trimmedUrl.includes('*')) {
                return { valid: false, message: 'Invalid URL or domain format' };
            }
        }
    } catch (e) {
        // If it's not a full URL, check if it's a valid domain pattern
        if (!trimmedUrl.includes('.') && !trimmedUrl.includes('*')) {
            return { valid: false, message: 'Invalid URL or domain format' };
        }
    }
    
    return { valid: true };
}

// Add URL to block
async function addUrl() {
    const url = urlInput.value.trim();
    const validation = validateUrl(url);
    
    if (!validation.valid) {
        showStatus(validation.message, 'error');
        return;
    }
    
    blockedUrls.push(url);
    await saveBlockedUrls();
    urlInput.value = '';
    showStatus(`Successfully blocked: ${url}`, 'success');
}

// Remove URL from block list
async function removeUrl(url) {
    blockedUrls = blockedUrls.filter(u => u !== url);
    await saveBlockedUrls();
    showStatus(`Removed: ${url}`, 'success');
}

// Clear all blocked URLs
async function clearAll() {
    if (blockedUrls.length === 0) return;
    
    if (confirm(`Are you sure you want to remove all ${blockedUrls.length} blocked URLs?`)) {
        blockedUrls = [];
        await saveBlockedUrls();
        showStatus('All blocked URLs removed', 'success');
    }
}

// Render blocked list
function renderBlockedList() {
    blockedCount.textContent = blockedUrls.length;
    
    if (blockedUrls.length === 0) {
        blockedList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🚫</div>
                <div>No custom URLs blocked yet</div>
                <div style="font-size: 11px; margin-top: 5px;">Add URLs above to start blocking</div>
            </div>
        `;
        clearAllButton.style.display = 'none';
        return;
    }
    
    clearAllButton.style.display = 'block';
    blockedList.innerHTML = blockedUrls.map(url => `
        <div class="blocked-item">
            <div class="blocked-url">${escapeHtml(url)}</div>
            <button class="remove-button" data-url="${escapeHtml(url)}">Remove</button>
        </div>
    `).join('');
    
    // Add event listeners to remove buttons
    blockedList.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const url = e.target.getAttribute('data-url');
            removeUrl(url);
        });
    });
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addButton.addEventListener('click', addUrl);
clearAllButton.addEventListener('click', clearAll);

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addUrl();
    }
});

urlInput.addEventListener('input', () => {
    addButton.disabled = urlInput.value.trim().length === 0;
});

// Initialize
loadTheme();
loadBlockedUrls();

