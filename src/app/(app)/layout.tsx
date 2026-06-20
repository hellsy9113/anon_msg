'use client';

import Navbar from '@/components/layout/Navbar';
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading workspace
        </div>
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
