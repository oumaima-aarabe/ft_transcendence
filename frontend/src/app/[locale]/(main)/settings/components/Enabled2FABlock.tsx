import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Enabled2FABlockProps {
    onDisable2FA: () => void;
}

const Enabled2FABlock: React.FC<Enabled2FABlockProps> = ({ onDisable2FA }) => {
    const t = useTranslations('settings.two_factor');

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-6 mb-8 mt-4 text-sm">
                <Image src="/assets/icons/2fa_vector.svg" alt="Shield" width={20} height={20} />
                <p>{t('enabled_message')}</p>
            </div>
            <button
                onClick={onDisable2FA}
                className="px-6 py-2 w-[70%] mx-auto bg-red-900/90 hover:bg-red-900/80 text-white text-sm mb-7 rounded-xl drop-shadow transition block focus:outline-none"
            >
                {t('disable_button')}
            </button>
        </div>
    );
};

export default Enabled2FABlock;
