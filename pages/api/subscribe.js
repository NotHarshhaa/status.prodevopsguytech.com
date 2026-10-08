/**
 * Subscription API Endpoint
 *
 * Handles status notification signups and records subscribers.
 */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'subscribers.json');
    let subscribers = [];

    if (fs.existsSync(filePath)) {
      try {
        subscribers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        subscribers = [];
      }
    }

    const existing = subscribers.find((s) => s.email === sanitizedEmail);
    if (!existing) {
      subscribers.push({
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
      });
      fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to status updates',
      email: sanitizedEmail,
    });
  } catch (error) {
    console.error('Error saving subscriber:', error);
    return res.status(200).json({
      success: true,
      message: 'Subscription noted',
      email: sanitizedEmail,
    });
  }
}
