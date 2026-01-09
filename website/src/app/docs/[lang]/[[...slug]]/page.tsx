import { getPageImage, getSource } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const params = await props.params;
  const source = getSource(params.lang);
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params: Array<{ lang: string; slug?: string[] }> = [];
  
  for (const [lang, source] of Object.entries({ en: getSource('en'), pt: getSource('pt') })) {
    const pages = source.getPages();
    params.push(
      ...pages.map((page) => ({
        lang,
        slug: page.slugs,
      }))
    );
  }
  
  return params;
}

export async function generateMetadata(props: { params: Promise<{ lang: string; slug?: string[] }> }): Promise<Metadata> {
  const params = await props.params;
  const source = getSource(params.lang);
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const langName = params.lang === 'pt' ? 'pt-BR' : 'en-US';
  const ogImage = getPageImage(page).url;

  return {
    title: page.data.title,
    description: page.data.description,
    keywords: [
      'AzuraJS',
      'documentation',
      page.data.title,
      'Node.js',
      'Bun',
      'TypeScript',
      'framework',
      'REST API',
    ],
    authors: [{ name: 'AzuraJS Team' }],
    openGraph: {
      title: `${page.data.title} | AzuraJS Docs`,
      description: page.data.description,
      type: 'article',
      locale: langName,
      images: ogImage,
      siteName: 'AzuraJS Documentation',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.data.title} | AzuraJS Docs`,
      description: page.data.description,
      images: ogImage,
    },
    alternates: {
      canonical: `/docs/${params.lang}/${params.slug?.join('/')}`,
      languages: {
        'en-US': `/docs/en/${params.slug?.join('/')}`,
        'pt-BR': `/docs/pt/${params.slug?.join('/')}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
