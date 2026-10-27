import React from 'react';
import { HardHat, PhoneCall, Languages, RefreshCw, Sparkles, MapPin, UserPlus, Building, Hammer, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, lang, setLang, activeWorker, activeContractor, onLogout, onResetSeed, isReseeding }) {
  const currentUser = activeWorker || activeContractor;
  const isWorker = !!activeWorker;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#064E3B] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#064E3B]/20">
            <Hammer className="h-6 w-6 text-[#84CC16]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-[#064E3B] flex items-center gap-1.5">
                <span>ShramSetu</span>
                <span className="font-hindi text-[#16A34A] font-extrabold text-lg">श्रमसेतु</span>
              </h1>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#064E3B] border border-[#A7F3D0]">
                Voice First
              </span>
            </div>
            <p className="text-xs text-[#475569] font-extrabold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#16A34A] inline" /> Rural Labor & Infrastructure Gig Matcher
            </p>
          </div>
        </div>

        {/* Persona Mode Selector Tabs */}
        <nav className="flex items-center bg-[#F8FAF9] p-1.5 rounded-2xl border border-slate-200 flex-wrap justify-center shadow-inner gap-1">
          
          {/* Rural Worker Tab */}
          <button
            onClick={() => setActiveTab('worker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'worker'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                : 'text-[#12372A] hover:text-[#064E3B] hover:bg-[#ECFDF5] bg-white border border-slate-200'
            }`}
          >
            <HardHat className="h-4 w-4" />
            <span>{lang === 'hi' ? 'ग्रामीण मजदूर' : 'Rural Worker'}</span>
          </button>

          {/* Contractor Tab */}
          <button
            onClick={() => setActiveTab('contractor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'contractor'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                : 'text-[#12372A] hover:text-[#064E3B] hover:bg-[#ECFDF5] bg-white border border-slate-200'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>{lang === 'hi' ? 'ठेकेदार' : 'Contractor'}</span>
          </button>

          {/* IVR Fallback Tab */}
          <button
            onClick={() => setActiveTab('ivr')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'ivr'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                : 'text-[#12372A] hover:text-[#064E3B] hover:bg-[#ECFDF5] bg-white border border-slate-200'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>{lang === 'hi' ? 'IVR फ़ोन' : 'IVR Fallback'}</span>
          </button>

          {/* Register Tab */}
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              activeTab === 'register'
                ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                : 'text-[#12372A] hover:text-[#064E3B] hover:bg-[#ECFDF5] bg-white border border-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>{lang === 'hi' ? 'रजिस्ट्रेशन / लॉगिन' : 'Register / Login'}</span>
          </button>
        </nav>

        {/* User Badge & Language Toggle */}
        <div className="flex items-center gap-2">
          
          {currentUser && (
            <div className="px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center gap-2 text-xs font-black text-[#064E3B]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span>{currentUser.name.split(' ')[0]} ({isWorker ? 'Worker' : 'Employer'})</span>
              <button
                onClick={onLogout}
                className="p-1 text-[#475569] hover:text-red-600 transition-colors"
                title="Logout / Switch Account"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-[#064E3B] hover:border-[#16A34A] hover:bg-[#ECFDF5] transition-all shadow-sm"
            title="Toggle Language"
          >
            <Languages className="h-3.5 w-3.5 text-[#16A34A]" />
            <span>{lang === 'hi' ? 'Hindi (हिंदी)' : 'English (ENG)'}</span>
          </button>

          {/* Seed Data Reset */}
          <button
            onClick={onResetSeed}
            disabled={isReseeding}
            className="p-2 bg-white border border-slate-300 rounded-xl text-[#475569] hover:text-[#064E3B] hover:border-[#16A34A] hover:bg-[#ECFDF5] transition-all disabled:opacity-50 shadow-sm"
            title="Reset & Re-seed Demo Data"
          >
            <RefreshCw className={`h-4 w-4 ${isReseeding ? 'animate-spin text-[#16A34A]' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
}
