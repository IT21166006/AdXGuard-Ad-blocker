// Content script to track blocked ads
// This monitors network requests and detects when ad domains fail to load (blocked)

(function() {
    'use strict';
    
    // List of known ad domains that should be blocked
    const adDomains = [
        'doubleclick.net',
        'googlesyndication.com',
        'ads.yahoo.com',
        'googleadservices.com',
        'adservice.google',
        'amazon-adsystem.com',
        'advertising.com',
        'adnxs.com',
        'adsrvr.org',
        'adtechus.com',
        'googletagservices.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'analytics.js',
        '2mdn.net',
        'adform.net',
        'criteo.com',
        'rubiconproject.com',
        'pubmatic.com',
        'scorecardresearch.com',
        'quantserve.com',
        'outbrain.com',
        'taboola.com'
    ];
    
    // Function to check if URL is an ad domain
    function isAdDomain(url) {
        if (!url) return false;
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            return adDomains.some(domain => hostname.includes(domain.toLowerCase()));
        } catch (e) {
            // If URL parsing fails, check if URL string contains ad domain
            const urlLower = url.toLowerCase();
            return adDomains.some(domain => urlLower.includes(domain.toLowerCase()));
        }
    }
    
    // Track failed requests (blocked ads)
    const failedRequests = new Set();
    let reportTimeout = null;
    
    function reportBlockedAd(url) {
        // Avoid duplicate reports
        if (failedRequests.has(url)) return;
        failedRequests.add(url);
        
        // Debounce reports
        clearTimeout(reportTimeout);
        reportTimeout = setTimeout(() => {
            try {
                chrome.runtime.sendMessage({
                    action: 'adBlocked',
                    url: url,
                    domain: window.location.hostname,
                    count: failedRequests.size
                }).catch(() => {
                    // Background script might not be ready
                });
                failedRequests.clear();
            } catch (e) {
                // Ignore errors
            }
        }, 1000);
    }
    
    // Monitor failed network requests using PerformanceObserver
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    // Check if request failed and is an ad domain
                    if (entry.name && isAdDomain(entry.name)) {
                        // If transferSize is 0 and duration is very short, likely blocked
                        if (entry.transferSize === 0 || entry.duration < 10) {
                            reportBlockedAd(entry.name);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.log('AdXGuard: PerformanceObserver not fully supported');
        }
    }
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && isAdDomain(url)) {
            return originalFetch.apply(this, args).catch(error => {
                // Request failed - likely blocked
                reportBlockedAd(url);
                throw error;
            });
        }
        return originalFetch.apply(this, args);
    };
    
    // Monitor XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._adXGuardUrl = url;
        return originalOpen.apply(this, [method, url, ...rest]);
    };
    
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
        if (this._adXGuardUrl && isAdDomain(this._adXGuardUrl)) {
            this.addEventListener('error', () => {
                reportBlockedAd(this._adXGuardUrl);
            });
            this.addEventListener('load', function() {
                if (this.status === 0 || this.status >= 400) {
                    reportBlockedAd(this._adXGuardUrl);
                }
            });
        }
        return originalSend.apply(this, args);
    };
    
    // Monitor image loads via error events (handled below)
    
    // Monitor script loads
    document.addEventListener('error', (e) => {
        if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'IMG' || e.target.tagName === 'IFRAME')) {
            const src = e.target.src || e.target.href;
            if (src && isAdDomain(src)) {
                reportBlockedAd(src);
            }
        }
    }, true);
    
    // Report page load to initialize domain stats
    function reportPageLoad() {
        try {
            chrome.runtime.sendMessage({
                action: 'pageLoaded',
                domain: window.location.hostname
            }).catch(() => {
                // Background script might not be ready
            });
        } catch (e) {
            // Ignore errors
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reportPageLoad);
    } else {
        reportPageLoad();
    }
})();
