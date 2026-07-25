import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { deleteProductAction } from "./actions";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted">No products yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] tracked uppercase text-muted border-b border-line">
              <th className="text-left py-2">Brand</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Slug</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line-dark hover:bg-paper-soft transition-colors">
                <td className="py-3">{product.brand}</td>
                <td className="py-3">{product.name}</td>
                <td className="py-3 text-muted">{product.slug}</td>
                <td className="py-3 flex gap-4 justify-end">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-muted hover:text-ink transition-colors">
                    Edit
                  </Link>
                  <form action={deleteProductAction.bind(null, product.id)}>
                    <button className="text-muted hover:text-ink transition-colors">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
