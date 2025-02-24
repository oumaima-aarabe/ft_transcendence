import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const GameComponent: React.FC = () => {
    const t = useTranslations('settings.game');
    //State for connectivity selection
    const [connectivity, setConnectivity] = useState<'online' | 'local'>('online');

    //State for board theme selection
    const [theme, setTheme] = useState<'fire' | 'water'>('fire');

    return (
        <div className="flex flex-col items-start gap-10 text-white pt-20">
            {/* Connectivity Selection */}
            <div className="flex flex-col items-start gap-2">
                <h2 className="text-sm mb-3">{t('connectivity.title')}</h2>
                <div className="flex gap-4">
                    <button
                        className={`relative gap-2 w-[9rem] py-2 border text-sm rounded-xl ${connectivity === 'online' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setConnectivity('online')}
                    >
                        <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                            <img src='/assets/icons/online-icon.svg' alt="online Icon" className="h-5 w-5" />
                        </div>
                        {t('connectivity.online')}
                    </button>
                    <button
                        className={`relative gap-2 w-[9rem] py-2 border text-sm rounded-xl ${connectivity === 'local' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setConnectivity('local')}
                    >
                        <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                            <img src='/assets/icons/invisible-icon.svg' alt="local Icon" className="h-5 w-5" />
                        </div>
                        {t('connectivity.local')}
                    </button>
                </div>
            </div>

            {/* Board Theme Selection */}
            <div className="flex flex-col gap-2 mt-8">
                <h2 className="text-sm mb-3">{t('theme.title')}</h2>
                <div className="flex gap-4">
                    <button
                        className={`flex items-center w-[9rem] py-1  border text-sm rounded-xl ${theme === 'fire' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setTheme('fire')}
                        title={t('theme.fire')}
                    >
                    <img src='/assets/icons/fire-icon.svg' alt="Fire Icon" className="h-7 w-7 w-full" />
                    </button>
                    <button
                        className={`flex items-center w-[9rem] py-1  border text-sm rounded-xl ${theme === 'water' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setTheme('water')}
                        title={t('theme.water')}
                    >
                        <img src='/assets/icons/water-icon.svg' alt="Water Icon" className="h-7 w-7 w-full" />
                    </button>
                </div>
            </div>

            {/* Pong Table Preview */}
            <div className="mt-12">
                {theme === 'fire' ? (
                    <Image
                        src="/assets/images/game-board-fire.svg"
                        alt={t('theme.fire')}
                        width={600}
                        height={300}
                        className="rounded-lg"
                    />
                ) : (
                    <Image
                        src="/assets/images/game-board-water.svg"
                        alt={t('theme.water')}
                        width={600}
                        height={300}
                        className="rounded-lg"
                    />
                )}
            </div>
        </div>
    );
};

export default GameComponent;
