import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface QRCodeBlockProps {
    onConfirm2FA: () => void; //logic
}

const QRCodeBlock: React.FC<QRCodeBlockProps> = ({ onConfirm2FA }) => {
    const t = useTranslations('settings.two_factor.qr');

    return (
        <div className="flex flex-row items-center justify-between gap-10 px-4 py-1">
            {/* Left Side - QR Code */}
            <div className="flex flex-col items-center gap-2 pl-6 pb-1">
                <h3 className="text-sm text-white ">{t('scan_title')}</h3>
                <Image
                    src="/assets/icons/qr-code.svg"
                    alt="QR Code"
                    width={130}
                    height={130}
                />
            </div>

            {/* Right Side -Code Entry */}
            <div className="flex flex-col flex-2 gap-4 pr-4">
                <h3 className="text-sm text-white">{t('code_title')}</h3>
                
                {/* Input generated code*/}
                <div className="relative flex items-center">
                <Image src="/assets/icons/password_icon.svg" alt="Lock" width={11} height={11} className="absolute top-2.5 left-3" />
                    <input
                        type="text"
                        placeholder={t('code_placeholder')}
                        className="pl-10 py-1.5 text-white bg-[#1E1E1E] rounded-xl border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#40CFB7]/50"
                    />
                </div>

                {/* Enable 2FA Button */}
                <button
                    onClick={onConfirm2FA}
                    className="py-2 bg-[#40CFB7]/70 hover:bg-[#00796B] text-white text-sm rounded-xl drop-shadow transition focus:outline-none"
                >
                    {t('enable_button', { defaultMessage: 'Enable 2FA' })}
                </button>
            </div>
        </div>
    );
};

export default QRCodeBlock;
