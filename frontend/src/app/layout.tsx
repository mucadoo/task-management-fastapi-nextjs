import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import ToastContainer from '@/components/ui/ToastContainer'; 

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskFlow | Modern Task Management',
  description: 'Manage your tasks efficiently with a beautiful interface.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col font-sans antialiased transition-colors duration-300`}
      >
        <NextTopLoader color="#3a5fa3" height={3} showSpinner={false} />
        <ClientProviders>
          <div className="flex-grow flex flex-col">{children}</div>
          <ToastContainer /> {/* Add ToastContainer here */}
        </ClientProviders>
      </body>
    </html>
  );
}
