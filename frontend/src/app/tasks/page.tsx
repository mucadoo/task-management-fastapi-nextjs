import { api } from "../../lib/api";
import TaskBoard from "../../components/TaskBoard";
import ErrorMessage from "../../components/ui/ErrorMessage";
export const dynamic = "force-dynamic";
export default async function TasksPage() {
  try {
    const initialData = await api.getTasks({ page: 1, page_size: 10 });
    return (
      <main className="min-h-screen bg-gray-50">
        <TaskBoard initialData={initialData} />
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load tasks. Please try again later.";
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage message={message} />
        </div>
      </main>
    );
  }
}
