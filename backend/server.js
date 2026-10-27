const express = require('express');
const cors = require('cors');
const { calculateDistance } = require('./utils/distance');
const { parseVoiceToProfile } = require('./utils/nlpParser');
const { 
  getWorkers, getJobs, getApplications, addWorker, addJob, 
  createOrUpdateApplication, checkInApplication, completeApplication, releasePayment, rateApplication, declineApplication, 
  checkFairWage, calculateTrustScore, calculateSafetyScore, getContractorAnalytics, getSeasonalIntelligence, getLaborDemandMetrics, seedDatabase 
} = require('./data/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ShramSetu Backend API', timestamp: new Date().toISOString() });
});

// Dynamic AI Match Score Calculator Helper
function computeDynamicMatch(worker, job) {
  let skillMatch = 0;
  const workerSkill = (worker?.primary_skill || 'Masonry').toLowerCase();
  const jobSkill = (job?.skill_required || job?.category || 'Masonry').toLowerCase();

  if (workerSkill === jobSkill) skillMatch = 100;
  else if (workerSkill.includes(jobSkill) || jobSkill.includes(workerSkill)) skillMatch = 85;
  else if (workerSkill.includes('labor') || jobSkill.includes('labor')) skillMatch = 70;
  else skillMatch = 30;

  const wLat = worker?.location?.lat || 28.4744;
  const wLng = worker?.location?.lng || 77.5040;
  const jLat = (job?.location && typeof job.location === 'object' && job.location.lat) ? Number(job.location.lat) : (Number(job?.latitude) || 28.4744);
  const jLng = (job?.location && typeof job.location === 'object' && job.location.lng) ? Number(job.location.lng) : (Number(job?.longitude) || 77.5040);

  const dist = calculateDistance(wLat, wLng, jLat, jLng);
  let distanceScore = 100;
  if (dist <= 2) distanceScore = 100;
  else if (dist <= 5) distanceScore = 90;
  else if (dist <= 15) distanceScore = 75;
  else if (dist <= 25) distanceScore = 60;
  else distanceScore = 40;

  const expectedMinWage = 600;
  const wageRatio = Math.min((job?.daily_wage || 600) / expectedMinWage, 1.2);
  const wageMatch = Math.min(Math.round(wageRatio * 90), 100);

  const availScore = worker?.isAvailable !== false ? 100 : 50;
  const reqYears = 3;
  const expScore = Math.min(Math.round(((worker?.experience_years || 1) / reqYears) * 85 + 15), 100);

  const totalScore = Math.round(
    skillMatch * 0.35 +
    distanceScore * 0.20 +
    wageMatch * 0.15 +
    availScore * 0.15 +
    expScore * 0.15
  );

  return {
    matchScore: `${totalScore}%`,
    matchScoreNum: totalScore,
    breakdown: {
      skillMatch: `${skillMatch}%`,
      distanceScore: `${distanceScore}%`,
      wageMatch: `${wageMatch}%`,
      availScore: `${availScore}%`,
      expScore: `${expScore}%`
    }
  };
}

// 1. Voice Worker Registration API
app.post('/api/worker/register-voice', (req, res) => {
  try {
    const { transcript, phone } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text or speech transcript required.' });
    }

    const structuredProfile = parseVoiceToProfile(transcript);
    if (phone) structuredProfile.phone = phone;

    const newWorker = addWorker(structuredProfile);
    res.json({
      success: true,
      message: 'Worker voice profile created successfully',
      extracted_data: structuredProfile,
      worker: newWorker
    });
  } catch (err) {
    console.error('Error in voice registration:', err);
    res.status(500).json({ error: 'Failed to process voice registration.' });
  }
});

// Auth / Profile Registration API
app.post('/api/auth/register', (req, res) => {
  try {
    const { role, name, phone, skill, experience_years, location } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required.' });
    }

    const loc = location || { lat: 28.4744, lng: 77.5040, pincode: '201310', village_name: 'Greater Noida' };
    const userRole = role === 'contractor' ? 'contractor' : 'worker';

    if (userRole === 'worker') {
      const newWorker = addWorker({
        name,
        phone,
        primary_skill: skill || 'General Labor',
        experience_years: Number(experience_years) || 1,
        location: {
          lat: loc.lat || 28.4744,
          lng: loc.lng || 77.5040,
          village_name: loc.district || loc.village_name || 'Greater Noida',
          pincode: loc.pincode || '201310'
        },
        raw_transcript: `Registered worker profile for ${name}`
      });

      return res.json({
        success: true,
        message: 'Worker registered successfully',
        user: newWorker,
        token: `jwt_simulated_${Date.now()}`
      });
    } else {
      const newContractor = {
        id: `ctr-${Date.now().toString().slice(-4)}`,
        name,
        phone,
        category: skill || 'Private Construction Contractor',
        location: {
          lat: loc.lat || 28.4744,
          lng: loc.lng || 77.5040,
          district: loc.district || 'Greater Noida',
          pincode: loc.pincode || '201310'
        },
        created_at: new Date().toISOString()
      };

      return res.json({
        success: true,
        message: 'Contractor registered successfully',
        user: newContractor,
        token: `jwt_simulated_${Date.now()}`
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});

// Auth Login API
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const userRole = role === 'contractor' ? 'contractor' : 'worker';
    if (userRole === 'worker') {
      const existingWorker = getWorkers().find(w => w.phone === phone) || getWorkers()[0];
      return res.json({
        success: true,
        message: 'Worker logged in successfully',
        user: existingWorker,
        token: `jwt_simulated_${Date.now()}`
      });
    } else {
      const contractor = {
        id: "ctr-201",
        name: "Gupta Infrastructure & Civil Works",
        phone: phone || "+91 98111 22233",
        category: "Private Construction Contractor",
        location: { lat: 28.4744, lng: 77.5040, district: "Greater Noida", pincode: "201310" }
      };
      return res.json({
        success: true,
        message: 'Contractor logged in successfully',
        user: contractor,
        token: `jwt_simulated_${Date.now()}`
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to process login.' });
  }
});

// 2. Fetch All Jobs API
app.get('/api/jobs', (req, res) => {
  try {
    const contractorId = req.query.contractor_id;
    let allJobs = getJobs().map(j => {
      const jLat = (j?.location && typeof j.location === 'object' && j.location.lat) ? Number(j.location.lat) : (Number(j?.latitude) || 28.4744);
      const jLng = (j?.location && typeof j.location === 'object' && j.location.lng) ? Number(j.location.lng) : (Number(j?.longitude) || 77.5040);
      const dist = calculateDistance(28.4744, 77.5040, jLat, jLng);
      const addr = typeof j.location === 'string' ? j.location : (j.location?.address || j.address || "Sector 31, Greater Noida");
      return {
        ...j,
        distance_km: dist,
        location: {
          lat: jLat,
          lng: jLng,
          address: addr,
          pincode: j.pincode || j.location?.pincode || "201310"
        }
      };
    });

    if (contractorId) {
      allJobs = allJobs.filter(j => j.contractorId === contractorId || j.contractor_id === contractorId);
    }
    res.json({ success: true, count: allJobs.length, jobs: allJobs });
  } catch (err) {
    console.error('Error fetching all jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// 3. Nearby Jobs API for Workers with Dynamic Match Score
app.get('/api/worker/jobs-nearby', (req, res) => {
  try {
    const workerLat = parseFloat(req.query.lat) || 28.4744;
    const workerLng = parseFloat(req.query.lng) || 77.5040;
    const radiusKm = parseFloat(req.query.radius_km) || 25.0;
    const filterSkill = req.query.skill;

    const workerObj = {
      primary_skill: filterSkill && filterSkill !== 'All' ? filterSkill : 'Masonry',
      experience_years: 5,
      location: { lat: workerLat, lng: workerLng },
      isAvailable: true
    };

    const allJobs = getJobs();
    const nearbyJobs = allJobs
      .map(job => {
        const jLat = (job?.location && typeof job.location === 'object' && job.location.lat) ? Number(job.location.lat) : (Number(job?.latitude) || 28.4744);
        const jLng = (job?.location && typeof job.location === 'object' && job.location.lng) ? Number(job.location.lng) : (Number(job?.longitude) || 77.5040);
        const dist = calculateDistance(workerLat, workerLng, jLat, jLng);
        const matchData = computeDynamicMatch(workerObj, job);
        const fairWage = checkFairWage(job.skill_required || job.category, job.daily_wage || job.wagePerDay);
        const safetyScore = calculateSafetyScore(job);

        return { 
          ...job, 
          distance_km: dist,
          matchScore: matchData.matchScore,
          matchBreakdown: matchData.breakdown,
          fairWageAssessment: fairWage,
          safetyScore: safetyScore
        };
      })
      .filter(job => {
        const withinDistance = job.distance_km <= radiusKm;
        const matchesSkill = !filterSkill || filterSkill === 'All' || (job.skill_required || job.category || '').toLowerCase() === filterSkill.toLowerCase();
        return withinDistance && matchesSkill;
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      count: nearbyJobs.length,
      radius_km: radiusKm,
      worker_location: { lat: workerLat, lng: workerLng },
      jobs: nearbyJobs
    });
  } catch (err) {
    console.error('Error fetching nearby jobs:', err);
    res.status(500).json({ error: 'Failed to fetch nearby jobs.' });
  }
});

// 4. Workers Discovery API for Contractors
app.get('/api/workers', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.4744;
    const lng = parseFloat(req.query.lng) || 77.5040;
    const radiusKm = parseFloat(req.query.radius_km) || 30.0;
    const skill = req.query.skill;

    const allWorkers = getWorkers();
    const result = allWorkers
      .map(worker => {
        const dist = calculateDistance(lat, lng, worker.location.lat, worker.location.lng);
        const trustScore = calculateTrustScore(worker);
        return { ...worker, distance_km: dist, trustScore };
      })
      .filter(worker => {
        const withinDist = worker.distance_km <= radiusKm;
        const skillMatch = !skill || skill === 'All' || worker.primary_skill.toLowerCase() === skill.toLowerCase();
        return withinDist && skillMatch;
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({ count: result.length, workers: result });
  } catch (err) {
    console.error('Error fetching workers:', err);
    res.status(500).json({ error: 'Failed to fetch workers.' });
  }
});

// 5. Create Job Posting API with Fair Wage Check
app.post('/api/jobs/create', (req, res) => {
  try {
    const { title, skill_required, category, daily_wage, wagePerDay, workers_needed, workersNeeded, address, pincode, lat, lng, contractor_name, contractorName, contractorId, description, working_hours, emergency_contact } = req.body;
    const jobTitle = title || "Rural Infrastructure Job";
    const skill = skill_required || category || "Masonry";
    const wage = Number(daily_wage || wagePerDay) || 750;

    const wageCheck = checkFairWage(skill, wage);

    const newJob = addJob({
      title: jobTitle,
      skill_required: skill,
      category: skill,
      daily_wage: wage,
      wagePerDay: wage,
      workers_needed: Number(workers_needed || workersNeeded) || 4,
      workersNeeded: Number(workersNeeded || workers_needed) || 4,
      address: address || "Sector 31, Greater Noida",
      pincode: pincode || "201310",
      lat: Number(lat) || 28.4744,
      lng: Number(lng) || 77.5040,
      contractor_name: contractor_name || contractorName || "Gupta Infrastructure & Civil Works",
      contractorName: contractorName || contractor_name || "Gupta Infrastructure & Civil Works",
      contractorId: contractorId || "ctr-201",
      description: description || "Local rural infrastructure & labor assignment.",
      working_hours: working_hours || "8:00 AM - 5:00 PM",
      emergency_contact: emergency_contact || "+91 98111 22233"
    });

    res.json({
      success: true,
      message: 'Job requirement created successfully',
      fair_wage_warning: !wageCheck.isFair ? wageCheck.message : null,
      job: newJob
    });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Failed to create job posting.' });
  }
});

// 6. Applications & 7-Stage Job Lifecycle APIs
app.get('/api/applications', (req, res) => {
  try {
    const apps = getApplications();
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

app.post('/api/applications/apply', (req, res) => {
  try {
    const { job_id, worker_id, worker_name, worker_phone, worker_skill } = req.body;
    const application = createOrUpdateApplication({
      job_id,
      worker_id,
      worker_name,
      worker_phone,
      worker_skill,
      status: 'ACCEPTED'
    });
    res.json({ success: true, message: 'Work accepted!', application });
  } catch (err) {
    console.error('Error applying for work:', err);
    res.status(500).json({ error: 'Failed to accept work.' });
  }
});

app.post('/api/applications/check-in', (req, res) => {
  try {
    const { application_id, job_id, worker_id, lat, lng } = req.body;
    const application = checkInApplication({ application_id, job_id, worker_id, lat, lng });
    res.json({ success: true, message: 'GPS Check-in recorded!', application });
  } catch (err) {
    console.error('Error checking in:', err);
    res.status(500).json({ error: 'Failed to record check-in.' });
  }
});

app.post('/api/applications/complete', (req, res) => {
  try {
    const { application_id, job_id, worker_id } = req.body;
    const application = completeApplication({ application_id, job_id, worker_id });
    res.json({ success: true, message: 'Work marked as completed!', application });
  } catch (err) {
    console.error('Error completing work:', err);
    res.status(500).json({ error: 'Failed to complete work.' });
  }
});

app.post('/api/applications/release-payment', (req, res) => {
  try {
    const { application_id, job_id, worker_id } = req.body;
    const application = releasePayment({ application_id, job_id, worker_id });
    res.json({ success: true, message: 'UPI Payment released to worker bank account!', application });
  } catch (err) {
    console.error('Error releasing payment:', err);
    res.status(500).json({ error: 'Failed to release payment.' });
  }
});

app.post('/api/applications/rate', (req, res) => {
  try {
    const { application_id, rating, review, rated_by } = req.body;
    const application = rateApplication({ application_id, rating, review, rated_by });
    res.json({ success: true, message: 'Rating recorded and Trust Score updated!', application });
  } catch (err) {
    console.error('Error rating:', err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

app.post('/api/applications/decline', (req, res) => {
  try {
    const { application_id, job_id, worker_id, reason, notes, declined_by } = req.body;
    const application = declineApplication({ application_id, job_id, worker_id, reason, notes, declined_by });
    res.json({ success: true, message: 'Work declined.', application });
  } catch (err) {
    console.error('Error declining work:', err);
    res.status(500).json({ error: 'Failed to decline work.' });
  }
});

// 7. Analytics & Intelligence APIs
app.get('/api/analytics/seasonal-intelligence', (req, res) => {
  res.json(getSeasonalIntelligence());
});

app.get('/api/analytics/labor-demand', (req, res) => {
  res.json(getLaborDemandMetrics());
});

app.get('/api/contractor/analytics', (req, res) => {
  const contractorId = req.query.contractor_id || 'ctr-201';
  res.json(getContractorAnalytics(contractorId));
});

// 8. Seed Reset
app.get('/api/seed', (req, res) => {
  seedDatabase();
  res.json({ success: true, message: 'Database re-seeded with fresh data.' });
});

app.listen(PORT, () => {
  console.log(`ShramSetu Backend API running on port ${PORT}`);
});
