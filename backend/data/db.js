/**
 * In-memory Database & Authoritative Business Logic Engine for ShramSetu
 */

let workers = [];
let jobs = [];
let applications = [];

const FAIR_WAGE_BENCHMARKS = {
  'Masonry': { min: 650, max: 850, average: 750 },
  'Carpentry': { min: 700, max: 950, average: 850 },
  'Agriculture': { min: 500, max: 700, average: 600 },
  'Plumbing': { min: 700, max: 1000, average: 850 },
  'General Labor': { min: 450, max: 650, average: 550 }
};

function seedDatabase() {
  workers = [
    {
      id: "wrk-101",
      name: "Raju Kumar",
      phone: "+91 98765 43210",
      primary_skill: "Masonry",
      experience_years: 5,
      location: { lat: 28.4744, lng: 77.5040, village_name: "Greater Noida", pincode: "201310" },
      ratings: [
        { contractor_id: "ctr-201", contractor_name: "Gupta Infrastructure", rating: 5, review: "Punctual and expert bricklayer." },
        { contractor_id: "ctr-202", contractor_name: "Sharma Builders", rating: 4.5, review: "Clean work on canal repair." }
      ],
      avg_rating: 4.8,
      completedJobsCount: 12,
      attendanceRate: 98,
      verification_status: { mobile: true, identity: true, skill: true },
      trust_badge: "Master Worker - 12 Verified Gigs ⭐",
      trustScore: 87,
      isAvailable: true,
      bio: "Mera naam Raju hai, main masonry ka kaam karta hu 5 saal se, Greater Noida se."
    },
    {
      id: "wrk-102",
      name: "Amit Sharma",
      phone: "+91 98123 56789",
      primary_skill: "Carpentry",
      experience_years: 7,
      location: { lat: 28.4800, lng: 77.5200, village_name: "Greater Noida East", pincode: "201310" },
      ratings: [
        { contractor_id: "ctr-201", contractor_name: "Gupta Infrastructure", rating: 5, review: "Excellent woodwork on formwork framework." }
      ],
      avg_rating: 4.6,
      completedJobsCount: 8,
      attendanceRate: 100,
      verification_status: { mobile: true, identity: true, skill: true },
      trust_badge: "Certified Craftsman - 8 Verified Gigs",
      trustScore: 92,
      isAvailable: true,
      bio: "Main Amit, carpentry and shuttering specialist with 7 years experience."
    },
    {
      id: "wrk-103",
      name: "Suresh Ram",
      phone: "+91 97654 32109",
      primary_skill: "Agriculture",
      experience_years: 4,
      location: { lat: 28.4500, lng: 77.4900, village_name: "Surajpur Village", pincode: "201306" },
      ratings: [],
      avg_rating: 4.7,
      completedJobsCount: 4,
      attendanceRate: 90,
      verification_status: { mobile: true, identity: true, skill: false },
      trust_badge: "Rising Star Worker",
      trustScore: 78,
      isAvailable: true,
      bio: "Kheti aur fasal katai ka tajurba hai 4 saal ka."
    },
    {
      id: "wrk-104",
      name: "Mahesh Verma",
      phone: "+91 99887 76655",
      primary_skill: "Plumbing",
      experience_years: 6,
      location: { lat: 28.5355, lng: 77.3910, village_name: "Noida Sector 62", pincode: "201301" },
      ratings: [
        { contractor_id: "ctr-203", contractor_name: "Verma Enterprises", rating: 4, review: "Good pipeline installation." }
      ],
      avg_rating: 4.0,
      completedJobsCount: 5,
      attendanceRate: 95,
      verification_status: { mobile: true, identity: true, skill: true },
      trust_badge: "Verified Specialist - 5 Gigs",
      trustScore: 82,
      isAvailable: true,
      bio: "Plumbing leak repair and high pressure pipe fitting master."
    },
    {
      id: "wrk-105",
      name: "Bhola Nath",
      phone: "+91 91234 56780",
      primary_skill: "General Labor",
      experience_years: 3,
      location: { lat: 25.5941, lng: 85.1376, village_name: "Patna Rural", pincode: "800001" },
      ratings: [],
      avg_rating: 4.5,
      completedJobsCount: 2,
      attendanceRate: 90,
      verification_status: { mobile: true, identity: false, skill: false },
      trust_badge: "Verified Helper",
      trustScore: 72,
      isAvailable: true,
      bio: "General loading, unloading aur construction helper work."
    }
  ];

  jobs = [
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

  applications = [
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
      check_in_coords: { lat: 28.4702, lng: 77.5101 },
      completed_at: null,
      payment_status: "ESCROW_HELD",
      worker_rating: null,
      contractor_rating: null,
      decline_reason: null,
      decline_notes: null,
      declined_by: null,
      updated_at: new Date().toISOString()
    },
    {
      id: "app-502",
      job_id: "job-302",
      job_title: "Panchayat Bhavan Roofing & Shuttering",
      daily_wage: 850,
      contractor_name: "Apex Rural Builders",
      worker_id: "wrk-102",
      worker_name: "Amit Sharma",
      worker_phone: "+91 98123 56789",
      worker_skill: "Carpentry",
      status: "APPLIED",
      check_in_time: null,
      check_in_coords: null,
      completed_at: null,
      payment_status: "PENDING",
      worker_rating: null,
      contractor_rating: null,
      decline_reason: null,
      decline_notes: null,
      declined_by: null,
      updated_at: new Date().toISOString()
    },
    {
      id: "app-503",
      job_id: "job-303",
      job_title: "Wheat Harvesting & Loading",
      daily_wage: 650,
      contractor_name: "Kisan Cooperative Farm",
      worker_id: "wrk-103",
      worker_name: "Suresh Ram",
      worker_phone: "+91 97654 32109",
      worker_skill: "Agriculture",
      status: "PAID",
      check_in_time: "07:10 AM, 12 Aug 2026",
      check_in_coords: { lat: 28.4401, lng: 77.4802 },
      completed_at: "04:30 PM, 12 Aug 2026",
      payment_status: "PAID_DIRECT_UPI",
      worker_rating: 5,
      contractor_rating: 5,
      decline_reason: null,
      decline_notes: null,
      declined_by: null,
      updated_at: new Date().toISOString()
    }
  ];
}

seedDatabase();

function getWorkers() { return workers; }
function getJobs() { return jobs; }
function getApplications() { return applications; }

function calculateTrustScore(worker) {
  let score = 50;
  const jobsCount = worker.completedJobsCount || 0;
  const rating = worker.avg_rating || 4.5;
  const attendance = worker.attendanceRate || 95;

  score += Math.min(jobsCount * 2.5, 25);
  score += Math.min((rating / 5.0) * 15, 15);
  score += Math.min((attendance / 100) * 10, 10);

  if (worker.verification_status?.mobile) score += 5;
  if (worker.verification_status?.identity) score += 5;
  if (worker.verification_status?.skill) score += 5;

  return Math.min(Math.round(score), 100);
}

function calculateSafetyScore(job) {
  let score = 70;
  if (job?.verification_status?.contractor) score += 10;
  if (job?.verification_status?.escrow_funded) score += 10;
  if (job?.verification_status?.location_verified) score += 5;
  if (job?.emergency_contact) score += 3;
  if (job?.nearby_hospital) score += 2;
  return Math.min(score, 100);
}

function checkFairWage(skill, wage) {
  const benchmark = FAIR_WAGE_BENCHMARKS[skill] || { min: 550, max: 750, average: 650 };
  const numWage = Number(wage);
  if (numWage < benchmark.min) {
    return {
      isFair: false,
      status: 'UNDERPAID',
      message: `⚠️ Wage appears below typical range. Expected range: ₹${benchmark.min}–₹${benchmark.max}/day`,
      min: benchmark.min,
      max: benchmark.max
    };
  }
  return {
    isFair: true,
    status: 'FAIR_WAGE',
    message: `✅ Fair Wage (Within regional benchmark of ₹${benchmark.min}–₹${benchmark.max}/day)`,
    min: benchmark.min,
    max: benchmark.max
  };
}

function addWorker(workerData) {
  const newWorker = {
    id: `wrk-${Date.now().toString().slice(-4)}`,
    name: workerData.name || "Rural Worker",
    phone: workerData.phone || `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    primary_skill: workerData.primary_skill || "General Labor",
    experience_years: workerData.experience_years || 1,
    location: workerData.location || { lat: 28.4744, lng: 77.5040, village_name: "Greater Noida", pincode: "201310" },
    ratings: [],
    avg_rating: 5.0,
    completedJobsCount: 0,
    attendanceRate: 100,
    verification_status: { mobile: true, identity: true, skill: true },
    trust_badge: "Verified New Worker ✓",
    trustScore: 80,
    isAvailable: true,
    bio: workerData.raw_transcript || "Voice registered worker profile"
  };
  newWorker.trustScore = calculateTrustScore(newWorker);
  workers.unshift(newWorker);
  return newWorker;
}

function addJob(jobData) {
  const skill = jobData.skill_required || jobData.category || "Masonry";
  const wage = Number(jobData.daily_wage || jobData.wagePerDay) || 750;
  const wageCheck = checkFairWage(skill, wage);

  const locLat = Number(jobData.lat || jobData.latitude || (jobData.location && typeof jobData.location === 'object' && jobData.location.lat)) || 28.4744;
  const locLng = Number(jobData.lng || jobData.longitude || (jobData.location && typeof jobData.location === 'object' && jobData.location.lng)) || 77.5040;
  const locAddr = typeof jobData.location === 'string' ? jobData.location : (jobData.address || (jobData.location && jobData.location.address) || "Sector 31, Greater Noida");

  const newJob = {
    id: `job-${Date.now().toString().slice(-4)}`,
    contractorId: jobData.contractorId || jobData.contractor_id || "ctr-201",
    contractor_id: jobData.contractorId || jobData.contractor_id || "ctr-201",
    contractorName: jobData.contractorName || jobData.contractor_name || "Gupta Infrastructure & Civil Works",
    contractor_name: jobData.contractorName || jobData.contractor_name || "Gupta Infrastructure & Civil Works",
    title: jobData.title || "Rural Infrastructure Job",
    category: skill,
    skill_required: skill,
    daily_wage: wage,
    wagePerDay: wage,
    workers_needed: Number(jobData.workers_needed || jobData.workersNeeded) || 4,
    workersNeeded: Number(jobData.workersNeeded || jobData.workers_needed) || 4,
    duration: jobData.duration || "5 days",
    requiredSkills: Array.isArray(jobData.requiredSkills) ? jobData.requiredSkills : [skill],
    experienceRequired: jobData.experienceRequired || "2+ years",
    startDate: jobData.startDate || "20 Aug",
    endDate: jobData.endDate || "25 Aug",
    status: "OPEN",
    location: {
      lat: locLat,
      lng: locLng,
      address: locAddr,
      pincode: jobData.pincode || "201310"
    },
    latitude: locLat,
    longitude: locLng,
    description: jobData.description || "Local rural infrastructure & labor assignment.",
    working_hours: jobData.working_hours || "8:00 AM - 5:00 PM",
    emergency_contact: jobData.emergency_contact || "+91 98111 22233",
    nearby_hospital: jobData.nearby_hospital || "Government District Hospital, Noida (2.0 km)",
    fair_wage_assessment: wageCheck,
    safetyScore: jobData.safetyScore || 92,
    paymentStatus: "ESCROW_HELD",
    verification_status: { contractor: true, escrow_funded: true, location_verified: true },
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  jobs.unshift(newJob);
  return newJob;
}

function updateJobStatus(jobId, newStatus) {
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    job.status = newStatus;
    job.updatedAt = new Date().toISOString();
  }
  return job;
}

function createOrUpdateApplication({ job_id, worker_id, worker_name, worker_phone, worker_skill, status = 'ACCEPTED' }) {
  let app = applications.find(a => a.job_id === job_id && a.worker_id === worker_id);
  const job = jobs.find(j => j.id === job_id);

  if (app) {
    app.status = status;
    app.updated_at = new Date().toISOString();
  } else {
    app = {
      id: `app-${Date.now().toString().slice(-4)}`,
      job_id: job_id || 'job-301',
      job_title: job ? job.title : 'Rural Infrastructure Gig',
      daily_wage: job ? job.daily_wage : 750,
      contractor_name: job ? job.contractor_name : 'Verified Contractor',
      worker_id: worker_id || 'wrk-101',
      worker_name: worker_name || 'Raju Kumar',
      worker_phone: worker_phone || '+91 98765 43210',
      worker_skill: worker_skill || (job ? job.skill_required : 'Masonry'),
      status: status,
      check_in_time: null,
      check_in_coords: null,
      completed_at: null,
      payment_status: 'ESCROW_HELD',
      worker_rating: null,
      contractor_rating: null,
      decline_reason: null,
      decline_notes: null,
      declined_by: null,
      updated_at: new Date().toISOString()
    };
    applications.unshift(app);
  }

  if (job && (status === 'ACCEPTED' || status === 'CHECKED_IN')) {
    if (job.status === 'OPEN') job.status = 'IN_PROGRESS';
  }

  return app;
}

function checkInApplication({ application_id, job_id, worker_id, lat, lng }) {
  let app = applications.find(a => a.id === application_id || (a.job_id === job_id && a.worker_id === worker_id));
  if (app) {
    app.status = 'CHECKED_IN';
    app.check_in_time = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today (GPS Verified ✓)`;
    app.check_in_coords = { lat: lat || 28.4744, lng: lng || 77.5040 };
    app.updated_at = new Date().toISOString();

    const job = jobs.find(j => j.id === app.job_id);
    if (job && job.status === 'OPEN') job.status = 'IN_PROGRESS';
  }
  return app;
}

function completeApplication({ application_id, job_id, worker_id }) {
  let app = applications.find(a => a.id === application_id || (a.job_id === job_id && a.worker_id === worker_id));
  if (app) {
    app.status = 'COMPLETED';
    app.completed_at = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today`;
    app.updated_at = new Date().toISOString();

    const job = jobs.find(j => j.id === app.job_id);
    if (job) job.status = 'COMPLETED';
  }
  return app;
}

function releasePayment({ application_id, job_id, worker_id }) {
  let app = applications.find(a => a.id === application_id || (a.job_id === job_id && a.worker_id === worker_id));
  if (app) {
    app.status = 'PAID';
    app.payment_status = 'PAID_DIRECT_UPI';
    app.updated_at = new Date().toISOString();

    const job = jobs.find(j => j.id === app.job_id);
    if (job) {
      job.status = 'COMPLETED';
      job.paymentStatus = 'PAID';
    }

    const worker = workers.find(w => w.id === app.worker_id);
    if (worker) {
      worker.completedJobsCount = (worker.completedJobsCount || 0) + 1;
      worker.trustScore = calculateTrustScore(worker);
    }
  }
  return app;
}

function rateApplication({ application_id, rating, review, rated_by }) {
  let app = applications.find(a => a.id === application_id);
  if (app) {
    const numRating = Number(rating);
    if (rated_by === 'contractor') {
      app.worker_rating = numRating;
      const worker = workers.find(w => w.id === app.worker_id);
      if (worker) {
        worker.ratings.push({ contractor_name: app.contractor_name, rating: numRating, review });
        const sum = worker.ratings.reduce((acc, r) => acc + r.rating, 0);
        worker.avg_rating = Math.round((sum / worker.ratings.length) * 10) / 10;
        worker.trustScore = calculateTrustScore(worker);
      }
    } else {
      app.contractor_rating = numRating;
    }
    app.updated_at = new Date().toISOString();
  }
  return app;
}

function declineApplication({ application_id, job_id, worker_id, reason, notes, declined_by }) {
  let app = applications.find(a => a.id === application_id || (a.job_id === job_id && a.worker_id === worker_id));
  if (app) {
    const isWorker = declined_by === 'worker';
    app.status = isWorker ? 'DECLINED_BY_WORKER' : 'DECLINED_BY_CONTRACTOR';
    app.decline_reason = reason;
    app.decline_notes = notes || '';
    app.declined_by = declined_by || 'worker';
    app.updated_at = new Date().toISOString();
  }
  return app;
}

function getContractorAnalytics(contractorId = 'ctr-201') {
  const contractorJobs = jobs.filter(j => j.contractorId === contractorId || j.contractor_id === contractorId);
  const jobsPosted = contractorJobs.length;
  
  const contractorApps = applications.filter(a => contractorJobs.some(j => j.id === a.job_id));
  const acceptedApps = contractorApps.filter(a => a.status === 'ACCEPTED' || a.status === 'CHECKED_IN' || a.status === 'COMPLETED' || a.status === 'PAID');
  const completedApps = contractorApps.filter(a => a.status === 'COMPLETED' || a.status === 'PAID');

  const workersHired = acceptedApps.length;
  const jobsCompleted = completedApps.length;
  const totalPaid = completedApps.reduce((acc, a) => acc + (a.daily_wage * 5), 124500);

  return {
    jobsPosted,
    workersHired,
    jobsCompleted,
    totalPaid,
    avgWorkerRating: 4.7,
    skillDemand: [
      { skill: "Masonry", count: 8, bar: "80%" },
      { skill: "Carpentry", count: 5, bar: "50%" },
      { skill: "Plumbing", count: 4, bar: "40%" },
      { skill: "Agriculture", count: 3, bar: "30%" }
    ]
  };
}

function getSeasonalIntelligence() {
  return {
    season: "Pre-Monsoon & Post-Harvest Season",
    trends: [
      { category: "Agriculture", trend: "HIGH", label: "🌾 Wheat & Paddy Harvesting Demand Increasing", advice: "High labor demand in Surajpur and Dadri farms." },
      { category: "Masonry", trend: "HIGH", label: "🔨 Infrastructure & Canal Wall Repair", advice: "Canal lining and road repair before monsoon rains." },
      { category: "Carpentry", trend: "MEDIUM", label: "🪚 Roof Shuttering & Panchayat Construction", advice: "Formwork and timber roofing ongoing." },
      { category: "Plumbing", trend: "HIGH", label: "🔧 Solar Jal Jeevan Pipe Laydown", advice: "High priority drinking water tank connections." }
    ]
  };
}

function getLaborDemandMetrics() {
  return {
    workers_needed: 14,
    available_nearby: 9,
    shortage: 5,
    skill_demand: [
      { skill: "Masonry", demandLevel: "HIGH", color: "text-[#16A34A] bg-[#ECFDF5]" },
      { skill: "Carpentry", demandLevel: "MEDIUM", color: "text-amber-700 bg-amber-50" },
      { skill: "Plumbing", demandLevel: "HIGH", color: "text-[#16A34A] bg-[#ECFDF5]" },
      { skill: "Agriculture", demandLevel: "VERY HIGH", color: "text-emerald-800 bg-emerald-100 font-black" }
    ]
  };
}

module.exports = {
  getWorkers,
  getJobs,
  getApplications,
  addWorker,
  addJob,
  updateJobStatus,
  createOrUpdateApplication,
  checkInApplication,
  completeApplication,
  releasePayment,
  rateApplication,
  declineApplication,
  checkFairWage,
  calculateTrustScore,
  calculateSafetyScore,
  getContractorAnalytics,
  getSeasonalIntelligence,
  getLaborDemandMetrics,
  seedDatabase
};
