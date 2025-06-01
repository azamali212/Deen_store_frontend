import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dashboardMetadata: Metadata = {
  title: 'Dashboard Management | Dashbaord',
  description: 'Manage user roles and permissions',
  metadataBase: new URL(baseUrl),
  icons: {
    icon: '/logo/opengraph-image.png',
    apple: '/logo/opengraph-image.png',
  },
  openGraph: {
    title: 'Roles',
    description: 'Manage user roles and permissions',
    url: '/role',
    images: [
      {
        url: '/logo/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Roles Management Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roles',
    description: 'Manage user roles and permissions',
    images: ['/logo/opengraph-image.png'],
  },
}