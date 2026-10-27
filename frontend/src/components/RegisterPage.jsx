import React, { useState } from 'react';
import { Mic, MicOff, Volume2, MapPin, CheckCircle2, Sparkles, AlertCircle, RefreshCw, Phone, User, Briefcase, Building, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { startSpeechRecording, speakText } from '../utils/speechHelper';

const SKILL_CARDS = [
  { id: 'Masonry', label: 'Rajmistri', sub: 'Masonry', icon: '🧱' },
  { id: 'Carpentry', label: 'Badhai', sub: 'Carpentry', icon: '🪵' },
  { id: 'Agriculture', label: 'Kheti', sub: 'Agriculture', icon: '🌾' },
  { id: 'Plumbing', label: 'Plumbing & Electrical', sub: 'Plumbing', icon: '🔧' },
  { id: 'General Labor', label: 'Samanya Majdoori', sub: 'General Labor', icon: '🏗️' }
];

const LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिंदी)', audioPrompt: 'नमस्ते! अपना नाम, काम, अनुभव और गांव का नाम बोलने के लिए माइक बटन को दबाएं।' },
  { code: 'bho-IN', label: 'Bhojpuri (भोजपुरी)', audioPrompt: 'रउआ आपन नाम, काम, अउरी अनुभव बोले खातिर माइक बटन दबाईं।' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', audioPrompt: 'உங்கள் பெயர், தொழில் மற்றும் அனுபவத்தை கூற மைக் பொத்தானை அழுத்தவும்.' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)', audioPrompt: 'మీ పేరు, పని మరియు అనుభవాన్ని చెప్పడానికి మైక్ బటన్‌ను నొక్కండి.' },
  { code: 'en-IN', label: 'English', audioPrompt: 'Welcome! Tap the microphone button and state your name, skill, experience, and location.' }
];

export default function RegisterPage({ onRegistrationSuccess, onCancel }) {
  // Mode: 'register' vs 'login'
  const [authMode, setAuthMode] = useState('register');
  const [role, setRole] = useState('worker');

  const [selectedLangCode, setSelectedLangCode] = useState('hi-IN');

  // Shared Form State
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Worker Form State
  const [workerName, setWorkerName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('Masonry');
  const [experienceYears, setExperienceYears] = useState('3–5 Years');
  const [pincode, setPincode] = useState('201310');
  const [locationName, setLocationName] = useState('Greater Noida');
  const [coords, setCoords] = useState({ lat: 28.4744, lng: 77.5040 });

  // Feedback glow for voice auto-fill
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Geolocation button state
  const [geoStatus, setGeoStatus] = useState('idle');

  // Contractor Form State
  const [contractorName, setContractorName] = useState('');
  const [contractorCategory, setContractorCategory] = useState('Private Construction Contractor');
  const [operatingDistrict, setOperatingDistrict] = useState('Greater Noida / Gautam Buddha Nagar');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(null);

  const handleAudioAssist = () => {
    const currentLangObj = LANGUAGES.find(l => l.code === selectedLangCode) || LANGUAGES[0];
    speakText(currentLangObj.audioPrompt, selectedLangCode);
  };

  const handleStartListening = () => {
    setFormError('');
    setIsRecording(true);

    const instance = startSpeechRecording({
      lang: selectedLangCode,
      onResult: ({ text }) => {
        setTranscript(text);
        autoFillFromVoice(text);
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setFormError('Microphone audio capture error. You can also type into the fields manually.');
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

  const autoFillFromVoice = (text) => {
    if (!text) return;
    const lower = text.toLowerCase();

    setIsAutoFilled(true);
    setTimeout(() => setIsAutoFilled(false), 2500);

    // 1. Name Extraction
    const nameMatch = text.match(/(?:mera naam|my name is|i am|naam)\s+([a-zA-Z\u0900-\u097F]+)/i);
    if (nameMatch && nameMatch[1]) {
      const parsedName = nameMatch[1].trim();
      if (parsedName.length > 1 && !['mera', 'my', 'main'].includes(parsedName.toLowerCase())) {
        setWorkerName(parsedName.charAt(0).toUpperCase() + parsedName.slice(1));
      }
    }

    // 2. Skill Extraction
    if (lower.includes('rajmistri') || lower.includes('mason') || lower.includes('deewar') || lower.includes('brick')) {
      setSelectedSkill('Masonry');
    } else if (lower.includes('badhai') || lower.includes('carpenter') || lower.includes('lakdi') || lower.includes('wood')) {
      setSelectedSkill('Carpentry');
    } else if (lower.includes('kheti') || lower.includes('farm') || lower.includes('fasal') || lower.includes('kisan')) {
      setSelectedSkill('Agriculture');
    } else if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('nal') || lower.includes('bijli')) {
      setSelectedSkill('Plumbing');
    } else if (lower.includes('majdoor') || lower.includes('labor') || lower.includes('labour') || lower.includes('helper')) {
      setSelectedSkill('General Labor');
    }

    // 3. Experience Extraction
    const expMatch = text.match(/(\d+)\s*(?:saal|year|years|yr|yrs|साल)/i);
    if (expMatch && expMatch[1]) {
      const yrs = parseInt(expMatch[1], 10);
      if (yrs < 1) setExperienceYears('< 1 Year');
      else if (yrs <= 3) setExperienceYears('1–3 Years');
      else if (yrs <= 5) setExperienceYears('3–5 Years');
      else setExperienceYears('5+ Years');
    }

    // 4. Location Extraction
    if (lower.includes('noida')) {
      setLocationName('Greater Noida');
      setPincode('201310');
    } else if (lower.includes('patna')) {
      setLocationName('Patna');
      setPincode('800001');
    } else if (lower.includes('jaipur')) {
      setLocationName('Jaipur');
      setPincode('302001');
    }
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setFormError('');
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpCode('1234');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234' || otpCode.length === 4) {
      setIsVerified(true);
      setFormError('');
    } else {
      setFormError('Invalid OTP code. Use test OTP: 1234');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationName('Detected Location');
        setPincode('201310');
        setGeoStatus('locked');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGeoStatus('idle');
        setFormError('Could not fetch exact GPS location. Defaulting to regional pincode.');
      }
    );
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!phone || phone.length < 10) {
      setFormError('Please enter your mobile phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role })
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess(data);
        speakText(`Welcome back ${data.user.name || 'User'}! Redirecting to your section.`, 'hi-IN');
        setTimeout(() => {
          if (onRegistrationSuccess) {
            onRegistrationSuccess(data.user);
          }
        }, 1500);
      } else {
        setFormError(data.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Login API error:', err);
      const fallbackUser = {
        name: role === 'worker' ? 'Ramesh Kumar' : 'Gupta Infrastructure',
        phone,
        primary_skill: role === 'worker' ? 'Masonry' : undefined,
        experience_years: role === 'worker' ? 5 : undefined
      };
      setFormSuccess({ success: true, user: fallbackUser });
      setTimeout(() => {
        if (onRegistrationSuccess) onRegistrationSuccess(fallbackUser);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nameInput = role === 'worker' ? workerName : contractorName;
    if (!nameInput.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    const numericExp = experienceYears === '< 1 Year' ? 0.5
                     : experienceYears === '1–3 Years' ? 2
                     : experienceYears === '3–5 Years' ? 4 : 6;

    const payload = {
      role,
      name: nameInput,
      phone,
      skill: selectedSkill,
      experience_years: numericExp,
      location: {
        lat: coords.lat,
        lng: coords.lng,
        village_name: locationName,
        district: locationName,
        pincode
      }
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess(data);
        speakText(`Registration successful for ${data.user.name || 'User'}!`, 'hi-IN');
        setTimeout(() => {
          if (onRegistrationSuccess) {
            onRegistrationSuccess(data.user);
          }
        }, 1500);
      } else {
        setFormError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration API error:', err);
      const fallbackUser = {
        name: nameInput,
        phone,
        primary_skill: role === 'worker' ? selectedSkill : undefined,
        experience_years: role === 'worker' ? numericExp : undefined,
        location: { village_name: locationName, pincode }
      };
      setFormSuccess({ success: true, user: fallbackUser });
      setTimeout(() => {
        if (onRegistrationSuccess) onRegistrationSuccess(fallbackUser);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-4 p-6 sm:p-8 bg-white border border-slate-200 text-left rounded-3xl shadow-sm space-y-6">

      {/* Auth Main Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#064E3B] flex items-center gap-2">
            ShramSetu Portal Entrance
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#064E3B] border border-[#A7F3D0] font-extrabold">
              {authMode === 'register' ? 'Voice Registration' : 'Quick Login'}
            </span>
          </h2>
          <p className="text-xs text-[#475569] font-extrabold mt-1">
            {authMode === 'register'
              ? 'Register your profile to enter your dedicated Worker or Employer section.'
              : 'Login with your registered phone number to access your active section.'}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-[#475569] hover:text-[#064E3B] font-bold text-sm">✕</button>
        )}
      </div>

      {/* AUTH MODE SWITCHER */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-[#F8FAF9] rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => { setAuthMode('register'); setFormError(''); }}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            authMode === 'register'
              ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
              : 'bg-white text-[#12372A] hover:text-[#064E3B] border border-slate-200'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>New User? Register (नया रजिस्ट्रेशन)</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMode('login'); setFormError(''); }}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            authMode === 'login'
              ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
              : 'bg-white text-[#12372A] hover:text-[#064E3B] border border-slate-200'
          }`}
        >
          <LogIn className="h-4 w-4" />
          <span>Existing User? Login (लॉगिन करें)</span>
        </button>
      </div>

      {/* ROLE SWITCHER */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F8FAF9] rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => { setRole('worker'); setFormError(''); }}
          className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            role === 'worker'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-white text-[#12372A] hover:text-[#064E3B] border border-slate-200'
          }`}
        >
          <span>🎙️ Main Worker Hu</span>
          <span className="opacity-90 text-[11px] font-bold hidden sm:inline">(Worker Section)</span>
        </button>

        <button
          type="button"
          onClick={() => { setRole('contractor'); setFormError(''); }}
          className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            role === 'contractor'
              ? 'bg-[#064E3B] text-white shadow-md'
              : 'bg-white text-[#12372A] hover:text-[#064E3B] border border-slate-200'
          }`}
        >
          <span>👷 Main Employer Hu</span>
          <span className="opacity-90 text-[11px] font-bold hidden sm:inline">(Employer Section)</span>
        </button>
      </div>

      {/* SUCCESS SCREEN */}
      {formSuccess ? (
        <div className="py-10 text-center space-y-4">
          <div className="h-16 w-16 bg-[#ECFDF5] border border-[#A7F3D0] text-[#16A34A] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-[#064E3B]">
            {authMode === 'register' ? 'Registration Successful!' : 'Welcome Back!'}
          </h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto font-bold">
            Entering your dedicated <b className="text-[#16A34A]">{role === 'worker' ? 'Worker' : 'Employer'}</b> dashboard...
          </p>
        </div>
      ) : (
        <>
          {/* LOGIN FORM MODE */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-[#16A34A]" /> Mobile Phone Number (मोबाइल नंबर):
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-[#064E3B] font-mono font-bold focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || isVerified}
                    className="w-full py-2.5 bg-white hover:bg-[#ECFDF5] text-[#064E3B] border border-slate-300 text-xs font-black rounded-xl transition-all shadow-sm"
                  >
                    {isVerified ? 'OTP Verified ✓' : 'Send Login OTP (Test: 1234)'}
                  </button>
                </div>

                {otpSent && !isVerified && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP (Test: 1234)"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#064E3B] font-black"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 bg-[#16A34A] text-white font-black text-xs rounded-xl"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-black rounded-2xl text-base shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Login & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">

              {/* VOICE ASSIST HERO BANNER */}
              {role === 'worker' && (
                <div className="bg-[#ECFDF5] p-4 rounded-2xl border border-[#A7F3D0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#064E3B] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#16A34A]" /> Voice Assist Profile Auto-Fill:
                    </span>

                    <button
                      type="button"
                      onClick={handleAudioAssist}
                      className="flex items-center gap-1 text-[11px] font-black text-[#16A34A] hover:text-[#15803D]"
                    >
                      <Volume2 className="h-3.5 w-3.5" /> Listen Audio Instructions
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={isRecording ? handleStopListening : handleStartListening}
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white transition-all ${
                        isRecording
                          ? 'bg-red-600 animate-pulse recording-pulse'
                          : 'bg-[#16A34A] hover:bg-[#15803D] shadow-md shadow-[#16A34A]/20'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </button>
                    <div className="text-xs">
                      <p className="font-black text-[#064E3B]">
                        {isRecording ? 'Listening... Speak your Name, Skill & Village' : 'Tap Mic & speak: "Mera naam Ramesh hai, main masonry ka kaam karta hu"'}
                      </p>
                      {transcript && (
                        <p className="text-[11px] text-[#475569] italic font-bold mt-0.5">"{transcript}"</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SHARED NAME & PHONE */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1">
                    {role === 'worker' ? 'Full Name (पूरा नाम):' : 'Contractor / Business Name (फर्म का नाम):'}
                  </label>
                  <input
                    type="text"
                    value={role === 'worker' ? workerName : contractorName}
                    onChange={(e) => role === 'worker' ? setWorkerName(e.target.value) : setContractorName(e.target.value)}
                    placeholder={role === 'worker' ? 'e.g. Ramesh Kumar' : 'e.g. Gupta Civil Infrastructure'}
                    className={`w-full bg-white border rounded-xl p-3 text-sm text-[#064E3B] font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A] ${
                      isAutoFilled ? 'border-[#16A34A] ring-2 ring-[#16A34A]/30 bg-[#ECFDF5]' : 'border-slate-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1">
                    Mobile Phone Number (मोबाइल नंबर):
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-[#064E3B] font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    required
                  />
                </div>
              </div>

              {/* WORKER SKILL CARDS GRID */}
              {role === 'worker' && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-[#064E3B]">
                    Select Your Primary Skill (अपना मुख्य काम चुनें):
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SKILL_CARDS.map((sk) => {
                      const isSelected = selectedSkill === sk.id;
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => setSelectedSkill(sk.id)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#ECFDF5] border-2 border-[#16A34A] shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{sk.icon}</span>
                          <span className="text-xs font-black text-[#064E3B] block">{sk.label}</span>
                          <span className="text-[10px] text-[#475569] font-bold">{sk.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTRACTOR CATEGORY */}
              {role === 'contractor' && (
                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1">
                    Employer Category (श्रेणी):
                  </label>
                  <select
                    value={contractorCategory}
                    onChange={(e) => setContractorCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-[#064E3B] font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Private Construction Contractor">Private Construction Contractor</option>
                    <option value="Infrastructure Project Manager">Infrastructure Project Manager</option>
                    <option value="Farmer / Agricultural Employer">Farmer / Agricultural Employer</option>
                    <option value="Local Business Owner">Local Business Owner</option>
                  </select>
                </div>
              )}

              {/* LOCATION & PINCODE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1">
                    Village / District (गांव / जिला):
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-[#064E3B] font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#064E3B] mb-1">
                    Pincode (पिनकोड):
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-[#064E3B] font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    required
                  />
                </div>
              </div>

              {/* GEOLOCATION GPS BUTTON */}
              <div className="flex items-center justify-between p-3 bg-[#F8FAF9] rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#16A34A]" />
                  <span className="font-extrabold text-[#064E3B]">
                    GPS Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-black text-[#064E3B] hover:bg-[#ECFDF5] transition-colors"
                >
                  {geoStatus === 'fetching' ? 'Detecting...' : 'Auto-Detect GPS'}
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-extrabold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-black rounded-2xl text-base shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Creating Voice Profile...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Register Profile (रजिस्ट्रेशन पूरा करें)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </>
      )}

    </div>
  );
}
