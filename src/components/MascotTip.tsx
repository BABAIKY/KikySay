import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakWord } from '../utils/audioSpeech';

interface MascotTipProps {
  message: string;
  subMessage?: string;
  spokenAudioText?: string;
  variant?: 'normal' | 'celebrate' | 'encouraging';
}

export const MascotTip: React.FC<MascotTipProps> = ({
  message,
  subMessage,
  spokenAudioText,
  variant = 'normal',
}) => {
  const handlePlayVoice = () => {
    const textToSpeak = spokenAudioText || message;
    speakWord(textToSpeak, false);
  };

  const bubbleBg =
    variant === 'celebrate'
      ? 'bg-amber-100 border-amber-300 text-amber-950'
      : variant === 'encouraging'
      ? 'bg-rose-100 border-rose-300 text-rose-950'
      : 'bg-white border-amber-200 text-slate-800';

  return (
    <div className="flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-3xl bg-amber-100/60 border border-amber-200 shadow-xs mb-6 max-w-2xl mx-auto">
      {/* Mascot Avatar with gentle bounce */}
      <button
        onClick={handlePlayVoice}
        className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
        title="Tekan Kiky untuk dengar!"
      >
        <img
          src="/src/assets/images/mascot_kiky_1794359891883.jpg"
          alt="Mascot Kiky"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xs">
          <Volume2 className="w-3 h-3" />
        </div>
      </button>

      {/* Speech Bubble */}
      <div className={`flex-1 relative p-3 rounded-2xl border shadow-xs ${bubbleBg}`}>
        {/* Pointer Triangle */}
        <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-amber-200" />
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm sm:text-base font-bold leading-snug">
            {message}
          </p>
          <button
            onClick={handlePlayVoice}
            className="p-1.5 rounded-xl bg-amber-200/60 hover:bg-amber-300/80 text-amber-900 transition-colors shrink-0 cursor-pointer"
            title="Dengar arahan suara"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        {subMessage && (
          <p className="text-xs text-slate-600 mt-1 font-medium">{subMessage}</p>
        )}
      </div>
    </div>
  );
};
