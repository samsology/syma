import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Symatechsolutions.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/student/',
        '/checkout/',
        '/continue-registration/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
