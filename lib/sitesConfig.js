// Configuration file for all monitored sites

const sites = [
  {
    id: 'main',
    name: 'ProDevOpsGuyTech Community',
    description: 'A passionate community built for DevOps and Cloud enthusiasts, learners, and professionals',
    url: 'https://www.prodevopsguytech.com',
    icon: '🚀',
  },
  {
    id: 'projects',
    name: 'Real-Time Projects Hub',
    description: 'Hands-on DevOps projects from beginner to advanced',
    url: 'https://projects.prodevopsguytech.com',
    icon: '💻',
  },
  {
    id: 'docs',
    name: 'Ultimate Docs Portal',
    description: '900+ curated DevOps learning materials',
    url: 'https://docs.prodevopsguytech.com',
    icon: '📚',
  },
  {
    id: 'repos',
    name: 'Repositories Central',
    description: 'Collection of scripts, infrastructure code & prep content',
    url: 'https://repos.prodevopsguytech.com',
    icon: '📦',
  },
  {
    id: 'jobs',
    name: 'Jobs Portal',
    description: 'Find your next DevOps career opportunity',
    url: 'https://jobs.prodevopsguytech.com',
    icon: '🧭',
  },
  {
    id: 'blog',
    name: 'DevOps Blog',
    description: 'Deep dives into DevOps practices & tutorials',
    url: 'https://blog.prodevopsguytech.com',
    icon: '📰',
  },
  {
    id: 'cloud',
    name: 'Cloud Blog',
    description: 'Cloud architecture & implementation guides',
    url: 'https://cloud.prodevopsguytech.com',
    icon: '☁️',
  },
  {
    id: 'docker2k8s',
    name: 'Docker to Kubernetes',
    description: 'Master containerization journey',
    url: 'https://dockertokubernetes.live',
    icon: '🐳',
  },
  {
    id: 'devopslab',
    name: 'DevOps Engineering Lab',
    description: 'A digital playground and lab bench where we experiment with CI/CD workflows, infrastructure automation, and observability stacks',
    url: 'https://www.devops-engineering.site',
    icon: '🔬',
  },
  {
    id: 'toolguides',
    name: 'DevOps Tool Guides',
    description: 'Setup & installation guides',
    url: 'https://www.devopsguides.site',
    icon: '🛠️',
  },
  {
    id: 'cheatsheet',
    name: 'DevOps Cheatsheet',
    description: 'Comprehensive tools & practices',
    url: 'https://cheatsheet.prodevopsguytech.com',
    icon: '📑',
  },
  {
    id: 'monitoring',
    name: 'DevOps Monitoring Platform',
    description: 'A ready-to-use advanced monitoring platform for DevOps engineers and beginners',
    url: 'https://devops-monitoring-in-a-box.vercel.app',
    icon: '📊',
  },
];

export default sites;

// Helper functions for working with sites
export const getSiteStatus = async (site) => {
  // In a real application, this would make an actual HTTP request
  // or connect to a monitoring service like Pingdom, UptimeRobot, etc.

  // For now, we'll simulate status with random values
  // In production, replace this with actual status checks
  const statusOptions = ['operational', 'degraded', 'outage'];
  const randomStatus = Math.random() > 0.8
    ? (Math.random() > 0.5 ? 'degraded' : 'outage')
    : 'operational';

  const lastChecked = new Date();

  return {
    id: site.id,
    name: site.name,
    url: site.url,
    status: randomStatus,
    statusText: randomStatus === 'operational'
      ? 'Operational'
      : randomStatus === 'degraded'
        ? 'Degraded Performance'
        : 'Outage',
    lastChecked,
    responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
  };
};

export const checkAllSites = async () => {
  const statusPromises = sites.map(site => getSiteStatus(site));
  return Promise.all(statusPromises);
};
