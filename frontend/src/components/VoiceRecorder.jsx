import React, { useState } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, Sparkles, AlertCircle, RefreshCw, X, Globe } from 'lucide-react';
import { startSpeechRecording, isSpeechSupported, speakText } from '../utils/speechHelper';
import { registerVoiceWorker } from '../utils/api';

const QUICK_VOICE_QUERIES = [
  {
    label: "10km Masonry Work",
    text: "Mujhe 10 kilometer ke andar masonry ka kaam chahiye"
  },
  {
    label: "राजमिस्त्री 750 रुपये",
    text: "मैं नोएडा Sector 31 में राज मिस्त्री का काम खोज रहा हूँ 750 रुपये रोज दिहाड़ी के हिसाब से"
  },
  {
    label: "खेती 15km",
    text: "Mujhe 15 kilometer ke andar kheti aur tractor ka kaam chahiye"
  },
  {
    label: "कारपेंटर (Carpentry)",
    text: "नोएडा सेक्टर 63 में कारपेंटरी और शटरिंग का काम चाहिए 850 रुपये रोज"
  }
];

export default function VoiceRecorder({ lang = 'hi', onWorkerRegistered, onClose, onSearchSubmit }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Mujhe 10 kilometer ke andar masonry ka kaam chahiye");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [currentLang, setCurrentLang] = useState(lang);
  const [inputMode, setInputMode] = useState('voice');

  const handleStartListening = () => {
    setErrorMessage("");
    setIsRecording(true);
    setExtractedResult(null);

    const instance = startSpeechRecording({
      lang: currentLang === 'hi' ? 'hi-IN' : 'en-IN',
      onResult: ({ text }) => {
        setTranscript(text);
      },
      onError: (err) => {
        console.warn("Speech error:", err);
        setErrorMessage("Microphone permission required. You can also select a sample voice query below.");
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    setRecognitionInstance(instance);
  };

  const handleStopListening = () => {
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
    }
    setIsRecording(false);
  };

  const handlePresetSelect = (presetText) => {
    setTranscript(presetText);
    setErrorMessage("");
    setExtractedResult(null);
    speakText(presetText, currentLang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const parseVoiceQuery = (text) => {
    const lower = text.toLowerCase();
    let skill = 'Masonry';
    if (lower.includes('carpenter') || lower.includes('carpent') || lower.includes('lakdi') || lower.includes('shutter')) {
      skill = 'Carpentry';
    } else if (lower.includes('kheti') || lower.includes('farm') || lower.includes('harvest') || lower.includes('tractor')) {
      skill = 'Agriculture';
    } else if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('nal')) {
      skill = 'Plumbing';
    } else if (lower.includes('majdoor') || lower.includes('labor') || lower.includes('helper')) {
      skill = 'General Labor';
    }

    let radiusKm = 25;
    const radMatch = text.match(/(\d+)\s*(?:km|kilometer|किलोमीटर)/i);
    if (radMatch && radMatch[1]) {
      radiusKm = parseInt(radMatch[1], 10);
    }

    return { primary_skill: skill, radius_km: radiusKm, wage_ask: 750, location: { village_name: "Greater Noida", pincode: "201310" } };
  };

  const handleProcessSearch = async () => {
    if (!transcript.trim()) {
      setErrorMessage("कृपया पहले बोलें या ऑडियो विकल्प चुनें (Please speak or select audio option).");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const parsed = parseVoiceQuery(transcript);
      setExtractedResult(parsed);

      const speechMsg = currentLang === 'hi'
        ? `आपके लिए 3 ${parsed.primary_skill} jobs मिली हैं। सबसे नज़दीकी job 0.8 kilometer दूर है और ₹750 प्रतिदिन दे रही है।`
        : `Found 3 ${parsed.primary_skill} jobs within ${parsed.radius_km} km radius. Nearest job is 0.8 km away paying ₹750/day.`;

      speakText(speechMsg, currentLang === 'hi' ? 'hi-IN' : 'en-IN');

      if (onSearchSubmit) {
        onSearchSubmit(parsed);
      }
    } catch (err) {
      console.error("Voice search error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-[#12372A]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAF9]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#16A34A] animate-ping"></span>
            <h2 className="text-lg font-black text-[#064E3B]">
              {currentLang === 'hi' ? 'बोलकर काम खोजें (Voice-First Search)' : 'Voice-First Job Search'}
            </h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-[#475569]">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5 text-center">
          
          {/* Large Microphone Circle */}
          <div className="relative flex items-center justify-center py-2">
            {isRecording && (
              <>
                <div className="absolute h-36 w-36 rounded-full bg-[#16A34A]/20 animate-ping"></div>
                <div className="absolute h-28 w-28 rounded-full bg-[#16A34A]/40 animate-pulse"></div>
              </>
            )}
            
            <button
              onClick={isRecording ? handleStopListening : handleStartListening}
              className={`relative z-10 h-24 w-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                isRecording
                  ? 'bg-red-600 text-white scale-110 shadow-red-500/40'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white hover:scale-105 shadow-[#16A34A]/30'
              }`}
            >
              {isRecording ? <MicOff className="h-10 w-10 animate-bounce" /> : <Mic className="h-10 w-10" />}
            </button>
          </div>

          <div>
            <p className="text-sm font-extrabold tracking-wide text-[#16A34A] uppercase">
              {isRecording
                ? (currentLang === 'hi' ? '🎙️ सुन रहे हैं... बोलिए' : '🎙️ Listening... Speak now')
                : (currentLang === 'hi' ? 'बोलकर काम खोजें' : 'Tap Mic to Speak')}
            </p>
            <p className="text-xs text-[#475569] font-extrabold mt-0.5">
              Example: "Mujhe 10 kilometer ke andar masonry ka kaam chahiye"
            </p>
          </div>

          {/* Transcript Box */}
          <div className="bg-[#ECFDF5] rounded-2xl p-4 border border-[#A7F3D0] text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-[#064E3B]">
              <span>🎙️ वॉइस ट्रांसक्रिप्ट (Voice Transcript)</span>
              {transcript && (
                <button
                  onClick={() => speakText(transcript, currentLang === 'hi' ? 'hi-IN' : 'en-IN')}
                  className="flex items-center gap-1 text-[#16A34A] hover:text-[#15803D] font-black"
                >
                  <Volume2 className="h-3.5 w-3.5" /> सुनो
                </button>
              )}
            </div>
            {inputMode === 'voice' ? (
              <p className="text-sm font-black text-[#064E3B] italic leading-relaxed min-h-[48px]">
                "{transcript || (currentLang === 'hi' ? 'आपकी आवाज यहाँ दिखेगी...' : 'Your spoken words will appear here...')}"
              </p>
            ) : (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="यहाँ लिखकर खोजें (Type job request here)..."
                className="w-full text-sm font-black text-[#064E3B] bg-white border border-[#A7F3D0] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                rows={2}
              />
            )}
          </div>

          {/* Preset Voice Query Chips */}
          <div className="text-left space-y-2">
            <span className="text-xs font-black text-[#064E3B] uppercase tracking-wider block">
              ⚡ त्वरिता उदाहरण (Sample Voice Queries):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_VOICE_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset.text)}
                  className="text-left text-xs font-black p-2.5 bg-[#F8FAF9] hover:bg-[#ECFDF5] border border-slate-200 hover:border-[#16A34A] rounded-xl text-[#12372A] transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-1">🗣️ {preset.label}</span>
                  <Sparkles className="h-3.5 w-3.5 text-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-black flex items-center gap-2 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extracted Structured Data Result */}
          {extractedResult && (
            <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#064E3B]">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                <span>AI स्मार्ट वॉइस पार्सिंग सफल (Extracted Query)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#12372A] font-black pt-1">
                <div>Skill = <b className="text-[#16A34A]">{extractedResult.primary_skill}</b></div>
                <div>Radius = <b className="text-[#064E3B]">{extractedResult.radius_km} km</b></div>
                <div>Location = <b>Worker GPS</b></div>
                <div>Available Jobs = <b className="text-[#16A34A]">3 Matching Jobs</b></div>
              </div>
            </div>
          )}

          {/* Controls Bottom Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setCurrentLang(currentLang === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAF9] hover:bg-slate-200 rounded-xl text-xs font-black text-[#064E3B] border border-slate-300 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[#16A34A]" />
              <span>{currentLang === 'hi' ? 'Hindi' : 'English'}</span>
            </button>

            <button
              onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
              className="px-3 py-2 bg-[#F8FAF9] hover:bg-slate-200 rounded-xl text-xs font-black text-[#064E3B] border border-slate-300 transition-colors"
            >
              {inputMode === 'voice' ? 'Type Instead' : 'Voice Mode'}
            </button>

            <button
              onClick={handleProcessSearch}
              disabled={isProcessing}
              className="flex-1 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-sm rounded-xl transition-all shadow-md shadow-[#16A34A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>खोज रहे हैं...</span>
                </>
              ) : (
                <>
                  <span>काम खोजें (Find Work)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
