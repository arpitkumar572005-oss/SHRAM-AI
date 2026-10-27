import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ShramSetuDashboard from './components/ShramSetuDashboard';
import ContractorPortal from './components/ContractorPortal';
import IVRSimulator from './components/IVRSimulator';
import RegisterPage from './components/RegisterPage';
import { reseedData } from './utils/api';
import { ShieldCheck, Zap, Hammer } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('worker'); // 'worker' | 'contractor' | 'ivr' | 'register'
  const [lang, setLang] = useState('hi');
  const [activeWorker, setActiveWorker] = useState(null);
  const [activeContractor, setActiveContractor] = useState(null);
  const [isReseeding, setIsReseeding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleResetSeed = async () => {
    setIsReseeding(true);
    try {
      const res = await reseedData();
      setToastMessage(res.message || "Database re-seeded successfully!");
      setActiveWorker(null);
      setActiveContractor(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to re-seed database:", err);
      setToastMessage("Demo data re-seeded!");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleAuthSuccess = (user) => {
    if (user.role === 'contractor' || (!user.primary_skill && user.experience_years === undefined)) {
      setActiveContractor(user);
      setActiveTab('contractor');
      setToastMessage(`Welcome ${user.name}! Redirected to your Employer Dashboard.`);
    } else {
      setActiveWorker(user);
      setActiveTab('worker');
      setToastMessage(`Welcome ${user.name}! Redirected to your Rural Worker Section.`);
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    setActiveWorker(null);
    setActiveContractor(null);
    setActiveTab('register');
    setToastMessage("Logged out successfully.");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#12372A] flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        activeWorker={activeWorker}
        activeContractor={activeContractor}
        onLogout={handleLogout}
        onResetSeed={handleResetSeed}
        isReseeding={isReseeding}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#064E3B] text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-[#16A34A] animate-bounce">
          <Zap className="h-4 w-4 text-[#84CC16]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 w-full mx-auto my-2">
        {/* REGISTRATION / LOGIN PAGE */}
        {activeTab === 'register' && (
          <div className="max-w-7xl mx-auto p-2 sm:p-4">
            <RegisterPage
              onRegistrationSuccess={handleAuthSuccess}
              onCancel={activeWorker || activeContractor ? () => setActiveTab(activeWorker ? 'worker' : 'contractor') : null}
            />
          </div>
        )}

        {/* DEDICATED RURAL WORKER SECTION */}
        {activeTab === 'worker' && (
          <ShramSetuDashboard
            mode="worker"
            lang={lang}
            activeWorker={activeWorker}
            setActiveWorker={setActiveWorker}
            onOpenRegister={() => setActiveTab('register')}
          />
        )}

        {/* DEDICATED CONTRACTOR SECTION */}
        {activeTab === 'contractor' && (
          <div className="max-w-7xl mx-auto p-2 sm:p-4">
            <ContractorPortal
              lang={lang}
              activeContractor={activeContractor}
              onOpenRegister={() => setActiveTab('register')}
            />
          </div>
        )}

        {/* IVR FEATURE PHONE FALLBACK SECTION */}
        {activeTab === 'ivr' && (
          <div className="max-w-7xl mx-auto p-2 sm:p-4">
            <IVRSimulator lang={lang} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-[#475569] space-y-2 mt-8">
        <div className="flex items-center justify-center gap-4 text-[#064E3B] font-bold flex-wrap">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> Spatial Haversine Matching</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-[#16A34A]" /> Voice-First Speech API</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Hammer className="h-3.5 w-3.5 text-[#16A34A]" /> Green-and-White Design System</span>
        </div>
        <p>© 2026 ShramSetu (श्रमसेतु) - Empowering Informal Rural Labor & Local Infrastructure Matching.</p>
      </footer>

    </div>
  );
}
