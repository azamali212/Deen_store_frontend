import { generateMetadata } from "@/lib/metadata";
import Head from "next/head";


export const metadata = generateMetadata({
    title: 'Permissions Management | Permissions',
    description: 'Manage user roles and permissions',
  })

export default function PermissionLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Head>
                {/* For modern browsers */}
                <link rel="icon" type="image/png" href="/logo/opengraph-image.png" sizes="32x32" />
                {/* For older browsers */}
                <link rel="icon" href="/logo/opengraph-image.png" />
                {/* For Apple devices */}
                <link rel="apple-touch-icon" href="/logo/opengraph-image.png" />
            </Head>
            {children}
        </>
    );
}