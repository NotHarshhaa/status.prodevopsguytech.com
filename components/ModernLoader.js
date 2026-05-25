import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Shield } from "lucide-react";

const ModernLoader = ({ message = "Loading status data..." }) => {
  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[320px] space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)",
          }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Activity className="h-8 w-8 text-white" strokeWidth={2} />
        </motion.div>

        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-emerald-500 rounded-full shadow-glow"
          variants={dotVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-2 h-2 bg-amber-400 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: 0.2 }}
        />
        <motion.div
          className="absolute -top-1 -left-2 w-2 h-2 bg-indigo-400 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: 0.4 }}
        />
      </div>

      <div className="text-center space-y-2">
        <motion.h3
          className="text-lg font-bold"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.h3>
        <p className="text-sm text-[var(--text-muted)] font-mono">
          Fetching real-time status updates...
        </p>
      </div>

      <div className="w-56 h-1 rounded-full overflow-hidden bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent-secondary))",
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex gap-6">
        {[
          { icon: Zap, label: "Real-time monitoring" },
          { icon: Shield, label: "Secure connection" },
        ].map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.2 }}
          >
            <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
            {label}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ModernLoader;
