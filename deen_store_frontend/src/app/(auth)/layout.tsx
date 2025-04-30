"use client";

import { AuthLayoutProps } from '@/types/ui';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  const isShopinintyAdmin = pathname.includes("shopinity_admin_login");

  const backgroundImage = isShopinintyAdmin
    ? "url('/dashboard_logo/alldone.jpeg')" // admin login bg
    : "url('/dashboard_logo/background.jpeg')";   // customer login bg

  return (
    <div
      className="auth-layout-wrapper min-h-screen bg-cover bg-center"
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <main className="text-gray-500">{children}</main>
    </div>
  );
}