import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'AzuraJS is a minimal, decorator-based framework for Node.js & Bun. Build REST APIs with full TypeScript type-safety, zero boilerplate, and exceptional performance.',
  openGraph: {
    title: 'AzuraJS - Build Faster with Type-Safe Decorators',
    description: 'The minimal framework for Node.js & Bun. Zero boilerplate, full type-safety, maximum productivity.',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AzuraJS - Build Faster with Type-Safe Decorators',
    description: 'The minimal framework for Node.js & Bun. Zero boilerplate, full type-safety, maximum productivity.',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/docs/en',
      'pt': '/docs/pt',
    },
  },
};
