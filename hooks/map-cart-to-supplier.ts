import { CartResponse, SupplierCartInput } from "@/types/cart";

export function mapToSupplierCarts(
  cartItems: CartResponse,
): SupplierCartInput[] {
  return (Array.isArray(cartItems) ? cartItems : [])
    .filter((item) => Array.isArray(item?.items) && item.items.length > 0)
    .map((group) => {
      return {
        cart_id: group.id,
        supplier_id: group.supplier_id,
      };
    });
}
