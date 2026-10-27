# SHRAM-AI (Shram Setu) 🇮🇳🔨

**SHRAM-AI** is an AI-powered multilingual platform bridging the gap between informal/rural workers and contractors/employers across India. It provides voice-driven accessibility (IVR simulation), intelligent skill matching, automated wage calculation & payment transparency, and an intuitive bilingual dashboard (Hindi & English).

---

## 🌟 Key Features

- 🎙️ **Voice & IVR Accessibility**: Allows workers with low digital literacy to discover jobs, register skills, and receive daily wage alerts via natural speech / IVR simulation.
- ⚡ **Smart Skill & Location Matchmaking**: Geospatial distance calculations and NLP-based matching pairing workers with local construction, agriculture, plumbing, and carpentry gigs.
- 🛡️ **Fair Wage Transparency & Verification**: Ensures contractors pay verified regional fair daily wage rates with status tracking.
- 🇮🇳 **Bilingual First (Hindi + English)**: Clean localization enabling accessibility in vernacular languages.
- 🏗️ **Contractor & Employer Hub**: Quick job posting, real-time worker shortlisting, applicant tracking, and status updates.

---

## 📁 Project Structure

```
shram-setu/
├── backend/
│   ├── data/
│   │   └── db.js            # In-memory / mock database with seed records
│   ├── utils/
│   │   ├── distance.js      # Haversine distance calculator for local jobs
│   │   └── nlpParser.js     # Natural language query parser for skills & requirements
│   ├── package.json
│   └── server.js            # Express REST API
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Dashboard, ContractorPortal, IVRSimulator, Register)
│   │   ├── utils/           # API helpers and translation dictionaries
│   │   ├── App.jsx
│   │   └── index.css        # Tailwind styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer)
- npm / yarn

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend server runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
The frontend dev server will launch (typically at `http://localhost:5173` or `http://localhost:3000`).

---

## 🤝 Contributing
Contributions, suggestions, and feedback are welcome! Feel free to open an issue or submit a pull request.
