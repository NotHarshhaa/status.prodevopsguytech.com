import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HistoricalChart = ({ siteHistory, siteId, siteName, embedded = false }) => {
  const [timeRange, setTimeRange] = useState('24h');

  if (!siteHistory) {
    return (
      <div className="flex justify-center items-center h-48 text-sm text-[var(--text-muted)]">
        No historical data available
      </div>
    );
  }

  const { hourlyData, dailyData } = siteHistory;

  const prepareChartData = () => {
    if (timeRange === '24h') {
      // Prepare data for the last 24 hours
      const labels = hourlyData.map(data =>
        new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      const responseTimeData = hourlyData.map(data => data.responseTime);

      const statusColorData = hourlyData.map(data => {
        switch (data.status) {
          case 'operational':
            return 'rgba(16, 185, 129, 0.2)'; // Green
          case 'degraded':
            return 'rgba(245, 158, 11, 0.2)'; // Yellow
          case 'outage':
            return 'rgba(239, 68, 68, 0.2)'; // Red
          default:
            return 'rgba(107, 114, 128, 0.2)'; // Gray
        }
      });

      return {
        labels,
        datasets: [
          {
            label: 'Response Time (ms)',
            data: responseTimeData,
            borderColor: 'rgba(59, 130, 246, 1)', // Blue
            backgroundColor: statusColorData,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: hourlyData.map(data => {
              switch (data.status) {
                case 'operational': return 'rgb(16, 185, 129)'; // Green
                case 'degraded': return 'rgb(245, 158, 11)'; // Yellow
                case 'outage': return 'rgb(239, 68, 68)'; // Red
                default: return 'rgb(107, 114, 128)'; // Gray
              }
            })
          }
        ]
      };
    } else {
      // Prepare data for the last 30 days
      const labels = dailyData.map(data =>
        new Date(data.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
      );

      return {
        labels,
        datasets: [
          {
            label: 'Response Time (ms)',
            data: dailyData.map(data => data.avgResponseTime),
            borderColor: 'rgba(59, 130, 246, 1)', // Blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            yAxisID: 'y',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 2,
          },
          {
            label: 'Uptime (%)',
            data: dailyData.map(data => data.uptime),
            borderColor: 'rgba(16, 185, 129, 1)', // Green
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            yAxisID: 'y1',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 2,
          }
        ]
      };
    }
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          color: 'rgb(var(--foreground-rgb))'
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(var(--foreground-rgb))',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        title: {
          display: true,
          text: 'Response Time (ms)',
          color: 'rgb(var(--foreground-rgb))',
        },
        ticks: {
          color: 'rgb(var(--foreground-rgb))',
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
      ...(timeRange === '30d' ? {
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 98.5,
          max: 100,
          title: {
            display: true,
            text: 'Uptime (%)',
            color: 'rgb(var(--foreground-rgb))',
          },
          ticks: {
            color: 'rgb(var(--foreground-rgb))',
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      } : {})
    },
  };

  const tabClass = (active) =>
    `px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
      active
        ? "bg-[#0969da] text-white border-[#0969da] dark:bg-[#238636] dark:border-[#238636]"
        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--page-bg)]"
    }`;

  return (
    <div className={embedded ? "" : "status-card p-4 sm:p-5"}>
      {!embedded && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold truncate">{siteName}</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTimeRange("24h")} className={tabClass(timeRange === "24h")}>
              24 Hours
            </button>
            <button type="button" onClick={() => setTimeRange("30d")} className={tabClass(timeRange === "30d")}>
              30 Days
            </button>
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setTimeRange("24h")} className={tabClass(timeRange === "24h")}>
            24 Hours
          </button>
          <button type="button" onClick={() => setTimeRange("30d")} className={tabClass(timeRange === "30d")}>
            30 Days
          </button>
        </div>
      )}
      <div className="h-48 sm:h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="mt-3 text-xs text-[var(--text-muted)]">
        {timeRange === "24h" ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Operational
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Degraded
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Outage
            </span>
          </div>
        ) : (
          <p>30-day historical data showing average response times and uptime</p>
        )}
      </div>
    </div>
  );
};

export default HistoricalChart;
