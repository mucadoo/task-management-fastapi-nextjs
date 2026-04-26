import { api } from '../../lib/api';
import TaskBoard from '../../components/TaskBoard';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function AppDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }
  try {
    const initialData = await api.getTasks({ page: 1, page_size: 12, token });
    return (
      <main className="min-h-screen">
        <TaskBoard initialData={initialData} />
      </main>
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('401') || error.message.includes('token'))
    ) {
      redirect('/login');
    }
    const message =
      error instanceof Error ? error.message : 'Failed to load tasks. Please try again later.';
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage message={message} />
        </div>
      </main>
    );
  }
}
