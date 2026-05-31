'use client'
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/next';
 
interface RootLayoutProps {
  children: React.ReactNode;
}

export default  function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
      <Analytics />
    </div>
  );
}