import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, Mail, ArrowRight, Loader } from "lucide-react";

const SubscribeModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  };

  const handleClose = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top gradient accent */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {status === "success" ? (
                  <motion.div
                    className="text-center py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      You&apos;re subscribed!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      We&apos;ll notify you at <strong>{email}</strong> whenever
                      there&apos;s a status change or incident.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-700/50">
                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Status Notifications
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Get notified about outages & incidents
                        </p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 mb-5">
                      {[
                        "Instant alerts for outages and degradation",
                        "Maintenance window notifications",
                        "Incident resolution updates",
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {errorMsg && (
                        <p className="text-xs text-red-500">{errorMsg}</p>
                      )}
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            Subscribe to Updates
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                        No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Trigger button component
export const SubscribeButton = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    <Bell className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Subscribe</span>
  </motion.button>
);

export default SubscribeModal;
