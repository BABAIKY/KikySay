import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Volume2,
  Lock,
  Unlock,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Check,
  Smartphone,
  Download,
  ExternalLink,
  FileCode,
} from 'lucide-react';
import { WordItem, Category } from '../types';
import { speakWord } from '../utils/audioSpeech';

interface DeveloperModeViewProps {
  words: WordItem[];
  onAddWord: (word: WordItem) => boolean; // returns true if added, false if exceeded 30
  onDeleteWord: (id: string) => void;
  onResetToDefaults: () => void;
}

const MAX_WORDS = 30;

export const DeveloperModeView: React.FC<DeveloperModeViewProps> = ({
  words,
  onAddWord,
  onDeleteWord,
  onResetToDefaults,
}) => {
  // Parent Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [lockError, setLockError] = useState(false);

  // Form State
  const [newWord, setNewWord] = useState('');
  const [newSyllables, setNewSyllables] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('haiwan');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Common emoji choices for kids
  const emojiShortcuts = ['🐱', '🐶', '🐰', '🐼', '🦁', '🍎', '🍓', '🍉', '🍍', '🍒', '🚗', '✈️', '🚲', '🚀', '⚽', '🎒', '🎨', '🧸', '⭐', '🎈'];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple math challenge: 6 + 7 = 13
    if (parentAnswer.trim() === '13' || parentAnswer.trim().toLowerCase() === 'kiky') {
      setIsUnlocked(true);
      setLockError(false);
    } else {
      setLockError(true);
    }
  };

  const handleTestVoice = (text: string) => {
    if (!text.trim()) return;
    speakWord(text.trim(), false);
  };

  const handleAutoGenerateSyllables = () => {
    if (!newWord.trim()) return;
    const clean = newWord.trim();
    // Simple 2-3 syllable chunking helper for Malay words
    const chunks = clean.match(/.{1,3}/g) || [clean];
    setNewSyllables(chunks.join(' - '));
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (words.length >= MAX_WORDS) {
      setFormError(`Had maksimum ${MAX_WORDS} patah perkataan telah dicapai! Sila padam perkataan sedia ada sebelum menambah baru.`);
      return;
    }

    if (!newWord.trim()) {
      setFormError('Sila masukkan patah perkataan.');
      return;
    }

    // Check duplicate
    const exists = words.some(
      (w) => w.word.toLowerCase() === newWord.trim().toLowerCase()
    );
    if (exists) {
      setFormError(`Perkataan "${newWord.trim()}" sudah wujud dalam senarai.`);
      return;
    }

    // Parse syllables
    let syllables = newSyllables
      .split(/[-–—,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (syllables.length === 0) {
      syllables = [newWord.trim()];
    }

    const categoryLabels: Record<Category, string> = {
      haiwan: 'Haiwan',
      buah: 'Buah-buahan',
      objek: 'Objek Harian',
      lain: 'Lain-lain',
    };

    const categoryThemes: Record<Category, WordItem['colorTheme']> = {
      haiwan: {
        bg: 'from-amber-100 to-orange-100',
        cardBg: 'bg-orange-50',
        border: 'border-orange-300',
        accent: 'text-orange-600',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700',
      },
      buah: {
        bg: 'from-rose-100 to-red-100',
        cardBg: 'bg-rose-50',
        border: 'border-rose-300',
        accent: 'text-rose-600',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-700',
      },
      objek: {
        bg: 'from-blue-100 to-indigo-100',
        cardBg: 'bg-blue-50',
        border: 'border-blue-300',
        accent: 'text-blue-600',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700',
      },
      lain: {
        bg: 'from-purple-100 to-violet-100',
        cardBg: 'bg-purple-50',
        border: 'border-purple-300',
        accent: 'text-purple-600',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700',
      },
    };

    const id = newWord
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

    const createdWord: WordItem = {
      id,
      word: newWord.trim(),
      syllables,
      phoneticGuide: syllables.join(' - '),
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      emoji: newEmoji || '⭐',
      description: newDescription.trim() || `Belajar menyebut kata ${newWord.trim()}.`,
      colorTheme: categoryThemes[newCategory],
      isCustom: true,
      starsEarned: 0,
      isMastered: false,
      needsPractice: false,
      attemptsCount: 0,
      updatedAt: Date.now(),
    };

    const added = onAddWord(createdWord);
    if (added) {
      setFormSuccess(`Perkataan "${newWord.trim()}" berjaya ditambah!`);
      setNewWord('');
      setNewSyllables('');
      setNewDescription('');
    } else {
      setFormError(`Had perkataan maksimum ${MAX_WORDS} telah dipenuhi.`);
    }
  };

  const filteredWords = words.filter((w) =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Page Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-white font-bold text-xs uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Mod Developer & Pengurusan Kata</span>
        </div>
        <h1 className="font-sniglet text-3xl sm:text-4xl font-black text-slate-800">
          Urus Perkataan kikysay
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
          Tambah dan buang perkataan mengikut silibus pembelajaran anak.
          Maksimum <strong>{MAX_WORDS} patah perkataan</strong> sahaja.
        </p>
      </div>

      {/* Security Gate for Parents / Developers */}
      {!isUnlocked ? (
        <div className="bg-white rounded-3xl border-4 border-amber-200 p-8 sm:p-10 max-w-md mx-auto shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-sniglet text-2xl font-black text-slate-800 mb-2">
            Zon Ibu Bapa & Guru
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-6">
            Sila jawab soalan mudah ini untuk membuka tetapan Mod Developer:
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 font-black text-lg text-amber-900">
              Berapakah 6 + 7 = ?
            </div>

            <input
              type="text"
              value={parentAnswer}
              onChange={(e) => setParentAnswer(e.target.value)}
              placeholder="Tulis jawapan (cth: 13)"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl text-center font-bold text-base focus:border-amber-500 focus:outline-none"
              autoFocus
            />

            {lockError && (
              <p className="text-xs text-rose-600 font-bold">
                Jawapan tidak tepat. Sila cuba lagi.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-sm shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Mod Developer</span>
            </button>
          </form>
        </div>
      ) : (
        /* Unlocked Developer Console */
        <div className="space-y-6">
          {/* Android APK & PWA Export Guidance Box */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl border-2 border-emerald-300 p-5 sm:p-6 shadow-xs">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-sniglet text-xl font-black text-slate-900">
                    Konfigurasi Android Capacitor & Fail APK
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950">
                    com.kikysay.app
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Folder projek Android (<strong>android/</strong>) dan konfigurasi <strong>Capacitor</strong> telah siap dibina bersama kebenaran mikrofon (RECORD_AUDIO).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-200/80 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">1</span>
                  <span>Pasang Terus di Telefon Pintar (Paling Cepat)</span>
                </p>
                <p className="text-slate-600 leading-relaxed mb-2">
                  Buka pautan ini di Google Chrome telefon Android anda, tekan ikon 3 titik di sudut atas, dan pilih <strong>"Add to Home screen" / "Install App"</strong>. Aplikasi akan terpasang di skrin telefon serta-merta!
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-emerald-200">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">2</span>
                  <span>Jana Fail .APK Sendiri (Android Studio)</span>
                </p>
                <p className="text-slate-600 leading-relaxed mb-2">
                  Muat turun projek ini, buka folder <code>android/</code> dalam <strong>Android Studio</strong> di PC/Laptop, lalu tekan:
                  <br />
                  <strong className="text-emerald-900">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar (30 Words Limit strictly visible) */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800">
                  Kapasiti Perkataan:
                </span>
                <span className="font-black text-amber-900 text-base font-sniglet">
                  {words.length} / {MAX_WORDS}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  words.length >= MAX_WORDS
                    ? 'bg-rose-100 text-rose-800 font-black'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {words.length >= MAX_WORDS
                  ? 'Maksimum Dicapai (30/30)'
                  : `Baki ${MAX_WORDS - words.length} slot perkataan`}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  words.length >= MAX_WORDS
                    ? 'bg-rose-500'
                    : words.length >= 25
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(words.length / MAX_WORDS) * 100}%` }}
              />
            </div>
          </div>

          {/* Form to Add New Word */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm">
            <h2 className="font-sniglet text-2xl font-black text-slate-800 mb-1 flex items-center gap-2">
              <Plus className="w-6 h-6 text-amber-500" />
              <span>Tambah Perkataan Baru</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Sila pastikan perkataan mudah dieja dan sesuai untuk kanak-kanak.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateWord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Word */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Patah Perkataan:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Contoh: Itik"
                      className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestVoice(newWord)}
                      className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold cursor-pointer"
                      title="Uji Suara"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Syllables */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Pecahan Suku Kata:
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSyllables}
                      className="text-[11px] text-amber-600 hover:underline font-bold cursor-pointer"
                    >
                      Jana Automatik
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newSyllables}
                    onChange={(e) => setNewSyllables(e.target.value)}
                    placeholder="Contoh: I - tik"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kategori:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-amber-500 focus:outline-none bg-white"
                  >
                    <option value="haiwan">Haiwan 🦁</option>
                    <option value="buah">Buah-buahan 🍎</option>
                    <option value="objek">Objek Harian 🚗</option>
                    <option value="lain">Lain-lain ⭐</option>
                  </select>
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ikon Emoji:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      className="w-16 px-3 py-2.5 border-2 border-slate-200 rounded-xl text-center text-xl font-bold focus:border-amber-500 focus:outline-none"
                    />
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1">
                      {emojiShortcuts.slice(0, 5).map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewEmoji(em)}
                          className="p-1 hover:scale-125 transition-transform text-lg cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Keterangan Kanak-Kanak:
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Contoh: Burung air yang berenang."
                    className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={words.length >= MAX_WORDS}
                  className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                    words.length >= MAX_WORDS
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:scale-101 active:scale-99'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    {words.length >= MAX_WORDS
                      ? `Had Maksimum ${MAX_WORDS} Dicapai`
                      : 'Simpan Perkataan Baru'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Word Management List */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-sniglet text-2xl font-black text-slate-800">
                  Senarai Semua Perkataan ({words.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Tekan ikon tong sampah untuk membuang perkataan.
                </p>
              </div>

              {/* Search & Reset */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari perkataan..."
                    className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={onResetToDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                  title="Pulihkan semula ke 20 perkataan asas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pulihkan Asal</span>
                </button>
              </div>
            </div>

            {/* Word Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-amber-300 bg-slate-50/70 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{word.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-sniglet font-black text-slate-800 text-base truncate">
                          {word.word}
                        </p>
                        {word.isCustom && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-violet-100 text-violet-700 rounded-md shrink-0">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium">
                        {word.phoneticGuide} · {word.categoryLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleTestVoice(word.word)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Uji Sebutan"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Adakah anda pasti ingin membuang perkataan "${word.word}"?`
                          )
                        ) {
                          onDeleteWord(word.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Buang Perkataan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredWords.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                Tiada perkataan sepadan dengan carian.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
