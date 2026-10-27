/**
 * Dynamic AI Match Engine for ShramSetu
 * Computes match score based on:
 * - Skill compatibility (35%)
 * - Distance (20%)
 * - Wage preference (15%)
 * - Worker availability (15%)
 * - Experience / Work History (15%)
 */

export function calculateMatchScore(worker, job) {
  const workerSkill = (worker?.primary_skill || worker?.skill || 'Masonry').toLowerCase();
  const jobSkill = (job?.skill_required || 'Masonry').toLowerCase();

  // 1. Skill Match (35%)
  let skillMatch = 30;
  if (workerSkill === jobSkill) skillMatch = 100;
  else if (workerSkill.includes(jobSkill) || jobSkill.includes(workerSkill)) skillMatch = 85;
  else if (workerSkill.includes('labor') || jobSkill.includes('labor')) skillMatch = 70;

  // 2. Distance Score (20%)
  const dist = job?.distance_km !== undefined ? Number(job.distance_km) : 2.5;
  let distanceScore = 100;
  if (dist <= 2) distanceScore = 100;
  else if (dist <= 5) distanceScore = 90;
  else if (dist <= 15) distanceScore = 75;
  else if (dist <= 25) distanceScore = 60;
  else distanceScore = 40;

  // 3. Wage Preference Match (15%)
  const wage = job?.daily_wage || 750;
  const benchmarkWage = 650;
  const wageMatch = Math.min(Math.round((wage / benchmarkWage) * 90), 100);

  // 4. Availability Score (15%)
  const availScore = worker?.isAvailable !== false ? 100 : 50;

  // 5. Experience / History (15%)
  const expYears = worker?.experience_years || 3;
  const expScore = Math.min(Math.round((expYears / 3) * 85 + 15), 100);

  // Weighted Sum
  const totalScore = Math.round(
    skillMatch * 0.35 +
    distanceScore * 0.20 +
    wageMatch * 0.15 +
    availScore * 0.15 +
    expScore * 0.15
  );

  return {
    scorePercent: `${totalScore}%`,
    scoreNum: totalScore,
    breakdown: {
      skillMatch: `${skillMatch}%`,
      distanceScore: `${distanceScore}%`,
      wageMatch: `${wageMatch}%`,
      availScore: `${availScore}%`,
      expScore: `${expScore}%`
    }
  };
}
