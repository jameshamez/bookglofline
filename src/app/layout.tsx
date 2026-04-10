import type { Metadata } from "next";
import { Bai_Jamjuree, Noto_Sans_Thai } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { getSafeServerSession, isLineAuthConfigured } from "@/lib/auth";
import "./globals.css";

const bodyFont = Noto_Sans_Thai({
  variable: "--font-body",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Bai_Jamjuree({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LINE Golf Booking",
  description: "ระบบจองรอบกอล์ฟบน Next.js ที่เชื่อมกับ LINE Login",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSafeServerSession();

  return (
    <html
      lang="th"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="relative min-h-full overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(33,84,62,0.16),_transparent_60%)]" />
          <SiteHeader session={session} lineReady={isLineAuthConfigured} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
