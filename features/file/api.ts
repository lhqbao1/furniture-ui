import { apiPublic } from "@/lib/axios";
import { StaticFileResponse } from "@/types/products";

export async function uploadStaticFile(file: FormData) {
  const { data } = await apiPublic.post("/static/upload", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data as StaticFileResponse;
}

export async function importProduct(file: FormData) {
  const { data } = await apiPublic.post("/import-products", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function importProductInventory(file: FormData) {
  const { data } = await apiPublic.post("import/inventory", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function importProductSupplier(
  file: FormData,
  supplier_id: string,
) {
  const { data } = await apiPublic.post(
    `/import-products-for-supplier/${supplier_id}`,
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
}
