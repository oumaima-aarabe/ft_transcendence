import React, { useState } from 'react';
import Image from 'next/image';
import QRCodeBlock from './QRCodeBlock';
import Enabled2FABlock from './Enabled2FABlock';
import { useTranslations } from 'next-intl';

interface TwoFactorAuthProps {
    is2FAEnabled: boolean;
    toggle2FA: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ is2FAEnabled, toggle2FA }) => {
    const t = useTranslations('settings.two_factor');
    const [step, setStep] = useState<'default' | 'qr' | 'enabled'>(is2FAEnabled ? 'enabled' : 'default');

    const handleEnable2FA = () => {
        toggle2FA();
        setStep('qr'); // Show QR Code Block
    };

    const handleConfirm2FA = () => {
        setStep('enabled'); //Show Enabled 2FA Block
    };

    const handleDisable2FA = () => {
        toggle2FA();
        setStep('default'); // Reset to initial state
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-sm font-normal">{t('title')}</h2>
            <div className="p-4 bg-[#2D2A2A]/30 border border-white/20 w-full rounded-xl">
                {step === 'default' && (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-8 mt-4 text-sm">
                            <Image src="/assets/icons/2fa_vector.svg" alt="Shield" width={20} height={20} />
                            <p>{t('disabled_message')}</p>
                        </div>
                        <button
                            onClick={handleEnable2FA}
                            className="px-6 py-2 w-[70%] mx-auto mb-7 bg-[#D05F3B]/90 hover:bg-[#D05F3B]/80 text-white text-sm rounded-xl drop-shadow transition block focus:outline-none"
                        >
                            {t('enable_button')}
                        </button>
                    </>
                )}

                {step === 'qr' && <QRCodeBlock onConfirm2FA={handleConfirm2FA} />}

                {step === 'enabled' && <Enabled2FABlock onDisable2FA={handleDisable2FA} />}
            </div>
        </div>
    );
};

export default TwoFactorAuth;
