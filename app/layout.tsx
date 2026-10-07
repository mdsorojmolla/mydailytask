import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "My Day",
  description: "Personal routine and task flow management application.",
  applicationName: "My Day",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Day"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7F8FD"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased bg-paper text-ink selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
