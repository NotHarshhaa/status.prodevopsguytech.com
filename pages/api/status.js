// API route for fetching site status data in real-time
// Uses the statusChecker service to check website availability

import {
  checkSiteStatus,
  checkAllSites,
  calculateSystemHealth,
} from "../../lib/services/statusChecker";
import sitesConfig from "../../lib/sitesConfig";

// Cache the status results to prevent excessive requests
let cachedResults = null;
let lastChecked = null;
const CACHE_DURATION = 30000; // 30 seconds

export default async function handler(req, res) {
  // Check if we need to refresh the cache
  const now = new Date();
  const shouldRefreshCache =
    !cachedResults || !lastChecked || now - lastChecked > CACHE_DURATION;

  // Return the requested data
  const { siteId, refresh } = req.query;

  // Force refresh if requested
  const forceRefresh = refresh === "true";

  try {
    // For individual site checks
    if (siteId) {
      const siteConfig = sitesConfig.find((s) => s.id === siteId);

      if (!siteConfig) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Check if we can use cached data for this site
      if (!forceRefresh && cachedResults && !shouldRefreshCache) {
        const cachedSite = cachedResults.find((s) => s.id === siteId);
        if (cachedSite) {
          return res.status(200).json({ site: cachedSite });
        }
      }

      // If not in cache or forcing refresh, check the site status in real-time
      const siteStatus = await checkSiteStatus(siteConfig);

      // Make sure the ID is preserved in the response
      const siteData = {
        ...siteConfig,
        ...siteStatus,
        id: siteConfig.id, // Ensure ID is set correctly
        icon: siteConfig.icon.displayName || siteConfig.icon.name || 'Monitor', // Convert React component to string identifier
      };

      return res.status(200).json({ site: siteData });
    }

    // For all sites
    if (forceRefresh || shouldRefreshCache) {
      // Check all sites in parallel
      const statusResults = await checkAllSites(sitesConfig);

      // Ensure each site has the correct ID
      cachedResults = statusResults.map((site) => ({
        ...site,
        id: site.id || sitesConfig.find((s) => s.url === site.url)?.id,
      }));

      lastChecked = new Date();
    }

    // Calculate overall system health metrics
    const healthMetrics = calculateSystemHealth(cachedResults);

    // Return all sites with health metrics
    return res.status(200).json({
      timestamp: new Date(),
      overall: healthMetrics.status,
      metrics: healthMetrics,
      sites: cachedResults,
      lastChecked,
    });
  } catch (error) {
    console.error("Error in status API:", error);
    return res.status(500).json({
      error: "Failed to check site status",
      message: error.message,
    });
  }
}
