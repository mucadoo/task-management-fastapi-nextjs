'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700/50 ${className || ''}`}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            {[1, 2].map((i) => (
              <section key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 ml-1" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 ml-1" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-2xl mt-4" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
