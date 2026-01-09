import { MetadataRoute } from 'next';
import { getSource } from '@/lib/source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://azurajs.org';
  
  const enSource = getSource('en');
  const ptSource = getSource('pt');
  
  const enPages = enSource.getPages();
  const ptPages = ptSource.getPages();
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
  
  // Add English docs
  enPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}/docs/en/${page.slugs.join('/')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });
  
  // Add Portuguese docs
  ptPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}/docs/pt/${page.slugs.join('/')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });
  
  return routes;
}
