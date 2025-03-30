import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CustomQueryClientProvider from "@/providers/react-query";
import { NotificationsProvider } from "@/providers/NotificationsProvider";

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
  const { locale } = await params;
  let messages = await getMessages({ locale });

  return (
    <html lang={locale} translate="no" className="notranslate">
      <body className={inter.className}>
        <main className="min-h-screen relative">
          <div className="absolute inset-0">
            <img
              src="/assets/images/background.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <NextIntlClientProvider messages={messages}>
              <CustomQueryClientProvider>
                <NotificationsProvider>
                  {children}
                </NotificationsProvider>
              </CustomQueryClientProvider>
              <Toaster />
            </NextIntlClientProvider>
          </div>
        </main>
      </body>
    </html>
  );
}
