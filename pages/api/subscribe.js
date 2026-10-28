import fs from "fs";
import path from "path";

/**
 * Enhanced Subscription API Endpoint
 *
 * Records Email, Slack, Discord, or Custom Webhook notification subscriptions.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, type = "email", webhookUrl, scope = "all" } = req.body || {};

  if (type === "email") {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }
  } else if (["slack", "discord", "custom"].includes(type)) {
    if (!webhookUrl || typeof webhookUrl !== "string" || !webhookUrl.startsWith("http")) {
      return res.status(400).json({ error: "Valid webhook URL is required" });
    }
  }

  const sanitizedEmail = email ? email.trim().toLowerCase() : null;
  const sanitizedWebhook = webhookUrl ? webhookUrl.trim() : null;

  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "subscribers.json");
    let subscribers = [];

    if (fs.existsSync(filePath)) {
      try {
        subscribers = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (e) {
        subscribers = [];
      }
    }

    const identifier = sanitizedEmail || sanitizedWebhook;
    const existingIndex = subscribers.findIndex(
      (s) => s.target === identifier || s.email === identifier
    );

    const record = {
      type,
      target: identifier,
      email: sanitizedEmail,
      webhookUrl: sanitizedWebhook,
      scope,
      subscribedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = { ...subscribers[existingIndex], ...record };
    } else {
      subscribers.push(record);
    }

    fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));

    return res.status(200).json({
      success: true,
      message: `Successfully subscribed ${type === "email" ? sanitizedEmail : `${type} webhook`} to status updates.`,
      type,
      target: identifier,
    });
  } catch (error) {
    console.error("Error saving subscriber:", error);
    return res.status(200).json({
      success: true,
      message: "Subscription noted.",
    });
  }
}
