import { getComingSoon } from "@/lib/data/coming-soon";
import { createComingSoonAction, updateComingSoonAction, deleteComingSoonAction } from "./actions";

export default async function AdminComingSoonPage() {
  const items = await getComingSoon();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-display text-3xl">Coming Soon</h1>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No coming-soon entries yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <form
              key={item.id}
              action={updateComingSoonAction.bind(null, item.id)}
              className="flex items-center gap-2 border-b border-line-dark pb-3"
            >
              <input name="brand" defaultValue={item.brand} className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
              <input name="label" defaultValue={item.label} className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
              <input name="position" type="number" defaultValue={item.position} className="border border-line bg-transparent px-3 py-2 text-sm w-16" />
              <button type="submit" className="text-[11px] tracked uppercase text-muted hover:text-ink">
                Save
              </button>
              <button formAction={deleteComingSoonAction.bind(null, item.id)} className="text-[11px] tracked uppercase text-muted hover:text-ink">
                Delete
              </button>
            </form>
          ))}
        </div>
      )}

      <form action={createComingSoonAction} className="flex items-center gap-2">
        <input name="brand" placeholder="Brand" required className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
        <input name="label" placeholder="Label" required className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
        <input name="position" type="number" placeholder="Position" defaultValue={0} className="border border-line bg-transparent px-3 py-2 text-sm w-16" />
        <button type="submit" className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors">
          Add
        </button>
      </form>
    </div>
  );
}
