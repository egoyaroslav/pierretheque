"use client";

import { useState } from "react";
import Image from "next/image";
import { instagramFeeds } from "@/lib/instagram";

const TABS = [
  { key: "shop" as const, ...instagramFeeds.shop },
  { key: "founder" as const, ...instagramFeeds.founder },
];

export function InstagramFeed() {
  const [active, setActive] = useState<"shop" | "founder">("shop");
  const current = TABS.find((t) => t.key === active)!;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-[10px] tracked uppercase border transition-colors ${
              active === tab.key
                ? "border-white/70 text-white bg-white/5"
                : "border-line text-white/40 hover:text-white/70"
            }`}
          >
            {tab.role}
          </button>
        ))}
      </div>

      <div key={current.key} className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl sm:text-3xl text-white">
            {current.label}
          </p>
          <p className="text-[11px] tracked uppercase text-white/40 mt-1">
            @{current.handle}
          </p>
        </div>
        <a
          href={current.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] tracked uppercase text-white/50 hover:text-white transition-colors whitespace-nowrap"
        >
          Follow ↗
        </a>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {current.posts.map((post, i) => (
          <a
            key={post.href}
            href={post.href}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-[4/5] overflow-hidden bg-charcoal-soft"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(min-width: 640px) 16vw, 33vw"
              className="object-cover scale-[1.03] transition-transform duration-700 group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] tracked uppercase">
                View ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
