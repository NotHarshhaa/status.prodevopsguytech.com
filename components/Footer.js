import Link from "next/link";
import { Github, Linkedin, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] mt-auto relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />

      <div className="status-container-wide py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="max-w-sm">
            <p className="text-base font-bold">ProDevOpsGuy Tech</p>
            <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
              Real-time status monitoring for all ProDevOpsGuy platforms.
              Updated automatically every few minutes.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-4 font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems monitored
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="status-section-title">Connect</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://www.prodevopsguytech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="status-btn-secondary text-xs"
              >
                Main site
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://github.com/NotHarshhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="status-btn-secondary p-2.5"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/harshhaa-vardhan-reddy/"
                target="_blank"
                rel="noopener noreferrer"
                className="status-btn-secondary p-2.5"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>© {year} ProDevOpsGuy. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            Built with
            <Heart className="h-3 w-3 text-red-400 fill-red-400" />
            on{" "}
            <Link href="/" className="status-link font-mono">
              status.prodevopsguytech.com
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
