import { Loader2 } from "lucide-react";

export default function StickyPolicyLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-xs">
      <Loader2 className="h-12 w-12 animate-spin text-secondary" />
    </div>
  );
}
