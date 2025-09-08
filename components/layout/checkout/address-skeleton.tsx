import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AddressSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardHeader className="flex items-center gap-2">
                <Skeleton className="h-6 w-32 rounded" />
            </CardHeader>
            <CardContent className="space-y-1 pl-7">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
            </CardContent>
        </Card>
    )
}
