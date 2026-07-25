import { getBrands } from "@/lib/data/brands";
import { createBrandAction, updateBrandAction, deleteBrandAction } from "./actions";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-display text-3xl">Brands</h1>

      {brands.length === 0 ? (
        <p className="text-sm text-muted">No brands yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {brands.map((brand) => (
            <form
              key={brand.id}
              action={updateBrandAction.bind(null, brand.id)}
              className="flex flex-col gap-2 border-b border-line-dark pb-4"
            >
              <input name="name" defaultValue={brand.name} className="border border-line bg-transparent px-3 py-2 text-sm" />
              <textarea name="note" defaultValue={brand.note ?? ""} className="border border-line bg-transparent px-3 py-2 text-sm" />
              <div className="flex items-center gap-3">
                <input name="position" type="number" defaultValue={brand.position} className="border border-line bg-transparent px-3 py-2 text-sm w-20" />
                <button type="submit" className="text-[11px] tracked uppercase text-muted hover:text-ink transition-colors">
                  Save
                </button>
                <button formAction={deleteBrandAction.bind(null, brand.id)} className="text-[11px] tracked uppercase text-muted hover:text-ink transition-colors">
                  Delete
                </button>
              </div>
            </form>
          ))}
        </div>
      )}

      <form action={createBrandAction} className="flex flex-col gap-2">
        <h2 className="text-[11px] tracked uppercase text-muted">Add Brand</h2>
        <input name="name" placeholder="Name" required className="border border-line bg-transparent px-3 py-2 text-sm" />
        <textarea name="note" placeholder="Note" className="border border-line bg-transparent px-3 py-2 text-sm" />
        <input name="position" type="number" placeholder="Position" defaultValue={0} className="border border-line bg-transparent px-3 py-2 text-sm w-20" />
        <button type="submit" className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors self-start">
          Add
        </button>
      </form>
    </div>
  );
}
