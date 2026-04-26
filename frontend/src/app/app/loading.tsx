import TaskSkeleton from '../../components/ui/TaskSkeleton';
export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 bg-warm-200 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-warm-200 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="mb-6">
        <div className="h-8 w-64 bg-warm-200 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
        <div className="h-10 flex-1 max-w-2xl bg-warm-200 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-warm-200 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
