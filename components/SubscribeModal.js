import { useState } from "react";
import { Bell, X, CheckCircle, Mail, Loader } from "lucide-react";

export default function SubscribeModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  const handleClose = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md status-card shadow-xl p-6"
        role="dialog"
        aria-labelledby="subscribe-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {status === "success" ? (
          <div className="text-center py-2">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 id="subscribe-title" className="text-lg font-semibold mb-2">
              You&apos;re subscribed
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              We&apos;ll email <strong>{email}</strong> when status changes.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="status-btn-primary mt-6"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-md bg-[var(--page-bg)]">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 id="subscribe-title" className="text-lg font-semibold">
                  Subscribe to updates
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Get notified about incidents and maintenance
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="status-input pl-10"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="status-btn-primary w-full"
              >
                {status === "loading" ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
