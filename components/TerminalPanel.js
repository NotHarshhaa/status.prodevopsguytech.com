import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";

const TYPEWRITER_BASE_DELAY = 0.06;

export default function TerminalPanel({
  title = "status-check",
  lines = [],
  prompt = "prodevops@status",
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const textContent = lines
    .map((l) => `${l.type === "cmd" ? `$ ${l.text}` : l.text}`)
    .join("\n");

  const cumulativeDelay = (index) => {
    let delay = 0.2;
    for (let i = 0; i < index; i++) {
      delay += (lines[i].delay ?? 80) / 1000;
    }
    return delay;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={`terminal-panel ${className}`}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        <span className="terminal-title">
          <Terminal className="h-3 w-3 inline mr-1.5 opacity-60" />
          {title}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="terminal-copy-btn"
          aria-label="Copy terminal output"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="terminal-body">
        {lines.map((line, i) => (
          <motion.div
            key={`${line.type}-${line.text || line.key}-${i}`}
            className="terminal-line"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.15,
              delay: cumulativeDelay(i),
            }}
          >
            {line.type === "cmd" ? (
              <>
                <span className="terminal-prompt">{prompt}</span>
                <span className="terminal-separator">:</span>
                <span className="terminal-path">~</span>
                <span className="terminal-separator">$ </span>
                <span className="terminal-cmd">{line.text}</span>
              </>
            ) : line.type === "success" ? (
              <span className="terminal-success">{line.text}</span>
            ) : line.type === "warn" ? (
              <span className="terminal-warn">{line.text}</span>
            ) : line.type === "error" ? (
              <span className="terminal-error">{line.text}</span>
            ) : line.type === "keyval" ? (
              <span className="terminal-muted">
                <span className="terminal-key">{line.key}</span>
                <span className="terminal-separator">: </span>
                <span className={line.valueClass || "terminal-value"}>{line.value}</span>
              </span>
            ) : (
              <span className="terminal-muted">{line.text}</span>
            )}
          </motion.div>
        ))}
        <motion.span
          className="terminal-cursor"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: cumulativeDelay(lines.length) + TYPEWRITER_BASE_DELAY }}
        />
      </div>
    </div>
  );
}

export function buildSiteTerminalLines(site, uptime90) {
  if (!site) return [];

  const statusLabel = site.statusText || site.status;
  const statusType =
    site.status === "operational"
      ? "success"
      : site.status === "outage"
        ? "error"
        : site.status === "degraded"
          ? "warn"
          : "muted";

  return [
    { type: "cmd", text: `curl -sI ${site.url}`, delay: 100 },
    { type: "muted", text: `HTTP/1.1 ${site.statusCode || 200} OK`, delay: 60 },
    { type: "muted", text: "content-type: text/html", delay: 40 },
    { type: "cmd", text: `status-cli check --service=${site.id}`, delay: 120 },
    { type: "keyval", key: "service", value: site.name, delay: 50 },
    { type: "keyval", key: "endpoint", value: site.url, delay: 50 },
    { type: "keyval", key: "status", value: statusLabel, valueClass: `terminal-${statusType}`, delay: 50 },
    { type: "keyval", key: "response_time", value: site.responseTime != null ? `${site.responseTime}ms` : "—", delay: 50 },
    ...(site.ssl?.hasSSL ? [
      {
        type: "keyval",
        key: "ssl_certificate",
        value: site.ssl.valid
          ? `Valid (${site.ssl.daysRemaining}d remaining - ${site.ssl.issuer})`
          : `Invalid (${site.ssl.error || "Expired"})`,
        valueClass: site.ssl.valid ? (site.ssl.isExpiringSoon ? "terminal-warn" : "terminal-success") : "terminal-error",
        delay: 50,
      }
    ] : []),
    { type: "keyval", key: "uptime_90d", value: `${uptime90}%`, delay: 50 },
    { type: "keyval", key: "last_checked", value: site.lastChecked ? new Date(site.lastChecked).toISOString() : "—", delay: 50 },
    {
      type: statusType === "success" ? "success" : statusType === "error" ? "error" : statusType === "warn" ? "warn" : "muted",
      text:
        site.status === "operational"
          ? "✓ All checks passed — service is healthy"
          : site.status === "outage"
            ? "✗ Service unreachable — investigating"
            : site.status === "degraded"
              ? "⚠ Degraded performance detected"
              : "ℹ Maintenance in progress",
      delay: 80,
    },
  ];
}
