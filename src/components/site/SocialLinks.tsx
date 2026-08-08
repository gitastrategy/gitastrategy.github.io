import { Facebook, Linkedin } from "lucide-react";
import { socialLinks } from "../../data/profile";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const icons = {
  LinkedIn: Linkedin,
  Facebook: Facebook,
  X: XIcon,
} as const;

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {socialLinks.map((s) => {
        const Icon = icons[s.label];
        return (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Gita Strategy on ${s.label} (opens in a new tab)`}
              title={s.label}
              className="grid h-11 w-11 place-items-center rounded-full border border-current/30 transition-colors hover:bg-current/10 focus-visible:outline-none"
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
