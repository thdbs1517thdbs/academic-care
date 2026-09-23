import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { serviceDescription, serviceName } from "@/lib/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: serviceName,
    template: `%s · ${serviceName}`,
  },
  description: serviceDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas font-sans text-slate-800">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
