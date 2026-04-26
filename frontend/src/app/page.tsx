import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LoginPage from './login/page';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (token) {
    redirect('/app');
  }
  return <LoginPage />;
}
