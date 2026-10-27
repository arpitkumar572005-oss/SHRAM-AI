import React, { useState, useEffect } from 'react';
import { 
  Home, Search, FileText, Briefcase, CreditCard, MessageSquare, User, Settings, HelpCircle, 
  Mic, MapPin, PhoneCall, Star, ShieldCheck, CheckCircle2, ChevronRight, Bell, Globe, 
  Volume2, Sliders, Filter, Sparkles, PlusCircle, Check, X, AlertTriangle, Clock, Award, Send, Phone, AlertOctagon, Info, DollarSign, Lock, Shield, ThumbsUp
} from 'lucide-react';
import { fetchNearbyJobs, fetchWorkers, fetchApplications, applyOrAcceptJob, checkInApplication, completeJob, releasePayment, rateApplication, declineJob, fetchSeasonalIntelligence } from '../utils/api';
import { calculateMatchScore } from '../utils/matchingEngine';
import { speakText } from '../utils/speechHelper';
import MapView from './MapView';
import VoiceRecorder from './VoiceRecorder';

const NAV_ITEMS = [
  { id: 'dashboard', labelHi: 'Dashboard', labelEn: 'Dashboard', icon: Home },
  { id: 'find-work', labelHi: 'Find Work', labelEn: 'Find Work', icon: Search },
  { id: 'applications', labelHi: 'My Applications', labelEn: 'My Applications', icon: FileText },
  { id: 'jobs', labelHi: 'My Jobs', labelEn: 'My Jobs', icon: Briefcase },
  { id: 'payments', labelHi: 'Payments', labelEn: 'Payments', icon: CreditCard },
  { id: 'messages', labelHi: 'Messages', labelEn: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'profile', labelHi: 'Profile', labelEn: 'Profile', icon: User },
  { id: 'settings', labelHi: 'Settings', labelEn: 'Settings', icon: Settings },
  { id: 'help', labelHi: 'Help & Safety', labelEn: 'Help & Safety', icon: HelpCircle },
];

const SKILLS_LIST = ['All', 'Masonry', 'Carpentry', 'Agriculture', 'Plumbing', 'General Labor'];
const RADIUS_CHIPS = [5, 10, 25, 50];

export default function ShramSetuDashboard({
  mode = 'worker',
  lang = 'hi',
  activeWorker,
  setActiveWorker,
  onOpenRegister
}) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // Job detail & match modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [whyMatchModalJob, setWhyMatchModalJob] = useState(null);
  const [sosAlertActive, setSosAlertActive] = useState(false);

  // Applications & Lifecycle State
  const [applications, setApplications] = useState([]);
  const [appFilter, setAppFilter] = useState('all');
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('Personal Health issue / बीमारी');
  const [declineNotes, setDeclineNotes] = useState('');
  const [isSubmittingDecline, setIsSubmittingDecline] = useState(false);

  // Rating Modal State
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('Punctual contractor and full wage paid on time.');

  // Settings State
  const [voiceSpeed, setVoiceSpeed] = useState('normal');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  // Messages Chat Input State
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, sender: 'Gupta Infrastructure', text: 'Namaste Raju, please bring your safety boots & hard hat to Sector 31 site tomorrow at 8:00 AM.', time: '09:15 AM', type: 'contractor' },
    { id: 2, sender: 'You', text: 'Ji Sir, I will reach by 7:45 AM. Is daily wage ₹750 funded in escrow?', time: '09:20 AM', type: 'worker' },
    { id: 3, sender: 'Gupta Infrastructure', text: 'Yes, ₹3,750 escrow for 5 days is locked and verified by ShramSetu Guarantee!', time: '09:22 AM', type: 'contractor' }
  ]);

  // Dynamic Worker Profile
  const workerProfile = {
    id: activeWorker?.id || "wrk-101",
    name: activeWorker?.name || "Raju Kumar",
    phone: activeWorker?.phone || "+91 98765 43210",
    primary_skill: activeWorker?.primary_skill || activeWorker?.skill || "Masonry",
    experience_years: activeWorker?.experience_years || 5,
    location: {
      lat: activeWorker?.location?.lat || 28.4744,
      lng: activeWorker?.location?.lng || 77.5040,
      village_name: activeWorker?.location?.village_name || activeWorker?.location?.district || "Sector 31, Noida"
    },
    trust_badge: activeWorker?.trust_badge || "Master Worker - 12 Verified Gigs ⭐",
    trustScore: activeWorker?.trustScore || 87,
    completedJobs: activeWorker?.completedJobsCount !== undefined ? activeWorker.completedJobsCount : 12,
    totalEarnings: activeWorker?.totalEarnings || 8400,
    rating: activeWorker?.avg_rating || 4.8,
    verification_status: activeWorker?.verification_status || { mobile: true, identity: true, skill: true },
    isAvailable: true
  };

  const [isAvailable, setIsAvailable] = useState(workerProfile.isAvailable);

  const loadApplicationsData = async () => {
    try {
      const res = await fetchApplications();
      let loaded = res.applications || [];
      try {
        const cachedApps = localStorage.getItem('shramsetu_applications');
        if (cachedApps) {
          const parsedA = JSON.parse(cachedApps);
          parsedA.forEach(ca => {
            const idx = loaded.findIndex(a => a.job_id === ca.job_id && a.worker_id === ca.worker_id);
            if (idx >= 0) loaded[idx] = { ...loaded[idx], ...ca };
            else loaded.unshift(ca);
          });
        }
      } catch (e) {}
      setApplications(loaded);
    } catch (err) {
      console.error("Error loading apps:", err);
    }
  };

  const loadJobsData = () => {
    fetchNearbyJobs({
      lat: workerProfile.location.lat,
      lng: workerProfile.location.lng,
      radius_km: radiusKm,
      skill: selectedSkill
    })
      .then(res => setJobs(res.jobs || []))
      .catch(err => console.error("Error fetching jobs:", err));
  };

  useEffect(() => {
    setLoadingJobs(true);
    loadJobsData();
    setLoadingJobs(false);
    loadApplicationsData();

    const timer = setInterval(() => {
      loadJobsData();
      loadApplicationsData();
    }, 3000);
    return () => clearInterval(timer);
  }, [radiusKm, selectedSkill, activeWorker, activeNav]);

  const handleSpeakJob = (job) => {
    const textToSpeak = lang === 'hi'
      ? `काम: ${job.title}. दैनिक मजदूरी: ₹${job.daily_wage} रुपये. स्थान: ${job.location.address}. दूरी: ${job.distance_km} किलोमीटर.`
      : `Job: ${job.title}. Daily Wage: ₹${job.daily_wage}. Location: ${job.location.address}. Distance: ${job.distance_km} km.`;
    speakText(textToSpeak, lang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const handleApplyJob = async (job) => {
    const newAppObj = {
      id: `app-${Date.now().toString().slice(-4)}`,
      job_id: job.id,
      job_title: job.title,
      daily_wage: job.daily_wage || 750,
      contractor_name: job.contractor_name || job.contractorName || 'Gupta Infrastructure & Civil Works',
      worker_id: workerProfile.id,
      worker_name: workerProfile.name,
      worker_phone: workerProfile.phone,
      worker_skill: workerProfile.primary_skill,
      status: 'ACCEPTED',
      check_in_time: null,
      completed_at: null,
      payment_status: 'ESCROW_HELD',
      updated_at: new Date().toISOString()
    };

    try {
      const cachedApps = localStorage.getItem('shramsetu_applications');
      const appArr = cachedApps ? JSON.parse(cachedApps) : [];
      const filtered = appArr.filter(a => !(a.job_id === job.id && a.worker_id === workerProfile.id));
      filtered.unshift(newAppObj);
      localStorage.setItem('shramsetu_applications', JSON.stringify(filtered));
    } catch (e) {}

    setApplications(prev => [newAppObj, ...prev.filter(a => !(a.job_id === job.id && a.worker_id === workerProfile.id))]);

    await applyOrAcceptJob({
      job_id: job.id,
      worker_id: workerProfile.id,
      worker_name: workerProfile.name,
      worker_phone: workerProfile.phone,
      worker_skill: workerProfile.primary_skill
    });
    speakText("काम स्वीकार कर लिया गया है! ठेकेदार के पोर्टल पर आपकी एप्लीकेशन अपडेट हो गई है।", 'hi-IN');
    loadApplicationsData();
  };

  const handleWorkerCheckIn = async (app) => {
    await checkInApplication({
      application_id: app.id,
      job_id: app.job_id,
      worker_id: workerProfile.id,
      lat: workerProfile.location.lat,
      lng: workerProfile.location.lng
    });
    speakText("साइट पर आपकी उपस्थिति GPS द्वारा सत्यापित कर ली गई है।", 'hi-IN');
    loadApplicationsData();
  };

  const handleWorkerMarkComplete = async (app) => {
    await completeJob({
      application_id: app.id,
      job_id: app.job_id,
      worker_id: workerProfile.id
    });
    speakText("कार्य पूर्ण होने की सूचना दर्ज कर ली गई है। भुगतान जारी किया जा रहा है।", 'hi-IN');
    loadApplicationsData();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatLog(prev => [
      ...prev,
      { id: Date.now(), sender: 'You', text: chatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'worker' }
    ]);
    setChatMessage('');
  };

  const filteredApplications = applications.filter(app => {
    if (appFilter === 'all') return true;
    if (appFilter === 'accepted') return app.status === 'ACCEPTED' || app.status === 'CHECKED_IN' || app.status === 'IN_PROGRESS';
    if (appFilter === 'pending') return app.status === 'APPLIED' || app.status === 'PENDING';
    if (appFilter === 'completed') return app.status === 'COMPLETED' || app.status === 'PAID';
    if (appFilter === 'declined') return app.status.startsWith('DECLINED');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#12372A]">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 p-3 sm:p-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 shrink-0 rounded-3xl p-4 sm:p-5 flex flex-col justify-between bg-white border border-slate-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-2xl bg-[#064E3B] flex items-center justify-center text-white font-black shadow-md">
                🛠
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight flex items-center gap-1 text-[#064E3B]">
                  <span>ShramSetu</span>
                  <span className="text-[#16A34A] font-hindi font-extrabold">श्रमसेतु</span>
                </h1>
                <p className="text-[11px] font-bold text-[#475569]">
                  Rural Labor & Infrastructure
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#475569] block font-semibold">
                    Namaste, {workerProfile.name.split(' ')[0]} 👋
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-[#16A34A] animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-extrabold text-[#064E3B]">
                      {isAvailable ? 'Available for work' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className="text-[10px] font-extrabold px-2.5 py-1 bg-white border border-[#A7F3D0] rounded-lg text-[#064E3B] hover:bg-[#D1FAFA] transition-colors shadow-sm"
                >
                  Toggle
                </button>
              </div>

              <div className="pt-1.5 border-t border-[#A7F3D0]/60 flex items-center justify-between text-[11px] font-black text-[#064E3B]">
                <span>Trust Score:</span>
                <span className="px-2 py-0.5 bg-white border border-[#A7F3D0] rounded-md text-[#16A34A]">
                  {workerProfile.trustScore}/100 🛡️
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                      isActive
                        ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                        : 'text-[#12372A] hover:bg-[#ECFDF5] hover:text-[#064E3B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#064E3B]'}`} />
                      <span>{lang === 'hi' ? item.labelHi : item.labelEn}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-[#16A34A]' : 'bg-[#16A34A] text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => setShowVoiceModal(true)}
              className="w-full p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl hover:border-[#16A34A] transition-all flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shadow-md">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-[#064E3B] block">
                    🎙 Voice Search
                  </span>
                  <span className="text-[11px] text-[#16A34A] font-extrabold font-hindi">
                    बोलकर खोजें
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#064E3B]" />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 space-y-6 text-left">
          
          {/* TOP HEADER */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
                  {lang === 'hi' ? `नमस्ते, ${workerProfile.name.split(' ')[0]} 👋` : `Namaste, ${workerProfile.name.split(' ')[0]} 👋`}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-[#ECFDF5] text-[#064E3B] border border-[#A7F3D0] flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]"></span> Available for work
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1 flex items-center gap-2 font-bold flex-wrap">
                <MapPin className="h-3.5 w-3.5 text-[#16A34A] inline" />
                <span>Location: <b className="text-[#064E3B]">{workerProfile.location.village_name}</b></span>
                <span className="text-slate-300">•</span>
                <span className="text-[#16A34A] font-extrabold">🏆 Trust Score: {workerProfile.trustScore}/100</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSosAlertActive(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-black text-red-700 hover:bg-red-100 transition-colors shadow-sm"
              >
                <AlertOctagon className="h-4 w-4 text-red-600 animate-pulse" />
                <span>SOS Emergency</span>
              </button>

              <button
                onClick={() => speakText(lang === 'hi' ? "Hindi mode active" : "हिंदी मोड सक्रिय", 'hi-IN')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAF9] border border-slate-300 rounded-xl text-xs font-bold text-[#064E3B] hover:border-[#16A34A] transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>🌐 {lang === 'hi' ? 'Hindi' : 'English'}</span>
              </button>

              <div className="h-9 w-9 rounded-xl bg-[#064E3B] text-white font-extrabold flex items-center justify-center shadow-md">
                {workerProfile.name[0]}
              </div>
            </div>
          </div>


          {/* 1. DASHBOARD VIEW */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl bg-[#F0FDF4] border border-[#A7F3D0] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 max-w-xl text-left z-10">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] tracking-tight leading-tight font-hindi">
                    बोलिए और काम पाइए (Voice-First Job Matcher)
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-[#12372A] leading-relaxed font-hindi">
                    अपनी भाषा में बोलें और अपने नज़दीक का काम खोजें: "Mujhe 10 km ke andar masonry ka kaam chahiye"
                  </p>
                  <div>
                    <button
                      onClick={() => setShowVoiceModal(true)}
                      className="px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-lg shadow-[#16A34A]/30 flex items-center gap-2.5 group"
                    >
                      <Mic className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                      <span className="font-hindi font-bold text-base">🎙 बोलकर खोजें</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED JOBS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#064E3B] tracking-tight">
                      Recommended Jobs & AI Match Scores
                    </h3>
                    <p className="text-xs text-[#475569] font-semibold">Calculated dynamically from your skill, location, wage, and experience</p>
                  </div>
                  <button
                    onClick={() => setActiveNav('find-work')}
                    className="text-xs font-extrabold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1"
                  >
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {jobs.slice(0, 3).map((job) => {
                    const matchResult = calculateMatchScore(workerProfile, job);
                    const existingApp = applications.find(a => a.job_id === job.id && a.worker_id === workerProfile.id);
                    const isAccepted = existingApp && (existingApp.status === 'ACCEPTED' || existingApp.status === 'CHECKED_IN');

                    return (
                      <div
                        key={job.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <span className="px-3 py-1 bg-[#ECFDF5] text-[#064E3B] font-black text-xs rounded-full border border-[#A7F3D0] flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                                {matchResult.scorePercent} Match
                              </span>
                            </div>

                            <button
                              onClick={() => handleSpeakJob(job)}
                              className="p-1.5 text-[#475569] hover:text-[#16A34A] transition-colors"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div>
                            <h4 className="text-base font-black text-[#064E3B] group-hover:text-[#16A34A] transition-colors">
                              {job.title}
                            </h4>
                            <span className="text-xs font-extrabold text-[#475569] block mt-0.5">
                              {job.skill_required || job.category} Work • {job.contractor_name || job.contractorName}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-[#12372A] font-bold">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                              <span className="truncate text-[#12372A]">{job.location?.address || 'Sector 31, Greater Noida'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#475569]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"></span>
                              <span>{job.distance_km || 0.8} km away</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <div>
                              <span className="text-lg font-black text-[#16A34A]">
                                ₹{job.daily_wage || job.wagePerDay}
                              </span>
                              <span className="text-xs text-[#475569] font-bold"> /day</span>
                            </div>
                            <span className="text-xs font-extrabold text-[#475569]">
                              Safety: <b className="text-[#064E3B]">{job.safetyScore || 94}/100</b>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="flex-1 py-2.5 px-3 bg-[#F8FAF9] hover:bg-slate-100 text-[#064E3B] border border-slate-200 font-extrabold text-xs rounded-xl transition-colors text-center"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleApplyJob(job)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-1 ${
                              isAccepted ? 'bg-[#064E3B]' : 'bg-[#16A34A] hover:bg-[#15803D]'
                            }`}
                          >
                            {isAccepted ? 'Accepted ✓' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* 2. FIND WORK FEED */}
          {activeNav === 'find-work' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-lg font-black text-[#064E3B]">🔍 Nearby Available Jobs Feed</h3>
                  
                  {/* Skill Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {SKILLS_LIST.map(sk => (
                      <button
                        key={sk}
                        onClick={() => setSelectedSkill(sk)}
                        className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                          selectedSkill === sk ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-[#F8FAF9] text-[#12372A] border-slate-200'
                        }`}
                      >
                        {sk}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map(job => {
                    const matchResult = calculateMatchScore(workerProfile, job);
                    const appState = applications.find(a => a.job_id === job.id && a.worker_id === workerProfile.id);
                    const isAccepted = appState && (appState.status === 'ACCEPTED' || appState.status === 'CHECKED_IN');

                    return (
                      <div
                        key={job.id}
                        className="bg-[#F8FAF9] p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 bg-white text-[#064E3B] font-black text-xs rounded-md border">
                              {job.skill_required || job.category}
                            </span>
                            <span className="text-base font-black text-[#16A34A]">₹{job.daily_wage || job.wagePerDay}/day</span>
                          </div>

                          <h4 className="text-base font-black text-[#064E3B]">{job.title}</h4>
                          <p className="text-xs text-[#475569] font-bold line-clamp-2">{job.description}</p>
                          <div className="text-xs font-bold text-[#475569]">📍 {job.location?.address || 'Sector 31, Greater Noida'} • {job.distance_km || 0.8} km</div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                          <button onClick={() => setSelectedJob(job)} className="px-3.5 py-2 bg-white text-[#064E3B] text-xs font-extrabold rounded-xl border">
                            Details
                          </button>
                          <button
                            onClick={() => handleApplyJob(job)}
                            className={`px-4 py-2 text-white text-xs font-black rounded-xl shadow-md ${
                              isAccepted ? 'bg-[#064E3B]' : 'bg-[#16A34A] hover:bg-[#15803D]'
                            }`}
                          >
                            {isAccepted ? 'Accepted ✓' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* 3. MY APPLICATIONS */}
          {activeNav === 'applications' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-lg font-black text-[#064E3B]">📄 Worker Job Applications ({applications.length})</h3>
              </div>

              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-5 bg-[#F8FAF9] rounded-3xl border border-slate-200 space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-black text-[#064E3B]">{app.job_title}</h4>
                        <p className="text-xs text-[#475569] font-bold">{app.contractor_name} • ₹{app.daily_wage}/day</p>
                      </div>
                      <span className="px-3.5 py-1.5 bg-[#ECFDF5] text-[#064E3B] text-xs font-black rounded-full border border-[#A7F3D0]">
                        🟢 {app.status} ✓
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border text-xs font-bold flex items-center justify-between">
                      <span>Status: <b>{app.check_in_time ? `📍 Checked-In at ${app.check_in_time}` : 'Awaiting Site Arrival'}</b></span>
                      {app.status === 'ACCEPTED' && (
                        <button onClick={() => handleWorkerCheckIn(app)} className="px-3 py-1 bg-[#064E3B] text-white rounded-xl text-xs font-black">
                          GPS Check-In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* 4. MY JOBS & ACTIVE WORK GIGS */}
          {activeNav === 'jobs' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#16A34A]" /> My Active Jobs & Site Attendance
                </h3>
              </div>

              <div className="space-y-4">
                {applications.filter(a => a.status === 'ACCEPTED' || a.status === 'CHECKED_IN').map((app) => (
                  <div key={app.id} className="p-5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-[#064E3B]">{app.job_title}</h4>
                      <span className="text-xs px-3 py-1 bg-[#064E3B] text-white font-black rounded-full">Active Work Gig</span>
                    </div>

                    <div className="text-xs font-bold text-[#12372A] space-y-1">
                      <div>Employer: <b>{app.contractor_name}</b></div>
                      <div>Daily Wage: <b className="text-[#16A34A]">₹{app.daily_wage}/day</b> (5 Days Escrow Funded)</div>
                      <div>Safety Gear: Hard hat, safety boots required</div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button onClick={() => handleWorkerCheckIn(app)} className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-black shadow">
                        📍 GPS Site Check-In
                      </button>

                      <button onClick={() => handleWorkerMarkComplete(app)} className="px-4 py-2 bg-[#064E3B] text-white rounded-xl text-xs font-black shadow">
                        ✅ Mark Work Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* 5. PAYMENTS & ESCROW LEDGER */}
          {activeNav === 'payments' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#16A34A]" /> Payments & Direct Escrow Earnings
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[#ECFDF5] rounded-3xl border border-[#A7F3D0]">
                  <span className="text-xs font-bold text-[#475569] block">Total Earnings</span>
                  <span className="text-3xl font-black text-[#16A34A]">₹{workerProfile.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200">
                  <span className="text-xs font-bold text-[#475569] block">Escrow Guarantee Balance</span>
                  <span className="text-3xl font-black text-emerald-900">₹3,750</span>
                </div>
                <div className="p-5 bg-[#F8FAF9] rounded-3xl border border-slate-200">
                  <span className="text-xs font-bold text-[#475569] block">Verified Bank UPI</span>
                  <span className="text-base font-black text-[#064E3B] mt-1 block">raju.kumar@upi ✓</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-black text-[#064E3B]">Recent UPI Payment Ledger</h4>
                <div className="space-y-2 text-xs font-bold">
                  <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border flex items-center justify-between">
                    <div>
                      <div className="text-[#064E3B] font-black">Irrigation Canal Repair (5 Days)</div>
                      <div className="text-[11px] text-[#475569]">Gupta Infrastructure • 14 Aug 2026</div>
                    </div>
                    <span className="text-[#16A34A] font-black text-sm">+ ₹3,750 (UPI Direct)</span>
                  </div>
                  <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border flex items-center justify-between">
                    <div>
                      <div className="text-[#064E3B] font-black">Village School Wall Plaster (3 Days)</div>
                      <div className="text-[11px] text-[#475569]">Apex Rural Builders • 10 Aug 2026</div>
                    </div>
                    <span className="text-[#16A34A] font-black text-sm">+ ₹2,550 (UPI Direct)</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* 6. MESSAGES & DIRECT CHAT */}
          {activeNav === 'messages' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#16A34A]" /> Employer Communications & Voice Chat
                </h3>
              </div>

              <div className="p-4 bg-[#F8FAF9] rounded-3xl border space-y-3 max-h-[350px] overflow-y-auto">
                {chatLog.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.type === 'worker' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-black text-[#475569] px-1">{msg.sender} • {msg.time}</span>
                    <div className={`p-3 rounded-2xl max-w-xs text-xs font-bold ${
                      msg.type === 'worker' ? 'bg-[#16A34A] text-white' : 'bg-white border border-slate-200 text-[#064E3B]'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type message to contractor..."
                  className="flex-1 bg-[#F8FAF9] border rounded-2xl px-4 py-2.5 text-xs font-bold text-[#064E3B]"
                />
                <button type="submit" className="px-5 py-2.5 bg-[#064E3B] text-white font-black text-xs rounded-2xl shadow">
                  Send
                </button>
              </form>
            </div>
          )}


          {/* 7. WORKER PROFILE */}
          {activeNav === 'profile' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 border-b pb-4 border-slate-100">
                <div className="h-16 w-16 rounded-3xl bg-[#064E3B] text-white text-2xl font-black flex items-center justify-center shadow-lg">
                  {workerProfile.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#064E3B]">{workerProfile.name}</h3>
                  <p className="text-xs font-bold text-[#16A34A] mt-0.5">{workerProfile.primary_skill} • {workerProfile.experience_years} Years Experience</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl">
                  <div className="text-[#475569]">Aadhaar & Mobile</div>
                  <div className="text-[#064E3B] font-black mt-1">KYC Verified ✓</div>
                </div>
                <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl">
                  <div className="text-[#475569]">Skill Proficiency</div>
                  <div className="text-[#16A34A] font-black mt-1">Master Mason (Level 4) ✓</div>
                </div>
                <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl">
                  <div className="text-[#475569]">Trust Score</div>
                  <div className="text-[#064E3B] font-black mt-1">{workerProfile.trustScore}/100 🛡️</div>
                </div>
              </div>
            </div>
          )}


          {/* 8. APP SETTINGS */}
          {activeNav === 'settings' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-[#064E3B] border-b pb-3">⚙️ App Settings & Regional Preferences</h3>
              
              <div className="space-y-4 text-xs font-bold">
                <div className="flex items-center justify-between p-4 bg-[#F8FAF9] rounded-2xl border">
                  <div>
                    <div className="text-[#064E3B] font-black">Voice Speech Assistance</div>
                    <div className="text-[#475569]">Audio playback speed for rural accessibility</div>
                  </div>
                  <select value={voiceSpeed} onChange={(e) => setVoiceSpeed(e.target.value)} className="bg-white border rounded-xl p-2 font-black">
                    <option value="normal">Normal Speed</option>
                    <option value="slow">Slow (ग्रामीण भाषा)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F8FAF9] rounded-2xl border">
                  <div>
                    <div className="text-[#064E3B] font-black">SMS Job Notification Alerts</div>
                    <div className="text-[#475569]">Receive instant SMS when contractor posts job in radius</div>
                  </div>
                  <button onClick={() => setSmsAlerts(!smsAlerts)} className={`px-4 py-1.5 rounded-xl font-black text-white ${smsAlerts ? 'bg-[#16A34A]' : 'bg-slate-400'}`}>
                    {smsAlerts ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* 9. HELP & SAFETY */}
          {activeNav === 'help' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-[#064E3B] border-b pb-3">🛡️ Help, Safety & Labor Rights</h3>
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-2 text-xs font-bold text-emerald-950">
                <h4 className="text-sm font-black text-[#064E3B]">24/7 ShramSetu Helpline: 1800-SHRAM-SETU</h4>
                <p>Fair wage guarantee compliance, dispute settlement, and emergency medical protection for rural workers.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* VOICE SEARCH OVERLAY */}
      {showVoiceModal && (
        <VoiceRecorder
          lang={lang}
          onClose={() => setShowVoiceModal(false)}
          onSearchSubmit={(extracted) => {
            if (extracted.primary_skill) setSelectedSkill(extracted.primary_skill);
            if (extracted.radius_km) setRadiusKm(extracted.radius_km);
            setShowVoiceModal(false);
          }}
        />
      )}
    </div>
  );
}
