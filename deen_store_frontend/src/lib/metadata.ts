import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface GenerateMetadataProps {
  title?: string
  description?: string
  path?: string
  imageUrl?: string
}

export function generateMetadata({
  title = 'Default Title',
  description = 'Default description',
  path = '/',
  imageUrl = '/logo/opengraph-image.png'
}: GenerateMetadataProps = {}): Metadata {
  return {
    title: `${title} | Site Name`,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: new URL(path, baseUrl).toString()
    },
    icons: {
      icon: imageUrl,
      apple: imageUrl
    },
    openGraph: {
      title: `${title} | Site Name`,
      description,
      url: new URL(path, baseUrl).toString(),
      images: [
        {
          url: new URL(imageUrl, baseUrl).toString(),
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Site Name`,
      description,
      images: [new URL(imageUrl, baseUrl).toString()]
    }
  }
}