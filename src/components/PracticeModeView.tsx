import React, { useState } from 'react';
import {
  Repeat,
  Volume2,
  Mic,
  Star,
  CheckCircle2,
  Sparkles,
  Trophy,
  ArrowRight,
  Smile,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { WordItem, SpeechMatchResult } from '../types';
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
} from '../utils/audioSpeech';
import { AudioVisualizer } from './AudioVisualizer';
import { MascotTip } from './MascotTip';
import { MicrophoneGuideModal } from './MicrophoneGuideModal';

interface PracticeModeViewProps {
  allWords: WordItem[];
  onUpdateWord: (updatedWord: WordItem) => void;
  onAddStar: (stars: number) => void;
  onSwitchToLearn: (wordIndex?: number) => void;
}

export const PracticeModeView: React.FC<PracticeModeViewProps> = ({
  allWords,
  onUpdateWord,
  onAddStar,
  onSwitchToLearn,
}) => {
  // Practice words: words marked as needsPractice OR with low stars
  const practiceWords = allWords.filter(
    (w) => w.needsPractice || (w.attemptsCount > 0 && w.starsEarned < 2)
  );

  const [activePracticeIndex, setActivePracticeIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [lastResult, setLastResult] = useState<SpeechMatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [rawErrorCode, setRawErrorCode] = useState<string | null>(null);

  const currentWord = practiceWords[activePracticeIndex] || null;

  const handlePlaySlowWord = (word: string) => {
    speakWord(word, true);
  };

  const handlePlaySyllable = (syl: string) => {
    speakSyllable(syl);
  };

  const startPracticeMic = () => {
    if (!currentWord) return;
    setErrorMessage(null);
    setRawErrorCode(null);
    setLastResult(null);

    const listener = new SpeechListener(
      (interim) => setInterimText(interim),
      (finalText) => {
        handlePracticeSpeechResult(finalText);
        listener.stop();
        setIsListening(false);
      },
      (error, rawCode) => {
        setErrorMessage(error);
        setRawErrorCode(rawCode || 'error');
        setIsListening(false);
      },
      (level) => setMicLevel(level)
    );

    const started = listener.startListening();
    if (started) {
      setIsListening(true);
    }
  };

  const startPracticeVolumeFallback = async () => {
    if (!currentWord) return;
    setIsListening(true);
    setErrorMessage(null);
    setInterimText('Sebut sekarang...');

    const volListener = new DirectAudioLevelListener(
      (level) => setMicLevel(level),
      (voiced, peak) => {
        setIsListening(false);
        if (voiced) {
          handlePracticeSpeechResult(currentWord.word);
        } else {
          setErrorMessage('Tiada suara yang cukup kuat dikesan. Sila cuba lagi dekat mikrofon.');
        }
      },
      (err) => {
        setErrorMessage(err);
        setIsListening(false);
      }
    );

    const started = await volListener.start(4000);
    if (!started) {
      setIsListening(false);
    }
  };

  const handlePracticeSpeechResult = (spokenText: string) => {
    if (!currentWord) return;

    const result = calculateMalaySimilarity(spokenText, currentWord.word);
    setLastResult(result);

    if (result.isMatch) {
      const newStreak = practiceStreak + 1;
      setPracticeStreak(newStreak);

      const updated: WordItem = {
        ...currentWord,
        starsEarned: Math.max(currentWord.starsEarned, 3),
        isMastered: true,
        needsPractice: false, // successfully cleared from difficult words!
        attemptsCount: currentWord.attemptsCount + 1,
        lastScore: result.similarity,
        lastSpokenText: spokenText,
      };

      onUpdateWord(updated);
      onAddStar(2);
      playStarChime(3);
      playCelebrationFanfare();
      triggerStarConfetti();
    } else {
      setPracticeStreak(0);
      playTryAgainSound();
    }
  };

  // Add all unmastered words to practice queue
  const handleAddAllToPractice = () => {
    allWords.forEach((w) => {
      if (!w.isMastered) {
        onUpdateWord({ ...w, needsPractice: true });
      }
    });
  };

  const handleResetPracticeForWord = (word: WordItem) => {
    onUpdateWord({ ...word, needsPractice: true });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Repeat className="w-4 h-4 text-rose-600" />
          <span>Mod Latihan Khas</span>
        </div>
        <h1 className="font-sniglet text-3xl sm:text-4xl font-black text-slate-800">
          Ulang Kaji Perkataan Sukar
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
          Latih sebutan perkataan yang memerlukan lebih perhatian secara perlahan dan berperingkat.
        </p>
      </div>

      {practiceWords.length === 0 ? (
        /* Empty State: All words mastered! */
        <div className="bg-white rounded-3xl border-4 border-amber-200 p-8 sm:p-12 text-center shadow-lg">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
            <Trophy className="w-14 h-14" />
          </div>
          <h2 className="font-sniglet text-2xl sm:text-3xl font-black text-slate-800 mb-2">
            Hebat Sekali! Tiada Perkataan Sukar! 🎉
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6">
            Adik telah berjaya menguasai semua perkataan asas dengan sangat baik! Teruskan usaha cemerlang ini.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onSwitchToLearn(0)}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Kembali Belajar Semua Kata</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddAllToPractice}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Latih Semula Semua Perkataan
            </button>
          </div>
        </div>
      ) : (
        /* Active Practice Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of difficult words */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-4 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase text-slate-500">
                Senarai Latihan ({practiceWords.length})
              </span>
              <span className="text-xs font-bold text-rose-600">Perlu Diulang</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {practiceWords.map((word, idx) => {
                const isSelected = idx === activePracticeIndex;
                return (
                  <button
                    key={word.id}
                    onClick={() => {
                      setActivePracticeIndex(idx);
                      setLastResult(null);
                      setErrorMessage(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 shadow-xs ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{word.emoji}</span>
                      <div>
                        <p className="font-sniglet font-black text-slate-800 text-base">
                          {word.word}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {word.phoneticGuide}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        className={`w-4 h-4 ${
                          word.starsEarned > 0
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center/Right: Focused Practice Workout Card */}
          {currentWord && (
            <div className="lg:col-span-2 bg-white rounded-3xl border-4 border-rose-200 p-6 sm:p-8 shadow-md flex flex-col items-center text-center">
              {/* Mascot Tip inside practice */}
              <MascotTip
                message={`Dengar sebutan "${currentWord.word}" perlahan-lahan ya!`}
                subMessage="Tekan setiap suku kata untuk dengar dengan jelas, kemudian sebut ke mikrofon."
                spokenAudioText={`Mari kita latih perkataan ${currentWord.word}. Sebut suku kata satu per satu.`}
                variant="encouraging"
              />

              <div className="w-28 h-28 rounded-full bg-rose-50 border-4 border-rose-200 flex items-center justify-center text-6xl shadow-inner mb-3">
                {currentWord.emoji}
              </div>

              <h2 className="font-sniglet text-4xl sm:text-5xl font-black text-slate-900 mb-1">
                {currentWord.word}
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                {currentWord.categoryLabel}
              </p>

              {/* Syllable Slow Training */}
              <div className="w-full bg-amber-50/70 p-4 rounded-2xl border border-amber-200 mb-6">
                <p className="text-xs font-bold text-amber-800 mb-2">
                  Langkah 1: Tekan dan Dengar Suku Kata
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentWord.syllables.map((syl, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handlePlaySyllable(syl)}
                      className="px-5 py-2.5 bg-white hover:bg-amber-100 border-2 border-amber-300 rounded-2xl font-black text-xl font-sniglet text-amber-950 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      {syl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Listen whole word slowly */}
              <button
                onClick={() => handlePlaySlowWord(currentWord.word)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer mb-6"
              >
                <Volume2 className="w-5 h-5" />
                <span>Dengar Sebutan Perlahan Penuh</span>
              </button>

              {/* Step 3: Speak into mic */}
              <div className="w-full max-w-md p-5 bg-rose-50/60 rounded-3xl border border-rose-200 flex flex-col items-center">
                <p className="text-xs font-black uppercase text-rose-900 mb-3">
                  Langkah 2: Sebut Sekarang
                </p>

                <button
                  onClick={startPracticeMic}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 ring-8 ring-rose-200 scale-110 animate-pulse'
                      : 'bg-rose-500 hover:bg-rose-600 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Mic className="w-8 h-8 mb-0.5" />
                  <span className="text-[10px] font-black uppercase">
                    {isListening ? 'Dengar...' : 'Sebut!'}
                  </span>
                </button>

                <div className="w-full mt-3">
                  <AudioVisualizer level={micLevel} isListening={isListening} />
                </div>

                {/* Helper and Test Button */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setIsGuideModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-rose-100 text-rose-900 font-bold text-xs border border-rose-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Bantuan Mikrofon</span>
                  </button>

                  <button
                    onClick={startPracticeVolumeFallback}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Mod Pengesan Suara</span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="mt-3 w-full p-3 bg-rose-100 border border-rose-300 rounded-2xl text-xs text-rose-900 text-center space-y-1.5">
                    <p className="font-bold">{errorMessage}</p>
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => setIsGuideModalOpen(true)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs"
                      >
                        Lihat Panduan
                      </button>
                      <button
                        onClick={startPracticeVolumeFallback}
                        className="px-2.5 py-1 bg-white text-rose-900 border border-rose-300 rounded-lg font-bold text-xs"
                      >
                        Guna Mod Suara
                      </button>
                    </div>
                  </div>
                )}

                {lastResult && (
                  <div
                    className={`mt-4 w-full p-4 rounded-2xl border-2 ${
                      lastResult.isMatch
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <p className="text-sm font-bold">{lastResult.feedbackText}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Didengar: <strong>"{lastResult.recognizedText}"</strong> ({lastResult.similarity}%)
                    </p>
                    {lastResult.isMatch && (
                      <p className="text-xs font-black text-emerald-700 mt-2">
                        🎉 Tahniah! Perkataan ini telah berjaya dikuasai dan dialihkan dari senarai sukar!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Modal */}
      <MicrophoneGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        rawErrorCode={rawErrorCode}
      />
    </div>
  );
};
