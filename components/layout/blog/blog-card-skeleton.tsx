export default function BlogCardSkeleton() {
  return (
    <div className="border rounded-lg shadow-sm animate-pulse">
      <div className="w-full h-48 bg-gray-300" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 bg-gray-300 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
