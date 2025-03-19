import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react/dist/iconify.js';

const GameComponent: React.FC = () => {
    const t = useTranslations('settings.game');

    const [connectivity, setConnectivity] = useState<'online' | 'local'>('online');
    const [theme, setTheme] = useState<'fire' | 'water'>('fire');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

    useEffect(() => {
       const connectivity = localStorage.getItem('connectivity');
       const theme = localStorage.getItem('theme');
       const difficulty = localStorage.getItem('difficulty');
       if (connectivity) {
        setConnectivity(connectivity as 'online' | 'local');
       }
       if (theme) {
        setTheme(theme as 'fire' | 'water');
       }
       if (difficulty) {
        setDifficulty(difficulty as 'easy' | 'medium' | 'hard');
       }
    }, []);

    useEffect(() => {
        localStorage.setItem('connectivity', connectivity);
        localStorage.setItem('theme', theme);
        localStorage.setItem('difficulty', difficulty);
    }, [connectivity, theme, difficulty]);

    return (
        <div className='h-[70vh] w-full flex flex-row items-center gap-44 p-20'>
        <div className="flex flex-col items-start gap-10 text-white">
            {/* Connectivity Selection */}
            <div className="flex flex-col items-start gap-2 mt-4">
                <h2 className="text-lg mb-3">{t('connectivity.title')}</h2>
                <div className="flex gap-4">
                    <button
                        className={`relative gap-2 w-[10rem] py-2 border text-sm rounded-xl ${connectivity === 'online' ? 'bg-[#A86F43]/30 border-white/30'
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
                        className={`relative gap-2 w-[10rem] py-2 border text-sm rounded-xl ${connectivity === 'local' ? 'bg-[#A86F43]/30 border-white/30'
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

            {/* Game difficulty selection */}
            <div className="flex flex-col items-start gap-2 mt-4">
                <h2 className="text-lg mb-3">{t('difficulty.title')}</h2>
                <div className="flex gap-4">
                    <button
                        className={`relative gap-2 w-[10rem] py-2 border text-sm rounded-xl ${difficulty === 'easy' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setDifficulty('easy')}
                    >
                        <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <Icon icon="mdi:speedometer-slow" width="24" height="24" color='yellow' />
                        </div>
                        {t('difficulty.easy')}
                    </button>
                    <button
                        className={`relative gap-2 w-[10rem] py-2 border text-sm rounded-xl ${difficulty === 'medium' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setDifficulty('medium')}
                    >
                        <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <Icon icon="mdi:speedometer-medium" width="24" height="24" color='green' />
                        </div>
                        {t('difficulty.medium')}
                    </button>
                    <button
                        className={`relative gap-2 w-[10rem] py-2 border text-sm rounded-xl ${difficulty === 'hard' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setDifficulty('hard')}
                    >
                        <div className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <Icon icon="mdi:speedometer" width="24" height="24" color='red' />
                        </div>
                        {t('difficulty.hard')}
                    </button>
                </div>
            </div>

            {/* Board Theme Selection */}
            <div className="flex flex-col gap-2 mt-4">
                <h2 className="text-lg mb-3">{t('theme.title')}</h2>
                <div className="flex gap-4">
                    <button
                        className={`flex  w-[10rem] py-1 items-center justify-center border text-sm rounded-xl ${theme === 'fire' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setTheme('fire')}
                        title={t('theme.fire')}
                    >
                    <img src='/assets/icons/fire-icon.svg' alt="Fire Icon" className="h-7 w-7 " />
                    </button>
                    <button
                        className={`flex w-[10rem] py-1 items-center justify-center border text-sm rounded-xl ${theme === 'water' ? 'bg-[#A86F43]/30 border-white/30'
                            : 'bg-[#2D2A2A]/30 border-white/20'
                            } transition focus:outline-none`}
                        onClick={() => setTheme('water')}
                        title={t('theme.water')}
                    >
                        <img src='/assets/icons/water-icon.svg' alt="Water Icon" className="h-7 w-7" />
                    </button>
                </div>
            </div>

            </div>
            {/* Pong Table Preview */}
            <div className='transform translate-y-[8%]'>
                {theme === 'fire' ? (
                    <Image
                        src="/assets/images/game-board-fire.png"
                        alt={t('theme.fire')}
                        width={300}
                        height={200}
                        className="rounded-lg"
                    />
                ) : (
                    <Image
                        src="/assets/images/game-board-water.png"
                        alt={t('theme.water')}
                        width={300}
                        height={200}
                        className="rounded-lg"
                    />
                )}
            </div>
        </div>
    );
};

export default GameComponent;
