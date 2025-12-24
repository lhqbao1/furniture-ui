"use client";

export default function CartSummarySkeleton() {
  return (
    <div className="space-y-2 text-base animate-pulse">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-muted rounded-xl" />
        <div className="h-4 w-16 bg-muted rounded-xl" />
      </div>

      {/* Shipping */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-muted rounded-xl" />
        <div className="h-4 w-16 bg-muted rounded-xl" />
      </div>

      {/* Total */}
      <div className="flex justify-between items-center font-semibold">
        <div className="h-5 w-32 bg-muted rounded-xl" />
        <div className="h-5 w-20 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
