import React from 'react';
import { Sparkles, BookOpen, Repeat, Award, Settings } from 'lucide-react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  totalStars: number;
  practiceCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  totalStars,
  practiceCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Mascot Logo */}
        <button
          onClick={() => onSelectMode('learn')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-amber-400 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden border-2 border-amber-300">
            <img
              src="/src/assets/images/mascot_kiky_1794359891883.jpg"
              alt="Kiky Mascot"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sniglet text-2xl font-black tracking-tight text-amber-900 group-hover:text-amber-600 transition-colors">
              kikysay
            </span>
            <span className="text-[10px] font-semibold text-amber-600 tracking-wider uppercase -mt-1 hidden sm:block">
              Belajar Sebut Kata
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectMode('learn')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentMode === 'learn'
                ? 'bg-amber-500 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Belajar</span>
          </button>

          <button
            onClick={() => onSelectMode('practice')}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentMode === 'practice'
                ? 'bg-rose-500 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/60'
            }`}
          >
            <Repeat className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Mod Latihan</span>
            {practiceCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-300 text-amber-950 font-black text-[11px] rounded-full">
                {practiceCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectMode('rewards')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentMode === 'rewards'
                ? 'bg-violet-500 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-violet-100/60'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap hidden sm:inline">Ganjaran</span>
          </button>

          <button
            onClick={() => onSelectMode('developer')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentMode === 'developer'
                ? 'bg-slate-800 text-white shadow-sm scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Mod Developer (Ibu Bapa / Guru)"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap hidden md:inline">Mod Developer</span>
          </button>
        </nav>

        {/* Zone 3: Star Counter Badge (Primary Child Motivation) */}
        <div
          onClick={() => onSelectMode('rewards')}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-3.5 py-1.5 rounded-full shadow-xs border-2 border-yellow-300/80 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Bintang Terkumpul"
        >
          <Sparkles className="w-4 h-4 text-amber-900 animate-spin-slow fill-yellow-200" />
          <span className="font-black text-sm sm:text-base font-sniglet tabular-nums">
            {totalStars}
          </span>
          <span className="text-xs font-bold hidden sm:inline text-amber-900">Bintang</span>
        </div>
      </div>
    </header>
  );
};
