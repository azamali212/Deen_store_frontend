// /app/(auth)/layout.tsx

import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="auth-layout-wrapper">
            {/* Shared layout for login/register */}
                <h1>Hlo</h1>
            <main>{children}</main>
        </div>
    );
}