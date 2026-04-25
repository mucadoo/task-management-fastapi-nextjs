import { TaskStatus } from "../types/task";
interface StatusBadgeProps {
  status: TaskStatus;
}
export default function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    pending: {
      label: "Pending",
      classes: "bg-gray-100 text-gray-700 border-gray-200",
    },
    in_progress: {
      label: "In Progress",
      classes: "bg-blue-100 text-blue-700 border-blue-200",
    },
    completed: {
      label: "Completed",
      classes: "bg-green-100 text-green-700 border-green-200",
    },
  };
  const config = configs[status];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
