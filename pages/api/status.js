import fs from "fs";
import path from "path";
import {
  checkSiteStatus,
  checkAllSites,
  calculateSystemHealth,
  getSiteHistory,
} from "../../lib/services/statusChecker";
import sitesConfig from "../../lib/sitesConfig";

// Cache the status results to prevent excessive requests
let cachedResults = null;
let lastChecked = null;
const CACHE_DURATION = 30000; // 30 seconds

function getStaticHistoricalData() {
  try {
    const dataFilePath = path.join(process.cwd(), "public", "status-data.json");
    if (fs.existsSync(dataFilePath)) {
      const parsed = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      return parsed.historical || null;
    }
  } catch (e) {}
  return null;
}

export default async function handler(req, res) {
  // Check if we need to refresh the cache
  const now = new Date();
  const shouldRefreshCache =
    !cachedResults || !lastChecked || now - lastChecked > CACHE_DURATION;

  // Return the requested data
  const { siteId, refresh } = req.query;

  // Force refresh if requested
  const forceRefresh = refresh === "true";
  const staticHistorical = getStaticHistoricalData();

  try {
    // For individual site checks
    if (siteId) {
      const siteConfig = sitesConfig.find((s) => s.id === siteId);

      if (!siteConfig) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Check if we can use cached data for this site
      let siteData = null;
      if (!forceRefresh && cachedResults && !shouldRefreshCache) {
        const cachedSite = cachedResults.find((s) => s.id === siteId);
        if (cachedSite) {
          siteData = cachedSite;
        }
      }

      if (!siteData) {
        const siteStatus = await checkSiteStatus(siteConfig);
        siteData = {
          ...siteConfig,
          ...siteStatus,
          id: siteConfig.id,
          icon: siteConfig.iconName || "Monitor",
        };
      }

      const history = getSiteHistory(siteConfig.id, staticHistorical, siteData);
      return res.status(200).json({ site: siteData, history });
    }

    // For all sites
    if (forceRefresh || shouldRefreshCache) {
      // Check all sites in parallel
      const statusResults = await checkAllSites(sitesConfig);

      // Ensure each site has the correct ID
      cachedResults = statusResults.map((site) => ({
        ...site,
        id: site.id || sitesConfig.find((s) => s.url === site.url)?.id,
        icon: sitesConfig.find((s) => s.id === site.id)?.iconName || "Monitor",
      }));

      lastChecked = new Date();
    }

    // Calculate overall system health metrics
    const healthMetrics = calculateSystemHealth(cachedResults);

    // Return all sites with health metrics and historical data
    return res.status(200).json({
      timestamp: new Date(),
      overall: healthMetrics.status,
      metrics: healthMetrics,
      sites: cachedResults,
      historical: staticHistorical,
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
