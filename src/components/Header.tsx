"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/#new-arrivals", label: "New In" },
  { href: "/#brands", label: "Brands" },
  { href: "/#about", label: "About" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-6 -ml-1"
        >
          <span
            className={`h-px w-full bg-ink transition-transform ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-full bg-ink transition-transform ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>

        <Link
          href="/"
          className="font-display text-xl sm:text-2xl tracking-[0.08em]"
        >
          PIERRETÈQUE<span className="text-muted">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] tracked uppercase">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/80 hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6 text-[11px] tracked uppercase">
          <a
            href="https://www.instagram.com/pierretheque/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-ink/80 hover:text-ink transition-colors"
          >
            Instagram
          </a>
          <span className="hidden sm:inline text-ink/80">Sign In</span>
          <span className="text-ink">Cart ({count})</span>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line bg-paper flex flex-col text-[11px] tracked uppercase">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-4 border-b border-line text-ink/80 hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.instagram.com/pierretheque/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-4 text-ink/80 hover:text-ink transition-colors"
          >
            Instagram
          </a>
        </nav>
      )}
    </header>
  );
}
