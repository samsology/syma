import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://symatechsolutions.com';

export const metadata: Metadata = {
  title: {
    default: 'Syma Tech Solutions | Health & Research Intelligence',
    template: '%s | Syma Tech Solutions',
  },
  description:
    'Syma Tech Solutions delivers healthcare analytics, research analytics, business intelligence, dashboard development, and data analytics training in Nigeria.',
  keywords: ['Healthcare Analytics Nigeria', 'Health Data Analytics', 'Healthcare Business Intelligence', 'Research Analytics', 'Power BI Healthcare', 'Healthcare Dashboards', 'Business Intelligence Nigeria', 'Research Consulting', 'Healthcare Technology', 'Bioinformatics', 'Data Analytics Training Nigeria'],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Syma Tech Solutions',
    title: 'Syma Tech Solutions | Health & Research Intelligence',
    description:
      'Healthcare analytics, research intelligence, business intelligence, technology solutions, and professional data education for organizations and professionals.',
    images: [
      {
        url: '/images/SYMA TECH.webp',
        width: 1200,
        height: 630,
        alt: 'Syma Tech Solutions - Health and Research Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syma Tech Solutions | Health & Research Intelligence',
    description:
      'Healthcare analytics, research intelligence, business intelligence, dashboard development, and professional data education in Nigeria.',
    images: ['/images/SYMA TECH.webp'],
    creator: '@Symatech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Syma Tech Solutions',
    url: siteUrl,
    logo: `${siteUrl}/logo/logo_2.webp`,
    description:
      'Syma Tech Solutions is a Health & Research Intelligence company advancing healthcare, research, business intelligence, and professional education across Africa.',
    sameAs: ['https://twitter.com/Symatech', 'https://www.linkedin.com/company/syma-tech/'],
    offers: {
      '@type': 'Offer',
      category: 'Healthcare Analytics, Research Intelligence, Business Intelligence, and Data Education',
    },
  };

  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col bg-[#f8fafc] font-sans text-slate-950 antialiased selection:bg-secondary/20 selection:text-primary">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}

        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
