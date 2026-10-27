/**
 * NLP Voice-to-Profile Extractor for ShramSetu
 * Parses speech transcript strings (Hindi/English mixed) into structured JSON.
 */

const LOCATION_COORDS = {
  "greater noida": { lat: 28.4744, lng: 77.5040, pincode: "201310" },
  "noida": { lat: 28.5355, lng: 77.3910, pincode: "201301" },
  "patna": { lat: 25.5941, lng: 85.1376, pincode: "800001" },
  "jaipur": { lat: 26.9124, lng: 75.7873, pincode: "302001" },
  "lucknow": { lat: 26.8467, lng: 80.9462, pincode: "226001" },
  "ludhiana": { lat: 30.9010, lng: 75.8573, pincode: "141001" },
  "varanasi": { lat: 25.3176, lng: 82.9739, pincode: "221001" },
  "kanpur": { lat: 26.4499, lng: 80.3319, pincode: "208001" },
  "ranchi": { lat: 23.3441, lng: 85.3096, pincode: "834001" },
  "surajpur": { lat: 28.4500, lng: 77.4900, pincode: "201306" }
};

const SKILL_KEYWORDS = {
  "Masonry": ["mason", "masonry", "rajmistri", "mistri", "brick", "construction", "makaan", "deewar", "chhat", "राजमिस्त्री", "मिस्त्री"],
  "Carpentry": ["carpenter", "carpentry", "wood", "barhai", "furniture", "lakdi", "तकई", "बढ़ई", "लकड़ी"],
  "Agriculture": ["farm", "farming", "agriculture", "kheti", "kisan", "crop", "field", "khet", "खेती", "किसान"],
  "Plumbing": ["plumber", "plumbing", "pipe", "nal", "water", "fitting", "प्लंबर", "नल"],
  "General Labor": ["labor", "labour", "helper", "mazdoor", "loading", "general", "work", "मजदूर", "हेल्पर"]
};

function parseVoiceToProfile(text) {
  if (!text || typeof text !== 'string') {
    return {
      name: "Rural Worker",
      primary_skill: "General Labor",
      experience_years: 2,
      location: { village_name: "Greater Noida", lat: 28.4744, lng: 77.5040, pincode: "201310" }
    };
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Extract Name
  let name = "Worker";
  const namePatterns = [
    /mera naam ([a-zA-Z\u0900-\u097F]+)/i,
    /my name is ([a-zA-Z\u0900-\u097F]+)/i,
    /i am ([a-zA-Z\u0900-\u097F]+)/i,
    /naam ([a-zA-Z\u0900-\u097F]+) hai/i,
    /([a-zA-Z\u0900-\u097F]+) naam hai/i
  ];

  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      const skipWords = ["mera", "my", "i", "main", "sabko", "namaste", "hello"];
      if (!skipWords.includes(extracted.toLowerCase()) && extracted.length > 1) {
        name = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        break;
      }
    }
  }

  if (name === "Worker") {
    // Fallback first word if reasonable name
    const firstWord = cleanText.split(/\s+/)[0];
    if (firstWord && firstWord.length > 2 && !["mera", "main", "namaste", "hello"].includes(firstWord.toLowerCase())) {
      name = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    }
  }

  // 2. Extract Skill
  let primary_skill = "General Labor";
  let maxHits = 0;

  for (const [skillCategory, keywords] of Object.entries(SKILL_KEYWORDS)) {
    let hits = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        hits++;
      }
    }
    if (hits > maxHits) {
      maxHits = hits;
      primary_skill = skillCategory;
    }
  }

  // 3. Extract Experience Years
  let experience_years = 2; // Default reasonable baseline
  const expPatterns = [
    /(\d+)\s*(?:saal|year|years|yr|yrs)/i,
    /(\d+)\s*(?:साल|वर्ष)/i,
    /(?:experience|anubhav)\s*(\d+)/i
  ];

  for (const pattern of expPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const parsedExp = parseInt(match[1], 10);
      if (!isNaN(parsedExp) && parsedExp >= 0 && parsedExp <= 50) {
        experience_years = parsedExp;
        break;
      }
    }
  }

  // 4. Extract Location
  let village_name = "Greater Noida";
  let lat = 28.4744;
  let lng = 77.5040;
  let pincode = "201310";
  let foundKnownLocation = false;

  // Check known locations lookup
  for (const [locName, coords] of Object.entries(LOCATION_COORDS)) {
    if (lowerText.includes(locName)) {
      village_name = locName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      lat = coords.lat;
      lng = coords.lng;
      pincode = coords.pincode;
      foundKnownLocation = true;
      break;
    }
  }

  // Fallback to pattern matching if no known location hit
  if (!foundKnownLocation) {
    const locPatterns = [
      /([a-zA-Z]+)\s+se\b/i,
      /from\s+([a-zA-Z]+)/i,
      /village\s+([a-zA-Z]+)/i
    ];
    const invalidLocs = ["masonry", "carpentry", "plumbing", "karta", "saal", "hu", "hai", "kaam", "hoon"];

    for (const pattern of locPatterns) {
      const locMatch = cleanText.match(pattern);
      if (locMatch && locMatch[1]) {
        const candidate = locMatch[1].trim();
        if (candidate.length > 2 && !invalidLocs.includes(candidate.toLowerCase())) {
          village_name = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          break;
        }
      }
    }
  }

  return {
    raw_transcript: cleanText,
    name,
    primary_skill,
    experience_years,
    location: {
      village_name,
      lat,
      lng,
      pincode
    }
  };
}

module.exports = { parseVoiceToProfile, LOCATION_COORDS };
