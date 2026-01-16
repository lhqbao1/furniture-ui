import { apiAdmin, apiPublic } from "@/lib/axios";
import { RelatedProductFormValues } from "@/src/app/[locale]/(admin)/admin/products/related/page";
import { ProductItem } from "@/types/products";

export async function createRelatedProducts({
  product_id,
  related_product_id,
}: RelatedProductFormValues) {
  const { data } = await apiAdmin.post(
    "/product-related",
    { product_id, related_product_id },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
    },
  );
  return data;
}

export async function getRelatedProducts(product_id: string) {
  const { data } = await apiPublic.get(
    `/product-related-of-product-id/${product_id}`,
  );
  return data as ProductItem[];
}

export async function deleteRelatedProduct(product_related_id: string) {
  const { data } = await apiAdmin.delete(
    `/product-related/${product_related_id}`,
  );
  return data;
}
