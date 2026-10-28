// Configuration file for all monitored sites
import {
  Rocket,
  Monitor,
  BookOpen,
  Package,
  Compass,
  Newspaper,
  Cloud,
  Container,
  FlaskConical,
  Wrench,
  FileText,
  BarChart3,
} from "lucide-react";

export const ICON_COMPONENTS = {
  Rocket,
  Monitor,
  BookOpen,
  Package,
  Compass,
  Newspaper,
  Cloud,
  Container,
  FlaskConical,
  Wrench,
  FileText,
  BarChart3,
};

const sites = [
  {
    id: "main",
    name: "ProDevOpsGuyTech Community",
    description:
      "A passionate community built for DevOps and Cloud enthusiasts, learners, and professionals",
    url: "https://www.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: Rocket,
    iconName: "Rocket",
  },
  {
    id: "projects",
    name: "Real-Time Projects Hub",
    description: "Hands-on DevOps projects from beginner to advanced",
    url: "https://projects.prodevopsguytech.com",
    healthEndpoints: ["/", "/health", "/api/health", "/status"],
    icon: Monitor,
    iconName: "Monitor",
  },
  {
    id: "docs",
    name: "Ultimate Docs Portal",
    description: "900+ curated DevOps learning materials",
    url: "https://docs.prodevopsguytech.com",
    healthEndpoints: ["/", "/health", "/api/health"],
    icon: BookOpen,
    iconName: "BookOpen",
  },
  {
    id: "repos",
    name: "Repositories Central",
    description: "Collection of scripts, infrastructure code & prep content",
    url: "https://repos.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: Package,
    iconName: "Package",
  },
  {
    id: "jobs",
    name: "Jobs Portal",
    description: "Find your next DevOps career opportunity",
    url: "https://jobs.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: Compass,
    iconName: "Compass",
  },
  {
    id: "blog",
    name: "DevOps Blog",
    description: "Deep dives into DevOps practices & tutorials",
    url: "https://blog.prodevopsguytech.com",
    healthEndpoints: ["/"],
    icon: Newspaper,
    iconName: "Newspaper",
    botProtected: true,
  },
  {
    id: "cloud",
    name: "Cloud Blog",
    description: "Cloud architecture & implementation guides",
    url: "https://cloud.prodevopsguytech.com",
    healthEndpoints: ["/"],
    icon: Cloud,
    iconName: "Cloud",
    botProtected: true,
  },
  {
    id: "docker2k8s",
    name: "Docker to Kubernetes",
    description: "Master containerization journey",
    url: "https://dockertok8s.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: Container,
    iconName: "Container",
  },
  {
    id: "cheatsheet",
    name: "DevOps Cheatsheet",
    description: "Comprehensive tools & practices",
    url: "https://cheatsheet.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: FileText,
    iconName: "FileText",
  },
  {
    id: "monitoring",
    name: "DevOps Monitoring Platform",
    description:
      "A ready-to-use advanced monitoring platform for DevOps engineers and beginners",
    url: "https://devops-monitoring-in-a-box.vercel.app",
    healthEndpoints: ["/", "/health", "/api/health"],
    icon: BarChart3,
    iconName: "BarChart3",
  },
  {
    id: "interviews",
    name: "DevOps Interview Hub",
    description:
      "DevOps 1100+ interview preparation materials, Q&A sets, and scenario-based practice",
    url: "https://interviews.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: FileText,
    iconName: "FileText",
  },
  {
    id: "devopstools",
    name: "DevOps Arsenal",
    description:
      "Collection of essential DevOps tools and utilities for daily use",
    url: "https://tools.prodevopsguytech.com",
    healthEndpoints: ["/", "/health"],
    icon: Wrench,
    iconName: "Wrench",
  },
];

export default sites;

/**
 * Finds a site configuration by ID
 * @param {string} id
 */
export function getSiteById(id) {
  return sites.find((s) => s.id === id) || null;
}
