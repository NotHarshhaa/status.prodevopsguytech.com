import { motion } from "framer-motion";

const STATUS_CONFIG = {
  operational: {
    ring: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    core: "#34d399",
    speed: 8,
  },
  degraded: {
    ring: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    core: "#fbbf24",
    speed: 5,
  },
  outage: {
    ring: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
    core: "#f87171",
    speed: 3,
  },
  maintenance: {
    ring: "#6366f1",
    glow: "rgba(99, 102, 241, 0.4)",
    core: "#818cf8",
    speed: 6,
  },
  unknown: {
    ring: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.3)",
    core: "#cbd5e1",
    speed: 10,
  },
};

export default function StatusRing({ status = "operational", size = 120 }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  const stroke = 3;
  const radius = (size - stroke * 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 40px ${cfg.glow}` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: cfg.speed / 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating dashed ring */}
      <motion.svg
        width={size}
        height={size}
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: cfg.speed, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius + 6}
          fill="none"
          stroke={cfg.ring}
          strokeWidth={1}
          strokeDasharray="6 8"
          opacity={0.4}
        />
      </motion.svg>

      {/* Progress arc */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={cfg.ring}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * 0.15 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: `drop-shadow(0 0 6px ${cfg.glow})` }}
        />
      </svg>

      {/* Counter-rotating inner ring */}
      <motion.svg
        width={size}
        height={size}
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: cfg.speed * 1.5, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius - 8}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeDasharray="3 6"
        />
      </motion.svg>

      {/* Core pulse */}
      <motion.div
        className="rounded-full z-10"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          background: cfg.core,
          boxShadow: `0 0 16px ${cfg.glow}`,
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: cfg.speed / 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
