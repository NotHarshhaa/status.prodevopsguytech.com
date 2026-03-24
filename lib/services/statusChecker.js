/**
 * StatusChecker Service
 *
 * This service fetches real-time status data for websites by making HTTP requests
 * and analyzing response times, status codes, and connectivity.
 */

import axios from 'axios';
import https from 'https';

// Array of User-Agents to rotate through
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'StatusChecker/1.0 (Health Monitoring Bot)',
  'HealthMonitor/2.0 (System Status Checker)'
];

let currentUAIndex = 0;

// Function to get next User-Agent
function getNextUserAgent() {
  const ua = userAgents[currentUAIndex];
  currentUAIndex = (currentUAIndex + 1) % userAgents.length;
  return ua;
}

// Simple in-memory cache for status results
const statusCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache TTL for real-time API

/**
 * Get cached status for a site if it's still valid
 * @param {string} siteId - Site identifier
 * @returns {Object|null} - Cached status or null if expired/not found
 */
function getCachedStatus(siteId) {
  const cached = statusCache.get(siteId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

/**
 * Cache status result for a site
 * @param {string} siteId - Site identifier
 * @param {Object} statusData - Status data to cache
 */
function setCachedStatus(siteId, statusData) {
  statusCache.set(siteId, {
    data: statusData,
    timestamp: Date.now()
  });
}

// Create an axios instance with configurations optimized for status checks
const statusAxios = axios.create({
  timeout: 10000, // 10 second timeout
  validateStatus: status => true, // Don't reject any status codes to analyze them manually
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates for checking
  })
});

/**
 * Sleep function for delaying retries
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks the status of a single site with retry logic for rate limiting and multiple endpoints
 * @param {Object} site - Site object with url and id
 * @param {boolean} forceCheck - Skip cache and force a new check
 * @returns {Promise<Object>} - Status information
 */
export async function checkSiteStatus(site, forceCheck = false) {
  // Check cache first unless force check is enabled
  if (!forceCheck) {
    const cached = getCachedStatus(site.id);
    if (cached) {
      return {
        ...cached,
        lastChecked: new Date(),
        fromCache: true
      };
    }
  }

  const startTime = Date.now();
  let status = 'operational';
  let statusText = 'Operational';
  let statusCode = null;
  let responseTime = null;
  let error = null;
  let retryCount = 0;
  const maxRetries = 2; // Fewer retries for real-time checks
  let workingEndpoint = null;

  // Define health endpoints to try (fallback to main URL)
  const endpoints = site.healthEndpoints || ['/'];
  
  while (retryCount <= maxRetries) {
    for (const endpoint of endpoints) {
      try {
        const fullUrl = site.url + endpoint;
        
        // Try HEAD request first (lighter)
        let response;
        try {
          response = await statusAxios.head(fullUrl, {
            timeout: 5000, // Shorter timeout for HEAD
            headers: {
              'User-Agent': getNextUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
        } catch (headError) {
          // If HEAD fails, try GET request
          response = await statusAxios.get(fullUrl, {
            timeout: 5000 // 5 second timeout for each individual request
          });
        }

        // Calculate response time
        responseTime = Date.now() - startTime;

        // Get status code
        statusCode = response.status;

        // If we get a 429 and have retries left, wait and retry
        if (statusCode === 429 && retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 500; // Faster backoff for real-time: 0.5s, 1s
          console.log(`${site.name} rate limited on ${endpoint}. Retrying in ${waitTime}ms...`);
          await sleep(waitTime);
          retryCount++;
          continue; // Continue to next retry
        }

        // Determine status based on response
        if (statusCode >= 500) {
          status = 'outage';
          statusText = 'Server Error';
        } else if (statusCode === 429) {
          status = 'degraded';
          statusText = 'Rate Limited';
        } else if (statusCode >= 400) {
          status = 'degraded';
          statusText = 'Client Error';
        } else if (responseTime > 3000) {
          status = 'degraded';
          statusText = 'Slow Response';
        } else if (statusCode >= 200 && statusCode < 300) {
          status = 'operational';
          statusText = 'Operational';
        } else {
          status = 'degraded';
          statusText = 'Unusual Response';
        }

        // If this endpoint worked, mark it and break the endpoint loop
        if (statusCode >= 200 && statusCode < 300) {
          workingEndpoint = endpoint;
          break;
        }

      } catch (err) {
        // Continue to next endpoint if this one fails
        continue;
      }
    }

    // If we found a working endpoint or reached max retries, break the retry loop
    if (workingEndpoint || retryCount > maxRetries) {
      break;
    }
    
    retryCount++;
  }

  // If all endpoints failed, mark as outage
  if (!workingEndpoint && status === 'operational') {
    status = 'outage';
    statusText = 'All Endpoints Failed';
  }

  // Create result object
  const result = {
    id: site.id,
    name: site.name,
    url: site.url,
    description: site.description,
    status,
    statusText,
    statusCode,
    responseTime,
    error,
    workingEndpoint,
    lastChecked: new Date(),
    fromCache: false
  };

  // Cache the result
  setCachedStatus(site.id, result);

  return result;
}

/**
 * Checks the status of all sites in parallel
 * @param {Array} sites - Array of site objects
 * @returns {Promise<Array>} - Array of status information
 */
export async function checkAllSites(sites) {
  try {
    const statusPromises = sites.map(site => checkSiteStatus(site));
    return await Promise.all(statusPromises);
  } catch (error) {
    console.error('Error checking sites:', error);
    return [];
  }
}

/**
 * Gets historical data for a site (simulated for now)
 * @param {string} siteId - Site identifier
 * @returns {Object} - Historical data object
 */
export function getSiteHistory(siteId) {
  // In a real implementation, this would fetch from a database
  // For now, we'll generate simulated historical data

  const now = Date.now();
  const hourInMs = 3600000;
  const dayInMs = 86400000;

  // Generate data for the past 24 hours
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now - (23 - i) * hourInMs);

    // Mostly operational with occasional degraded performance
    const status = Math.random() > 0.9 ? 'degraded' : 'operational';

    // Response times between 100ms and 500ms, with occasional spikes
    const responseTime = Math.floor(Math.random() * 400) + 100;

    return {
      timestamp,
      status,
      responseTime
    };
  });

  // Generate data for the past 30 days (daily averages)
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const timestamp = new Date(now - (29 - i) * dayInMs);

    // Uptime percentage between 99% and 100%
    const uptime = 99 + Math.random();

    // Average response time between 150ms and 350ms
    const avgResponseTime = Math.floor(Math.random() * 200) + 150;

    return {
      timestamp,
      uptime,
      avgResponseTime
    };
  });

  return {
    hourlyData,
    dailyData
  };
}

/**
 * Calculates overall system health metrics
 * @param {Array} siteStatuses - Array of site status objects
 * @returns {Object} - Health metrics
 */
export function calculateSystemHealth(siteStatuses) {
  if (!siteStatuses || siteStatuses.length === 0) {
    return {
      status: 'unknown',
      operationalPercentage: 0,
      averageResponseTime: 0,
      sitesWithIssues: []
    };
  }

  const operationalCount = siteStatuses.filter(site => site.status === 'operational').length;
  const operationalPercentage = Math.round((operationalCount / siteStatuses.length) * 100);

  // Calculate average response time for operational sites
  const operationalSites = siteStatuses.filter(site => site.status === 'operational');
  const totalResponseTime = operationalSites.reduce((sum, site) => sum + (site.responseTime || 0), 0);
  const averageResponseTime = operationalSites.length > 0
    ? Math.round(totalResponseTime / operationalSites.length)
    : 0;

  // Get sites with issues
  const sitesWithIssues = siteStatuses
    .filter(site => site.status !== 'operational')
    .map(site => ({
      id: site.id,
      name: site.name,
      status: site.status,
      statusText: site.statusText
    }));

  // Determine overall status
  let status = 'operational';
  if (siteStatuses.some(site => site.status === 'outage')) {
    status = 'outage';
  } else if (siteStatuses.some(site => site.status === 'degraded')) {
    status = 'degraded';
  }

  return {
    status,
    operationalPercentage,
    averageResponseTime,
    sitesWithIssues,
    totalSites: siteStatuses.length
  };
}
