import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

/**
 * Reusable SEO component for dynamic metadata management.
 * Handles Titles, Descriptions, OG Tags, Twitter Cards, and Canonical Links.
 * Automatically synchronizes with i18next for language and directionality.
 */
export const SEO = ({ 
  title, 
  description, 
  image = '/og-image.png', // Default OG image path
  type = 'website' 
}: SEOProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  const siteName = 'TrueScope';
  // Base title template: TrueScope | %s
  const fullTitle = title ? `${siteName} | ${title}` : siteName;
  
  // Dynamically generate canonical link
  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  
  // Extract language and direction from i18next
  const currentLang = i18n.language || 'en';
  const currentDir = i18n.dir(currentLang);

  // Fallback description from translations if not provided
  const metaDescription = description || t('seo.defaultDescription', 'Advanced AI Detection & Deepfake Forensics');

  return (
    <Helmet>
      {/* 1. Localization & Accessibility */}
      <html lang={currentLang} dir={currentDir} />
      
      {/* 2. Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" type="image/png" href="/fav.png" />

      {/* 3. Social Media & Meta Tags (Open Graph) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* 4. Social Media & Meta Tags (Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
