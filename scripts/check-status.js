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

// Create an axios instance with configurations optimized for status checks
const statusAxios = axios.create({
  timeout: 15000, // 15 second timeout
  validateStatus: (status) => true, // Don't reject any status codes to analyze them manually
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates for checking
  }),
});

// Define the list of sites to monitor - same as in API route
const sitesConfig = [
  {
    id: "projects",
    name: "Real-Time Projects Hub",
    description: "Hands-on DevOps projects from beginner to advanced",
    url: "https://projects.prodevopsguytech.com",
    icon: "💻",
  },
  {
    id: "docs",
    name: "Ultimate Docs Portal",
    description: "900+ curated DevOps learning materials",
    url: "https://docs.prodevopsguytech.com",
    icon: "📚",
  },
  {
    id: "repos",
    name: "Repositories Central",
    description: "Collection of scripts, infrastructure code & prep content",
    url: "https://repos.prodevopsguytech.com",
    icon: "📦",
  },
  {
    id: "jobs",
    name: "Jobs Portal",
    description: "Find your next DevOps career opportunity",
    url: "https://jobs.prodevopsguytech.com",
    icon: "🧭",
  },
  {
    id: "blog",
    name: "DevOps Blog",
    description: "Deep dives into DevOps practices & tutorials",
    url: "https://blog.prodevopsguytech.com",
    icon: "📰",
  },
  {
    id: "cloud",
    name: "Cloud Blog",
    description: "Cloud architecture & implementation guides",
    url: "https://cloud.prodevopsguytech.com",
    icon: "☁️",
  },
  {
    id: "docker2k8s",
    name: "Docker to Kubernetes",
    description: "Master containerization journey",
    url: "https://dockertokubernetes.live",
    icon: "🐳",
  },
  {
    id: "devopslab",
    name: "DevOps Engineering Lab",
    description: "Hands-on CI/CD & automation",
    url: "https://www.devops-engineering.site",
    icon: "🔬",
  },
  {
    id: "toolguides",
    name: "DevOps Tool Guides",
    description: "Setup & installation guides",
    url: "https://www.devopsguides.site",
    icon: "🛠️",
  },
  {
    id: "cheatsheet",
    name: "DevOps Cheatsheet",
    description: "Comprehensive tools & practices",
    url: "https://cheatsheet.prodevopsguytech.com",
    icon: "📑",
  },
  {
    id: "monitoring",
    name: "DevOps Monitoring Platform",
    description:
      "A ready-to-use advanced monitoring platform for DevOps engineers and beginners",
    url: "https://devops-monitoring-in-a-box.vercel.app",
    icon: "📊",
  },
  {
    id: "interviews",
    name: "DevOps Interview Hub",
    description:
      "DevOps 1100+ interview preparation materials, Q&A sets, and scenario-based practice",
    url: "https://interviews.prodevopsguytech.com",
    icon: "📝",
  },
  {
    id: "devopstools",
    name: "DevOps Arsenal",
    description:
      "Collection of essential DevOps tools and utilities for daily use",
    url: "https://tools.prodevopsguytech.com",
    icon: "🛠️",
  },
  {
    id: "awesomeui",
    name: "Awesome DevOps",
    description:
      "A showcase of powerful, user-friendly UIs for managing DevOps workflows and monitoring systems",
    url: "https://awesomedevopsui.site",
    icon: "💻",
  },
  {
    id: "resources",
    name: "Home of Best DevOps Resources",
    description:
      "All-in-one portal for curated DevOps learning materials, articles, and best practices",
    url: "https://devopsresourceshub.site",
    icon: "📚",
  },
];

/**
 * Checks the status of a single site
 * @param {Object} site - Site object with url and id
 * @returns {Promise<Object>} - Status information
 */
async function checkSiteStatus(site) {
  const startTime = Date.now();
  let status = "operational";
  let statusText = "Operational";
  let statusCode = null;
  let responseTime = null;
  let error = null;

  try {
    // Make the HTTP request
    const response = await statusAxios.get(site.url, {
      timeout: 10000, // 10 second timeout for each individual request
    });

    // Calculate response time
    responseTime = Date.now() - startTime;

    // Get status code
    statusCode = response.status;

    // Determine status based on response
    if (statusCode >= 500) {
      status = "outage";
      statusText = "Server Error";
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
  } catch (err) {
    // Handle timeout or connection errors
    error = err.message || "Connection error";
    status = "outage";
    statusText = "Connection Failed";
    responseTime = Date.now() - startTime;
  }

  console.log(`Checked ${site.name}: ${status} (${responseTime}ms)`);

  // Return comprehensive status object
  return {
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
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Checks the status of all sites in parallel
 * @param {Array} sites - Array of site objects
 * @returns {Promise<Array>} - Array of status information
 */
async function checkAllSites(sites) {
  try {
    console.log(`Starting status check for ${sites.length} sites...`);
    const statusPromises = sites.map((site) => checkSiteStatus(site));
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

/**
 * Main function to run the status check
 */
async function main() {
  try {
    // Check the status of all sites
    const siteStatuses = await checkAllSites(sitesConfig);

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
  } catch (error) {
    console.error("Error in status check script:", error);
    process.exit(1);
  }
}

// Run the script
main();
