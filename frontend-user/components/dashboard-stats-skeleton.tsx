import { Skeleton } from "@/components/ui/skeleton"

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border-none bg-card p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-28" />
                </div>
            ))}
        </div>
    )
}
