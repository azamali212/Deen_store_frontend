// app/auth/layout.tsx
'use client'
import { AuthLayoutProps } from '@/types/ui';
import { useSearchParams } from 'next/navigation';

export default function AuthLayout({ children }: AuthLayoutProps) {
  const searchParams = useSearchParams();
  const portal = searchParams.get('portal');

  const isAdminPortal = portal === 'admin';

  const backgroundImage = isAdminPortal
    ? "url('/logo/alldone.jpeg')"
    : "url('/dashboard_logo/background.jpeg')";

  return (
    <div
      className="auth-layout-wrapper min-h-screen bg-cover bg-center"
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
      }}
    >
      <main className="text-gray-500">{children}</main>
    </div>
  );
}