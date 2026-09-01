import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { CustomScrollbar } from "./components/CustomScrollbar";
import { Loader } from "./components/Loader";
import { PageTransitionOverlay } from "./components/PageTransitionOverlay";
import { SmoothScroll } from "./components/SmoothScroll";
import { CookieBanner } from "./components/CookieBanner";
import { SITE_JSON_LD, SITE_URL } from "./lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Open Graph image paths are relative, and a crawler cannot fetch a relative
  // URL. Without this Next falls back to localhost and every shared link
  // previews a broken image.
  metadataBase: new URL(SITE_URL),
  // `default` is what an untitled page inherits; `template` wraps every page
  // that sets its own title, so no page has to repeat the brand by hand.
  title: {
    default: "Behsse | Designer et développeur web freelance en France",
    template: "%s | Behsse",
  },
  description:
    "Designer et développeur web freelance en France. Je conçois et développe des sites sur-mesure qui convertissent : identité de marque, design d'interface et développement Next.js, du premier échange à la mise en ligne.",
  applicationName: "Behsse",
  authors: [{ name: "Sébastien Behsse", url: SITE_URL }],
  creator: "Sébastien Behsse",
  publisher: "Behsse",
  // Ignored by Google since 2009, still read by a few smaller engines and by
  // internal search tools. Kept short and commercial rather than stuffed: the
  // real keyword work is in the titles, the descriptions and the page copy.
  keywords: [
    "designer web freelance",
    "développeur web freelance",
    "création de site internet sur-mesure",
    "création site vitrine",
    "refonte de site web",
    "identité visuelle",
    "branding",
    "développeur Next.js",
    "freelance France",
    "Behsse",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Behsse",
    title: "Behsse | Designer et développeur web freelance en France",
    description:
      "Sites sur-mesure, identité de marque et développement Next.js. Je travaille avec peu de clients à la fois, du premier échange à la mise en ligne.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Behsse | Designer et développeur web freelance en France",
    description:
      "Sites sur-mesure, identité de marque et développement Next.js. Je travaille avec peu de clients à la fois, du premier échange à la mise en ligne.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Defaults cap the snippet and forbid large preview images, which costs
      // click-through on a portfolio where the visual IS the argument.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/** Separate from `metadata` because Next treats the viewport and the theme
 * colour as their own export since 14. The two colours match the two page
 * backgrounds the site actually uses, so the browser chrome on mobile follows
 * the page instead of sitting on a default grey. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // fr-FR, not fr: the site is written for a French audience and the region
    // is what tells Google which country's results this belongs in.
    <html
      lang="fr-FR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {/* Site-wide structured data. Declared once in the layout so every page
          * carries the identity of the studio behind it; pages that describe
          * something more specific (a case study, a breadcrumb trail) add their
          * own block on top rather than restating this one. */}
        <script
          type="application/ld+json"
          // The payload is a literal object from our own source, never user
          // input, so there is nothing here for an injection to ride in on.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">
          {`
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'manual';
            }
            window.scrollTo(0, 0);
          `}
        </Script>
        <SmoothScroll />
        <Loader />
        <PageTransitionOverlay />
        <Navbar />
        <CustomScrollbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <CookieBanner />
      </body>
    </html>
  );
}
