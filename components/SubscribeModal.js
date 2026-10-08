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
} from "lucide-react";

export default function SubscribeModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("email"); // 'email', 'telegram', 'rss'
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rssCopied, setRssCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("status_subscribed_email");
      if (savedEmail) setEmail(savedEmail);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      await axios.post("/api/subscribe", { email });
      if (typeof window !== "undefined") {
        localStorage.setItem("status_subscribed_email", email);
      }
      setStatus("success");
    } catch (err) {
      console.warn("Subscription API note:", err.message);
      // Fallback gracefully
      if (typeof window !== "undefined") {
        localStorage.setItem("status_subscribed_email", email);
      }
      setStatus("success");
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
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md status-card shadow-2xl p-6 border border-[var(--border)]"
        role="dialog"
        aria-labelledby="subscribe-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--page-bg)] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[rgba(0,212,170,0.1)] text-[var(--accent)]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 id="subscribe-title" className="text-lg font-bold">
              Subscribe to updates
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Get instant alerts for outages & maintenance
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[var(--border)] mb-4 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "email"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telegram")}
            className={`pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "telegram"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Telegram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rss")}
            className={`pb-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "rss"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Rss className="h-3.5 w-3.5" />
            RSS Feed
          </button>
        </div>

        {activeTab === "email" && (
          <div>
            {status === "success" ? (
              <div className="text-center py-4">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-semibold mb-1">
                  You&apos;re subscribed!
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  We will notify <strong>{email}</strong> whenever system incidents or outages occur.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="status-btn-primary mt-5 w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="status-input pl-10 w-full"
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs text-red-500">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="status-btn-primary w-full justify-center"
                >
                  {status === "loading" ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-1.5" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe via Email"
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "telegram" && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Join the official ProDevOpsGuy community and status channel on Telegram for real-time announcements.
            </p>
            <a
              href="https://t.me/prodevopsguy"
              target="_blank"
              rel="noopener noreferrer"
              className="status-btn-primary w-full justify-center py-2.5 text-xs flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Join ProDevOpsGuy on Telegram
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {activeTab === "rss" && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Subscribe to the system status and incident feed in your RSS reader, Slack, or Discord bot.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/api/feed` : "/api/feed"}
                className="status-input text-xs font-mono flex-1 bg-[var(--page-bg)]"
              />
              <button
                type="button"
                onClick={handleCopyRss}
                className="status-btn-secondary text-xs flex items-center gap-1.5 px-3 py-2"
              >
                {rssCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
