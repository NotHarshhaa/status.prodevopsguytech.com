import Link from "next/link";
import { Github, Linkedin, ExternalLink } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="status-container-wide py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold">ProDevOpsGuy Tech</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              Status page for all ProDevOpsGuy platforms. Updated automatically
              every few minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a
              href="https://www.prodevopsguytech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Main site
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/NotHarshhaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/harshhaa-vardhan-reddy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>© {year} ProDevOpsGuy. All rights reserved.</span>
          <span>
            Powered by{" "}
            <Link href="/" className="hover:text-[var(--text)]">
              status.prodevopsguytech.com
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
