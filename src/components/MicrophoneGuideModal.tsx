import React, { useState, useEffect } from 'react';
import {
  Mic,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  X,
  Volume2,
  Lock,
} from 'lucide-react';
import { checkMicPermissionStatus, isSpeechRecognitionSupported, DirectAudioLevelListener } from '../utils/audioSpeech';
import { AudioVisualizer } from './AudioVisualizer';

interface MicrophoneGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawErrorCode?: string | null;
}

export const MicrophoneGuideModal: React.FC<MicrophoneGuideModalProps> = ({
  isOpen,
  onClose,
  rawErrorCode,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [isTesting, setIsTesting] = useState(false);
  const [testLevel, setTestLevel] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);

  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (isOpen) {
      checkMicPermissionStatus().then((status) => {
        setPermissionStatus(status);
      });
    }
  }, [isOpen]);

  const handleRunMicTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const tester = new DirectAudioLevelListener(
      (level) => setTestLevel(level),
      (voiced, peak) => {
        setIsTesting(false);
        if (voiced) {
          setTestResult(`Hebat! Mikrofon berfungsi dengan baik (Kekuatan suara: ${Math.round(peak * 100)}%).`);
          setPermissionStatus('granted');
        } else {
          setTestResult('Tiada bunyi yang cukup dikesan semasa ujian. Sila bercakap lebih dekat pada mikrofon.');
        }
      },
      (error) => {
        setIsTesting(false);
        setTestResult(`Gagal mengakses mikrofon: ${error}`);
      }
    );

    const started = await tester.start(3000);
    if (!started) {
      setIsTesting(false);
    }
  };

  const handleOpenStandaloneTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border-4 border-amber-300 max-w-xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-sniglet text-2xl font-black text-slate-800">
                Panduan & Bantuan Mikrofon
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Penyelesaian mudah jika mikrofon tidak terdetect atau disekat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnosis Status Bar */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Sokongan Web Speech API:</span>
            <span className="flex items-center gap-1 font-bold">
              {speechSupported ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Disokong (Chrome / Edge)
                </span>
              ) : (
                <span className="text-rose-700 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Terhad di pelayar ini
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Status Kebenaran Mikrofon:</span>
            <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
              {permissionStatus === 'granted'
                ? 'Dibenarkan (Granted)'
                : permissionStatus === 'denied'
                ? 'Disekat (Denied)'
                : permissionStatus === 'prompt'
                ? 'Menunggu Kebenaran'
                : 'Belum Ditetapkan'}
            </span>
          </div>

          {rawErrorCode && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-rose-700">
              <span className="font-bold">Kod Ralat Terakhir:</span>
              <span className="font-mono text-[11px] bg-rose-100 px-2 py-0.5 rounded-md font-bold">
                {rawErrorCode}
              </span>
            </div>
          )}
        </div>

        {/* 4 Causes and Solutions */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Solution 1: Open in Standalone Tab (Most common in AI Studio iframe) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0 font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-950 text-sm mb-1">
                  Buka di Tab Pelayar Penuh (Sangat Disyorkan)
                </h3>
                <p className="text-xs text-amber-900/90 leading-relaxed mb-3">
                  Di dalam paparan preview AI Studio (iframe), keselamatan pelayar kadangkala menyekat akses perkakasan mikrofon. Membuka di tab penuh membolehkan pop-up kebenaran mikrofon dipaparkan secara langsung.
                </p>
                <button
                  onClick={handleOpenStandaloneTab}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-transform hover:scale-102"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Aplikasi di Tab Baru (Penuh)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Solution 2: Browser Permission Setting */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Benarkan Akses Mikrofon di Bar Alamat Pelayar</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. Lihat di bahagian atas pelayar (di sebelah alamat URL / link).<br />
                  2. Tekan <strong>ikon mangga/kunci 🔒</strong> atau ikon tetapan tapak.<br />
                  3. Di bahagian <strong>Mikrofon (Microphone)</strong>, tukar kepada <strong>"Benarkan" (Allow)</strong>.<br />
                  4. Muat semula (Refresh) halaman web ini.
                </p>
              </div>
            </div>
          </div>

          {/* Solution 3: Hardware Check */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Pastikan Mikrofon Fizikal Tidak Dikunci Aplikasi Lain
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika anda sedang membuka aplikasi seperti Zoom, Google Meet, Teams, atau rakaman suara lain, tutup aplikasi tersebut terlebih dahulu supaya mikrofon tidak dikunci.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Test Area */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-100/50 border border-amber-200 flex flex-col items-center text-center">
          <p className="text-xs font-bold text-amber-900 mb-2">
            Uji Sambungan Mikrofon Anda Sekarang:
          </p>

          <button
            onClick={handleRunMicTest}
            disabled={isTesting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isTesting
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-xs'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isTesting ? 'Sebut sesuatu ke mikrofon (3 saat)...' : 'Mula Ujian Mikrofon'}</span>
          </button>

          <div className="w-full mt-3">
            <AudioVisualizer level={testLevel} isListening={isTesting} />
          </div>

          {testResult && (
            <p className="mt-2 text-xs font-bold text-amber-950 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
              {testResult}
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
          >
            Tutup & Teruskan Belajar
          </button>
        </div>
      </div>
    </div>
  );
};
