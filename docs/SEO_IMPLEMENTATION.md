# SEO Implementation Guide - Eredeti Csakra

## Overview
Complete SEO infrastructure implementation for the Eredeti Csakra webapp, following Next.js 14 App Router best practices and targeting Hungarian women 35+ for chakra healing lead generation.

## Implemented Features

### 1. Meta Tags (All Pages)

#### Root Layout (`app/layout.tsx`)
- **Viewport Configuration**: Responsive design with theme colors
- **Global Metadata**:
  - Default title with template pattern
  - Comprehensive keywords array (10 targeted keywords)
  - Open Graph tags for social sharing
  - Twitter Card support
  - Robot indexing rules
  - Canonical URL configuration

#### Landing Page (`app/page.tsx`)
- **Title**: "Ingyenes Csakra Teszt | Fedezd fel energiáid állapotát"
- **Description**: 155 characters, includes key selling points
- **Keywords**: 10 highly targeted keywords for Hungarian market
- **Open Graph**: Full social sharing support
- **Canonical**: Points to homepage

#### Quiz Page (`app/kviz/layout.tsx`)
- **Title**: "Csakra Teszt Kitöltése"
- **Description**: Explains the 28-question format
- **Open Graph**: Optimized for sharing quiz entry point
- **Indexable**: Yes (important funnel page)

#### Result Page (`app/eredmeny/[id]/layout.tsx`)
- **Dynamic Metadata**: Generates unique metadata per result
- **Title**: "Csakra Teszt Eredményed"
- **Robots**: `noindex, nofollow, noarchive, nocache` (private results)
- **Reason**: Result pages are private and should not be indexed

### 2. Structured Data (JSON-LD)

Location: `components/seo/StructuredData.tsx`

#### Organization Schema
- Establishes brand identity
- Helps with knowledge graph

#### WebApplication Schema
- Defines the app as a health application
- Shows free pricing
- Language: hu-HU

#### FAQ Schema
- 5 common questions and answers:
  1. Mi az a csakra?
  2. Mennyi időbe telik a teszt kitöltése?
  3. Valóban ingyenes a teszt?
  4. Hogyan működik a teszt?
  5. Mit jelent, ha egy csakra blokkolt?
- Improves chances of rich snippets in search results

### 3. Robots.txt

Location: `public/robots.txt`

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /eredmeny/

Sitemap: https://eredeticsakra.hu/sitemap.xml
Crawl-delay: 1
```

**Key Points**:
- Allows all crawlers
- Blocks API endpoints (no value for SEO)
- Blocks result pages (private user data)
- References sitemap
- Adds crawl delay to prevent aggressive crawling

### 4. Sitemap Configuration

Package: `next-sitemap` (v4.2.3)

Location: `next-sitemap.config.js`

**Features**:
- Generates `sitemap.xml` automatically after build
- Priority-based crawling hints:
  - Homepage: Priority 1.0, Daily updates
  - Quiz page: Priority 0.9, Weekly updates
- Excludes: `/api/*`, `/eredmeny/*`
- Custom transform function for fine-grained control

**Build Integration**:
```json
"scripts": {
  "postbuild": "next-sitemap"
}
```

### 5. Open Graph Image

Location: `app/opengraph-image.tsx`

**Dynamic Generation** using Next.js 14 OG Image API:
- Size: 1200x630px (Facebook/Twitter recommended)
- Purple-rose-gold gradient background
- Brand elements: "Eredeti Csakra" with sparkle emoji
- Subtitle: "Fedezd fel csakráid állapotát"
- Features: "Ingyenes teszt • 3 perc • Azonnali eredmény"
- Domain badge: "eredeticsakra.hu"

**Benefits**:
- Automatically generated at build time
- No need for external image files
- Consistent branding
- Optimized file size

### 6. Environment Variables

Added `NEXT_PUBLIC_SITE_URL` to:
- `.env.example`: Production URL placeholder
- `.env.local`: Development URL (localhost:3000)

**Usage**:
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eredeticsakra.hu";
```

## Testing Checklist

### Local Testing
1. Run dev server: `npm run dev`
2. Check pages:
   - http://localhost:3000 (landing)
   - http://localhost:3000/kviz (quiz)
   - http://localhost:3000/eredmeny/[any-id] (result - should be noindex)

3. Verify meta tags in browser DevTools:
   - Open DevTools > Elements > `<head>`
   - Check for `<meta>` tags
   - Verify JSON-LD scripts

4. Test OG image:
   - Visit http://localhost:3000/opengraph-image
   - Should see generated image

### Build Testing
1. Build the project:
   ```bash
   npm run build
   ```

2. Check generated files:
   - `public/sitemap.xml` (should exist after build)
   - `public/robots.txt` (should exist)

3. Start production server:
   ```bash
   npm start
   ```

4. Verify production metadata

### SEO Validation Tools

#### Google Rich Results Test
- URL: https://search.google.com/test/rich-results
- Test each page's structured data
- Check for errors/warnings

#### Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- Test Open Graph tags
- Clear cache if needed

#### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Test Twitter Card display
- Verify image loads

#### Schema.org Validator
- URL: https://validator.schema.org/
- Paste JSON-LD from page source
- Check for schema errors

### Google Search Console (Post-Launch)
1. Submit sitemap: `https://eredeticsakra.hu/sitemap.xml`
2. Request indexing for key pages
3. Monitor:
   - Index coverage
   - Core Web Vitals
   - Mobile usability
   - Enhancement reports (Structured Data)

## Best Practices Applied

### 1. Next.js 14 App Router Conventions
- Metadata exports in layouts for server components
- Separate layout files for client components
- Dynamic `generateMetadata` for dynamic routes
- OG image generation using Image Response API

### 2. Hungarian Language Optimization
- All content in Hungarian (`hu-HU`)
- Keywords targeting Hungarian search terms
- Open Graph locale: `hu_HU`

### 3. Privacy & Security
- Private result pages marked `noindex`
- API routes blocked in robots.txt
- No sensitive data in metadata

### 4. Performance
- Structured data minified in production
- Sitemap generated at build time (not runtime)
- OG images cached by Next.js

### 5. Accessibility
- Skip to content link (already in layout)
- Proper HTML lang attribute
- Semantic HTML structure

## Maintenance

### Updating Keywords
Edit the `keywords` array in:
- `app/layout.tsx` (global keywords)
- `app/page.tsx` (landing page specific)
- `app/kviz/layout.tsx` (quiz specific)

### Adding New Pages
1. Create page in appropriate directory
2. Add metadata export or layout
3. Update `next-sitemap.config.js` if needed
4. Add to structured data if relevant

### Updating Structured Data
Edit `components/seo/StructuredData.tsx`:
- Add more FAQ items
- Update organization info
- Add new schema types (Article, BlogPosting, etc.)

## Production Deployment

### Pre-Deployment
1. Update `.env` or deployment environment:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://eredeticsakra.hu
   ```

2. Verify all placeholder URLs are replaced

3. Test build:
   ```bash
   npm run build
   npm start
   ```

### Post-Deployment
1. Verify robots.txt accessible: `https://eredeticsakra.hu/robots.txt`
2. Verify sitemap accessible: `https://eredeticsakra.hu/sitemap.xml`
3. Verify OG image: `https://eredeticsakra.hu/opengraph-image`
4. Submit sitemap to Google Search Console
5. Test social sharing on Facebook/Twitter

## Expected Results

### Search Engine Benefits
- **Indexing**: Faster discovery of new pages
- **Rich Snippets**: Potential for FAQ rich results
- **Social Sharing**: Professional preview cards
- **Brand Recognition**: Consistent metadata across platforms

### Target Metrics (3-6 months)
- 50+ indexed pages (if adding content)
- 10-20% CTR improvement (with rich snippets)
- Increased social sharing engagement
- Better mobile search rankings

## Troubleshooting

### Sitemap not generating
- Check `package.json` has `"postbuild": "next-sitemap"`
- Verify `next-sitemap.config.js` exists
- Run `npm run build` and check for errors

### OG image not showing
- Clear Facebook/Twitter cache
- Check image accessible at `/opengraph-image`
- Verify no CORS issues

### Structured data errors
- Use Schema.org validator
- Check JSON-LD syntax
- Ensure all required fields present

### Pages being indexed that shouldn't
- Check robots meta tags
- Update robots.txt
- Request removal in Google Search Console

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Schemas](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Implementation Date**: October 14, 2025
**Version**: 1.0
**Status**: Complete and Production Ready
