/**
 * StatusChecker Service
 *
 * This service fetches real-time status data for websites by making HTTP requests
 * and analyzing response times, status codes, and connectivity.
 */

import axios from 'axios';
import https from 'https';

// Create an axios instance with configurations optimized for status checks
const statusAxios = axios.create({
  timeout: 10000, // 10 second timeout
  validateStatus: status => true, // Don't reject any status codes to analyze them manually
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Allow self-signed certificates for checking
  })
});

/**
 * Checks the status of a single site
 * @param {Object} site - Site object with url and id
 * @returns {Promise<Object>} - Status information
 */
export async function checkSiteStatus(site) {
  const startTime = Date.now();
  let status = 'operational';
  let statusText = 'Operational';
  let statusCode = null;
  let responseTime = null;
  let error = null;

  try {
    // Make the HTTP request
    const response = await statusAxios.get(site.url, {
      timeout: 5000 // 5 second timeout for each individual request
    });

    // Calculate response time
    responseTime = Date.now() - startTime;

    // Get status code
    statusCode = response.status;

    // Determine status based on response
    if (statusCode >= 500) {
      status = 'outage';
      statusText = 'Server Error';
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
  } catch (err) {
    // Handle timeout or connection errors
    error = err.message || 'Connection error';
    status = 'outage';
    statusText = 'Connection Failed';
    responseTime = Date.now() - startTime;
  }

  // Return comprehensive status object
  return {
    id: site.id,
    name: site.name,
    url: site.url,
    description: site.description,
    status,
    statusText,
    statusCode,
    responseTime,
    error,
    lastChecked: new Date(),
  };
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
