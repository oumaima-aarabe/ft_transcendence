import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { fetcher } from '@/lib/fetcher';
import { useMutation } from '@tanstack/react-query';

interface QRCodeBlockProps {
    onConfirm2FA: () => void;
    qrCodeData?: string;
    secret?: string;
}

const QRCodeBlock: React.FC<QRCodeBlockProps> = ({ onConfirm2FA, qrCodeData, secret }) => {
    const t = useTranslations('settings.two_factor.qr');
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const verifyCodeMutation = useMutation({
        mutationFn: async () => {
            const response = await fetcher.post('/api/auth/verify-2fa', { code });
            return response.data;
        },
        onSuccess: (data) => {
            onConfirm2FA();
            setError(null);
        },
        onError: (error: any) => {
            setError(error.message || 'Invalid verification code');
        }
    });

    const handleVerify = () => {
        if (code.length !== 6) {
            setError('Code must be 6 digits');
            return;
        }
        verifyCodeMutation.mutate();
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-4 py-1">
            {/* Left Side - QR Code */}
            <div className="flex flex-col items-center gap-2 pl-6 pb-1">
                <h3 className="text-sm text-white ">{t('scan_title')}</h3>
                {qrCodeData ? (
                    <img 
                        src={qrCodeData} 
                        alt="QR Code" 
                        width={130} 
                        height={130} 
                        className="rounded-lg"
                    />
                ) : (
                    <Image
                        src="/assets/icons/qr-code.svg"
                        alt="QR Code"
                        width={130}
                        height={130}
                    />
                )}
                {secret && (
                    <div className="mt-2 text-xs text-white text-center">
                        <p className="mb-1">Manual setup code:</p>
                        <p className="font-mono bg-gray-800 p-1 rounded">{secret}</p>
                    </div>
                )}
            </div>

            {/* Right Side -Code Entry */}
            <div className="flex flex-col flex-2 gap-4 pr-4">
                <h3 className="text-sm text-white">{t('code_title')}</h3>
                
                {/* Input generated code*/}
                <div className="relative flex flex-col items-center">
                    <div className="relative w-full">
                        <Image 
                            src="/assets/icons/password_icon.svg" 
                            alt="Lock" 
                            width={11} 
                            height={11} 
                            className="absolute top-2.5 left-3" 
                        />
                        <input
                            type="text"
                            placeholder={t('code_placeholder')}
                            className="pl-10 py-1.5 text-white bg-[#1E1E1E] rounded-xl border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#40CFB7]/50 w-full"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            maxLength={6}
                        />
                    </div>
                    {error && (
                        <p className="text-red-400 text-xs mt-1 self-start">{error}</p>
                    )}
                </div>

                {/* Enable 2FA Button */}
                <button
                    onClick={handleVerify}
                    disabled={verifyCodeMutation.isPending || code.length !== 6}
                    className="py-2 bg-[#40CFB7]/70 hover:bg-[#00796B] text-white text-sm rounded-xl drop-shadow transition focus:outline-none disabled:opacity-50"
                >
                    {verifyCodeMutation.isPending ? 'Verifying...' : t('enable_button', { defaultMessage: 'Enable 2FA' })}
                </button>
            </div>
        </div>
    );
};

export default QRCodeBlock;
