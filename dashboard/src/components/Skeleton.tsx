import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="slate-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-28 rounded-lg" />
      <Skeleton className="h-8 w-40 rounded-lg" />
      <Skeleton className="h-3 w-24 rounded-lg" />
    </div>
  );
}

export function ChartSkeleton({
  height = "h-72",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div className={`slate-card p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-3 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className={`${height} w-full rounded-lg`} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="slate-card p-6 space-y-4">
      <Skeleton className="h-5 w-40 rounded-lg" />
      <Skeleton className="h-3 w-56 rounded-lg" />
      <div className="space-y-2.5 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-label="Loading page content">
      <div className="mb-6 space-y-2 pb-4 border-b border-slate-200">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartSkeleton height="h-72" className="xl:col-span-2" />
        <ChartSkeleton height="h-72" />
      </div>
    </div>
  );
}
