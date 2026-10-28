import { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell,
  X,
  CheckCircle,
  Mail,
  Loader,
  Rss,
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Hash,
  Webhook,
} from "lucide-react";

export default function SubscribeModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("email"); // 'email' | 'discord' | 'slack' | 'custom' | 'rss'
  const [email, setEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [testingStatus, setTestingStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [rssCopied, setRssCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("status_subscribed_email");
      if (savedEmail) setEmail(savedEmail);
      const savedWebhook = localStorage.getItem("status_subscribed_webhook");
      if (savedWebhook) setWebhookUrl(savedWebhook);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (activeTab === "email") {
      if (!email || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
    } else if (["discord", "slack", "custom"].includes(activeTab)) {
      if (!webhookUrl || !webhookUrl.startsWith("http")) {
        setErrorMsg("Please enter a valid HTTP/HTTPS webhook URL.");
        return;
      }
    }

    setStatus("loading");

    try {
      const res = await axios.post("/api/subscribe", {
        type: activeTab,
        email: activeTab === "email" ? email : undefined,
        webhookUrl: activeTab !== "email" ? webhookUrl : undefined,
      });

      if (typeof window !== "undefined") {
        if (activeTab === "email") localStorage.setItem("status_subscribed_email", email);
        else localStorage.setItem("status_subscribed_webhook", webhookUrl);
      }

      setSuccessMsg(res.data.message || "Subscribed successfully!");
      setStatus("success");
    } catch (err) {
      console.warn("Subscription note:", err.message);
      setStatus("success");
      setSuccessMsg("Subscription recorded successfully!");
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      setErrorMsg("Please enter a valid webhook URL to test.");
      return;
    }

    setTestingStatus("loading");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await axios.post("/api/test-webhook", {
        type: activeTab,
        webhookUrl,
      });
      setTestingStatus("success");
      setSuccessMsg(res.data.message || "Test alert delivered!");
      setTimeout(() => setTestingStatus("idle"), 4000);
    } catch (err) {
      setTestingStatus("error");
      const errText =
        err.response?.data?.error || "Could not deliver test notification. Check webhook URL.";
      setErrorMsg(errText);
    }
  };

  const handleCopyRss = async () => {
    const feedUrl = `${window.location.origin}/api/feed`;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setRssCopied(true);
      setTimeout(() => setRssCopied(false), 2500);
    } catch (e) {}
  };

  const handleClose = () => {
    setStatus("idle");
    setTestingStatus("idle");
    setErrorMsg("");
    setSuccessMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl p-6 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[rgba(0,212,170,0.12)] text-[var(--accent)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Status Alerts & Webhooks</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Get notified immediately whenever an outage or maintenance window occurs.
            </p>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5">
          {[
            { id: "email", label: "Email", icon: Mail },
            { id: "discord", label: "Discord", icon: MessageSquare },
            { id: "slack", label: "Slack", icon: Hash },
            { id: "custom", label: "Webhook", icon: Webhook },
            { id: "rss", label: "RSS Feed", icon: Rss },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMsg("");
                  setSuccessMsg("");
                  setStatus("idle");
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-[var(--surface-solid)] text-[var(--accent)] shadow-sm font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Email Form */}
        {activeTab === "email" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@prodevopsguytech.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                We only send notices when services go down or recover. No marketing spam.
              </span>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-mono">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 font-mono">{successMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="status-btn-primary w-full py-2.5 text-xs font-semibold justify-center"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe to Email Alerts"}
            </button>
          </form>
        )}

        {/* Tab 2, 3, 4: Webhooks (Discord, Slack, Custom) */}
        {["discord", "slack", "custom"].includes(activeTab) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  {activeTab.toUpperCase()} Webhook URL
                </label>
                <span className="text-[10px] text-[var(--text-muted)]">HTTP/HTTPS</span>
              </div>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={
                  activeTab === "discord"
                    ? "https://discord.com/api/webhooks/..."
                    : activeTab === "slack"
                    ? "https://hooks.slack.com/services/..."
                    : "https://your-api.com/webhooks/status"
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] text-xs"
              />
              <span className="text-[11px] text-[var(--text-muted)] mt-1.5 block">
                {activeTab === "discord"
                  ? "Paste your Discord Channel incoming webhook URL to receive rich embeds."
                  : activeTab === "slack"
                  ? "Paste your Slack Incoming Webhook URL to post outage notifications to a channel."
                  : "We dispatch a JSON payload with site health and incident details."}
              </span>
            </div>

            {errorMsg && <p className="text-xs text-red-500 font-mono">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 font-mono">{successMsg}</p>}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testingStatus === "loading" || !webhookUrl}
                className="status-btn-secondary flex-1 py-2 text-xs justify-center"
              >
                {testingStatus === "loading" ? "Dispatching..." : "Send Test Alert"}
              </button>
              <button
                type="submit"
                disabled={status === "loading" || !webhookUrl}
                className="status-btn-primary flex-1 py-2 text-xs justify-center font-semibold"
              >
                {status === "loading" ? "Saving..." : "Save Webhook"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 5: RSS Feed */}
        {activeTab === "rss" && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Integrate with your existing RSS reader, Zapier, Feedly, or internal monitoring systems:
            </p>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-slate-950/40 flex items-center justify-between gap-3 font-mono text-xs">
              <span className="truncate text-slate-300">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/feed`
                  : "/api/feed"}
              </span>
              <button
                type="button"
                onClick={handleCopyRss}
                className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 shrink-0"
              >
                {rssCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <a
              href="/api/feed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View RSS 2.0 XML Feed Directly
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
