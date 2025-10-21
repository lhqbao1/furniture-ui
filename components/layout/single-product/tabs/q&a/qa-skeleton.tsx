import { Skeleton } from "@/components/ui/skeleton";

const QASkeleton = () => (
    <div className="space-y-6">
        {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-24 rounded-md" /> {/* tên người */}
                    <Skeleton className="h-6 w-32 rounded-md" /> {/* ngày giờ */}
                </div>
                <Skeleton className="h-16 w-full rounded-lg" /> {/* nội dung */}
                <div className="flex justify-end">
                    <Skeleton className="h-8 w-20 rounded-md" /> {/* nút Reply */}
                </div>
            </div>
        ))}
    </div>
)

export default QASkeleton
