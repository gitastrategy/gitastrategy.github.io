import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";

const nav = [
  { to: "/verses", label: "Verses" },
  { to: "/leadership", label: "Leadership" },
  { to: "/toolkit", label: "Toolkit" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/quotes", label: "Quotes" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-gold)] font-display text-lg text-primary">
            ॐ
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-xl leading-none font-semibold">
              Gita Strategy
            </span>
            <span className="eyebrow block text-[0.6rem] text-muted-foreground">
              Wisdom · Strategy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/newsletter"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Newsletter
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-border/60 bg-background px-5 pb-5 lg:hidden">
          {[...nav, { to: "/newsletter", label: "Newsletter" } as const].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/50 py-3 text-sm text-muted-foreground"
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="surface-dusk mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl">Gita Strategy</h3>
          <p className="mt-3 text-sm opacity-75">
            Ancient wisdom translated into the working language of modern management.
          </p>
        </div>
        <div>
          <p className="eyebrow opacity-60">Explore</p>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            {nav.slice(0, 5).map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:opacity-100 hover:underline">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow opacity-60">Reach us</p>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>info@gitastrategy.in</li>
            <li>+91 8652074439</li>
            <li>Mumbai, India – 421204</li>
            <li>Mon – Fri: 9:00 – 18:00 IST</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow opacity-60">Connect</p>
          <a
            href="https://wa.me/918652074439"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 text-sm"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
          <p className="mt-4 text-xs opacity-60">
            © {new Date().getFullYear()} Gita Strategy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
