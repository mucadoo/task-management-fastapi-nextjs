"use client";
import { Task } from "../types/task";
import StatusBadge from "./StatusBadge";
import LoadingSpinner from "./ui/LoadingSpinner";
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}
export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isDeleting,
}: TaskCardProps) {
  const formattedDate = new Date(task.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <StatusBadge status={task.status} />
        <span className="text-xs text-gray-500 font-medium">{formattedDate}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
        {task.title}
      </h3>
      <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-grow">
        {task.description || "No description provided."}
      </p>
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(task)}
          disabled={isDeleting}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          disabled={isDeleting}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 flex justify-center items-center"
        >
          {isDeleting ? <div className="scale-50"><LoadingSpinner /></div> : "Delete"}
        </button>
      </div>
    </div>
  );
}
