import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award } from "lucide-react";

const SLAGauge = ({ sites = [] }) => {
  const canvasRef = useRef(null);

  // Calculate SLA
  const operationalCount = sites.filter(
    (s) => s.status === "operational"
  ).length;
  const sla =
    sites.length > 0 ? (operationalCount / sites.length) * 100 : 100;
  const slaDisplay = sla.toFixed(1);

  // Draw arc gauge
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 140;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 55;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const lineWidth = 12;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = "rgba(156,163,175,0.2)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Determine color based on SLA
    let color;
    if (sla >= 99) color = "#10b981"; // green
    else if (sla >= 95) color = "#f59e0b"; // amber
    else color = "#ef4444"; // red

    // Filled arc
    const fillEnd =
      startAngle + ((endAngle - startAngle) * sla) / 100;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, fillEnd);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, fillEnd);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [sla]);

  const getSLALabel = () => {
    if (sla >= 99.9) return "Excellent";
    if (sla >= 99) return "Great";
    if (sla >= 95) return "Fair";
    return "Needs Attention";
  };

  const getSLAColor = () => {
    if (sla >= 99) return "text-green-600 dark:text-green-400";
    if (sla >= 95) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <motion.div
      className="metrics-card flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full" />

      <div className="flex items-center gap-2 mb-3 self-start w-full">
        <div className="bg-indigo-100/80 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-200/50 dark:border-indigo-700/30">
          <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current SLA
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-500">
            Service Level Agreement
          </p>
        </div>
      </div>

      {/* Canvas gauge */}
      <div className="relative flex items-center justify-center my-1">
        <canvas ref={canvasRef} />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getSLAColor()}`}>
            {slaDisplay}%
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {getSLALabel()}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-2 w-full justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {operationalCount}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Healthy
          </p>
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {sites.length - operationalCount}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Issues
          </p>
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {sites.length}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Total
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SLAGauge;
