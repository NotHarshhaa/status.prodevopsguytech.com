import axios from "axios";

/**
 * Test Webhook API Endpoint
 *
 * Dispatches an instant test alert to verify Discord, Slack, or Custom Webhooks.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, webhookUrl } = req.body || {};

  if (!webhookUrl || typeof webhookUrl !== "string" || !webhookUrl.startsWith("http")) {
    return res.status(400).json({ error: "Valid HTTP/HTTPS Webhook URL is required" });
  }

  try {
    if (type === "discord") {
      await axios.post(
        webhookUrl,
        {
          username: "ProDevOpsGuy Status",
          avatar_url: "https://status.prodevopsguytech.com/favicon.ico",
          embeds: [
            {
              title: "🟢 Status Notification Test",
              description:
                "This is a test notification from the **ProDevOpsGuy Tech Status Dashboard**. Your Discord webhook is configured and operational!",
              color: 0x00d4aa,
              timestamp: new Date().toISOString(),
              footer: {
                text: "ProDevOpsGuy Tech Status Bot",
              },
            },
          ],
        },
        { timeout: 7000 }
      );
    } else if (type === "slack") {
      await axios.post(
        webhookUrl,
        {
          text: "🟢 *ProDevOpsGuy Status Alert Test*\nYour Slack incoming webhook is active and connected to live status notifications.",
        },
        { timeout: 7000 }
      );
    } else {
      // Custom webhook
      await axios.post(
        webhookUrl,
        {
          event: "test_notification",
          timestamp: new Date().toISOString(),
          source: "status.prodevopsguytech.com",
          message: "ProDevOpsGuy webhook test signal verified.",
        },
        { timeout: 7000 }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Test notification successfully sent to ${type || "webhook"}!`,
    });
  } catch (err) {
    console.error("Test webhook failed:", err.message);
    const msg =
      err.response?.data?.message || err.response?.data || err.message;
    return res.status(400).json({
      error: `Webhook delivery failed: ${typeof msg === "string" ? msg : "Check webhook URL format"}`,
    });
  }
}
