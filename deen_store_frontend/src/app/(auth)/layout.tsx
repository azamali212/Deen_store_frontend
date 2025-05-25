'use client'
import { AuthLayoutProps } from '@/types/ui';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();

  console.log("Current pathname:", pathname);

  const isShopinintyAdmin = pathname.includes("shopinity_admin_login");

  console.log("Is admin login page?", isShopinintyAdmin);

  const backgroundImage = isShopinintyAdmin
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
        height: "100vh", // Added to guarantee full height
        width: "100vw",  // Added for full width
      }}
    >
      <main className="text-gray-500">{children}</main>
    </div>
  );
}