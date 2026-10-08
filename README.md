# ProDevOpsGuy Status Dashboard

![banner](https://imgur.com/swyz5EF.png)

A modern, responsive status dashboard for monitoring the health and uptime of web services and applications. Built with Next.js and Tailwind CSS.

## Features

- 🚦 Real-time service status monitoring with fallback to static data
- 📊 **90-Day Real Uptime History & SLA Telemetry** (no simulated data)
- 🔒 **SSL/TLS Certificate Health & Expiration Monitoring** (< 14 days warning)
- 🛡️ **Dynamic Embeddable SVG Badges** for GitHub READMEs (`/api/badge/[id].svg`)
- 📡 **RSS 2.0 Incident & Status Feed** (`/api/feed`)
- 📣 **Multi-Channel Outage Alerts** via Telegram, Discord, and Slack webhooks
- 🔎 **Interactive Search & Status Filtering** by operational state
- 📈 **SLA Arc Gauge & Contribution-Style Heatmap**
- 🔔 Incident reporting and history tracking
- ⏱️ Response time monitoring and latency profiling
- 🤖 Automated status checks via GitHub Actions with 90-day retention
- 🔄 Dual-mode: real-time live checks + static CDN fallback
- 🌓 Dark/light mode with persistence
- 📱 Fully responsive design for mobile, tablet, and desktop
- 🔍 Detailed site-specific diagnostic terminal panel (`/site/[id]`)

## Getting Started

### Prerequisites

- Node.js (v14.x or newer)
- npm or yarn
- GitHub account (for GitHub Actions functionality)

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/status.prodevopsguytech.com.git
cd status.prodevopsguytech.com
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard

### Setting Up GitHub Actions

The dashboard includes automated status checks through GitHub Actions:

1. Push the code to your GitHub repository
2. GitHub Actions will automatically run on the configured schedule (4 times daily)
3. The workflow will:
   - Check the status of all configured websites
   - Update a JSON file with the results
   - Commit the changes back to the repository

You can also manually trigger the workflow from the Actions tab in your GitHub repository.

## Project Structure

- `/components` - Reusable UI components
- `/pages` - Next.js pages and API routes
- `/lib` - Utility functions and helpers
  - `/lib/services` - Service integrations like statusChecker
  - `/lib/utils` - Utility functions including status data handling
- `/public` - Static assets and generated status data
- `/styles` - Global styles and Tailwind configuration
- `/scripts` - Status checking and data update scripts
- `/.github/workflows` - GitHub Actions workflow configurations

## Customization

### Service Configuration

To add or modify the services displayed on the dashboard, edit the configuration in these places:

- For real-time monitoring: Update the `sitesConfig` array in `/pages/api/status.js`
- For GitHub Actions monitoring: Update the same configuration in `/scripts/check-status.js`

### Status Check Frequency

To change how often the GitHub Actions workflow runs:

1. Edit `.github/workflows/status-checker.yml`
2. Modify the `cron` schedule expression under the `schedule` section

### Theming

The project uses Tailwind CSS for styling. You can customize colors, fonts, and other design elements in the `tailwind.config.js` file.

### Status Data Location

By default, the status data is stored in `/public/status-data.json`. You can change this in:

- `/scripts/check-status.js` - For the GitHub Actions script
- `/pages/api/static-status.js` - For the API endpoint

## Deployment

This application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

### Deploy to Vercel

The easiest way to deploy:

```bash
npm run build
vercel --prod
```

### GitHub Actions Configuration

When deploying to a platform like Vercel or Netlify, make sure to:

1. Set up the repository connection in your deployment platform
2. Ensure GitHub Actions has write permissions to the repository
3. Verify that the generated status data file is being included in deployments

## Usage

### Manual Status Checking

You can manually run the status checks with:

```bash
npm run check-status
```

### Updating Status Data from API

To update the static status data from the API:

```bash
npm run update-status
```

## How It Works

1. **Real-time Status Checks**: The application can perform real-time checks via API endpoints
2. **Scheduled GitHub Actions**: Automated checks run on a schedule to update static data
3. **Fallback Mechanism**: The UI falls back to static data if real-time checks fail
4. **Historical Data**: Performance and uptime history are maintained over time
5. **Status Notifications**: Users are notified of status changes as they occur

## License

MIT

## Author & Community  

This project is crafted with 💡 by **[Harshhaa](https://github.com/NotHarshhaa)**.  
Your feedback is always welcome! Let's build together. 🚀  

📧 **Connect with me:**  
🔗 **GitHub**: [@NotHarshhaa](https://github.com/NotHarshhaa)  
🔗 **Blog**: [ProDevOpsGuy](https://blog.prodevopsguy.xyz)  
🔗 **Telegram Community**: [Join Here](https://t.me/prodevopsguy)  
🔗 **LinkedIn**: [Harshhaa Vardhan Reddy](https://www.linkedin.com/in/harshhaa-vardhan-reddy/)  

---

## Support the Project  

If this helped you, consider:  
✅ **Starring** ⭐ this repository  
✅ **Sharing** 📢 with your network  

---

### Stay Connected  

![Follow Me](https://imgur.com/2j7GSPs.png)
