import { CartResponse, SupplierCartInput } from "@/types/cart";

export function mapToSupplierCarts(
  cartItems: CartResponse,
): SupplierCartInput[] {
  return cartItems
    .filter((item) => item.items.length > 0)
    .map((group) => {
      // ✅ Tính total_shipping trực tiếp ở đây
      const hasAmmCarrier = group.items.some(
        (item) =>
          item.products.carrier.toLowerCase() === "amm" ||
          item.products.carrier.toLowerCase() === "spedition",
      );
      const totalShipping = hasAmmCarrier ? 35.95 : 5.95;

      return {
        cart_id: group.id,
        supplier_id: group.supplier_id,
      };
    });
}
