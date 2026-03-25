import ProductTableSkeleton from "@/components/shared/skeleton/table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="space-y-6">
        <div className="text-3xl text-secondary font-bold text-center">
          Return Orders
        </div>
        <ProductTableSkeleton columnsCount={6} rowsCount={6} />
      </div>
    </div>
  );
}

