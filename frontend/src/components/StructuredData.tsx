/**
 * Structured Data Component
 * JSON-LD schema markup for Answer Engine Optimization (AEO)
 * Helps LLMs better understand and index content
 */

import { Helmet } from 'react-helmet-async';

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social media profiles
  contactPoint?: {
    contactType: string;
    email?: string;
  };
}

export interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo?: string;
  };
  mainEntityOfPage?: string;
}

export interface CourseSchema {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  courseCode?: string;
  educationalLevel?: string;
  teaches?: string[];
  image?: string;
}

export interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface StructuredDataProps {
  organization?: OrganizationSchema;
  website?: {
    name: string;
    url: string;
    description: string;
    potentialAction?: {
      target: string;
      'query-input': string;
    };
  };
  article?: ArticleSchema;
  course?: CourseSchema;
  faq?: FAQSchema;
  breadcrumbs?: BreadcrumbSchema;
}

export default function StructuredData({
  organization,
  website,
  article,
  course,
  faq,
  breadcrumbs,
}: StructuredDataProps) {
  const schemas: object[] = [];

  // Organization Schema
  if (organization) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      ...(organization.logo && {
        logo: organization.logo,
      }),
      ...(organization.description && {
        description: organization.description,
      }),
      ...(organization.sameAs && organization.sameAs.length > 0 && {
        sameAs: organization.sameAs,
      }),
      ...(organization.contactPoint && {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: organization.contactPoint.contactType,
          ...(organization.contactPoint.email && {
            email: organization.contactPoint.email,
          }),
        },
      }),
    });
  }

  // Website Schema
  if (website) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name,
      url: website.url,
      description: website.description,
      ...(website.potentialAction && {
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: website.potentialAction.target,
          },
          'query-input': website.potentialAction['query-input'],
        },
      }),
    });
  }

  // Article Schema
  if (article) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      ...(article.image && {
        image: article.image,
      }),
      datePublished: article.datePublished,
      ...(article.dateModified && {
        dateModified: article.dateModified,
      }),
      author: {
        '@type': 'Person',
        name: article.author.name,
        ...(article.author.url && {
          url: article.author.url,
        }),
      },
      publisher: {
        '@type': 'Organization',
        name: article.publisher.name,
        ...(article.publisher.logo && {
          logo: {
            '@type': 'ImageObject',
            url: article.publisher.logo,
          },
        }),
      },
      ...(article.mainEntityOfPage && {
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': article.mainEntityOfPage,
        },
      }),
    });
  }

  // Course Schema
  if (course) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.name,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: course.provider.name,
        url: course.provider.url,
      },
      ...(course.courseCode && {
        courseCode: course.courseCode,
      }),
      ...(course.educationalLevel && {
        educationalLevel: course.educationalLevel,
      }),
      ...(course.teaches && course.teaches.length > 0 && {
        teaches: course.teaches,
      }),
      ...(course.image && {
        image: course.image,
      }),
    });
  }

  // FAQ Schema
  if (faq && faq.questions.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.questions.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  // Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.items.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  if (schemas.length === 0) {
    return null;
  }

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
      ))}
    </Helmet>
  );
}

