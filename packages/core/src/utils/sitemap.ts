import { JsonObject, SiteMapUrl } from '../types';

function getBaseUrl(locals: JsonObject): string {
  const raw = locals.baseUrl;
  if (typeof raw !== 'string' || !raw.length) {
    throw new Error('Invalid baseUrl in locals.');
  }
  return raw.replace(/^http:\/\//, 'https://');
}

export const sitemapIndex = (locals: JsonObject, sitemaps: SiteMapUrl[]): Response => {
  const baseUrl = getBaseUrl(locals);

  const sitemapEntries = sitemaps
    .map(
      ({ loc, lastmod }) => `
    <sitemap>
      <loc>${baseUrl}${loc}</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`;

  const compressed = Bun.gzipSync(xml);

  return new Response(compressed, {
    headers: {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/xml',
      'Content-Length': compressed.byteLength.toString(),
    },
  });
};

export const sitemap = (locals: JsonObject, urls: SiteMapUrl[]): Response => {
  const baseUrl = getBaseUrl(locals);

  const urlset = urls
    .map(
      ({ loc, lastmod, changefreq = 'weekly', priority = '0.5' }) => `
    <url>
      <loc>${baseUrl}${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>${priority}</priority>
      <changefreq>${changefreq}</changefreq>
    </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
  http://www.google.com/schemas/sitemap-image/1.1
  http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlset}
</urlset>`;

  const compressed = Bun.gzipSync(xml);

  return new Response(compressed, {
    headers: {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/xml',
      'Content-Length': compressed.byteLength.toString(),
    },
  });
};

export default {
  sitemap,
  sitemapIndex,
};
