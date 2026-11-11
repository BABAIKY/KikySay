import confetti from 'canvas-confetti';
import { SpeechMatchResult } from '../types';

// Web Audio API Context (Lazily initialized on first user gesture)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a sparkly ascending glockenspiel chime when stars are earned
 */
export function playStarChime(count = 1) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const baseFrequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

    const notesToPlay = Math.min(count + 2, baseFrequencies.length);

    for (let i = 0; i < notesToPlay; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFrequencies[i], now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    }
  } catch {
    // Audio context not allowed or failed silently
  }
}

/**
 * Play triumphant victory celebration fanfare
 */
export function playCelebrationFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12, t: 0.0 },   // C5
      { f: 659.25, d: 0.12, t: 0.12 },  // E5
      { f: 783.99, d: 0.12, t: 0.24 },  // G5
      { f: 1046.50, d: 0.4, t: 0.36 },  // C6
    ];

    notes.forEach(({ f, d, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.3, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.25);
    });
  } catch {
    // Audio context fallback
  }
}

/**
 * Play cute bubble pop when clicking a syllable
 */
export function playSyllableBoop(pitchOffset = 0) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 400 + pitchOffset * 80;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Ignore audio context error
  }
}

/**
 * Gentle encouraging sound for retry
 */
export function playTryAgainSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.linearRampToValueAtTime(329.63, now + 0.25); // E4

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Ignore
  }
}

/**
 * Soft UI click sound
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Ignore
  }
}

/**
 * Trigger kid-friendly confetti explosion
 */
export function triggerStarConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });
  } catch {
    // Confetti fallback
  }
}

/**
 * Text-to-Speech Engine
 * Prioritizes Malay / Indonesian voices, with tuning for children clarity.
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

function getBestMalayVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();

  // 1. Exact match for Malay (ms-MY or ms)
  const msVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ms'));
  if (msVoice) return msVoice;

  // 2. Indonesian voice (phonetically very close to Malay)
  const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
  if (idVoice) return idVoice;

  // 3. Fallback to default voice
  return voices.find((v) => v.default) || voices[0] || null;
}

export function speakWord(text: string, slow = false): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestMalayVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'ms-MY';
    }

    // Rate and pitch tuned for friendly Malaysian guide voice
    utterance.rate = slow ? 0.65 : 0.85;
    utterance.pitch = 1.15; // slightly higher pitch feels welcoming for kids

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function speakSyllable(syllable: string): Promise<void> {
  playSyllableBoop();
  return speakWord(syllable, true);
}

/**
 * Phonetic & String similarity comparison between recognized speech and target word
 */
export function calculateMalaySimilarity(spokenRaw: string, targetWord: string): SpeechMatchResult {
  const cleanSpoken = spokenRaw.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  const cleanTarget = targetWord.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

  // Exact match
  if (cleanSpoken === cleanTarget) {
    return {
      similarity: 100,
      recognizedText: spokenRaw,
      isMatch: true,
      feedbackText: 'Sangat Hebat! Sebutan adik 100% tepat dan jelas!',
      starsAwarded: 3,
      matchedWord: targetWord,
    };
  }

  // Spoken text contains target word (e.g. "saya sebut kucing" or "ini epal")
  const spokenTokens = cleanSpoken.split(/\s+/);
  if (spokenTokens.includes(cleanTarget)) {
    return {
      similarity: 95,
      recognizedText: spokenRaw,
      isMatch: true,
      feedbackText: 'Syabas! Perkataan disebut dengan betul dan jelas!',
      starsAwarded: 3,
      matchedWord: targetWord,
    };
  }

  // Calculate Levenshtein Distance for best token or whole string
  let highestScore = 0;
  const candidates = [cleanSpoken, ...spokenTokens];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const dist = levenshteinDistance(candidate, cleanTarget);
    const maxLen = Math.max(candidate.length, cleanTarget.length);
    const score = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
    if (score > highestScore) {
      highestScore = score;
    }
  }

  // Custom Malay phonetic allowances (e.g. "kucin" for "kucing", "aym" for "ayam", "kudaa" for "kuda")
  if (cleanTarget.endsWith('ng') && cleanSpoken.endsWith('n')) {
    highestScore = Math.max(highestScore, 85);
  }

  const isMatch = highestScore >= 70;
  let starsAwarded = 0;
  let feedbackText = '';

  if (highestScore >= 85) {
    starsAwarded = 3;
    feedbackText = 'Wah, hebatnya! Sebutan sangat jelas dan lancar!';
  } else if (highestScore >= 70) {
    starsAwarded = 2;
    feedbackText = 'Bagus sekali! Adik berjaya menyebutnya dengan baik!';
  } else if (highestScore >= 50) {
    starsAwarded = 1;
    feedbackText = 'Hampir betul! Cuba dengar suku kata dan sebut sekali lagi ya!';
  } else {
    starsAwarded = 0;
    feedbackText = 'Kiky dengar suara adik! Jom cuba sebut perlahan-lahan ya.';
  }

  return {
    similarity: highestScore,
    recognizedText: spokenRaw || '(tiada suara didengar)',
    isMatch,
    feedbackText,
    starsAwarded,
    matchedWord: targetWord,
  };
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Speech Recognition & Microphone Support
 */
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export async function checkMicPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
    try {
      const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return res.state;
    } catch {
      return 'unsupported';
    }
  }
  return 'unsupported';
}

/**
 * Primary Speech Recognition Listener
 * Runs synchronously within direct user click gesture to avoid browser NotAllowedError.
 */
export class SpeechListener {
  private recognition: any = null;
  private animInterval: NodeJS.Timeout | null = null;
  private isEnded = false;

  constructor(
    private onInterim: (text: string) => void,
    private onResult: (text: string) => void,
    private onError: (errorMsg: string, rawCode?: string) => void,
    private onAudioLevel?: (level: number) => void
  ) {}

  public startListening(): boolean {
    const win = window as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      this.onError(
        'Pelayar ini tidak menyokong Web Speech Recognition. Sila gunakan pelayar Google Chrome atau Microsoft Edge untuk sokongan penuh.',
        'not-supported'
      );
      return false;
    }

    this.isEnded = false;

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = 'ms-MY';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      // Start responsive audio wave simulator synchronized with speech recognition
      this.startSimulatedAudioWaves();

      this.recognition.onstart = () => {
        // Recognition is officially capturing microphone
        this.onAudioLevel?.(0.3);
      };

      this.recognition.onspeechstart = () => {
        // User started vocalizing
        this.onAudioLevel?.(0.8);
      };

      this.recognition.onspeechend = () => {
        this.onAudioLevel?.(0.2);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (interimTranscript) {
          this.onAudioLevel?.(0.6 + Math.random() * 0.4);
          this.onInterim(interimTranscript);
        }

        if (finalTranscript) {
          this.isEnded = true;
          this.stop();
          this.onResult(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error || 'unknown';
        this.stop();

        if (error === 'no-speech') {
          this.onError(
            'Tiada suara dikesan. Sila pastikan adik bercakap lebih dekat dan lantang ke arah mikrofon.',
            'no-speech'
          );
        } else if (error === 'not-allowed') {
          this.onError(
            'Akses mikrofon disekat oleh pelayar! Sila tekan ikon mangga/kunci pada bar alamat pelayar di atas dan pilih "Benarkan" (Allow) untuk Mikrofon.',
            'not-allowed'
          );
        } else if (error === 'audio-capture') {
          this.onError(
            'Peranti mikrofon tidak dapat dirakam. Sila pastikan mikrofon disambung ke peranti anda.',
            'audio-capture'
          );
        } else if (error === 'network') {
          this.onError(
            'Pengecaman suara memerlukan sambungan internet yang stabil. Sila cuba sekali lagi.',
            'network'
          );
        } else {
          this.onError(`Ralat mikrofon (${error}). Sila cuba semula.`, error);
        }
      };

      this.recognition.onend = () => {
        this.stop();
      };

      // CRITICAL: Call start() synchronously within the user gesture
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.stop();
      this.onError(
        err?.message || 'Gagal memulakan mikrofon. Sila semak kebenaran mikrofon pelayar anda.',
        'exception'
      );
      return false;
    }
  }

  private startSimulatedAudioWaves() {
    if (!this.onAudioLevel) return;
    this.animInterval = setInterval(() => {
      // Gentle pulsing to indicate mic is actively listening
      const pulse = 0.2 + Math.sin(Date.now() / 150) * 0.15;
      this.onAudioLevel?.(Math.max(0.1, pulse));
    }, 100);
  }

  public stop() {
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
    if (this.onAudioLevel) {
      this.onAudioLevel(0);
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}

/**
 * Fallback Audio Energy Listener
 * Uses pure getUserMedia & AudioContext to measure real spoken volume
 * when SpeechRecognition service is unavailable or blocked in iframes.
 */
export class DirectAudioLevelListener {
  private audioStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animId: number | null = null;
  private peakVolume = 0;
  private spokenDurationMs = 0;
  private startTime = 0;

  constructor(
    private onLevel: (level: number) => void,
    private onCompleted: (detectedSpoken: boolean, peakVol: number) => void,
    private onError: (msg: string) => void
  ) {}

  public async start(durationMs = 3500): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.onError('Pelayar ini tidak membenarkan akses media mikrofon.');
        return false;
      }

      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = getAudioContext();
      const source = this.audioCtx.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      source.connect(this.analyser);

      this.peakVolume = 0;
      this.spokenDurationMs = 0;
      this.startTime = Date.now();

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const loop = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 80);

        if (normalized > this.peakVolume) {
          this.peakVolume = normalized;
        }

        if (normalized > 0.15) {
          this.spokenDurationMs += 50;
        }

        this.onLevel(normalized);

        if (Date.now() - this.startTime < durationMs) {
          this.animId = requestAnimationFrame(loop);
        } else {
          this.stop();
          const voiced = this.peakVolume > 0.25 || this.spokenDurationMs > 300;
          this.onCompleted(voiced, this.peakVolume);
        }
      };

      loop();
      return true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        this.onError('Akses mikrofon disekat oleh pelayar. Sila benarkan akses mikrofon di tetapan pelayar.');
      } else {
        this.onError(`Ralat akses mikrofon: ${err?.message || err}`);
      }
      this.stop();
      return false;
    }
  }

  public stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    this.onLevel(0);
  }
}

