"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";

export function ProductForm({
  product,
  action,
}: {
  product?: Product;
  action: (formData: FormData) => void;
}) {
  const [description, setDescription] = useState<string[]>(product?.description ?? [""]);
  const [details, setDetails] = useState<{ label: string; value: string }[]>(
    product?.details ?? [{ label: "", value: "" }]
  );
  const [keptImages, setKeptImages] = useState<string[]>(product?.images ?? []);

  return (
    <form action={action} className="flex flex-col gap-6 max-w-2xl">
      <label className="flex flex-col gap-1 text-sm">
        Slug
        <input name="slug" defaultValue={product?.slug} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Brand
        <input name="brand" defaultValue={product?.brand} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" defaultValue={product?.name} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Price
        <input name="price" defaultValue={product?.price} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Size
        <input name="size" defaultValue={product?.size} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Condition
        <input name="condition" defaultValue={product?.condition} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Origin
        <input name="origin" defaultValue={product?.origin} required className="border border-line bg-transparent px-3 py-2" />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Description</legend>
        {description.map((para, i) => (
          <textarea
            key={i}
            name="description"
            value={para}
            onChange={(e) => {
              const next = [...description];
              next[i] = e.target.value;
              setDescription(next);
            }}
            className="border border-line bg-transparent px-3 py-2 text-sm"
          />
        ))}
        <button type="button" onClick={() => setDescription([...description, ""])} className="text-[11px] tracked uppercase text-muted hover:text-ink self-start">
          + Add Paragraph
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Details</legend>
        {details.map((d, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="detailLabel"
              value={d.label}
              placeholder="Label"
              onChange={(e) => {
                const next = [...details];
                next[i] = { ...next[i], label: e.target.value };
                setDetails(next);
              }}
              className="border border-line bg-transparent px-3 py-2 text-sm w-1/3"
            />
            <input
              name="detailValue"
              value={d.value}
              placeholder="Value"
              onChange={(e) => {
                const next = [...details];
                next[i] = { ...next[i], value: e.target.value };
                setDetails(next);
              }}
              className="border border-line bg-transparent px-3 py-2 text-sm flex-1"
            />
          </div>
        ))}
        <button type="button" onClick={() => setDetails([...details, { label: "", value: "" }])} className="text-[11px] tracked uppercase text-muted hover:text-ink self-start">
          + Add Detail
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Images</legend>
        {keptImages.map((url) => (
          <label key={url} className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="keptImages"
              value={url}
              defaultChecked
              onChange={(e) => {
                if (!e.target.checked) setKeptImages(keptImages.filter((u) => u !== url));
              }}
            />
            {url}
          </label>
        ))}
        <input type="file" name="newImages" multiple accept="image/*" className="text-sm" />
      </fieldset>

      <button
        type="submit"
        className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors self-start"
      >
        Save
      </button>
    </form>
  );
}
