import React from "react";
import { Twitter, Github, Linkedin, Heart, Globe, Code, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const year = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/NotHarshhaa",
      icon: Twitter,
      hoverColor: "hover:text-blue-500 dark:hover:text-blue-400",
    },
    {
      name: "GitHub",
      href: "https://github.com/NotHarshhaa",
      icon: Github,
      hoverColor: "hover:text-gray-900 dark:hover:text-white",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/harshhaa-vardhan-reddy/",
      icon: Linkedin,
      hoverColor: "hover:text-blue-700 dark:hover:text-blue-300",
    },
  ];

  return (
    <footer className="glass-header border-t border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile View */}
        <div className="md:hidden py-3">
          <div className="flex flex-col items-center space-y-2">
            <motion.div 
              className="flex items-center space-x-1.5 text-gray-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">ProDevOpsGuy Tech</span>
            </motion.div>

            <motion.div 
              className="flex space-x-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-500 dark:text-gray-400 transition-all duration-300 transform ${link.hoverColor}`}
                  aria-label={link.name}
                  whileTap={{ scale: 0.95 }}
                >
                  <link.icon className="h-4 w-4" strokeWidth={2} />
                </motion.a>
              ))}
            </motion.div>

            <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 dark:text-gray-400">
              <Code className="h-3 w-3" />
              <span>with</span>
              <Heart className="h-3 w-3 text-red-500 animate-pulse" />
              <span>by ProDevOpsGuy</span>
            </div>

            <div className="text-center text-[10px] text-gray-600 dark:text-gray-500">
              <div>Powered by Next.js & Tailwind CSS</div>
              <div>© {year} All rights reserved</div>
            </div>
          </div>
        </div>

        {/* Desktop View (unchanged) */}
        <div className="hidden md:block py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="flex flex-col items-start space-y-3">
              <motion.div 
                className="flex items-center space-x-2 text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">ProDevOpsGuy Tech</span>
              </motion.div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Empowering DevOps excellence through innovative solutions and best practices.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center space-y-4">
              <motion.div 
                className="flex space-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-500 dark:text-gray-400 transition-all duration-300 transform ${link.hoverColor} hover:scale-110`}
                    aria-label={link.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <link.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                  </motion.a>
                ))}
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Code className="h-4 w-4" />
                <span>with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>by ProDevOpsGuy</span>
              </motion.div>
            </div>

            {/* Tech Stack */}
            <div className="hidden lg:flex flex-col items-end space-y-3">
              <motion.div 
                className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GitBranch className="h-4 w-4 text-green-500" />
                <span>Updated via GitHub Actions</span>
              </motion.div>
              <div className="flex flex-col items-end text-xs text-gray-600 dark:text-gray-500">
                <span>Powered by Next.js & Tailwind CSS</span>
                <span>© {year} All rights reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
