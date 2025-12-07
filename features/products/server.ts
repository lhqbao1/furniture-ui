// server/api.ts
import { apiPublic } from "@/lib/axios";
import { ProductItem } from "@/types/products";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getProductByIdServer(id: string) {
  const { data } = await apiPublic.get(`/products/details/${id}`);
  return data as ProductItem;
}

export async function serverGetAllProducts() {
  const cookieStore = cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    credentials: "include",
    cache: "no-store", // tránh bị cache
  });

  if (!res.ok) throw new Error("Failed to fetch products");

  return res.json();
}
