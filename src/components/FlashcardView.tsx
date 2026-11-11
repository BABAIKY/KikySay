import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  CheckCircle2,
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { WordItem, Category, SpeechMatchResult } from '../types';
import {
  speakWord,
  speakSyllable,
  playStarChime,
  playCelebrationFanfare,
  playTryAgainSound,
  triggerStarConfetti,
  calculateMalaySimilarity,
  SpeechListener,
  DirectAudioLevelListener,
  isSpeechRecognitionSupported,
} from '../utils/audioSpeech';
import { AudioVisualizer } from './AudioVisualizer';
import { MascotTip } from './MascotTip';
import { MicrophoneGuideModal } from './MicrophoneGuideModal';

interface FlashcardViewProps {
  words: WordItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onUpdateWord: (updatedWord: WordItem) => void;
  onAddStar: (stars: number) => void;
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  currentIndex,
  onNavigate,
  onUpdateWord,
  onAddStar,
  selectedCategory,
  onSelectCategory,
}) => {
  const currentWord = words[currentIndex] || words[0];

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [lastResult, setLastResult] = useState<SpeechMatchResult | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [rawErrorCode, setRawErrorCode] = useState<string | null>(null);
  const [activeSyllable, setActiveSyllable] = useState<string | null>(null);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState(false);
  const [showSimulateInput, setShowSimulateInput] = useState(false);
  const [simulatedSpokenText, setSimulatedSpokenText] = useState('');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [useVolumeMode, setUseVolumeMode] = useState(false);

  const listenerRef = useRef<SpeechListener | null>(null);
  const volumeListenerRef = useRef<DirectAudioLevelListener | null>(null);
  const micTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play guide speech when card changes
  useEffect(() => {
    setLastResult(null);
    setMicError(null);
    setRawErrorCode(null);
    setInterimText('');
    stopListening();
  }, [currentWord?.id]);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (listenerRef.current) {
      listenerRef.current.stop();
      listenerRef.current = null;
    }
    if (volumeListenerRef.current) {
      volumeListenerRef.current.stop();
      volumeListenerRef.current = null;
    }
    if (micTimeoutRef.current) {
      clearTimeout(micTimeoutRef.current);
      micTimeoutRef.current = null;
    }
    setIsListening(false);
    setMicLevel(0);
  };

  const handleStartListening = () => {
    if (!currentWord) return;
    setMicError(null);
    setRawErrorCode(null);
    setLastResult(null);
    setInterimText('');

    if (isListening) {
      stopListening();
      return;
    }

    // If user prefers direct volume detection mode
    if (useVolumeMode) {
      startVolumeDetector();
      return;
    }

    // Primary: Web Speech API (runs synchronously)
    const listener = new SpeechListener(
      (interim) => {
        setInterimText(interim);
      },
      (finalText) => {
        handleSpeechResult(finalText);
        stopListening();
      },
      (errorMsg, rawCode) => {
        setMicError(errorMsg);
        setRawErrorCode(rawCode || 'error');
        stopListening();
      },
      (level) => {
        setMicLevel(level);
      }
    );

    listenerRef.current = listener;
    const started = listener.startListening();

    if (started) {
      setIsListening(true);
      micTimeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening();
          if (!lastResult) {
            setMicError('Masa bercakap tamat. Sila tekan mikrofon semula untuk cuba ya!');
          }
        }
      }, 7000);
    }
  };

  const startVolumeDetector = async () => {
    setIsListening(true);
    setInterimText('Sedang mendengar suara adik...');

    const volListener = new DirectAudioLevelListener(
      (level) => setMicLevel(level),
      (voiced, peak) => {
        setIsListening(false);
        if (voiced) {
          // Child successfully voiced the word!
          handleSpeechResult(currentWord.word);
        } else {
          setMicError('Tiada suara yang cukup kuat dikesan. Sila cuba lagi dekat mikrofon.');
          stopListening();
        }
      },
      (err) => {
        setMicError(err);
        stopListening();
      }
    );

    volumeListenerRef.current = volListener;
    const started = await volListener.start(4000);
    if (!started) {
      setIsListening(false);
    }
  };

  const handleSpeechResult = (spokenText: string) => {
    if (!currentWord) return;

    const result = calculateMalaySimilarity(spokenText, currentWord.word);
    setLastResult(result);

    const prevStars = currentWord.starsEarned;
    const newStars = Math.max(prevStars, result.starsAwarded);
    const isNowMastered = result.starsAwarded >= 2;

    // Calculate star increment to add to total bank
    const starsDifference = Math.max(0, newStars - prevStars);
    if (starsDifference > 0) {
      onAddStar(starsDifference);
    }

    const updated: WordItem = {
      ...currentWord,
      starsEarned: newStars,
      isMastered: isNowMastered,
      needsPractice: result.starsAwarded < 2,
      attemptsCount: currentWord.attemptsCount + 1,
      lastScore: result.similarity,
      lastSpokenText: spokenText,
      updatedAt: Date.now(),
    };

    onUpdateWord(updated);

    if (result.isMatch) {
      playStarChime(result.starsAwarded);
      if (result.starsAwarded === 3) {
        triggerStarConfetti();
        playCelebrationFanfare();
      }
    } else {
      playTryAgainSound();
    }
  };

  const handleSimulateSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedSpokenText.trim()) return;
    handleSpeechResult(simulatedSpokenText.trim());
    setSimulatedSpokenText('');
    setShowSimulateInput(false);
  };

  const handlePlayGuide = async (slow = false) => {
    if (!currentWord || isSpeakingGuide) return;
    setIsSpeakingGuide(true);
    await speakWord(currentWord.word, slow);
    setIsSpeakingGuide(false);
  };

  const handlePlaySyllable = async (syllable: string, index: number) => {
    setActiveSyllable(syllable);
    await speakSyllable(syllable);
    setTimeout(() => {
      setActiveSyllable(null);
    }, 400);
  };

  const togglePracticeQueue = () => {
    if (!currentWord) return;
    const updated: WordItem = {
      ...currentWord,
      needsPractice: !currentWord.needsPractice,
    };
    onUpdateWord(updated);
  };

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? words.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === words.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  const handleRandom = () => {
    if (words.length <= 1) return;
    let randomIndex = Math.floor(Math.random() * words.length);
    if (randomIndex === currentIndex) {
      randomIndex = (currentIndex + 1) % words.length;
    }
    onNavigate(randomIndex);
  };

  if (!currentWord) {
    return (
      <div className="p-8 text-center text-slate-500">
        Tiada perkataan dijumpai dalam kategori ini.
      </div>
    );
  }

  const categoryTabs = [
    { id: 'all', label: 'Semua (20+)' },
    { id: 'haiwan', label: 'Haiwan 🦁' },
    { id: 'buah', label: 'Buah-buahan 🍎' },
    { id: 'objek', label: 'Objek Harian 🚗' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-white/80 rounded-2xl border border-amber-200/80 shadow-xs mb-6 overflow-x-auto">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id as Category | 'all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-amber-500 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mascot Speaking Tip */}
      <MascotTip
        message={`Jom sebut perkataan "${currentWord.word}"!`}
        subMessage="Dengar sebutan Kiky, kemudian tekan butang mikrofon besar di bawah untuk sebut."
        spokenAudioText={`Jom sebut perkataan ${currentWord.word}. Tekan butang mikrofon dan sebut dengan jelas.`}
        variant={lastResult?.isMatch ? 'celebrate' : 'normal'}
      />

      {/* Main Flashcard Container */}
      <div className="relative bg-white rounded-3xl border-4 border-amber-200 shadow-xl overflow-hidden transition-all duration-300">
        {/* Top Header Card Strip */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-200 text-amber-900">
              {currentWord.categoryLabel}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {currentIndex + 1} daripada {words.length}
            </span>
          </div>

          {/* Practice Toggle & Mastered Badge */}
          <div className="flex items-center gap-2">
            {currentWord.isMastered && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dikuasai!
              </span>
            )}
            <button
              onClick={togglePracticeQueue}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${
                currentWord.needsPractice
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title={
                currentWord.needsPractice
                  ? 'Dalam Mod Latihan'
                  : 'Tambah ke Mod Latihan'
              }
            >
              {currentWord.needsPractice ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-rose-600" />
                  <span>Perlu Latihan</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Ulang Kaji</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-10 flex flex-col items-center text-center">
          {/* Emoji / Illustration Feature */}
          <div className="relative mb-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-amber-100/70 to-orange-100/70 flex items-center justify-center text-7xl sm:text-8xl shadow-inner border-4 border-amber-200 animate-bounce-slow">
              {currentWord.emoji}
            </div>
            {/* Stars on Card */}
            <div className="absolute -bottom-2 inset-x-0 flex justify-center gap-1.5">
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
                    currentWord.starsEarned >= starIdx
                      ? 'bg-amber-400 text-amber-950 scale-110 ring-2 ring-yellow-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      currentWord.starsEarned >= starIdx
                        ? 'fill-amber-950 text-amber-950'
                        : ''
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Word Title in Big Kid-friendly Display Font */}
          <h2 className="font-sniglet text-4xl sm:text-5xl font-black text-slate-800 tracking-wide mt-3 mb-2">
            {currentWord.word}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-md mb-6 leading-relaxed">
            {currentWord.description}
          </p>

          {/* Interactive Syllable Breakdown Buttons */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Tekan suku kata untuk dengar bunyinya:
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {currentWord.syllables.map((syl, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handlePlaySyllable(syl, sIdx)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xl sm:text-2xl font-sniglet transition-all shadow-sm border-2 cursor-pointer ${
                    activeSyllable === syl
                      ? 'bg-amber-400 text-amber-950 border-amber-500 scale-110 shadow-md ring-4 ring-amber-200'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-200 hover:scale-105 active:scale-95'
                  }`}
                  title={`Dengar sebutan suku kata "${syl}"`}
                >
                  {syl}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Guide Audio Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            <button
              onClick={() => handlePlayGuide(false)}
              disabled={isSpeakingGuide}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm sm:text-base shadow-sm transition-all hover:scale-103 active:scale-97 cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-5 h-5" />
              <span>🔊 Dengar Panduan</span>
            </button>

            <button
              onClick={() => handlePlayGuide(true)}
              disabled={isSpeakingGuide}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-sm sm:text-base border border-orange-300 shadow-xs transition-all hover:scale-103 active:scale-97 cursor-pointer disabled:opacity-50"
            >
              <span>🐢 Sebut Perlahan</span>
            </button>
          </div>

          {/* Microphone Live Feedback & Speech Recognition Section */}
          <div className="w-full max-w-lg p-5 sm:p-6 bg-gradient-to-b from-amber-50/80 to-orange-50/60 rounded-3xl border-2 border-amber-200/90 shadow-sm flex flex-col items-center mb-6">
            <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-3">
              Giliran Adik Pula!
            </p>

            {/* Microphone Button with Pulse Glow */}
            <button
              onClick={handleStartListening}
              className={`relative w-22 h-22 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 ring-8 ring-rose-200 scale-110 animate-pulse'
                  : 'bg-gradient-to-br from-amber-500 via-rose-500 to-rose-600 hover:scale-105 active:scale-95 ring-4 ring-amber-200'
              }`}
              title="Tekan untuk bercakap ke mikrofon"
            >
              {isListening ? (
                <>
                  <MicOff className="w-8 h-8 sm:w-9 sm:h-9 text-white mb-0.5" />
                  <span className="text-[10px] font-black uppercase">Berhenti</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-white mb-0.5" />
                  <span className="text-[10px] font-black uppercase">Sebut!</span>
                </>
              )}
            </button>

            {/* Audio Wave Visualizer while listening */}
            <div className="mt-4 w-full">
              <AudioVisualizer level={micLevel} isListening={isListening} />
            </div>

            {/* Interim or live detected transcript */}
            {interimText && isListening && (
              <div className="mt-2 text-sm font-bold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full animate-pulse">
                {interimText}
              </div>
            )}

            {/* Diagnostic & Mode Switcher Quick Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-colors shadow-2xs cursor-pointer"
                title="Buka panduan kenapa mikrofon tidak terdetect"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Bantuan & Ujian Mikrofon</span>
              </button>

              <button
                onClick={() => setUseVolumeMode(!useVolumeMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border transition-colors shadow-2xs cursor-pointer ${
                  useVolumeMode
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Tukar antara pengecaman kata dan pengesan bunyi suara"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{useVolumeMode ? 'Mod Suara Langsung: AKTIF' : 'Mod: Pengecaman Sebutan'}</span>
              </button>
            </div>

            {/* Error Message if Mic Blocked */}
            {micError && (
              <div className="mt-3 w-full p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs text-rose-900 text-center space-y-2">
                <p className="font-bold flex items-center justify-center gap-1.5 text-rose-800">
                  <MicOff className="w-4 h-4 text-rose-600" />
                  <span>Mikrofon Tidak Terdetect / Disekat</span>
                </p>
                <p className="leading-relaxed">{micError}</p>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setIsGuideModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Lihat Cara Buka Akses</span>
                  </button>

                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka di Tab Baru</span>
                  </button>

                  <button
                    onClick={() => {
                      setUseVolumeMode(true);
                      setMicError(null);
                      startVolumeDetector();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-200 hover:bg-rose-300 text-rose-950 font-bold text-xs cursor-pointer"
                  >
                    Cuba Mod Pengesan Suara Langsung
                  </button>
                </div>
              </div>
            )}

            {/* Simulated Voice Input Helper for testing / sandboxes */}
            {showSimulateInput && (
              <form
                onSubmit={handleSimulateSpeech}
                className="mt-3 w-full p-3 bg-white rounded-2xl border border-amber-300 shadow-xs flex flex-col gap-2"
              >
                <label className="text-xs font-bold text-slate-700">
                  Uji Suara Secara Manual:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simulatedSpokenText}
                    onChange={(e) => setSimulatedSpokenText(e.target.value)}
                    placeholder={`Contoh: ${currentWord.word}`}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Semak
                  </button>
                </div>
              </form>
            )}

            {/* Speech Evaluation Result */}
            {lastResult && (
              <div
                className={`mt-4 w-full p-4 rounded-2xl border-2 transition-all ${
                  lastResult.isMatch
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-600">
                    Didengar: <span className="font-black text-slate-900">"{lastResult.recognizedText}"</span>
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      lastResult.similarity >= 70
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {lastResult.similarity}% Padanan
                  </span>
                </div>

                <p className="text-sm font-bold mb-2">{lastResult.feedbackText}</p>

                {/* Stars Won Animation */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3].map((starIndex) => (
                    <div
                      key={starIndex}
                      className={`transition-all duration-300 ${
                        lastResult.starsAwarded >= starIndex
                          ? 'scale-125 text-amber-500 animate-bounce'
                          : 'text-slate-300'
                      }`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          lastResult.starsAwarded >= starIndex
                            ? 'fill-amber-400 text-amber-500'
                            : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {lastResult.isMatch ? (
                  <p className="text-xs font-black text-emerald-700 mt-2 text-center">
                    + {lastResult.starsAwarded} Bintang Emas untuk adik!
                  </p>
                ) : (
                  <div className="mt-2 text-center">
                    <button
                      onClick={handleStartListening}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-200/80 hover:bg-rose-300 text-rose-900 font-bold text-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Cuba Sekali Lagi</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-md pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-300"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Sebelum</span>
            </button>

            <button
              onClick={handleRandom}
              className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm border border-amber-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Pilih Perkataan Rawak"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <span>Seterusnya</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Microphone Guide & Diagnostic Modal */}
      <MicrophoneGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        rawErrorCode={rawErrorCode}
      />
    </div>
  );
};
