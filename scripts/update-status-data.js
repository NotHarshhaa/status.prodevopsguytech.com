/**
 * Status Data Update Utility
 *
 * This script fetches the current status from the API and updates
 * the static JSON data file. This is useful for manual testing or
 * for updating the static data outside of the scheduled GitHub Actions runs.
 *
 * The script maintains the historical data while updating current status,
 * preserving the last 7 days of daily data and 24 hours of hourly data.
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Configuration
const API_URL = process.env.API_URL || "http://localhost:3000/api/status";
const OUTPUT_PATH = path.join(__dirname, "../public/status-data.json");

/**
 * Fetches status data from the API
 */
async function fetchStatusData() {
  try {
    console.log(`Fetching status data from ${API_URL}...`);
    const response = await axios.get(API_URL, {
      params: { refresh: "true" }, // Request fresh data
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching status data:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

/**
 * Saves data to the JSON file
 */
function saveStatusData(data) {
  try {
    // Load existing file if it exists to preserve historical data
    let existingData = {};
    if (fs.existsSync(OUTPUT_PATH)) {
      const fileContent = fs.readFileSync(OUTPUT_PATH, "utf8");
      existingData = JSON.parse(fileContent);
    }

    // Clean up historical data to keep last 90 days daily and 48 hours hourly
    const cleanupHistoricalData = (historical) => {
      if (!historical) return { hourly: {}, daily: {} };

      // For daily data, keep last 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoffDailyKey = cutoffDate.toISOString().split("T")[0];

      // For hourly data, keep last 48 hours
      const cutoffHour = new Date();
      cutoffHour.setHours(cutoffHour.getHours() - 48);
      const cutoffHourKey = cutoffHour.toISOString().split(":")[0];

      // Clean up daily data
      Object.keys(historical.daily || {}).forEach((siteId) => {
        Object.keys(historical.daily[siteId] || {}).forEach((dateKey) => {
          if (dateKey < cutoffDailyKey) {
            delete historical.daily[siteId][dateKey];
          }
        });
      });

      // Clean up hourly data
      Object.keys(historical.hourly || {}).forEach((siteId) => {
        Object.keys(historical.hourly[siteId] || {}).forEach((hourKey) => {
          if (hourKey < cutoffHourKey) {
            delete historical.hourly[siteId][hourKey];
          }
        });
      });

      return historical;
    };

    // Merge new data with existing historical data
    const cleanedHistorical = cleanupHistoricalData(
      existingData.historical || { hourly: {}, daily: {} },
    );

    const updatedData = {
      ...data,
      historical: cleanedHistorical,
    };

    // Calculate file size before writing
    const beforeSize = fs.existsSync(OUTPUT_PATH)
      ? (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)
      : 0;

    // Write updated data
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(updatedData, null, 2));

    // Calculate and log file size after writing
    const afterSize = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2);
    console.log(`Status data saved to ${OUTPUT_PATH}`);
    console.log(`File size: ${beforeSize}KB → ${afterSize}KB`);
  } catch (error) {
    console.error("Error saving status data:", error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const statusData = await fetchStatusData();
    saveStatusData(statusData);
    console.log("Status data update completed successfully.");
  } catch (error) {
    console.error("Failed to update status data:", error);
    process.exit(1);
  }
}

// Run the script
main();
