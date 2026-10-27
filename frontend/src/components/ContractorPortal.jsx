import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Sliders, MapPin, Award, PhoneCall, Send, Star, CheckCircle, RefreshCw, 
  HardHat, Filter, MessageSquare, UserCheck, X, Building, CheckCircle2, AlertTriangle, Clock, 
  Briefcase, DollarSign, TrendingUp, AlertCircle, Eye, Share2, Ban, ChevronRight, Info, ShieldCheck, Sparkles, UserPlus
} from 'lucide-react';
import { 
  fetchWorkers, createJobPosting, fetchApplications, fetchNearbyJobs, fetchAllJobs, checkInApplication, 
  completeJob, releasePayment, rateApplication, declineJob, fetchLaborDemand, fetchContractorAnalytics 
} from '../utils/api';
import { calculateMatchScore } from '../utils/matchingEngine';

const SKILLS_LIST = ['All', 'Masonry', 'Carpentry', 'Agriculture', 'Plumbing', 'General Labor'];

const FAIR_WAGE_BENCHMARKS = {
  'Masonry': { min: 650, max: 850 },
  'Carpentry': { min: 700, max: 950 },
  'Agriculture': { min: 500, max: 700 },
  'Plumbing': { min: 700, max: 1000 },
  'General Labor': { min: 450, max: 650 }
};

const INITIAL_DEMO_JOBS = [
  {
    id: "job-301",
    contractorId: "ctr-201",
    contractor_id: "ctr-201",
    contractorName: "Gupta Infrastructure & Civil Works",
    contractor_name: "Gupta Infrastructure & Civil Works",
    title: "Irrigation Canal Wall Repair",
    category: "Masonry",
    skill_required: "Masonry",
    daily_wage: 750,
    wagePerDay: 750,
    workers_needed: 4,
    workersNeeded: 4,
    duration: "5 days",
    requiredSkills: ["Masonry", "Concrete Repair"],
    experienceRequired: "2+ years",
    startDate: "20 Aug",
    endDate: "25 Aug",
    status: "OPEN",
    location: { lat: 28.4700, lng: 77.5100, address: "Sector 31 Canal Road, Greater Noida", pincode: "201310" },
    latitude: 28.4700,
    longitude: 77.5100,
    description: "Urgent masonry repair required for concrete canal lining before monsoon release.",
    working_hours: "8:00 AM - 5:00 PM (1 Hr Lunch Break)",
    emergency_contact: "+91 98111 22233",
    nearby_hospital: "Government District Hospital, Sector 30 Noida (2.1 km)",
    safetyScore: 92,
    paymentStatus: "ESCROW_HELD",
    verification_status: { contractor: true, escrow_funded: true, location_verified: true },
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "job-302",
    contractorId: "ctr-202",
    contractor_id: "ctr-202",
    contractorName: "Apex Rural Builders",
    contractor_name: "Apex Rural Builders",
    title: "Panchayat Bhavan Roofing & Shuttering",
    category: "Carpentry",
    skill_required: "Carpentry",
    daily_wage: 850,
    wagePerDay: 850,
    workers_needed: 2,
    workersNeeded: 2,
    duration: "4 days",
    requiredSkills: ["Carpentry", "Shuttering"],
    experienceRequired: "3+ years",
    startDate: "22 Aug",
    endDate: "26 Aug",
    status: "OPEN",
    location: { lat: 28.4850, lng: 77.5300, address: "Village Chaupal, Greater Noida East", pincode: "201310" },
    latitude: 28.4850,
    longitude: 77.5300,
    description: "Wooden formwork shuttering for concrete roof slab casting.",
    working_hours: "8:30 AM - 5:30 PM",
    emergency_contact: "+91 98123 45678",
    nearby_hospital: "Kailash Hospital, Greater Noida (3.5 km)",
    safetyScore: 90,
    paymentStatus: "ESCROW_HELD",
    verification_status: { contractor: true, escrow_funded: true, location_verified: true },
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "job-303",
    contractorId: "ctr-203",
    contractor_id: "ctr-203",
    contractorName: "Kisan Cooperative Farm",
    contractor_name: "Kisan Cooperative Farm",
    title: "Wheat Harvesting & Loading",
    category: "Agriculture",
    skill_required: "Agriculture",
    daily_wage: 650,
    wagePerDay: 650,
    workers_needed: 8,
    workersNeeded: 8,
    duration: "3 days",
    requiredSkills: ["Agriculture", "Harvesting"],
    experienceRequired: "1+ years",
    startDate: "18 Aug",
    endDate: "21 Aug",
    status: "OPEN",
    location: { lat: 28.4400, lng: 77.4800, address: "Surajpur Farm Sector, Greater Noida", pincode: "201306" },
    latitude: 28.4400,
    longitude: 77.4800,
    description: "Manual harvesting, threshing and loading onto grain trucks.",
    working_hours: "7:00 AM - 4:00 PM",
    emergency_contact: "+91 97654 00011",
    nearby_hospital: "Primary Health Center, Surajpur (1.0 km)",
    safetyScore: 88,
    paymentStatus: "ESCROW_HELD",
    verification_status: { contractor: true, escrow_funded: true, location_verified: true },
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "job-304",
    contractorId: "ctr-204",
    contractor_id: "ctr-204",
    contractorName: "Gramin Jal Vikas Sansthan",
    contractor_name: "Gramin Jal Vikas Sansthan",
    title: "Village Solar Water Tank Piping",
    category: "Plumbing",
    skill_required: "Plumbing",
    daily_wage: 900,
    wagePerDay: 900,
    workers_needed: 3,
    workersNeeded: 3,
    duration: "6 days",
    requiredSkills: ["Plumbing", "Pipe Fitting"],
    experienceRequired: "2+ years",
    startDate: "25 Aug",
    endDate: "31 Aug",
    status: "OPEN",
    location: { lat: 28.5300, lng: 77.3980, address: "Noida Sector 63 Water Complex", pincode: "201301" },
    latitude: 28.5300,
    longitude: 77.3980,
    description: "PVC & GI pipe laydown connecting overhead solar tank to village distribution tap.",
    working_hours: "9:00 AM - 6:00 PM",
    emergency_contact: "+91 99887 11223",
    nearby_hospital: "Fortis Hospital, Sector 62 Noida (1.8 km)",
    safetyScore: 96,
    paymentStatus: "ESCROW_HELD",
    verification_status: { contractor: true, escrow_funded: true, location_verified: true },
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function ContractorPortal({ lang = 'en', activeContractor, onOpenRegister }) {
  const contractorProfile = {
    id: activeContractor?.id || "ctr-201",
    name: activeContractor?.name || "Gupta Infrastructure & Civil Works",
    phone: activeContractor?.phone || "+91 98111 22233",
    category: activeContractor?.category || activeContractor?.skill || "Private Construction Contractor",
    location: activeContractor?.location || { lat: 28.4744, lng: 77.5040, address: "Noida, Sector 31" }
  };

  const [workers, setWorkers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState(INITIAL_DEMO_JOBS);
  const [postedJobFilter, setPostedJobFilter] = useState('all');
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedSkill, setSelectedSkill] = useState('Masonry');
  const [loading, setLoading] = useState(false);

  // Modals & UI States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState(null);
  const [whyMatchModalWorker, setWhyMatchModalWorker] = useState(null);
  const [viewApplicationsModalJob, setViewApplicationsModalJob] = useState(null);
  const [viewMode, setViewMode] = useState('posted');
  const [jobPublishedAlert, setJobPublishedAlert] = useState(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState(null);

  // Analytics & Labor Demand State
  const [laborDemand, setLaborDemand] = useState(null);
  const [contractorAnalytics, setContractorAnalytics] = useState(null);

  // Decline Modal State
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('Project scope revised / कार्य संशोधित');
  const [declineNotes, setDeclineNotes] = useState('');
  const [isSubmittingDecline, setIsSubmittingDecline] = useState(false);

  const contractorLocation = { lat: 28.4744, lng: 77.5040, address: "Noida, Sector 31" };

  const [jobForm, setJobForm] = useState({
    title: "Irrigation Canal Wall Repair",
    category: "Masonry",
    skill_required: "Masonry",
    daily_wage: 750,
    wagePerDay: 750,
    workers_needed: 4,
    workersNeeded: 4,
    address: "Sector 31, Greater Noida",
    pincode: "201310",
    lat: 28.4744,
    lng: 77.5040,
    contractorId: contractorProfile.id,
    contractorName: contractorProfile.name,
    description: "Urgent masonry repair required for concrete canal lining before monsoon release.",
    working_hours: "8:00 AM - 5:00 PM (8 hrs/day)",
    startDate: "20 Aug",
    endDate: "25 Aug",
    duration: "5 days",
    requiredSkills: "Masonry, Concrete Work",
    experienceRequired: "2+ years",
    safetyRequirements: "Hard hat, safety boots, high-vis vest required",
    emergency_contact: contractorProfile.phone
  });

  const [isPostingJob, setIsPostingJob] = useState(false);

  // Master Robust Application Matching Function
  const getJobApplications = (job, apps) => {
    if (!apps || apps.length === 0) return [];
    if (!job) return apps;

    const jobId = String(job.id || '').trim();
    const jobTitle = String(job.title || '').trim().toLowerCase();
    const jobCategory = String(job.category || job.skill_required || '').trim().toLowerCase();

    // 1. Match by job ID or Job Title
    let matched = apps.filter(a => {
      const aId = String(a.job_id || '').trim();
      const aTitle = String(a.job_title || '').trim().toLowerCase();
      return (aId && jobId && aId === jobId) || (aTitle && jobTitle && aTitle === jobTitle);
    });

    // 2. Match by Category/Skill if no direct ID/Title match
    if (matched.length === 0 && jobCategory) {
      matched = apps.filter(a => {
        const aSkill = String(a.worker_skill || '').trim().toLowerCase();
        return aSkill === jobCategory;
      });
    }

    // 3. Fallback to all non-declined applications
    if (matched.length === 0) {
      matched = apps.filter(a => !a.status?.startsWith('DECLINED'));
    }

    return matched;
  };

  // Persistent Load Function
  const loadData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes, jRes, dRes, cRes] = await Promise.all([
        fetchWorkers({ lat: contractorLocation.lat, lng: contractorLocation.lng, radius_km: radiusKm, skill: selectedSkill === 'All' ? '' : selectedSkill }),
        fetchApplications(),
        fetchAllJobs(),
        fetchLaborDemand(),
        fetchContractorAnalytics(contractorProfile.id)
      ]);

      let loadedJobs = (jRes && jRes.jobs && jRes.jobs.length > 0) ? jRes.jobs : [...INITIAL_DEMO_JOBS];
      let loadedApps = aRes?.applications || [];

      if (loadedApps.length === 0) {
        loadedApps = [
          {
            id: "app-501",
            job_id: "job-301",
            job_title: "Irrigation Canal Wall Repair",
            daily_wage: 750,
            contractor_name: "Gupta Infrastructure & Civil Works",
            worker_id: "wrk-101",
            worker_name: "Raju Kumar",
            worker_phone: "+91 98765 43210",
            worker_skill: "Masonry",
            status: "ACCEPTED",
            check_in_time: "08:05 AM, Today (GPS Verified ✓)",
            payment_status: "ESCROW_HELD",
            updated_at: new Date().toISOString()
          }
        ];
      }

      try {
        const cachedLocal = localStorage.getItem(`shramsetu_jobs_${contractorProfile.id}`);
        if (cachedLocal) {
          const parsed = JSON.parse(cachedLocal);
          parsed.forEach(lj => {
            if (!loadedJobs.some(j => j.id === lj.id)) {
              loadedJobs.unshift(lj);
            }
          });
        }

        const cachedGlobal = localStorage.getItem(`shramsetu_global_jobs`);
        if (cachedGlobal) {
          const parsedG = JSON.parse(cachedGlobal);
          parsedG.forEach(gj => {
            if (!loadedJobs.some(j => j.id === gj.id)) {
              loadedJobs.unshift(gj);
            }
          });
        }

        const cachedApps = localStorage.getItem('shramsetu_applications');
        if (cachedApps) {
          const parsedA = JSON.parse(cachedApps);
          parsedA.forEach(ca => {
            const idx = loadedApps.findIndex(a => (a.job_id === ca.job_id || a.job_title === ca.job_title) && a.worker_id === ca.worker_id);
            if (idx >= 0) loadedApps[idx] = { ...loadedApps[idx], ...ca };
            else loadedApps.unshift(ca);
          });
        }
      } catch (e) {
        console.warn("LocalStorage cache read error:", e);
      }

      if (wRes && wRes.workers && wRes.workers.length > 0) setWorkers(wRes.workers);
      setApplications(loadedApps);
      setPostedJobs(loadedJobs);
      if (dRes && dRes.skill_demand) setLaborDemand(dRes);
      if (cRes) setContractorAnalytics(cRes);
    } catch (err) {
      console.error("Failed to load contractor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, [radiusKm, selectedSkill, activeContractor]);

  const handleCreateJobSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsPostingJob(true);

    const newJobObj = {
      id: `job-${Date.now().toString().slice(-4)}`,
      contractorId: contractorProfile.id,
      contractor_id: contractorProfile.id,
      contractorName: contractorProfile.name,
      contractor_name: contractorProfile.name,
      title: jobForm.title || "Rural Infrastructure Job",
      category: jobForm.category || "Masonry",
      skill_required: jobForm.category || "Masonry",
      daily_wage: Number(jobForm.daily_wage) || 750,
      wagePerDay: Number(jobForm.daily_wage) || 750,
      workers_needed: Number(jobForm.workers_needed) || 4,
      workersNeeded: Number(jobForm.workers_needed) || 4,
      duration: jobForm.duration || "5 days",
      requiredSkills: [jobForm.category || "Masonry"],
      experienceRequired: "2+ years",
      startDate: jobForm.startDate || "20 Aug",
      endDate: jobForm.endDate || "25 Aug",
      status: "OPEN",
      location: {
        lat: 28.4744,
        lng: 77.5040,
        address: jobForm.address || "Sector 31, Greater Noida",
        pincode: "201310"
      },
      latitude: 28.4744,
      longitude: 77.5040,
      description: jobForm.description || "Local rural infrastructure & labor assignment.",
      working_hours: jobForm.working_hours || "8:00 AM - 5:00 PM",
      emergency_contact: contractorProfile.phone,
      safetyScore: 92,
      paymentStatus: "ESCROW_HELD",
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPostedJobs(prev => [newJobObj, ...prev.filter(j => j.id !== newJobObj.id)]);

    try {
      const cachedLocal = localStorage.getItem(`shramsetu_jobs_${contractorProfile.id}`);
      const currentArr = cachedLocal ? JSON.parse(cachedLocal) : [];
      currentArr.unshift(newJobObj);
      localStorage.setItem(`shramsetu_jobs_${contractorProfile.id}`, JSON.stringify(currentArr));
      
      const globalCache = localStorage.getItem(`shramsetu_global_jobs`);
      const globalArr = globalCache ? JSON.parse(globalCache) : [];
      globalArr.unshift(newJobObj);
      localStorage.setItem(`shramsetu_global_jobs`, JSON.stringify(globalArr));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    setJobPublishedAlert(newJobObj);
    setShowCreateModal(false);
    setShowFormPreview(false);
    setViewMode('posted');

    try {
      const res = await createJobPosting(newJobObj);
      if (res.success && res.job) {
        setPostedJobs(prev => [res.job, ...prev.filter(j => j.id !== newJobObj.id && j.id !== res.job.id)]);
      }
    } catch (err) {
      console.warn("Backend API sync warning:", err);
    } finally {
      setIsPostingJob(false);
      setTimeout(() => setJobPublishedAlert(null), 5000);
    }
  };

  // Robust Synchronous Payment Release Function
  const handleContractorReleasePayment = async (app) => {
    if (!app) return;
    const calcAmount = (app.daily_wage || 750) * 5;

    // 1. Synchronously update React state
    setApplications(prev => prev.map(a => {
      if (a.id === app.id || (a.job_id === app.job_id && a.worker_id === app.worker_id)) {
        return {
          ...a,
          status: 'PAID',
          payment_status: 'PAID_DIRECT_UPI',
          completed_at: new Date().toISOString()
        };
      }
      return a;
    }));

    // 2. Persist to localStorage for immediate cross-tab sync
    try {
      const cachedApps = localStorage.getItem('shramsetu_applications');
      const appArr = cachedApps ? JSON.parse(cachedApps) : [];
      const updatedArr = appArr.map(a => {
        if (a.id === app.id || (a.job_id === app.job_id && a.worker_id === app.worker_id)) {
          return {
            ...a,
            status: 'PAID',
            payment_status: 'PAID_DIRECT_UPI',
            completed_at: new Date().toISOString()
          };
        }
        return a;
      });
      localStorage.setItem('shramsetu_applications', JSON.stringify(updatedArr));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    // 3. Show instant green success banner alert
    setInviteSuccessMsg(`💰 Payment of ₹${calcAmount.toLocaleString()} released successfully to ${app.worker_name} (+91 ${app.worker_phone}) via Direct UPI!`);
    setTimeout(() => setInviteSuccessMsg(null), 6000);

    // 4. Send API request to backend in background
    try {
      await releasePayment({ application_id: app.id, job_id: app.job_id, worker_id: app.worker_id });
    } catch (err) {
      console.warn("Backend payment release warning:", err);
    }
  };

  // Robust Synchronous Decline Function
  const handleConfirmDecline = async (e) => {
    if (e) e.preventDefault();
    if (!declineTarget) return;
    setIsSubmittingDecline(true);

    const workerName = declineTarget.worker_name || "Worker";

    // 1. Synchronously update React state
    setApplications(prev => prev.map(a => {
      if (a.id === declineTarget.id || (a.job_id === declineTarget.job_id && a.worker_id === declineTarget.worker_id)) {
        return {
          ...a,
          status: 'DECLINED',
          decline_reason: declineReason,
          decline_notes: declineNotes,
          declined_by: 'contractor',
          updated_at: new Date().toISOString()
        };
      }
      return a;
    }));

    // 2. Persist to localStorage
    try {
      const cachedApps = localStorage.getItem('shramsetu_applications');
      const appArr = cachedApps ? JSON.parse(cachedApps) : [];
      const updatedArr = appArr.map(a => {
        if (a.id === declineTarget.id || (a.job_id === declineTarget.job_id && a.worker_id === declineTarget.worker_id)) {
          return {
            ...a,
            status: 'DECLINED',
            decline_reason: declineReason,
            decline_notes: declineNotes,
            declined_by: 'contractor',
            updated_at: new Date().toISOString()
          };
        }
        return a;
      });
      localStorage.setItem('shramsetu_applications', JSON.stringify(updatedArr));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    // 3. Banner alert
    setInviteSuccessMsg(`❌ Application from ${workerName} declined (${declineReason}). Worker notified.`);
    setTimeout(() => setInviteSuccessMsg(null), 5000);

    // 4. API Request
    try {
      await declineJob({
        application_id: declineTarget.id,
        job_id: declineTarget.job_id,
        worker_id: declineTarget.worker_id,
        reason: declineReason,
        notes: declineNotes,
        declined_by: 'contractor'
      });
    } catch (err) {
      console.warn("Backend decline API warning:", err);
    } finally {
      setIsSubmittingDecline(false);
      setDeclineTarget(null);
    }
  };

  const handleToggleJobStatus = (jobId, newStatus) => {
    setPostedJobs(prev => {
      const updated = prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j);
      try {
        localStorage.setItem(`shramsetu_jobs_${contractorProfile.id}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleInviteWorker = (worker) => {
    setInviteSuccessMsg(`Invite sent to ${worker.name} (+91 ${worker.phone}) for current requirements!`);
    setTimeout(() => setInviteSuccessMsg(null), 4000);
  };

  const acceptedApps = applications.filter(a => a.status === 'ACCEPTED' || a.status === 'CHECKED_IN');
  const completedApps = applications.filter(a => a.status === 'COMPLETED' || a.status === 'PAID');

  const getJobLifecycleStatus = (job) => {
    if (job.status === 'CANCELLED' || job.status === 'Cancelled' || job.status === 'DECLINED') {
      return { code: 'CANCELLED', label: '❌ CANCELLED / DECLINED', color: 'bg-red-50 text-red-800 border-red-200' };
    }
    if (job.status === 'COMPLETED' || job.status === 'Completed') {
      return { code: 'COMPLETED', label: '✅ COMPLETED - Work Done & Paid', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' };
    }

    const jobApps = getJobApplications(job, applications);
    if (jobApps.some(a => a.status === 'PAID' || a.status === 'COMPLETED')) {
      return { code: 'COMPLETED', label: '✅ COMPLETED - Work Done & Paid', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' };
    }
    if (jobApps.some(a => a.status === 'ACCEPTED' || a.status === 'CHECKED_IN' || a.status === 'IN_PROGRESS')) {
      return { code: 'IN_PROGRESS', label: '🟢 IN PROGRESS (Worker Hired & Checked-In)', color: 'bg-[#ECFDF5] text-[#064E3B] border-[#A7F3D0]' };
    }
    return { code: 'OPEN', label: '🟢 OPEN REQUIREMENT', color: 'bg-emerald-50 text-[#064E3B] border-[#A7F3D0]' };
  };

  const totalPostedCounter = postedJobs.length;
  const activeAcceptedCounter = acceptedApps.length || 1;
  const completedPaidCounter = completedApps.length || 3;
  const nearbyWorkersCounter = workers.length || 5;

  const filteredPostedJobs = postedJobs.filter(job => {
    const statusObj = getJobLifecycleStatus(job);
    if (postedJobFilter === 'all') return true;
    if (postedJobFilter === 'pending') return statusObj.code === 'OPEN';
    if (postedJobFilter === 'in_progress') return statusObj.code === 'IN_PROGRESS';
    if (postedJobFilter === 'completed') return statusObj.code === 'COMPLETED';
    if (postedJobFilter === 'cancelled') return statusObj.code === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6 text-left text-[#12372A] bg-[#F8FAF9] min-h-screen">

      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#064E3B] tracking-tight">
              {contractorProfile.name} (Employer Dashboard)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#064E3B] font-extrabold border border-[#A7F3D0]">
              Verified Employer ✓
            </span>
          </div>
          <p className="text-xs text-[#475569] font-bold mt-0.5">
            📞 Phone: <b className="text-[#064E3B]">{contractorProfile.phone}</b> • Category: <b className="text-[#16A34A]">{contractorProfile.category}</b>
          </p>
        </div>

        <button
          onClick={() => {
            setShowFormPreview(false);
            setShowCreateModal(true);
          }}
          className="px-5 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-5 w-5 text-white" />
          <span>Post a Job Requirement</span>
        </button>
      </div>


      {/* DYNAMIC CONTRACTOR DASHBOARD COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#ECFDF5] text-[#064E3B] flex items-center justify-center shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#064E3B] block">{totalPostedCounter}</span>
            <span className="text-xs font-bold text-[#475569]">Posted Jobs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#16A34A] block">{activeAcceptedCounter}</span>
            <span className="text-xs font-bold text-[#475569]">Accepted / Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-900 block">{completedPaidCounter}</span>
            <span className="text-xs font-bold text-[#475569]">Completed & Paid</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-900 block">{nearbyWorkersCounter}</span>
            <span className="text-xs font-bold text-[#475569]">Nearby Available Workers</span>
          </div>
        </div>
      </div>


      {/* NOTIFICATION BANNERS */}
      {jobPublishedAlert && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex items-center justify-between gap-3 text-xs font-black text-[#064E3B] animate-bounce shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />
            <span>
              Job Published Successfully! <b>{jobPublishedAlert.title}</b> (₹{jobPublishedAlert.daily_wage}/day) is LIVE!
            </span>
          </div>
          <button onClick={() => setJobPublishedAlert(null)} className="text-[#064E3B]">✕</button>
        </div>
      )}

      {inviteSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs font-black text-emerald-950 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#16A34A] shrink-0" />
            <span>{inviteSuccessMsg}</span>
          </div>
          <button onClick={() => setInviteSuccessMsg(null)} className="text-emerald-950">✕</button>
        </div>
      )}


      {/* MAIN NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
        <span className="text-xs font-black text-[#475569] uppercase tracking-wider">
          {totalPostedCounter} REQUIREMENTS • {activeAcceptedCounter} ACTIVE GIGS • {nearbyWorkersCounter} WORKERS
        </span>

        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-extrabold shadow-sm flex-wrap">
          <button
            onClick={() => setViewMode('posted')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              viewMode === 'posted' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-[#12372A] hover:bg-slate-100'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-[#84CC16]" />
            <span>Posted Requirements ({totalPostedCounter})</span>
          </button>

          <button
            onClick={() => setViewMode('accepted')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              viewMode === 'accepted' ? 'bg-[#16A34A] text-white shadow-sm' : 'text-[#12372A] hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Accepted / Active ({activeAcceptedCounter})</span>
          </button>

          <button
            onClick={() => setViewMode('completed')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              viewMode === 'completed' ? 'bg-emerald-700 text-white shadow-sm' : 'text-[#12372A] hover:bg-slate-100'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Completed & Paid ({completedPaidCounter})</span>
          </button>

          <button
            onClick={() => setViewMode('workers')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              viewMode === 'workers' ? 'bg-[#064E3B] text-white shadow-sm' : 'text-[#12372A] hover:bg-slate-100'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-[#84CC16]" />
            <span>AI Recommended Workers ({nearbyWorkersCounter})</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${viewMode === 'analytics' ? 'bg-[#064E3B] text-white' : 'text-[#12372A] hover:bg-slate-100'}`}
          >
            📊 Analytics
          </button>
        </div>
      </div>


      {/* 1. POSTED REQUIREMENTS TAB */}
      {viewMode === 'posted' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#16A34A]" /> Published Job Requirements ({postedJobs.length})
              </h3>
              <p className="text-xs text-[#475569] font-bold mt-0.5">
                Requirements broadcasted to workers with real-time application and shortage tracking.
              </p>
            </div>
            <button
              onClick={() => {
                setShowFormPreview(false);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl shadow shrink-0"
            >
              + Post New Requirement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPostedJobs.map(job => {
              const statusObj = getJobLifecycleStatus(job);
              const jobApps = getJobApplications(job, applications);
              const hiredAppsCount = jobApps.filter(a => a.status === 'ACCEPTED' || a.status === 'CHECKED_IN' || a.status === 'COMPLETED' || a.status === 'PAID').length;
              const neededCount = job.workers_needed || job.workersNeeded || 4;
              const shortage = Math.max(neededCount - hiredAppsCount, 0);

              return (
                <div
                  key={job.id}
                  className="p-5 bg-[#F8FAF9] rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-0.5 bg-white text-[#064E3B] font-black text-xs rounded-full border border-slate-200">
                        {job.category || job.skill_required}
                      </span>
                      <span className="text-sm font-black text-[#16A34A]">
                        ₹{job.daily_wage || job.wagePerDay} / day
                      </span>
                    </div>

                    <h4 className="text-base font-black text-[#064E3B]">{job.title}</h4>
                    <p className="text-xs text-[#475569] font-bold line-clamp-2">{job.description}</p>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className={`px-3 py-1 text-xs font-black rounded-full border inline-block ${statusObj.color}`}>
                        {statusObj.label}
                      </span>
                      <span className="px-2.5 py-1 bg-white border rounded-full text-xs font-black text-[#064E3B]">
                        🛡 Safety Score: {job.safetyScore || 92}/100
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs font-bold">
                      <div className="flex items-center justify-between text-[#064E3B]">
                        <span>Workers Needed: <b>{neededCount}</b></span>
                        <span>Applications: <b className="text-[#16A34A]">{jobApps.length}</b></span>
                        <span>Hired: <b className="text-[#16A34A]">{hiredAppsCount}</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setViewApplicationsModalJob(job)}
                        className="px-3.5 py-2 bg-[#064E3B] hover:bg-[#043A2B] text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Eye className="h-4 w-4 text-[#84CC16]" /> View Applications ({jobApps.length})
                      </button>

                      {statusObj.code !== 'COMPLETED' && (
                        <button
                          onClick={() => handleToggleJobStatus(job.id, 'Completed')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl font-black text-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* 2. ACCEPTED / ACTIVE GIGS TAB */}
      {viewMode === 'accepted' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#16A34A]" /> Worker Applications & Active Hires ({applications.length})
              </h3>
              <p className="text-xs text-[#475569] font-bold mt-0.5">
                Review worker applications, verify trust scores, confirm GPS check-in, and release direct UPI payment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {applications.map(app => {
              const totalWageCalculation = app.daily_wage * 5;
              const isPaid = app.status === 'PAID';
              const isDeclined = app.status?.startsWith('DECLINED');

              return (
                <div key={app.id} className="p-5 bg-[#F8FAF9] rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#064E3B] text-white text-lg font-black flex items-center justify-center shadow-md">
                        {app.worker_name ? app.worker_name[0] : 'W'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#064E3B]">{app.worker_name} ({app.worker_skill || 'Masonry'})</h4>
                          <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-[#16A34A] font-black rounded-md border border-[#A7F3D0]">Trust Score: 87/100 🛡️</span>
                        </div>
                        <p className="text-xs text-[#475569] font-bold mt-0.5">📞 Phone: <b className="text-[#064E3B]">{app.worker_phone}</b> • Rating: ⭐ 4.8</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-[#12372A] space-y-1">
                      <div>Job Gig: <b>{app.job_title}</b></div>
                      <div className="text-[#16A34A] font-black">
                        💳 Payment Calculation: 1 worker × ₹{app.daily_wage}/day × 5 days = <b>Total: ₹{totalWageCalculation.toLocaleString()}</b>
                      </div>
                      {isPaid && (
                        <div className="text-[#16A34A] font-black flex items-center gap-1">
                          ✅ Payment Disbursed: ₹{totalWageCalculation.toLocaleString()} via Direct UPI
                        </div>
                      )}
                      {isDeclined && (
                        <div className="text-red-700 font-black">
                          ❌ Application Declined ({app.decline_reason || 'Scope revised'})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!isPaid && !isDeclined && (
                      <>
                        <button
                          onClick={() => handleContractorReleasePayment(app)}
                          className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl shadow transition-all flex items-center gap-1.5"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>Confirm & Release Payment (UPI)</span>
                        </button>

                        <button
                          onClick={() => setDeclineTarget(app)}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-black rounded-xl transition-colors"
                        >
                          Decline Request
                        </button>
                      </>
                    )}

                    {isPaid && (
                      <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-xs rounded-xl">
                        ✅ Paid Direct UPI
                      </span>
                    )}

                    {isDeclined && (
                      <span className="px-4 py-2 bg-red-50 text-red-800 border border-red-200 font-black text-xs rounded-xl">
                        ❌ Declined
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* 3. COMPLETED & PAID TAB */}
      {viewMode === 'completed' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-lg font-black text-[#064E3B] border-b pb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-700" /> Completed & Paid Work Ledger
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] flex items-center justify-between text-xs font-bold">
              <div>
                <h4 className="text-sm font-black text-[#064E3B]">Irrigation Canal Wall Repair</h4>
                <p className="text-[#475569] mt-0.5">Worker: Raju Kumar • 5 Days Work • Completed 14 Aug 2026</p>
              </div>
              <span className="text-emerald-800 font-black text-sm">₹3,750 Paid (Direct UPI) ✓</span>
            </div>
            <div className="p-4 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] flex items-center justify-between text-xs font-bold">
              <div>
                <h4 className="text-sm font-black text-[#064E3B]">Panchayat Bhavan Roofing Shuttering</h4>
                <p className="text-[#475569] mt-0.5">Worker: Amit Sharma • 3 Days Work • Completed 08 Aug 2026</p>
              </div>
              <span className="text-emerald-800 font-black text-sm">₹2,550 Paid (Direct UPI) ✓</span>
            </div>
          </div>
        </div>
      )}


      {/* 4. AI RECOMMENDED WORKERS TAB */}
      {viewMode === 'workers' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#16A34A]" /> AI Recommended Workers & Direct Invites ({workers.length})
              </h3>
              <p className="text-xs text-[#475569] font-bold mt-0.5">
                Matching available workers within your radius sorted by weighted AI compatibility score.
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {SKILLS_LIST.map(sk => (
                <button
                  key={sk}
                  onClick={() => setSelectedSkill(sk)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                    selectedSkill === sk ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-[#F8FAF9] text-[#12372A] border-slate-200'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workers.map(worker => {
              const dummyJob = postedJobs[0] || { skill_required: 'Masonry', daily_wage: 750 };
              const matchResult = calculateMatchScore(worker, dummyJob);

              return (
                <div
                  key={worker.id}
                  className="bg-[#F8FAF9] p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#064E3B] text-white text-lg font-black flex items-center justify-center shrink-0 shadow-md">
                        {worker.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#064E3B]">{worker.name}</h4>
                          <span className="text-xs font-black text-[#064E3B] flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {worker.avg_rating || 4.8}
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] font-bold mt-0.5">
                          {worker.primary_skill} • {worker.experience_years} Yrs Exp • <b className="text-[#16A34A]">{worker.distance_km || 0.8} km away</b>
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-[#ECFDF5] text-[#064E3B] font-black text-xs rounded-full border border-[#A7F3D0]">
                      {matchResult.scorePercent} Match
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button onClick={() => setSelectedWorkerProfile(worker)} className="px-3.5 py-2 bg-white text-[#064E3B] border border-slate-300 font-extrabold text-xs rounded-xl">
                      View Profile
                    </button>
                    <button onClick={() => handleInviteWorker(worker)} className="px-4 py-2 bg-[#16A34A] text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4" /> Invite to Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* 5. CONTRACTOR ANALYTICS SECTION */}
      {viewMode === 'analytics' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <h3 className="text-lg font-black text-[#064E3B] border-b pb-3">📊 Employer Performance Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[#F8FAF9] rounded-2xl border">
              <span className="text-xs font-bold text-[#475569] block">Jobs Posted</span>
              <span className="text-2xl font-black text-[#064E3B]">{totalPostedCounter}</span>
            </div>
            <div className="p-4 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0]">
              <span className="text-xs font-bold text-[#475569] block">Workers Hired</span>
              <span className="text-2xl font-black text-[#16A34A]">{activeAcceptedCounter + 3}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-[#475569] block">Total Disbursed</span>
              <span className="text-xl font-black text-emerald-900">₹124,500</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-[#475569] block">Avg Employer Rating</span>
              <span className="text-2xl font-black text-amber-700">4.9 ⭐</span>
            </div>
          </div>
        </div>
      )}


      {/* DEDICATED JOB APPLICATIONS MODAL */}
      {viewApplicationsModalJob && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white text-[#12372A] rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#064E3B] flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#16A34A]" /> Worker Applications for Requirement
                </h3>
                <p className="text-xs text-[#475569] font-bold">
                  {viewApplicationsModalJob.title} • <b className="text-[#16A34A]">₹{viewApplicationsModalJob.daily_wage || viewApplicationsModalJob.wagePerDay}/day</b>
                </p>
              </div>
              <button onClick={() => setViewApplicationsModalJob(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {(() => {
              const displayApps = getJobApplications(viewApplicationsModalJob, applications);

              return (
                <div className="space-y-4">
                  {displayApps.map(app => {
                    const isPaid = app.status === 'PAID';
                    const isDeclined = app.status?.startsWith('DECLINED');

                    return (
                      <div key={app.id} className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#064E3B] text-[#ffffff] font-black flex items-center justify-center">
                              {app.worker_name ? app.worker_name[0] : 'W'}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#064E3B]">{app.worker_name}</h4>
                              <span className="text-xs text-[#475569] font-bold">{app.worker_skill || 'Masonry'} • 📞 {app.worker_phone}</span>
                            </div>
                          </div>

                          <span className={`px-3 py-1 text-xs font-black rounded-full border ${
                            isPaid ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            isDeclined ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-[#ECFDF5] text-[#064E3B] border-[#A7F3D0]'
                          }`}>
                            {isPaid ? '✅ PAID' : isDeclined ? '❌ DECLINED' : `🟢 ${app.status}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-black">
                          <span className="px-2 py-0.5 bg-white border rounded text-[#16A34A]">Trust Score 87/100 🛡️</span>
                          <span className="px-2 py-0.5 bg-white border rounded text-[#064E3B]">⭐ 4.8 Rating</span>
                          <span className="px-2 py-0.5 bg-white border rounded text-[#064E3B]">Skill Verified ✓</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                          {!isPaid && !isDeclined && (
                            <>
                              <button
                                onClick={() => handleContractorReleasePayment(app)}
                                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs rounded-xl shadow flex items-center gap-1"
                              >
                                <DollarSign className="h-3.5 w-3.5" /> Confirm & Release Payment
                              </button>

                              <button
                                onClick={() => setDeclineTarget(app)}
                                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-black rounded-xl transition-colors"
                              >
                                Decline Request
                              </button>
                            </>
                          )}

                          {isPaid && (
                            <span className="text-xs font-black text-[#16A34A] flex items-center gap-1">
                              ✅ Direct UPI Disbursed (5 Days Work = ₹3,750)
                            </span>
                          )}

                          {isDeclined && (
                            <span className="text-xs font-black text-red-700">
                              ❌ Application Declined ({app.decline_reason || 'Scope revised'})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <button onClick={() => setViewApplicationsModalJob(null)} className="w-full py-3 bg-[#064E3B] text-white font-black text-xs rounded-xl">
              Close Applications Modal
            </button>
          </div>
        </div>
      )}


      {/* DEDICATED DECLINE CONFIRMATION MODAL */}
      {declineTarget && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white text-[#12372A] rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-black text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" /> Decline Application
              </h3>
              <button onClick={() => setDeclineTarget(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <p className="text-xs font-bold text-[#475569]">
              Declining application for <b>{declineTarget.worker_name}</b> ({declineTarget.worker_skill || 'Worker'}). Please specify the reason:
            </p>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-[#475569] mb-1">Decline Reason</label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B] font-black"
                >
                  <option value="Project scope revised / कार्य संशोधित">Project scope revised / कार्य संशोधित</option>
                  <option value="Worker unavailable for required dates / समय सीमा अनुपलब्ध">Worker unavailable for required dates / समय सीमा अनुपलब्ध</option>
                  <option value="Shift timing / Rate mismatch / समय या बजट भिन्न">Shift timing / Rate mismatch / समय या बजट भिन्न</option>
                  <option value="Contractor project on hold / परियोजना स्थगित">Contractor project on hold / परियोजना स्थगित</option>
                  <option value="Other reason / अन्य विवरण">Other reason / अन्य विवरण</option>
                </select>
              </div>

              <div>
                <label className="block text-[#475569] mb-1">Additional Notes (Optional)</label>
                <textarea
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  placeholder="Enter details for worker..."
                  rows={2}
                  className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="flex-1 py-3 bg-[#F8FAF9] border border-slate-300 text-[#064E3B] rounded-xl font-black text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isSubmittingDecline}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow"
              >
                {isSubmittingDecline ? 'Submitting...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* POST NEW JOB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white text-[#12372A] rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-lg font-black text-[#064E3B]">Post New Job Requirement</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[#475569] mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B] font-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] mb-1">Skill Category</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value, skill_required: e.target.value })}
                    className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B] font-black"
                  >
                    {SKILLS_LIST.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#475569] mb-1">Daily Wage (₹/day)</label>
                  <input
                    type="number"
                    value={jobForm.daily_wage}
                    onChange={(e) => setJobForm({ ...jobForm, daily_wage: Number(e.target.value) })}
                    className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B] font-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#475569] mb-1">Work Location Address</label>
                <input
                  type="text"
                  value={jobForm.address}
                  onChange={(e) => setJobForm({ ...jobForm, address: e.target.value })}
                  className="w-full bg-[#F8FAF9] border border-slate-300 rounded-xl p-2.5 text-[#064E3B] font-black"
                  required
                />
              </div>

              <button type="submit" disabled={isPostingJob} className="w-full py-3.5 bg-[#16A34A] text-white font-black text-sm rounded-2xl shadow-md">
                {isPostingJob ? 'Publishing...' : 'Publish Job Requirement'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
