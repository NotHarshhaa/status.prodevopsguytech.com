/**
 * Status Checker Script
 *
 * This script is designed to be run as a GitHub Action on a schedule.
 * It checks the status of all configured sites and updates a JSON file with the results.
 * This JSON file can then be fetched by the frontend to display real-time status.
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const https = require("https");

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

// Create an axios instance with configurations optimized for status checks
const statusAxios = axios.create({
  timeout: 15000, // 15 second timeout
  validateStatus: (status) => true, // Don't reject any status codes to analyze them manually
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates for checking
  }),
});

// Define the list of sites to monitor with alternative health check endpoints
const sitesConfig = [
  {
    id: "projects",
    name: "Real-Time Projects Hub",
    description: "Hands-on DevOps projects from beginner to advanced",
    url: "https://projects.prodevopsguytech.com",
    healthEndpoints: [
      "/", // Main page
      "/health", // Common health endpoint
      "/api/health", // API health endpoint
      "/status" // Status endpoint
    ],
    icon: "💻",
  },
  {
    id: "docs",
    name: "Ultimate Docs Portal",
    description: "900+ curated DevOps learning materials",
    url: "https://docs.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health",
      "/api/health"
    ],
    icon: "📚",
  },
  {
    id: "repos",
    name: "Repositories Central",
    description: "Collection of scripts, infrastructure code & prep content",
    url: "https://repos.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "📦",
  },
  {
    id: "jobs",
    name: "Jobs Portal",
    description: "Find your next DevOps career opportunity",
    url: "https://jobs.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "🧭",
  },
  {
    id: "blog",
    name: "DevOps Blog",
    description: "Deep dives into DevOps practices & tutorials",
    url: "https://blog.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health",
      "/wp-json/wp/v2", // WordPress API
      "/feed" // RSS feed
    ],
    icon: "📰",
  },
  {
    id: "cloud",
    name: "Cloud Blog",
    description: "Cloud architecture & implementation guides",
    url: "https://cloud.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health",
      "/wp-json/wp/v2", // WordPress API
      "/feed" // RSS feed
    ],
    icon: "☁️",
  },
  {
    id: "docker2k8s",
    name: "Docker to Kubernetes",
    description: "Master containerization journey",
    url: "https://dockertokubernetes.live",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "🐳",
  },
  {
    id: "devopslab",
    name: "DevOps Engineering Lab",
    description: "Hands-on CI/CD & automation",
    url: "https://www.devops-engineering.site",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "🔬",
  },
  {
    id: "toolguides",
    name: "DevOps Tool Guides",
    description: "Setup & installation guides",
    url: "https://www.devopsguides.site",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "🛠️",
  },
  {
    id: "cheatsheet",
    name: "DevOps Cheatsheet",
    description: "Comprehensive tools & practices",
    url: "https://cheatsheet.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "📑",
  },
  {
    id: "monitoring",
    name: "DevOps Monitoring Platform",
    description:
      "A ready-to-use advanced monitoring platform for DevOps engineers and beginners",
    url: "https://devops-monitoring-in-a-box.vercel.app",
    healthEndpoints: [
      "/",
      "/health",
      "/api/health"
    ],
    icon: "📊",
  },
  {
    id: "interviews",
    name: "DevOps Interview Hub",
    description:
      "DevOps 1100+ interview preparation materials, Q&A sets, and scenario-based practice",
    url: "https://interviews.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "📝",
  },
  {
    id: "devopstools",
    name: "DevOps Arsenal",
    description:
      "Collection of essential DevOps tools and utilities for daily use",
    url: "https://tools.prodevopsguytech.com",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "🛠️",
  },
  {
    id: "awesomeui",
    name: "Awesome DevOps",
    description:
      "A showcase of powerful, user-friendly UIs for managing DevOps workflows and monitoring systems",
    url: "https://awesomedevopsui.site",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "💻",
  },
  {
    id: "resources",
    name: "Home of Best DevOps Resources",
    description:
      "All-in-one portal for curated DevOps learning materials, articles, and best practices",
    url: "https://devopsresourceshub.site",
    healthEndpoints: [
      "/",
      "/health"
    ],
    icon: "📚",
  },
];

// Simple in-memory cache for status results
const statusCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

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

/**
 * Sleep function for delaying retries
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay function to avoid sending requests simultaneously
 * @param {number} min - Minimum delay in milliseconds
 * @param {number} max - Maximum delay in milliseconds
 */
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Checks the status of a single site with retry logic for rate limiting and multiple endpoints
 * @param {Object} site - Site object with url and id
 * @param {boolean} forceCheck - Skip cache and force a new check
 * @returns {Promise<Object>} - Status information
 */
async function checkSiteStatus(site, forceCheck = false) {
  // Check cache first unless force check is enabled
  if (!forceCheck) {
    const cached = getCachedStatus(site.id);
    if (cached) {
      console.log(`Using cached status for ${site.name}: ${cached.status}`);
      return {
        ...cached,
        lastChecked: new Date().toISOString(),
        fromCache: true
      };
    }
  }

  const startTime = Date.now();
  let status = "operational";
  let statusText = "Operational";
  let statusCode = null;
  let responseTime = null;
  let error = null;
  let retryCount = 0;
  const maxRetries = 3;
  let workingEndpoint = null;

  // Get health endpoints for this site, fallback to just the main URL
  const endpoints = site.healthEndpoints || ["/"];
  
  while (retryCount <= maxRetries) {
    for (const endpoint of endpoints) {
      try {
        const fullUrl = site.url + endpoint;
        
        // Try HEAD request first (lighter)
        let response;
        try {
          response = await statusAxios.head(fullUrl, {
            timeout: 8000, // Shorter timeout for HEAD
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
            timeout: 10000, // 10 second timeout for each individual request
            headers: {
              'User-Agent': getNextUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
        }

        // Calculate response time
        responseTime = Date.now() - startTime;

        // Get status code
        statusCode = response.status;

        // If we get a 429 and have retries left, wait and retry
        if (statusCode === 429 && retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`${site.name} rate limited on ${endpoint}. Retrying in ${waitTime}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          await sleep(waitTime);
          retryCount++;
          continue; // Continue to next retry
        }

        // Determine status based on response
        if (statusCode >= 500) {
          status = "outage";
          statusText = "Server Error";
        } else if (statusCode === 429) {
          status = "degraded";
          statusText = "Rate Limited";
        } else if (statusCode >= 400) {
          status = "degraded";
          statusText = "Client Error";
        } else if (responseTime > 3000) {
          status = "degraded";
          statusText = "Slow Response";
        } else if (statusCode >= 200 && statusCode < 300) {
          status = "operational";
          statusText = "Operational";
        } else {
          status = "degraded";
          statusText = "Unusual Response";
        }

        // If this endpoint worked, mark it and break the endpoint loop
        if (statusCode >= 200 && statusCode < 300) {
          workingEndpoint = endpoint;
          break;
        }

      } catch (err) {
        // Continue to next endpoint if this one fails
        console.log(`Endpoint ${endpoint} failed for ${site.name}: ${err.message}`);
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
  if (!workingEndpoint && status === "operational") {
    status = "outage";
    statusText = "All Endpoints Failed";
  }

  console.log(`Checked ${site.name}: ${status} (${responseTime}ms)${retryCount > 0 ? ` after ${retryCount} retries` : ''}${workingEndpoint ? ` via ${workingEndpoint}` : ''}`);

  // Create result object
  const result = {
    id: site.id,
    name: site.name,
    url: site.url,
    icon: site.icon,
    description: site.description,
    status,
    statusText,
    statusCode,
    responseTime,
    error,
    workingEndpoint,
    lastChecked: new Date().toISOString(),
    fromCache: false
  };

  // Cache the result
  setCachedStatus(site.id, result);

  return result;
}

/**
 * Checks the status of all sites in parallel with random delays
 * @param {Array} sites - Array of site objects
 * @param {boolean} forceCheck - Skip cache and force new checks
 * @returns {Promise<Array>} - Array of status information
 */
async function checkAllSites(sites, forceCheck = false) {
  try {
    console.log(`Starting status check for ${sites.length} sites...`);
    
    // Create staggered checks to avoid overwhelming servers
    const statusPromises = sites.map(async (site, index) => {
      // Add random delay before each check (0-2000ms stagger)
      await randomDelay(index * 100, index * 100 + Math.random() * 500);
      return checkSiteStatus(site, forceCheck);
    });
    
    return await Promise.all(statusPromises);
  } catch (error) {
    console.error("Error checking sites:", error);
    return [];
  }
}

/**
 * Calculates overall system health metrics
 * @param {Array} siteStatuses - Array of site status objects
 * @returns {Object} - Health metrics
 */
function calculateSystemHealth(siteStatuses) {
  if (!siteStatuses || siteStatuses.length === 0) {
    return {
      status: "unknown",
      operationalPercentage: 0,
      averageResponseTime: 0,
      sitesWithIssues: [],
    };
  }

  const operationalCount = siteStatuses.filter(
    (site) => site.status === "operational",
  ).length;
  const operationalPercentage = Math.round(
    (operationalCount / siteStatuses.length) * 100,
  );

  // Calculate average response time for operational sites
  const operationalSites = siteStatuses.filter(
    (site) => site.status === "operational",
  );
  const totalResponseTime = operationalSites.reduce(
    (sum, site) => sum + (site.responseTime || 0),
    0,
  );
  const averageResponseTime =
    operationalSites.length > 0
      ? Math.round(totalResponseTime / operationalSites.length)
      : 0;

  // Get sites with issues
  const sitesWithIssues = siteStatuses
    .filter((site) => site.status !== "operational")
    .map((site) => ({
      id: site.id,
      name: site.name,
      status: site.status,
      statusText: site.statusText,
    }));

  // Determine overall status
  let status = "operational";
  if (siteStatuses.some((site) => site.status === "outage")) {
    status = "outage";
  } else if (siteStatuses.some((site) => site.status === "degraded")) {
    status = "degraded";
  }

  return {
    status,
    operationalPercentage,
    averageResponseTime,
    sitesWithIssues,
    totalSites: siteStatuses.length,
  };
}

/**
 * Update historical data with the latest check
 * @param {Object} existingData - Previously stored status data
 * @param {Array} currentSiteStatuses - Latest site status data
 * @returns {Object} - Updated historical data
 */
function updateHistoricalData(existingData, currentSiteStatuses) {
  const now = new Date();

  // Initialize historical data if it doesn't exist
  if (!existingData || !existingData.historical) {
    existingData = {
      ...existingData,
      historical: {
        hourly: {},
        daily: {},
      },
    };
  }

  const historical = existingData.historical;

  // Get today's date in YYYY-MM-DD format for daily data
  const todayKey = now.toISOString().split("T")[0];

  // Get current hour in YYYY-MM-DDTHH format for hourly data
  const hourKey = now.toISOString().split(":")[0];

  // Process each site
  currentSiteStatuses.forEach((site) => {
    // Initialize site data if it doesn't exist
    if (!historical.hourly[site.id]) {
      historical.hourly[site.id] = {};
    }
    if (!historical.daily[site.id]) {
      historical.daily[site.id] = {};
    }

    // Update hourly data
    historical.hourly[site.id][hourKey] = {
      status: site.status,
      responseTime: site.responseTime,
    };

    // Update or initialize daily data
    if (!historical.daily[site.id][todayKey]) {
      historical.daily[site.id][todayKey] = {
        checks: 0,
        operational: 0,
        degraded: 0,
        outage: 0,
        totalResponseTime: 0,
      };
    }

    const dailyData = historical.daily[site.id][todayKey];
    dailyData.checks++;
    dailyData[site.status]++;
    dailyData.totalResponseTime += site.responseTime;

    // Calculate uptime percentage
    dailyData.uptime = Math.round(
      (dailyData.operational / dailyData.checks) * 100,
    );
    dailyData.avgResponseTime = Math.round(
      dailyData.totalResponseTime / dailyData.checks,
    );
  });

  // Clean up old data (keep only the last 7 days of data)
  const cleanupHistoricalData = () => {
    // For daily data, keep last 7 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffDailyKey = cutoffDate.toISOString().split("T")[0];

    // For hourly data, keep last 24 hours (reduce from 48 to save space)
    const cutoffHour = new Date();
    cutoffHour.setHours(cutoffHour.getHours() - 24);
    const cutoffHourKey = cutoffHour.toISOString().split(":")[0];

    // Clean up each site's data with logging for visibility
    console.log(`Cleaning up historical data older than ${cutoffDailyKey}`);
    let removedDailyEntries = 0;
    let removedHourlyEntries = 0;

    Object.keys(historical.daily).forEach((siteId) => {
      Object.keys(historical.daily[siteId]).forEach((dateKey) => {
        if (dateKey < cutoffDailyKey) {
          delete historical.daily[siteId][dateKey];
          removedDailyEntries++;
        }
      });
    });

    Object.keys(historical.hourly).forEach((siteId) => {
      Object.keys(historical.hourly[siteId]).forEach((hourKey) => {
        if (hourKey < cutoffHourKey) {
          delete historical.hourly[siteId][hourKey];
          removedHourlyEntries++;
        }
      });
    });

    if (removedDailyEntries > 0 || removedHourlyEntries > 0) {
      console.log(
        `Removed ${removedDailyEntries} daily entries and ${removedHourlyEntries} hourly entries from historical data`,
      );
    }
  };

  cleanupHistoricalData();

  return historical;
}

async function main() {
  try {
    // Check the status of all sites (force check to bypass cache for scheduled runs)
    const siteStatuses = await checkAllSites(sitesConfig, true);

    // Calculate system health metrics
    const healthMetrics = calculateSystemHealth(siteStatuses);

    // Prepare the data file path
    const dataFilePath = path.join(__dirname, "../public/status-data.json");

    // Load existing data if available
    let existingData = {};
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, "utf8");
        existingData = JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn(
        "Could not read existing data file, creating new one:",
        err.message,
      );
    }

    // Update historical data
    const historical = updateHistoricalData(existingData, siteStatuses);

    // Prepare the complete status data
    const statusData = {
      timestamp: new Date().toISOString(),
      overall: healthMetrics.status,
      metrics: healthMetrics,
      sites: siteStatuses,
      lastChecked: new Date().toISOString(),
      historical,
    };

    // Calculate file size before writing
    const beforeSize = fs.existsSync(dataFilePath)
      ? (fs.statSync(dataFilePath).size / 1024).toFixed(2)
      : 0;

    // Write the updated data to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(statusData, null, 2));

    // Calculate and log file size after writing
    const afterSize = (fs.statSync(dataFilePath).size / 1024).toFixed(2);
    console.log(`Status data file size: ${beforeSize}KB → ${afterSize}KB`);

    console.log(`Status check completed. Data saved to ${dataFilePath}`);
    console.log(`Overall system status: ${healthMetrics.status}`);
    console.log(`Operational sites: ${healthMetrics.operationalPercentage}%`);
    console.log(
      `Average response time: ${healthMetrics.averageResponseTime}ms`,
    );

    if (healthMetrics.sitesWithIssues.length > 0) {
      console.log("Sites with issues:");
      healthMetrics.sitesWithIssues.forEach((site) => {
        console.log(`- ${site.name}: ${site.status} (${site.statusText})`);
      });
    }

    // Log cache statistics
    const cacheHits = siteStatuses.filter(site => site.fromCache).length;
    const cacheMisses = siteStatuses.filter(site => !site.fromCache).length;
    console.log(`Cache performance: ${cacheHits} hits, ${cacheMisses} misses`);
  } catch (error) {
    console.error("Error in status check script:", error);
    process.exit(1);
  }
}

// Run the script
main();
