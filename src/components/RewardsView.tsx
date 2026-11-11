import React from 'react';
import { Sparkles, Trophy, Star, CheckCircle, Award } from 'lucide-react';
import { WordItem, Badge } from '../types';
import { triggerStarConfetti, playCelebrationFanfare } from '../utils/audioSpeech';

interface RewardsViewProps {
  totalStars: number;
  words: WordItem[];
  badges: Badge[];
  onSwitchToLearn: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  totalStars,
  words,
  badges,
  onSwitchToLearn,
}) => {
  const masteredWords = words.filter((w) => w.isMastered);
  const animalMastered = words.filter((w) => w.category === 'haiwan' && w.isMastered).length;
  const fruitMastered = words.filter((w) => w.category === 'buah' && w.isMastered).length;
  const objectMastered = words.filter((w) => w.category === 'objek' && w.isMastered).length;

  const handleCelebrate = () => {
    triggerStarConfetti();
    playCelebrationFanfare();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-900 border border-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4 text-violet-600" />
          <span>Koleksi Ganjaran & Bintang</span>
        </div>
        <h1 className="font-sniglet text-3xl sm:text-4xl font-black text-slate-800">
          Tahniah Bintang Cilik! 🌟
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
          Lihat semua bintang emas dan lencana kejuaraan yang adik kumpulkan semasa belajar menyebut perkataan di kikysay.
        </p>
      </div>

      {/* Hero Star Bank Card */}
      <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-amber-950 shadow-xl border-4 border-yellow-200 mb-8 relative overflow-hidden">
        {/* Decorative background stars */}
        <div className="absolute top-2 right-4 text-yellow-200/40 text-7xl font-black select-none pointer-events-none">
          ⭐
        </div>
        <div className="absolute bottom-2 left-6 text-yellow-200/30 text-5xl font-black select-none pointer-events-none">
          ✨
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/90 p-1 flex items-center justify-center shadow-lg border-4 border-yellow-300 animate-wiggle">
              <Star className="w-12 h-12 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                Jumlah Bintang Terkumpul
              </p>
              <h2 className="font-sniglet text-5xl sm:text-6xl font-black text-amber-950">
                {totalStars}
              </h2>
              <p className="text-xs font-bold text-amber-900/80">
                {masteredWords.length} perkataan telah dikuasai sepenuhnya!
              </p>
            </div>
          </div>

          <button
            onClick={handleCelebrate}
            className="px-6 py-3.5 bg-white hover:bg-yellow-50 text-amber-950 rounded-2xl font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 border-2 border-yellow-300"
          >
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <span>Raikan Kejayaan! 🎉</span>
          </button>
        </div>
      </div>

      {/* Category Mastery Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Haiwan */}
        <div className="bg-white rounded-3xl border-2 border-orange-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🦁</span>
            <span className="font-sniglet font-black text-lg text-orange-950">
              {animalMastered} / {words.filter((w) => w.category === 'haiwan').length}
            </span>
          </div>
          <h3 className="font-sniglet font-black text-slate-800 text-base">
            Kategori Haiwan
          </h3>
          <p className="text-xs text-slate-500 mt-1">Perkataan haiwan dikuasai</p>
        </div>

        {/* Buah */}
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🍎</span>
            <span className="font-sniglet font-black text-lg text-rose-950">
              {fruitMastered} / {words.filter((w) => w.category === 'buah').length}
            </span>
          </div>
          <h3 className="font-sniglet font-black text-slate-800 text-base">
            Buah-buahan
          </h3>
          <p className="text-xs text-slate-500 mt-1">Perkataan buah dikuasai</p>
        </div>

        {/* Objek */}
        <div className="bg-white rounded-3xl border-2 border-blue-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🚗</span>
            <span className="font-sniglet font-black text-lg text-blue-950">
              {objectMastered} / {words.filter((w) => w.category === 'objek').length}
            </span>
          </div>
          <h3 className="font-sniglet font-black text-slate-800 text-base">
            Objek Harian
          </h3>
          <p className="text-xs text-slate-500 mt-1">Perkataan objek dikuasai</p>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sniglet text-2xl font-black text-slate-800">
              Peti Lencana Kejuaraan
            </h2>
            <p className="text-xs text-slate-500">
              Buka lebih banyak lencana dengan menyebut lebih banyak perkataan!
            </p>
          </div>
          <Award className="w-6 h-6 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            // Dynamic check for unlock
            let isUnlocked = badge.unlocked;
            if (badge.id === 'first_star' && totalStars >= 1) isUnlocked = true;
            if (badge.id === 'animal_master' && animalMastered >= 3) isUnlocked = true;
            if (badge.id === 'fruit_lover' && fruitMastered >= 3) isUnlocked = true;
            if (badge.id === 'object_pro' && objectMastered >= 3) isUnlocked = true;
            if (badge.id === 'champion' && totalStars >= 15) isUnlocked = true;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-400 text-white shadow-xs animate-bounce-slow'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-sniglet font-black text-slate-800 text-sm truncate">
                      {badge.name}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return to Learn CTA */}
      <div className="text-center">
        <button
          onClick={onSwitchToLearn}
          className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          🌟 Teruskan Belajar & Sebut Kata
        </button>
      </div>
    </div>
  );
};
