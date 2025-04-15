import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCodeBlock from './QRCodeBlock';
import Enabled2FABlock from './Enabled2FABlock';
import { useTranslations } from 'next-intl';
import { fetcher } from '@/lib/fetcher';
import { useMutation } from '@tanstack/react-query';

interface TwoFactorAuthProps {
    is2FAEnabled: boolean;
    toggle2FA: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ is2FAEnabled, toggle2FA }) => {
    const t = useTranslations('settings.two_factor');
    const [step, setStep] = useState<'default' | 'qr' | 'enabled'>(is2FAEnabled ? 'enabled' : 'default');
    const [error, setError] = useState<string | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);

    // Check user's 2FA status on component mount
    useEffect(() => {
        // Update the step based on the is2FAEnabled prop
        setStep(is2FAEnabled ? 'enabled' : 'default');
    }, [is2FAEnabled]);

    const enable2FAMutation = useMutation({
        mutationFn: async () => {
            const response = await fetcher.post('/api/auth/enable-2fa');
            return response.data;
        },
        onSuccess: (data) => {
            // Show QR code step
            setStep('qr');
            setError(null);
            
            // Set QR code data and secret
            if (data.qr_code) {
                setQrCodeData(data.qr_code);
            }
            if (data.secret) {
                setSecret(data.secret);
            }
        },
        onError: (error: any) => {
            setError(error.message || 'Failed to enable 2FA');
        }
    });

    const disable2FAMutation = useMutation({
        mutationFn: async () => {
            const response = await fetcher.post('/api/auth/disable-2fa');
            return response.data;
        },
        onSuccess: (data) => {
            toggle2FA();
            setStep('default');
            setError(null);
            setQrCodeData(null);
            setSecret(null);
        },
        onError: (error: any) => {
            setError(error.message || 'Failed to disable 2FA');
        }
    });

    const handleEnable2FA = () => {
        enable2FAMutation.mutate();
    };

    const handleConfirm2FA = () => {
        toggle2FA();
        setStep('enabled');
        setQrCodeData(null);
        setSecret(null);
    };

    const handleDisable2FA = () => {
        disable2FAMutation.mutate();
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-normal">{t('title')}</h2>
            <div className="p-4 bg-[#2D2A2A]/30 border border-white/20 w-full rounded-xl">
                {error && (
                    <div className="bg-red-500/20 text-red-300 p-2 mb-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                {step === 'default' && (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-8 mt-4 text-sm">
                            <Image src="/assets/icons/2fa_vector.svg" alt="Shield" width={20} height={20} />
                            <p>{t('disabled_message')}</p>
                        </div>
                        <button
                            onClick={handleEnable2FA}
                            disabled={enable2FAMutation.isPending}
                            className="px-6 py-2 w-[70%] mx-auto mb-7 bg-[#D05F3B]/90 hover:bg-[#D05F3B]/80 text-white text-sm rounded-xl drop-shadow transition block focus:outline-none disabled:opacity-50"
                        >
                            {enable2FAMutation.isPending ? 'Enabling...' : t('enable_button')}
                        </button>
                    </>
                )}

                {step === 'qr' && <QRCodeBlock onConfirm2FA={handleConfirm2FA} qrCodeData={qrCodeData || undefined} secret={secret || undefined} />}

                {step === 'enabled' && <Enabled2FABlock onDisable2FA={handleDisable2FA} />}
            </div>
        </div>
    );
};

export default TwoFactorAuth;
