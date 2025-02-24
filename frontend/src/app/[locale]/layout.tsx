import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CustomQueryClientProvider from "@/providers/react-query";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PongArcadia",
  description: "PongArcadia - The best way to play pong online",
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function RootLayout({ children, params }: Props) {
  const messages = await getMessages();
  const locale = await params.locale;

  if (!locale) {
    return (
      <html lang="en" translate="no" className="notranslate">
        <body className={inter.className}>{children}</body>
      </html>
    );
  }

  return (
    <html lang={locale} translate="no" className="notranslate">
      <body className={inter.className}>
        <main>
          <NextIntlClientProvider messages={messages}>
            <CustomQueryClientProvider>
              {children}
            </CustomQueryClientProvider>
            <Toaster />
          </NextIntlClientProvider>
        </main>
      </body>
    </html>
  );
}
