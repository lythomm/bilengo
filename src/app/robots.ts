import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bilengo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/*', '/llms.txt'],
        disallow: ['/dashboard/', '/e/', '/events/', '/booking/', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot'],
        allow: ['/', '/blog', '/blog/*', '/llms.txt'],
        disallow: ['/dashboard/', '/e/', '/events/', '/booking/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
