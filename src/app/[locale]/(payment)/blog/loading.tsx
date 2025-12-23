export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-xs">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}
