import React, { useState, useEffect } from 'react';
import { HardHat, Mic, MapPin, Volume2, PhoneCall, CheckCircle, Search, Sliders, ChevronRight } from 'lucide-react';
import { fetchNearbyJobs } from '../utils/api';
import { speakText } from '../utils/speechHelper';
import MapView from './MapView';
import VoiceRecorder from './VoiceRecorder';

const SKILLS_LIST = ['All', 'Masonry', 'Carpentry', 'Agriculture', 'Plumbing', 'General Labor'];

export default function WorkerPortal({ lang, activeWorker, setActiveWorker }) {
  const [jobs, setJobs] = useState([]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedJobForCall, setSelectedJobForCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null);

  // Worker Location (Default: Greater Noida coordinates)
  const workerLocation = activeWorker ? activeWorker.location : { lat: 28.4744, lng: 77.5040, village_name: "Greater Noida" };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchNearbyJobs({
        lat: workerLocation.lat,
        lng: workerLocation.lng,
        radius_km: radiusKm,
        skill: selectedSkill
      });
      if (res.jobs) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error("Failed to load nearby jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [radiusKm, selectedSkill, activeWorker]);

  const handleSpeakJob = (job) => {
    const textToSpeak = lang === 'hi'
      ? `Kaam ka naam: ${job.title}. Majdoori: ₹${job.daily_wage} rupaye pratidin. Kaam ka sthan: ${job.location.address}. Doori: ${job.distance_km} kilometer.`
      : `Job title: ${job.title}. Daily Wage: ${job.daily_wage} rupees per day. Location: ${job.location.address}. Distance: ${job.distance_km} kilometers.`;

    speakText(textToSpeak, lang === 'hi' ? 'hi-IN' : 'en-IN');
  };

  const handleInitiateCall = (job) => {
    setSelectedJobForCall(job);
    setCallStatus('CONNECTING');

    setTimeout(() => {
      setCallStatus('CONNECTED');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner / Worker Profile Info */}
      <div className="glass-card p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-100">
                  {activeWorker ? activeWorker.name : (lang === 'hi' ? 'नमस्ते! ग्रामीण मजदूर' : 'Welcome Rural Worker')}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {activeWorker ? activeWorker.primary_skill : 'Voice Profile Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>📍 Location: <b>{workerLocation.village_name}</b></span>
                {activeWorker && (
                  <span className="text-teal-400 font-semibold">🏆 {activeWorker.trust_badge}</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVoiceModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Mic className="h-5 w-5 text-slate-950" />
            <span>{lang === 'hi' ? 'बोलकर रजिस्ट्रेशन करें (Voice Register)' : 'Register Voice Profile'}</span>
          </button>
        </div>
      </div>

      {/* Voice Recording Modal overlay */}
      {showVoiceModal && (
        <VoiceRecorder
          lang={lang}
          onWorkerRegistered={(newWorker) => {
            setActiveWorker(newWorker);
            setShowVoiceModal(false);
          }}
          onClose={() => setShowVoiceModal(false)}
        />
      )}

      {/* Spatial Map & Nearby Jobs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Cards List & Radius Filter */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Controls Header */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  {lang === 'hi' ? 'आस-पास के काम (Nearby Jobs)' : 'Nearby Available Gigs'}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Found <b className="text-amber-400">{jobs.length}</b> jobs within {radiusKm} km
              </span>
            </div>

            {/* Radius Slider & Skill Filter */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Search Radius (दूरी की सीमा):</span>
                  <span className="text-amber-400 font-bold">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Skill Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SKILLS_LIST.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedSkill === skill
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Cards */}
          {loading ? (
            <div className="glass-card p-12 text-center text-slate-400 text-sm">
              Finding local jobs within spatial radius...
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 text-sm space-y-2">
              <p>No jobs found matching your criteria in {radiusKm} km.</p>
              <p className="text-xs text-slate-500">Try expanding the search radius slider above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-4 glass-card-hover space-y-3 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-xs font-bold">
                          {job.skill_required}
                        </span>
                        <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                          <MapPin className="h-3 w-3 inline" /> {job.distance_km} km away
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-base mt-1.5">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.contractor_name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-400">
                        ₹{job.daily_wage}<span className="text-xs font-normal text-slate-400">/day</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {job.workers_needed} workers needed
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-400">
                      📍 <span className="text-slate-300">{job.location.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio Readout Button */}
                      <button
                        onClick={() => handleSpeakJob(job)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Listen to Job Description in Audio"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>{lang === 'hi' ? 'सुनें (Listen)' : 'Listen'}</span>
                      </button>

                      {/* 1-Click Call Button */}
                      <button
                        onClick={() => handleInitiateCall(job)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>{lang === 'hi' ? 'कॉल करें' : 'Call Contractor'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Spatial Leaflet Map View */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-card p-4">
            <h3 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-400" />
              <span>Spatial Job Radius Map</span>
            </h3>
            <MapView
              center={{ lat: workerLocation.lat, lng: workerLocation.lng }}
              radiusKm={radiusKm}
              jobs={jobs}
              workers={[]}
            />
          </div>
        </div>

      </div>

      {/* Call Contractor Simulation Modal */}
      {selectedJobForCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="h-16 w-16 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <PhoneCall className="h-8 w-8" />
            </div>

            {callStatus === 'CONNECTING' ? (
              <>
                <h3 className="text-lg font-bold text-slate-100">Connecting Direct Call...</h3>
                <p className="text-xs text-slate-400">Dialing contractor helpline for "{selectedJobForCall.title}"</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle className="h-5 w-5" />
                  <span>Call Connected / SMS Dispatched!</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1">
                  <p className="text-slate-300"><b>Contractor:</b> {selectedJobForCall.contractor_name}</p>
                  <p className="text-slate-300"><b>Daily Wage:</b> ₹{selectedJobForCall.daily_wage}/day</p>
                  <p className="text-slate-300"><b>Job Location:</b> {selectedJobForCall.location.address}</p>
                  <p className="text-emerald-400 font-medium pt-1">✓ Work dispatch SMS alert sent to your mobile phone.</p>
                </div>
              </>
            )}

            <button
              onClick={() => setSelectedJobForCall(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl mt-2"
            >
              Close Call Screen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
