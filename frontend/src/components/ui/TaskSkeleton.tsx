'use client';

export default function TaskSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col h-full animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
      <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
}
