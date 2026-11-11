import React from 'react';

interface AudioVisualizerProps {
  level: number; // 0 to 1
  isListening: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ level, isListening }) => {
  // Generate 9 dynamic bars based on current microphone audio level
  const bars = [0.3, 0.6, 0.9, 1.2, 1.5, 1.2, 0.9, 0.6, 0.3];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200">
      <div className="flex items-center gap-1">
        {bars.map((multiplier, idx) => {
          const height = isListening
            ? Math.max(8, Math.min(38, level * 50 * multiplier + 6))
            : 6;

          return (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isListening
                  ? 'bg-gradient-to-t from-amber-500 to-rose-500 shadow-xs'
                  : 'bg-amber-200'
              }`}
              style={{
                height: `${height}px`,
              }}
            />
          );
        })}
      </div>
      <span className="ml-2 text-xs font-semibold text-amber-800">
        {isListening ? 'Kiky sedang mendengar...' : 'Mikrofon bersedia'}
      </span>
    </div>
  );
};
