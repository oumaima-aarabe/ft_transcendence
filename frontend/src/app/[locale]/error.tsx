'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-6xl font-bold text-[#D05F3B] mb-6 drop-shadow-[0_0_10px_rgba(255,102,0,0.7)]">
        {t('oops')}
      </div>
      <h1 className="text-3xl text-white font-bold mb-4 drop-shadow-md text-center">
        {t('somethingWentWrong')}
      </h1>
      <p className="text-lg text-white text-center mb-8 max-w-xl px-4 drop-shadow-sm">
        {t('errorLoadingPage')}
      </p>

      <Button
        onClick={() => reset()}
        className="relative bg-[#40CFB7] hover:bg-[#EEE5BE] text-[#c75b37] border text-xl px-8 py-4 rounded-full shadow-lg overflow-hidden transition-all duration-300 hover:scale-105"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-[#751d03] via-[#f18662] to-[#40CFB7] opacity-25 animate-pulse"></span>
        <span className="relative z-10">{t('tryAgain')}</span>
      </Button>
    </div>
  );
} 