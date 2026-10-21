import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SPPG Public Leaders Network — Africa's public leaders, connected for life",
    template: "%s · SPLN",
  },
  description:
    "The SPPG Public Leaders Network (SPLN) is the lifelong community of graduates of the School of Politics, Policy & Governance — public leaders across Nigeria, Senegal, Kenya and Ghana working to transform how Africa is governed.",
  openGraph: {
    type: "website",
    siteName: "SPPG Public Leaders Network",
    images: ["/images/grad-stage.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0e1512" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
