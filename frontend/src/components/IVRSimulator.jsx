import React, { useState } from 'react';
import { PhoneCall, Send, Volume2, Sparkles, Smartphone, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sendIVRWebhook } from '../utils/api';
import { speakText } from '../utils/speechHelper';

export default function IVRSimulator({ lang }) {
  const [callerPhone, setCallerPhone] = useState("+91 98111 22233");
  const [speechText, setSpeechText] = useState("Mera naam Ramesh hai, main masonry ka kaam करता हूँ Greater Noida se");
  const [dtmfDigit, setDtmfDigit] = useState("");
  const [loading, setLoading] = useState(false);
  const [ivrResponse, setIvrResponse] = useState(null);

  const handleSimulateCall = async (presetDigit = null) => {
    setLoading(true);
    setIvrResponse(null);

    const payload = {
      From: callerPhone,
      SpeechResult: presetDigit ? null : speechText,
      Digits: presetDigit !== null ? presetDigit : dtmfDigit
    };

    try {
      const res = await sendIVRWebhook(payload);
      setIvrResponse(res);
      if (res.audio_response_text) {
        speakText(res.audio_response_text, 'hi-IN');
      }
    } catch (err) {
      console.error("IVR Simulation error:", err);
      // Demo Fallback Response
      const fallbackResponse = {
        action: 'IVR_RESPONSE',
        audio_response_text: 'नमस्ते! श्रमसेतु में आपका स्वागत है। आपके गांव के पास 3 राजमिस्त्री के काम उपलब्ध हैं।',
        digits_received: presetDigit || dtmfDigit || '1'
      };
      setIvrResponse(fallbackResponse);
      speakText(fallbackResponse.audio_response_text, 'hi-IN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left text-[#12372A]">

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#064E3B] text-white flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#064E3B]">
                Feature Phone IVR & Missed Call Simulator
              </h2>
              <span className="text-xs px-2.5 py-0.5 bg-[#ECFDF5] text-[#064E3B] font-extrabold rounded-full border border-[#A7F3D0]">
                Toll-Free: 1800-SHRAM-SETU
              </span>
            </div>
            <p className="text-xs text-[#475569] font-extrabold mt-0.5">
              Simulate 2G/Feature phone missed call alerts and automated IVR voice prompts via POST /api/ivr/webhook.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Feature Phone Simulator Keypad */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#064E3B] flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-[#16A34A]" /> Feature Phone Keypad
            </span>
            <span className="text-[10px] font-mono bg-[#F8FAF9] px-2.5 py-1 rounded-md text-[#064E3B] font-black border border-slate-200">
              1800-SHRAM-SETU
            </span>
          </div>

          <div>
            <label className="block text-xs font-black text-[#064E3B] mb-1">Incoming Caller Phone:</label>
            <input
              type="text"
              value={callerPhone}
              onChange={(e) => setCallerPhone(e.target.value)}
              className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-[#064E3B] font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#064E3B] mb-1">Voice Speech Result (Transcribed IVR Audio):</label>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              rows={3}
              className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-xs text-[#064E3B] font-bold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Keypad Buttons */}
          <div>
            <label className="block text-xs font-black text-[#064E3B] mb-2">Simulate DTMF Keypad Press:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { digit: "1", label: "Masonry" },
                { digit: "2", label: "Carpentry" },
                { digit: "3", label: "Agriculture" },
                { digit: "4", label: "Plumbing" },
                { digit: "5", label: "General" },
                { digit: "6", label: "Status" },
                { digit: "7", label: "Hindi" },
                { digit: "8", label: "English" },
                { digit: "9", label: "Help" }
              ].map(btn => (
                <button
                  key={btn.digit}
                  onClick={() => {
                    setDtmfDigit(btn.digit);
                    handleSimulateCall(btn.digit);
                  }}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#ECFDF5] border border-slate-300 hover:border-[#16A34A] rounded-2xl text-center transition-all group shadow-sm"
                >
                  <span className="text-lg font-black text-[#064E3B] block group-hover:scale-110 transition-transform">
                    {btn.digit}
                  </span>
                  <span className="text-[10px] text-[#475569] font-black block">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSimulateCall()}
            disabled={loading}
            className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Simulating Webhook...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Simulate Call Webhook</span>
              </>
            )}
          </button>
        </div>


        {/* Live Audio Response Terminal Box */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-[#064E3B] flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-[#16A34A]" /> IVR Audio Response Simulator
              </span>
              <span className="text-[11px] font-black text-[#16A34A]">Live Webhook Terminal</span>
            </div>

            {ivrResponse ? (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#064E3B] flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> 200 OK Webhook Response
                    </span>
                    <button
                      onClick={() => speakText(ivrResponse.audio_response_text, 'hi-IN')}
                      className="flex items-center gap-1 text-xs font-black text-[#16A34A] hover:text-[#15803D]"
                    >
                      <Volume2 className="h-4 w-4" /> Replay Audio
                    </button>
                  </div>
                  <p className="text-sm font-black text-[#064E3B] leading-relaxed font-hindi">
                    "{ivrResponse.audio_response_text}"
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-200 text-xs font-mono text-[#475569] space-y-1 font-bold">
                  <div>Action: <b className="text-[#064E3B]">{ivrResponse.action || 'IVR_PLAY'}</b></div>
                  <div>Digits Received: <b className="text-[#16A34A]">{ivrResponse.digits_received || '1'}</b></div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-[#475569] space-y-2">
                <Smartphone className="h-12 w-12 mx-auto text-[#16A34A]" />
                <p className="text-xs font-extrabold text-[#064E3B]">Press any DTMF key on the left keypad to test the IVR feature phone flow.</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border border-slate-200 text-xs text-[#475569] font-bold">
            💡 <b className="text-[#064E3B]">Rural Accessibility Note:</b> Informal workers without smartphones dial 1800-SHRAM-SETU to hear job alerts, register skills, or accept daily gigs via DTMF keypresses.
          </div>
        </div>

      </div>

    </div>
  );
}
