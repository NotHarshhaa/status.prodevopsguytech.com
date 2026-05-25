import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Activity, RefreshCw } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/**
 * RealTimeStatusChart Component
 *
 * A dynamic chart for visualizing real-time and historical status data
 * with smooth animations and responsive design
 */
const RealTimeStatusChart = ({
  siteId = "",
  siteName = "Unknown Site",
  className = "",
  timeRange = "24h",
  embedded = false,
}) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const chartRef = useRef(null);

  // Generate mock data based on time range
  const generateData = (range) => {
    const now = new Date();
    const data = [];
    const labels = [];

    // Configure time intervals based on range
    let points = 24;
    let intervalMinutes = 60; // Default 1 hour steps for 24h view
    let format = "HH:mm";

    switch (range) {
      case "1h":
        points = 12;
        intervalMinutes = 5;
        format = "HH:mm";
        break;
      case "7d":
        points = 7;
        intervalMinutes = 60 * 24; // Daily
        format = "MMM DD";
        break;
      case "30d":
        points = 30;
        intervalMinutes = 60 * 24; // Daily
        format = "MMM DD";
        break;
      default: // 24h
        points = 24;
        intervalMinutes = 60;
        format = "HH:mm";
    }

    // Generate random response time data with realistic patterns
    let baseResponseTime = Math.floor(Math.random() * 100) + 150; // Base between 150-250ms
    let currentResponseTime = baseResponseTime;
    let hasOutage = Math.random() > 0.8; // 20% chance of having an outage
    let outagePoint = hasOutage ? Math.floor(Math.random() * points) : -1;

    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);

      // Format the label based on the time range
      const label = formatDate(time, format);
      labels.push(label);

      // Simulate response time variations
      // If at outage point, set to null to break the line
      if (i === outagePoint) {
        data.push(null);
      } else {
        // Add some random variation to response time
        let variation = Math.random() * 40 - 20; // +/- 20ms

        // Occasionally add a spike
        if (Math.random() > 0.9) {
          variation += Math.random() * 100;
        }

        // Update current response time with some "memory" of previous value
        currentResponseTime = Math.max(
          50,
          currentResponseTime * 0.7 + (baseResponseTime + variation) * 0.3,
        );
        data.push(Math.round(currentResponseTime));
      }
    }

    return { labels, data };
  };

  // Simple date formatter
  const formatDate = (date, format) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][d.getMonth()];

    if (format === "HH:mm") {
      return `${hours}:${minutes}`;
    } else {
      return `${month} ${day}`;
    }
  };

  // Load chart data
  const loadChartData = (range) => {
    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const { labels, data } = generateData(range);

      const chartData = {
        labels,
        datasets: [
          {
            label: "Response Time (ms)",
            data: data,
            fill: true,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(59, 130, 246, 1)",
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.4,
            spanGaps: true, // Connect the line across null values (outages)
          },
        ],
      };

      setChartData(chartData);
      setLoading(false);
    }, 800);
  };

  // Refresh chart data
  const refreshData = () => {
    setRefreshing(true);
    loadChartData(selectedTimeRange);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Change time range
  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    loadChartData(range);
  };

  // Initial data load
  useEffect(() => {
    if (siteId) {
      loadChartData(selectedTimeRange);

      // Setup auto-refresh every 30 seconds for 1h view, 5 minutes for other views
      const interval = setInterval(
        () => {
          if (selectedTimeRange === "1h") {
            refreshData();
          }
        },
        selectedTimeRange === "1h" ? 30000 : 300000,
      );

      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, siteId]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(156, 163, 175, 0.05)",
        },
        ticks: {
          color: "rgb(156, 163, 175)",
          callback: (value) => `${value}ms`,
        },
        title: {
          display: true,
          text: "Response Time",
          color: "rgb(156, 163, 175)",
        },
      },
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.05)",
        },
        ticks: {
          color: "rgb(156, 163, 175)",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "rgb(243, 244, 246)",
        bodyColor: "rgb(243, 244, 246)",
        borderColor: "rgba(107, 114, 128, 0.5)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return `${siteName} - ${tooltipItems[0].label}`;
          },
          label: (context) => {
            if (context.raw === null) return "Outage Detected";
            return `Response Time: ${context.raw}ms`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        cubicInterpolationMode: "monotone",
      },
    },
  };

  // Time range options
  const timeRanges = [
    { value: "1h", label: "1 Hour" },
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
  ];

  const tabClass = (active) =>
    `px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
      active
        ? "bg-[#0969da] text-white border-[#0969da] dark:bg-[#238636] dark:border-[#238636]"
        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--page-bg)]"
    }`;

  return (
    <div className={embedded ? className : `status-card p-4 sm:p-5 ${className}`}>
      {!embedded && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0969da] dark:text-[#58a6ff]" />
            <h3 className="text-base font-semibold truncate">{siteName} Performance</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              Updated {new Date().toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={refreshData}
              className="status-btn-secondary p-1.5"
              disabled={loading || refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={refreshData}
            className="status-btn-secondary p-1.5"
            disabled={loading || refreshing}
            aria-label="Refresh chart"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => handleTimeRangeChange(range.value)}
            className={tabClass(selectedTimeRange === range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="relative h-56 sm:h-64">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
          </div>
        ) : chartData ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]">
            No data available
          </div>
        )}
      </div>

      {!loading && chartData?.datasets?.[0]?.data && (
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {[
            {
              label: "Avg",
              value: Math.round(
                chartData.datasets[0].data
                  .filter((v) => v != null)
                  .reduce((a, b) => a + b, 0) /
                  Math.max(1, chartData.datasets[0].data.filter((v) => v != null).length),
              ),
              color: "text-[#0969da] dark:text-[#58a6ff]",
            },
            {
              label: "Min",
              value: Math.min(...chartData.datasets[0].data.filter((v) => v != null)),
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Max",
              value: Math.max(...chartData.datasets[0].data.filter((v) => v != null)),
              color: "text-red-600 dark:text-red-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-[var(--border)] bg-[var(--page-bg)] p-2"
            >
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                {stat.label}
              </div>
              <div className={`text-base font-semibold tabular-nums ${stat.color}`}>
                {stat.value}ms
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeStatusChart;
