"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export function AddToCartButton({
  className = "",
}: {
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
      className={`inline-flex items-center justify-center gap-2 border border-ink px-7 py-3 text-[11px] tracked uppercase transition-colors ${
        added ? "bg-ink text-paper" : "hover:bg-ink hover:text-paper"
      } ${className}`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
