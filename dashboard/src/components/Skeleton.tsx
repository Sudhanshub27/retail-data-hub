import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-72", className = "" }: { height?: string; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className={`${height} w-full rounded-xl`} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-56" />
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
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-80" />
        </div>
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
