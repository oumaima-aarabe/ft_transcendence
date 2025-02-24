import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const LanguageSelection: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('settings.language');

  const languages = [
    { name: t('languages.english'), locale: "en", flag: "/assets/icons/usa-flag.svg" },
    { name: t('languages.french'), locale: "fr", flag: "/assets/icons/french-flag.svg" },
    { name: t('languages.italian'), locale: "it", flag: "/assets/icons/italian-flag.svg" },
    { name: t('languages.spanish'), locale: "es", flag: "/assets/icons/spanish-flag.svg" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-normal">{t('title')}</h2>
      <div className="flex gap-4">
        {languages.map((lang) => (
          <button
            key={lang.name}
            onClick={() => {
                router.replace(pathname, { locale: lang.locale })
            }}
            className={`flex items-center w-full min-w-[7rem] gap-2 px-4 py-2 border text-sm rounded-xl ${
              locale === lang.locale
                ? "bg-[#A86F43]/30 border-white/30"
                : "bg-[#2D2A2A]/30 border-white/20"
            } transition focus:outline-none`}
          >
            <Image src={lang.flag} alt={lang.name} width={20} height={20} />
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;
