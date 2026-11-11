import React, { useState, useEffect } from 'react';
import { WordItem, AppMode, Category, Badge } from './types';
import { DEFAULT_WORDS, INITIAL_BADGES } from './data/defaultWords';
import { Navbar } from './components/Navbar';
import { FlashcardView } from './components/FlashcardView';
import { PracticeModeView } from './components/PracticeModeView';
import { DeveloperModeView } from './components/DeveloperModeView';
import { RewardsView } from './components/RewardsView';
import { playClickSound } from './utils/audioSpeech';

const STORAGE_KEY = 'kikysay_store_v1';
const MAX_WORDS = 30;

export default function App() {
  // Load initial words
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.words) && parsed.words.length > 0) {
          return parsed.words.slice(0, MAX_WORDS);
        }
      }
    } catch {
      // LocalStorage read error fallback
    }
    return DEFAULT_WORDS;
  });

  // Load user total stars
  const [totalStars, setTotalStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.totalStars === 'number') {
          return parsed.totalStars;
        }
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  // Badges
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Navigation and active filters
  const [currentMode, setCurrentMode] = useState<AppMode>('learn');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          words,
          totalStars,
          updatedAt: Date.now(),
        })
      );
    } catch {
      // Storage save error
    }
  }, [words, totalStars]);

  // Filtered words based on category in learn mode
  const displayedWords = selectedCategory === 'all'
    ? words
    : words.filter((w) => w.category === selectedCategory);

  // Safe navigation index
  const safeCurrentIndex = Math.min(currentIndex, Math.max(0, displayedWords.length - 1));

  // Handler for mode changes
  const handleSelectMode = (mode: AppMode) => {
    playClickSound();
    setCurrentMode(mode);
  };

  // Handler for category changes
  const handleSelectCategory = (category: Category | 'all') => {
    playClickSound();
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  // Add Stars to child's bank
  const handleAddStar = (count: number) => {
    setTotalStars((prev) => prev + count);
  };

  // Update a single word (e.g. after speech evaluation or practice bookmark)
  const handleUpdateWord = (updatedWord: WordItem) => {
    setWords((prevWords) =>
      prevWords.map((w) => (w.id === updatedWord.id ? updatedWord : w))
    );
  };

  // Add new word in developer mode (Strict 30 words maximum)
  const handleAddWord = (newWord: WordItem): boolean => {
    if (words.length >= MAX_WORDS) {
      return false;
    }
    setWords((prevWords) => {
      if (prevWords.length >= MAX_WORDS) return prevWords;
      return [...prevWords, newWord];
    });
    return true;
  };

  // Delete word in developer mode
  const handleDeleteWord = (id: string) => {
    setWords((prevWords) => {
      const filtered = prevWords.filter((w) => w.id !== id);
      // Ensure at least 1 word remains
      return filtered.length > 0 ? filtered : DEFAULT_WORDS.slice(0, 1);
    });
  };

  // Reset words to default 20 basic words
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Adakah anda pasti ingin memulihkan semula ke 20 perkataan asas asal (Haiwan, Buah, Objek)?'
      )
    ) {
      setWords(DEFAULT_WORDS);
      setCurrentIndex(0);
      setSelectedCategory('all');
    }
  };

  // Count words needing practice
  const practiceCount = words.filter(
    (w) => w.needsPractice || (w.attemptsCount > 0 && w.starsEarned < 2)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-50 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        totalStars={totalStars}
        practiceCount={practiceCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentMode === 'learn' && (
          <FlashcardView
            words={displayedWords}
            currentIndex={safeCurrentIndex}
            onNavigate={(newIdx) => setCurrentIndex(newIdx)}
            onUpdateWord={handleUpdateWord}
            onAddStar={handleAddStar}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentMode === 'practice' && (
          <PracticeModeView
            allWords={words}
            onUpdateWord={handleUpdateWord}
            onAddStar={handleAddStar}
            onSwitchToLearn={(idx = 0) => {
              setCurrentIndex(idx);
              setCurrentMode('learn');
            }}
          />
        )}

        {currentMode === 'rewards' && (
          <RewardsView
            totalStars={totalStars}
            words={words}
            badges={badges}
            onSwitchToLearn={() => setCurrentMode('learn')}
          />
        )}

        {currentMode === 'developer' && (
          <DeveloperModeView
            words={words}
            onAddWord={handleAddWord}
            onDeleteWord={handleDeleteWord}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* Clean Child Educational Footer */}
      <footer className="border-t border-amber-200/80 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-sniglet font-black text-amber-900 text-sm">
              kikysay
            </span>
            <span>·</span>
            <span>Aplikasi Sebutan Bahasa Melayu Kanak-Kanak</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => handleSelectMode('learn')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Belajar Kata
            </button>
            <button
              onClick={() => handleSelectMode('practice')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Mod Latihan ({practiceCount})
            </button>
            <button
              onClick={() => handleSelectMode('developer')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Mod Developer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
