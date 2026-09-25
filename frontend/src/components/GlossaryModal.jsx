import React from 'react';
import { X, BookOpen, Layers, ShieldCheck, Activity, Info } from 'lucide-react';

const GLOSSARY_TERMS = [
  {
    acronym: "AQI",
    fullName: "Air Quality Index",
    authority: "CPCB / Ministry of Environment, Forest and Climate Change (MoEFCC)",
    category: "Air Chemistry",
    meaning: "A standardized composite numerical scale (0 to 500) that simplifies complex multi-pollutant concentrations (PM2.5, PM10, NO2, SO2, CO, O3) into a single health-risk metric for citizens."
  },
  {
    acronym: "NAQI",
    fullName: "National Air Quality Index (India)",
    authority: "Central Pollution Control Board (CPCB / NAAQS 2009)",
    category: "Air Chemistry",
    meaning: "India's statutory air quality scale based on six categories: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), and Severe (401-500). PM2.5 standard 24h normal limit is 60 µg/m³."
  },
  {
    acronym: "US-EPA AQI",
    fullName: "United States Environmental Protection Agency AQI Scale",
    authority: "US Environmental Protection Agency (Revised 2024)",
    category: "Air Chemistry",
    meaning: "International air quality scale utilized by global platforms (Apple Weather, WAQI). Has tighter permissible thresholds (PM2.5 standard is 35 µg/m³, with AQI > 150 classified as Unhealthy and > 300 Hazardous)."
  },
  {
    acronym: "WAQI",
    fullName: "World Air Quality Index Project (aqicn.org)",
    authority: "Global Environmental Monitoring Project & Citizen Data Consortium",
    category: "Monitoring Infrastructure",
    meaning: "An international real-time air quality observation platform aggregating continuous telemetry from over 30,000 monitoring stations across 130 countries, providing Vaayu with live physical CAAQMS station telemetry."
  },
  {
    acronym: "CAAQMS",
    fullName: "Continuous Ambient Air Quality Monitoring Station",
    authority: "Central Pollution Control Board (CPCB) & DPCC",
    category: "Monitoring Infrastructure",
    meaning: "Automated stationary environmental sensor observatories measuring real-time ambient concentrations of particulate matter and toxic trace gases at 15-minute intervals across Delhi NCR."
  },
  {
    acronym: "DPCC",
    fullName: "Delhi Pollution Control Committee",
    authority: "Autonomous Regulatory Board (Govt. of NCT of Delhi)",
    category: "Statutory Regulation",
    meaning: "The statutory regulatory body operating under the Department of Environment, Govt. of NCT of Delhi, administering CAAQMS ground monitoring stations and municipal anti-pollution bylaws."
  },
  {
    acronym: "PM2.5",
    fullName: "Fine Particulate Matter (Aerodynamic Diameter ≤ 2.5 micrometers)",
    authority: "CPCB / WHO Air Quality Guidelines",
    category: "Air Chemistry",
    meaning: "Combustion soot and toxic fine aerosols small enough to bypass nasal ciliary filters, penetrate deep into pulmonary alveoli, and translocate directly into the vascular bloodstream."
  },
  {
    acronym: "PM10",
    fullName: "Coarse Inhalable Particulate Matter (Aerodynamic Diameter ≤ 10 micrometers)",
    authority: "CPCB / WHO Air Quality Guidelines",
    category: "Air Chemistry",
    meaning: "Mechanical dust, road resuspension, and construction particles that deposit in the upper trachea and bronchial airways, causing acute cough and rhinitis."
  },
  {
    acronym: "ISI",
    fullName: "Inversion Severity Index",
    authority: "Vaayu Coupled Atmospheric Engine (Derived from Boundary Layer Dynamics)",
    category: "Atmospheric Physics",
    meaning: "A normalized metric (0.0 to 1.0) quantifying how strongly a thermal inversion 'capping lid' is trapping hazardous pollutants near the ground, computed from boundary layer height, wind shear, and thermal gradient."
  },
  {
    acronym: "PBL",
    fullName: "Planetary Boundary Layer",
    authority: "Atmospheric Science / NWP Reanalysis",
    category: "Atmospheric Physics",
    meaning: "The lowest tier of the troposphere in direct contact with Earth's surface. During cold winter nights, nocturnal radiative cooling contracts PBL height from ~1500m down to <200m, concentrating toxic smoke."
  },
  {
    acronym: "WRF-Chem",
    fullName: "Weather Research and Forecasting Model coupled with Chemistry",
    authority: "NCAR / NOAA / Earth System Research Laboratories",
    category: "AI & Machine Learning",
    meaning: "A regional chemical transport model simulating trace gases and aerosol emissions simultaneously with meteorological equations. Vaayu's neural surrogate emulates its 2-way aerosol-radiation feedback."
  },
  {
    acronym: "GAT",
    fullName: "Graph Attention Network",
    authority: "Geometric Deep Learning Architecture",
    category: "AI & Machine Learning",
    meaning: "A neural network architecture that operates on spatial graph topologies, used in Vaayu to model the 40 CAAQMS station nodes in Delhi NCR with dynamic edge weights modulated by wind vectors."
  },
  {
    acronym: "TFT",
    fullName: "Temporal Fusion Transformer",
    authority: "Deep Learning Time-Series Research (Google / Oxford)",
    category: "AI & Machine Learning",
    meaning: "A multi-horizon neural forecasting architecture that combines recurrent layers with self-attention, powering Vaayu's +6h, +24h, +48h, and +72h forward AQI projections."
  },
  {
    acronym: "GRAP",
    fullName: "Graded Response Action Plan",
    authority: "Commission for Air Quality Management (CAQM in NCR & Adjoining Areas)",
    category: "Statutory Regulation",
    meaning: "An emergency administrative enforcement schedule triggered progressively across four severity stages (Stage I Poor, Stage II Very Poor, Stage III Severe, Stage IV Severe+) with mandatory anti-pollution bans."
  },
  {
    acronym: "CAQM",
    fullName: "Commission for Air Quality Management",
    authority: "Statutory Body established under CAQM in NCR and Adjoining Areas Act, 2021",
    category: "Statutory Regulation",
    meaning: "The statutory constitutional authority responsible for coordinating, issuing binding directions, and enforcing air pollution abatement across Delhi, Punjab, Haryana, Rajasthan, and Uttar Pradesh."
  },
  {
    acronym: "FIRMS",
    fullName: "Fire Information for Resource Management System",
    authority: "NASA Earth Science Data Systems (ESDS) & EOSDIS",
    category: "Remote Sensing / Satellite",
    meaning: "NASA's near-real-time satellite observation program tracking active thermal anomalies and agricultural crop residue (stubble) fires via polar-orbiting VIIRS and MODIS sensors."
  },
  {
    acronym: "VIIRS",
    fullName: "Visible Infrared Imaging Radiometer Suite",
    authority: "NASA / NOAA Suomi-NPP & NOAA-20 Satellites",
    category: "Remote Sensing / Satellite",
    meaning: "Advanced spaceborne multispectral sensor providing high-resolution (375m) thermal anomaly detections for identifying individual farm fires across Punjab and Haryana."
  },
  {
    acronym: "FRP",
    fullName: "Fire Radiative Power (Megawatts - MW)",
    authority: "NASA EOSDIS / Satellite Thermal Radiometry",
    category: "Remote Sensing / Satellite",
    meaning: "Rate of radiant heat energy emitted by an active agricultural fire, directly proportional to the mass of stubble biomass combusted and resulting smoke volume."
  },
  {
    acronym: "Pasquill-Gifford",
    fullName: "Pasquill-Gifford Gaussian Dispersion Parameters",
    authority: "Atmospheric Diffusion Science / US-EPA Guideline on Air Quality Models",
    category: "Atmospheric Physics",
    meaning: "Formulas for lateral and vertical plume spread (σy, σz) as a function of downwind distance and atmospheric stability class, utilized by Vaayu for 72h forward smoke fanning polygons."
  },
  {
    acronym: "Haversine Distance",
    fullName: "Haversine Great-Circle Geolocation Formula",
    authority: "Spherical Trigonometry / Geodesy",
    category: "Monitoring Infrastructure",
    meaning: "The spherical trigonometric formula used by Vaayu's GPS engine to compute the exact curvature distance between a user's phone or laptop and all 40 CAAQMS monitoring stations."
  },
  {
    acronym: "Coupling Delta (Δ)",
    fullName: "Two-Way Weather-Chemistry Feedback Retention Gain",
    authority: "Vaayu Coupled WRF-Chem Surrogate Formulation",
    category: "Atmospheric Physics",
    meaning: "The +18% to +28% increase in ground particulate retention captured when particulate solar attenuation and nocturnal boundary layer compression are dynamically fed back into meteorology."
  },
  {
    acronym: "RAG",
    fullName: "Retrieval-Augmented Generation",
    authority: "Clinical AI Architecture",
    category: "Health Advisory",
    meaning: "An AI architecture that anchors conversational language generation strictly to authenticated medical guidelines (ICMR & WHO 2021) to prevent hallucinated health advice."
  },
  {
    acronym: "ICMR",
    fullName: "Indian Council of Medical Research",
    authority: "Apex Biomedical Research Body under Ministry of Health & Family Welfare",
    category: "Health Advisory",
    meaning: "The apex biomedical agency of India whose published clinical protocols for air pollution morbidity govern Vaayu's vernacular citizen advisories."
  }
];

export default function GlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('All');

  if (!isOpen) return null;

  const categories = [
    'All', 
    'Air Chemistry', 
    'Atmospheric Physics', 
    'Monitoring Infrastructure', 
    'Remote Sensing / Satellite', 
    'Statutory Regulation', 
    'AI & Machine Learning', 
    'Health Advisory'
  ];

  const filtered = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.acronym.toLowerCase().includes(search.toLowerCase()) ||
                          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          item.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All' || item.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--accent-health)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent-health)', textTransform: 'uppercase', fontWeight: 600 }}>
                Scientific Literacy & Citizen Clarity
              </span>
            </div>
            <h3 className="heading-serif" style={{ fontSize: '1.6rem', margin: '4px 0 0', color: 'var(--text-primary)' }}>
              Scientific Full Forms & Acronym Glossary
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search acronym or full name (e.g. WAQI, CAAQMS, WRF-Chem, Inversion)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '8px 12px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem'
            }}
          />
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className="btn-zen"
                style={{
                  fontSize: '0.6875rem',
                  padding: '4px 8px',
                  background: filterCat === cat ? 'var(--color-surface-elevated)' : 'transparent',
                  borderColor: filterCat === cat ? 'var(--accent-health)' : 'var(--color-border)',
                  color: filterCat === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: filterCat === cat ? 600 : 400
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Terms Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              No scientific terms match "{search}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-health)', background: 'var(--color-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' }}>
                      {item.acronym}
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.fullName}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: '3px', background: 'var(--color-surface)', color: 'var(--text-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '6px' }}>
                  <strong>Authority / Standard:</strong> {item.authority}
                </div>

                <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.meaning}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
