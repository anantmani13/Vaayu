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
    acronym: "CAAQMS",
    fullName: "Continuous Ambient Air Quality Monitoring Station",
    authority: "Central Pollution Control Board (CPCB) & State Pollution Control Boards",
    category: "Monitoring Infrastructure",
    meaning: "Automated stationary environmental sensor observatories measuring real-time ambient concentrations of particulate matter and toxic trace gases at 15-minute intervals across Delhi NCR."
  },
  {
    acronym: "PM2.5",
    fullName: "Fine Particulate Matter (Aerodynamic Diameter ≤ 2.5 micrometers)",
    authority: "CPCB / WHO Air Quality Guidelines",
    category: "Pollutant",
    meaning: "Combustion soot and toxic fine aerosols small enough to bypass nasal ciliary filters, penetrate deep into pulmonary alveoli, and translocate directly into the vascular bloodstream."
  },
  {
    acronym: "PM10",
    fullName: "Coarse Inhalable Particulate Matter (Aerodynamic Diameter ≤ 10 micrometers)",
    authority: "CPCB / WHO Air Quality Guidelines",
    category: "Pollutant",
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
    category: "Regulatory Authority",
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
    acronym: "Coupling Delta (Δ)",
    fullName: "Two-Way Weather-Chemistry Feedback Retention Gain",
    authority: "Vaayu Coupled WRF-Chem Surrogate Formulation",
    category: "Model Science",
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
    category: "Medical Authority",
    meaning: "The apex biomedical agency of India whose published clinical protocols for air pollution morbidity govern Vaayu's vernacular citizen advisories."
  }
];

export default function GlossaryModal({ isOpen, onClose }) {
  const [search, setSearch] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Air Chemistry', 'Atmospheric Physics', 'Remote Sensing / Satellite', 'Statutory Regulation', 'Health Advisory'];

  const filtered = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.acronym.toLowerCase().includes(search.toLowerCase()) ||
                          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          item.meaning.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All' || item.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search acronym or full name (e.g., CAAQMS, Inversion, PM2.5)..."
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
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button
                key={c}
                className={`horizon-tab ${filterCat === c ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.6875rem' }}
                onClick={() => setFilterCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.acronym}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-health)' }}>
                    • {item.fullName}
                  </span>
                </div>
                <span className="card-badge" style={{ fontSize: '0.65rem' }}>
                  {item.category}
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-primary)', margin: '2px 0' }}>
                {item.meaning}
              </p>

              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="var(--accent-health)" /> Authority: {item.authority}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No matching terms found. Try a different search term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
