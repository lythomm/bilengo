import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getAppSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bilengo.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Bilengo',
    operatingSystem: 'All',
    applicationCategory: 'TravelApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description:
      'Bilengo est une application web de covoiturage événementiel gratuit et sans commission pour mariages, festivals, événements sportifs et d entreprise.',
    url: baseUrl,
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bilengo.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`,
    },
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: article.author || 'Bilengo',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bilengo',
      url: baseUrl,
    },
  };
}

export function getFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
