import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/panel-profesional', '/cliente'],
    },
    sitemap: 'https://oficiosya.com/sitemap.xml',
  };
}
