'use client';

import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/next';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  const { status } = useSession();
   const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

 
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {children}
      <Analytics />
    </div>
  );
}