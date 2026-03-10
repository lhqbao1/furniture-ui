import { BlogByProductResponse } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";

export default function SidebarBlog({
  items,
}: {
  items: BlogByProductResponse;
}) {
  const products = items?.products ?? [];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Neueste Artikel</h3>

      <div className="space-y-5">
        {products.slice(0, 10).map((product) => {
          const firstBlog = product.blogs?.[0];
          return (
            <div className="flex gap-4" key={product.id}>
              <Image
                src={product.image || "/placeholder-product.webp"}
                alt={product.name}
                width={90}
                height={70}
                className="rounded-md h-20 w-20 object-contain transition-all hover:scale-110 duration-300"
                unoptimized
              />

              <div className="flex-1">
                <Link
                  href={`/blog/category/${product.url_key}`}
                  key={product.id}
                  className=""
                >
                  <p className="hover:text-secondary transition line-clamp-2 font-semibold">
                    {product.name}
                  </p>
                </Link>
                {firstBlog && (
                  <Link
                    href={`/blog/${firstBlog.slug}`}
                    className="mt-2 block text-sm text-gray-600 hover:text-secondary transition line-clamp-2"
                  >
                    {firstBlog.title}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
