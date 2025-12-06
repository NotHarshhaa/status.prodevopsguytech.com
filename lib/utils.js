// Utility functions for the status site

/**
 * Toggle between dark and light mode
 * @param {Function} setDarkMode - State setter function for dark mode
 */
export const toggleDarkMode = (prevMode) => {
  const newMode = !prevMode;
  
  // Update document class immediately
  if (newMode) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  // Save preference to localStorage
  try {
    localStorage.setItem('darkMode', newMode ? 'true' : 'false');
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }

  return newMode;
};

/**
 * Initialize dark mode based on user preference or system preference
 * @returns {boolean} Whether dark mode should be enabled
 */
export const initializeDarkMode = () => {
  if (typeof window === 'undefined') return false;

  try {
    const savedPreference = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedPreference === 'true' || (!savedPreference && systemPrefersDark);

    // Update document class immediately
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    return shouldBeDark;
  } catch (e) {
    console.warn('Failed to initialize theme:', e);
    return false;
  }
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {string} format - Format pattern (simple/full/relative)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'simple') => {
  const dateObj = date instanceof Date ? date : new Date(date);

  switch (format) {
    case 'full':
      return dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    case 'relative': {
      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }
    case 'simple':
    default:
      return dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
  }
};

/**
 * Helper function to get color classes based on status
 * @param {string} status - The status string
 * @returns {Object} Object containing color classes for different elements
 */
export const getStatusColors = (status) => {
  switch (status.toLowerCase()) {
    case 'operational':
      return {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-100',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500'
      };
    case 'degraded':
    case 'degraded_performance':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-100',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-500'
      };
    case 'partial_outage':
      return {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        text: 'text-orange-800 dark:text-orange-100',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-500'
      };
    case 'major_outage':
      return {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-100',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-500'
      };
    case 'maintenance':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-100',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500'
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        border: 'border-gray-200 dark:border-gray-700',
        icon: 'text-gray-500'
      };
  }
};

/**
 * Filter services by category
 * @param {Array} services - List of services
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered services
 */
export const filterServicesByCategory = (services, category) => {
  if (!category || category === 'all') return services;
  return services.filter(service => service.category === category);
};

/**
 * Get unique categories from services list
 * @param {Array} services - List of services
 * @returns {Array} List of unique categories
 */
export const getUniqueCategories = (services) => {
  const categories = services.map(service => service.category);
  return ['all', ...new Set(categories)];
};

/**
 * Simulates fetching data from an API
 * In a real app, this would be replaced with actual API calls
 * @returns {Object} Mock data
 */
export const fetchMockData = () => {
  // Mock services data
  const services = [
    {
      id: 1,
      name: 'Main Website',
      description: 'prodevopsguy.tech main website',
      status: 'operational',
      uptime: '99.98',
      category: 'websites',
      lastUpdated: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: 2,
      name: 'API Gateway',
      description: 'Public API endpoints',
      status: 'operational',
      uptime: '99.95',
      category: 'api',
      lastUpdated: new Date(Date.now() - 180000), // 3 minutes ago
    },
    {
      id: 3,
      name: 'Database Cluster',
      description: 'Primary database services',
      status: 'degraded_performance',
      uptime: '98.43',
      category: 'infrastructure',
      lastUpdated: new Date(Date.now() - 240000), // 4 minutes ago
    },
    {
      id: 4,
      name: 'Authentication Service',
      description: 'User authentication and authorization',
      status: 'operational',
      uptime: '99.99',
      category: 'authentication',
      lastUpdated: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: 5,
      name: 'Notification Service',
      description: 'Email and push notifications',
      status: 'operational',
      uptime: '99.91',
      category: 'communication',
      lastUpdated: new Date(Date.now() - 420000), // 7 minutes ago
    },
    {
      id: 6,
      name: 'Blog Platform',
      description: 'Content management system',
      status: 'operational',
      uptime: '99.97',
      category: 'websites',
      lastUpdated: new Date(Date.now() - 360000), // 6 minutes ago
    },
    {
      id: 7,
      name: 'CDN',
      description: 'Content delivery network',
      status: 'operational',
      uptime: '99.99',
      category: 'infrastructure',
      lastUpdated: new Date(Date.now() - 540000), // 9 minutes ago
    },
  ];

  // Mock incidents data
  const incidents = [
    {
      id: 1,
      title: 'Database Performance Issues',
      date: new Date(Date.now() - 86400000), // 1 day ago
      status: 'investigating',
      message: 'We are investigating reports of slow response times on our database cluster.',
      resolved: true,
      resolvedAt: new Date(Date.now() - 82800000), // 23 hours ago
      affectedServices: [3]
    },
    {
      id: 2,
      title: 'API Gateway Downtime',
      date: new Date(Date.now() - 604800000), // 7 days ago
      status: 'resolved',
      message: 'The API gateway experienced a 15-minute outage due to a configuration error during deployment.',
      resolved: true,
      resolvedAt: new Date(Date.now() - 603600000), // 6 days, 23 hours ago
      affectedServices: [2]
    },
    {
      id: 3,
      title: 'Scheduled Database Maintenance',
      date: new Date(Date.now() + 86400000), // 1 day in future
      status: 'scheduled',
      message: 'We will be performing scheduled maintenance on our database systems. Expect intermittent slowdowns.',
      resolved: false,
      resolvedAt: null,
      affectedServices: [3]
    }
  ];

  return { services, incidents };
};
