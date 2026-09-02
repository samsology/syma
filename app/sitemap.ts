import { MetadataRoute } from 'next';
import { OFFICIAL_COURSES } from '@/lib/courses/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://symatechsolutions.com';

  const staticRoutes = [
    '',
    '/about',
    '/consultation',
    '/contact',
    '/enroll',
    '/portfolio',
    '/programs',
    '/insights',
  ];

  const courseRoutes = OFFICIAL_COURSES.map((course) => `/programs/${course.slug}`);

  const allRoutes = [...staticRoutes, ...courseRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/programs') ? 0.9 : 0.8,
  }));
}
