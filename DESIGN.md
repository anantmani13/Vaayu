# Vaayu — Design System & UI/UX Specification
### Wabi-Sabi Aesthetic for Atmospheric & Environmental Intelligence

**Project:** Vaayu — Coupled Weather-Chemistry Forecasting & Vernacular Health Advisory  
**Design Vibe:** Wabi-Sabi (Earthy, serene, minimal, organic textures, generous breathing room, unpretentious calm)  
**Target Interfaces:** Responsive Web Dashboard (Desktop/Tablet) + Vernacular Mobile Interface (Mobile/WhatsApp)  
**Version:** 2.0 (Clean Terminology Edition)  

---

## 1. Visual Philosophy: Calm, Earthy, and Organic

Most air pollution dashboards feel like high-stress stock tickers or neon video games: loud alarms, garish traffic lights, glowing futuristic panels, and cluttered boxes.

**Vaayu takes the opposite direction through a Wabi-Sabi design vibe:**

- **Grounded & Organic:** The interface feels like natural elements — weathered stone, morning mist, dried clay, textured paper, and atmospheric layers.
- **Calm Simplicity:** High data density without visual chaos. Generous margins and breathing room let users absorb serious environmental readings without panic.
- **Soft Organic Geometry:** Containers and cards have subtle, soft rounding and matte surfaces rather than harsh plastic gloss or flashy glassmorphism.
- **Living Atmosphere:** Transitions are gentle and fluid, mimicking how wind, smoke plumes, and fog naturally move and dissipate.

---

## 2. Color Palette

All colors are muted, earthy tones inspired by natural landscapes, soil, and atmospheric conditions. No synthetic neon shades are used.

### 2.1 Surfaces & Neutrals

```
Light Theme (Paper & Warm Stone)
├── Canvas Background:    #F7F5F0   (Warm Linen Paper)
├── Card Surface:         #EFECE6   (Soft Limestone)
├── Elevated Surface:     #E7E3DA   (Warm River Stone)
├── Subtle Border:        #D5CEBF   (Muted Clay Stroke, 1px)
├── Muted / Secondary:    #7C776D   (Fog Gray)
└── Primary Text:         #23211D   (Charcoal Ink)

Dark Theme (Charcoal & Basalt)
├── Canvas Background:    #151413   (Deep Earth)
├── Card Surface:         #1E1C1A   (Charred Timber)
├── Elevated Surface:     #282522   (Dark Basalt)
├── Subtle Border:        #38332E   (Dark Clay Stroke, 1px)
├── Muted / Secondary:    #8F897F   (Warm Smoke)
└── Primary Text:         #EAE6DF   (Warm Bone White)
```

### 2.2 Standard AQI Categories (Earth-Toned)

Standard air quality categories remain completely unchanged in terminology, but are rendered in tasteful, earth-derived tones that are easy on the eyes:

| Category | AQI Range | Tone Concept | Light Hex | Dark Hex | Visual Feel |
|---|---|---|---|---|---|
| **Good** | 0 – 50 | Forest Moss | `#3F5E4D` | `#527863` | Calm, clear green |
| **Satisfactory** | 51 – 100 | Sage Leaf | `#657849` | `#7D945B` | Gentle olive green |
| **Moderate** | 101 – 200 | Warm Ochre | `#B88B4A` | `#CFA058` | Muted amber/earth |
| **Poor** | 201 – 300 | Terracotta Clay | `#BA5D3F` | `#D16E4E` | Warm brick/terracotta |
| **Very Poor** | 301 – 400 | Smoked Rust | `#9E3B2F` | `#B84B3C` | Deep rust red |
| **Severe** | 401 – 500+ | Burnt Plum | `#5A2C37` | `#7A3A49` | Heavy charcoal wine |

### 2.3 Environmental Accents

- **Inversion Layer Boundary:** Warm Burnished Brass (`#A87948`) — signifies the thermal inversion lid.
- **Stubble Burning Hotspots:** Ember Red (`#C24D36`) — NASA FIRMS fire markers.
- **Wind Streamlines:** Soft Celadon Slate (`#8DA399`) — wind currents moving across the region.
- **Health Advisory Badge:** Muted Mineral Blue (`#384D5E`) — grounded medical and health context.

---

## 3. Typography

The typographic pairing combines organic editorial warmth for headings with clean, high-precision clarity for scientific data.

### 3.1 Typefaces

- **Headings & Editorial Labels:** `Instrument Serif` or `Cormorant Garamond`
  - Elegant, thoughtful, human serif typography that gives the product dignity and warmth.
- **UI, Controls & Body Text:** `Plus Jakarta Sans` or `Inter`
  - Clean, neutral, highly legible sans-serif for numbers, charts, tables, and settings.
- **Vernacular Scripts (Hindi / Regional):** `Noto Sans Devanagari`
  - Clean rendering with natural proportions for regional voice and text advisories.
- **Formulas & Model Telemetry:** `JetBrains Mono`
  - Fixed-width font for model loss, equations, and coordinates.

### 3.2 Hierarchy

| Role | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display Title** | 34px / 2.125rem | Regular (400) | 1.2 | Main page headline, system identity |
| **Section Title** | 22px / 1.375rem | Medium (500) | 1.3 | Module headers, major cards |
| **Card Header** | 16px / 1.0rem | SemiBold (600) | 1.4 | Metric card titles, chart labels |
| **Large Metric Value**| 40px / 2.5rem | Light (300) | 1.0 | Primary AQI and PM2.5 numbers |
| **Metric Unit / Tag** | 11px / 0.6875rem | Medium (500) | 1.2 | Units (`µg/m³`, `ppm`), status pills |
| **Body / Advisory** | 15px / 0.9375rem | Regular (400) | 1.6 | Health recommendations, bulletins |
| **Caption / Time** | 12px / 0.75rem | Regular (400) | 1.4 | Timestamps, data source attribution |

---

## 4. Materials, Tactility & Spatial Layout

### 4.1 Surface Materials

- **Matte Paper Feel:** No glossy highlights or high-saturation gradients. Surfaces have a flat, matte appearance reminiscent of heavyweight art paper.
- **Soft Contoured Corners:** Rounded corners (`12px` to `16px`) feel organic and gentle to touch.
- **Delicate Hairline Borders:** Cards are outlined with a fine 1px stroke in a soft clay tone (`rgba(120, 110, 95, 0.18)`), creating clean structure without heavy shadows.
- **Soft Ambient Shadows:** Subtle, wide-dispersion drop shadows simulating natural overcast daylight:
  ```css
  box-shadow: 0 4px 20px -2px rgba(45, 40, 32, 0.05),
              0 1px 3px 0 rgba(45, 40, 32, 0.03);
  ```

### 4.2 Breathing Space

- Generous padding inside containers (20px to 28px).
- Ample margins between sections (24px to 32px).
- Data values are not crowded; each number has room to be read clearly and calmly.

---

## 5. Component Blueprints

### 5.1 Atmospheric Inversion Layer Card

Visualizes how the temperature inversion traps pollution close to the ground:

```
┌────────────────────────────────────────────────────────┐
│  ATMOSPHERIC INVERSION & BOUNDARY LAYER                │
│  Planetary Boundary Layer (PBL) Height: 420m           │
│                                                        │
│  Upper Atmosphere (Clear air layer)                    │
│  ----------------------------------------------------  │
│  === INVERSION LAYER (Severity Index: 0.78 - Active) = │
│  ....................................................  │
│  Trapped Pollutant Zone (PM2.5: 384 µg/m³)             │
│  Wind Speed: 0.8 m/s • Surface Temp: 14°C              │
│  ----------------------------------------------------  │
│  Ground Level — Anand Vihar Station                    │
│                                                        │
│  [ Two-Way Feedback Applied: +24% PM2.5 Trapping Delta]│
└────────────────────────────────────────────────────────┘
```

- **Visual Style:** Cross-sectional vertical diagram with layered earth tones.
- **Upper Sky:** Muted cool gray slate.
- **Inversion Line:** Warm brass line with a soft glow indicating where warm air caps cold air.
- **Trapped Zone:** Subtle textured haze with soft drifting particles.
- **Coupling Note:** Quiet pill tag showing the numerical difference between the coupled model and standard uncoupled model.

---

### 5.2 Wind Vectors & Stubble Burning Plume Map

- **Base Map:** Minimalist, desaturated monochrome map focusing on geography, district borders, and waterways rather than colorful highway lines.
- **Wind Vectors:** Soft slate-green flowing streamlines showing wind direction and speed across Punjab, Haryana, and Delhi NCR.
- **Stubble Burning Plumes:** Semi-transparent warm amber/terracotta smoke clouds originating from active fire locations and projecting forward over the next 72 hours.
- **Monitoring Stations:** Soft circular stone badges colored according to current AQI.

---

### 5.3 Metric & Telemetry Cards

Clean cards for individual pollutants and meteorological metrics:

```
┌─────────────────────────┐
│  PM2.5                  │
│  384 µg/m³              │
│  [ Severe ] 24h Avg     │
└─────────────────────────┘
```

- Clear hierarchy: Pollutant name, current concentration, category tag.
- Category tags use the muted earth-tone palette with high-contrast text.
- Micro-chart underneath displaying the 72-hour forecast trend line.

---

### 5.4 GRAP Compliance & Action Notice Card

For CAQM and state pollution control officers:

```
┌───────────────────────────────────────────────────────────┐
│  GRADED RESPONSE ACTION PLAN (GRAP) — COMPLIANCE NOTICE    │
│                                                           │
│  [ STAGE III MANDATED ]   Trigger: PM2.5 > 350 µg/m³      │
│  Predicted Duration: 48h  Model Confidence: 94%           │
│                                                           │
│  Action Items Auto-Drafted:                               │
│  • Ban on non-essential construction and demolition       │
│  • Intensify mechanized road sweeping and water washing   │
│  • Restrict BS-III petrol and BS-IV diesel LMVs           │
│                                                           │
│  [ Edit Action Plan ]         [ Sign & Dispatch Notice ]  │
└───────────────────────────────────────────────────────────┘
```

- Designed like a clean, authoritative administrative document.
- Clear action list with checkboxes for officer review.
- Simple, unhurried primary action button.

---

### 5.5 Citizen Voice Health Advisory Card

Designed for fast, accessible interaction on mobile devices:

```
┌───────────────────────────────────────────────────────────┐
│  HEALTH ADVISORY FOR YOUR AREA                            │
│  Locality: Anand Vihar, New Delhi                         │
│                                                           │
│  AQI: 384 — Severe                                        │
│                                                           │
│  [ ( • ) Tap to Speak your question ]                     │
│  Example: "Is it safe for morning walk with asthma?"      │
│                                                           │
│  Personalized Guidance:                                   │
│  "Avoid outdoor activity between 6 AM and 11 AM today.    │
│   Wear an N95 mask if traveling. Keep inhaler handy."     │
│                                                           │
│  [ ▶ Play Spoken Audio ]   Source: ICMR Guidelines (2021) │
└───────────────────────────────────────────────────────────┘
```

- Central tactile microphone button shaped like a smooth stone.
- Calm, fluid audio waveform during speech capture and playback.
- Plainspoken, actionable advice with medical source attribution.

---

## 6. Motion & Transitions

- **Atmospheric Easing:** Animations use a natural deceleration curve:
  ```css
  --ease-natural: cubic-bezier(0.22, 1, 0.36, 1);
  ```
- **Timeline Scrubbing:** Switching forecast horizons (6h, 24h, 48h, 72h) smoothly interpolates chart curves over 350ms.
- **Plume Animation:** Continuous slow loop (10 to 12 seconds) simulating gentle wind-driven plume dispersion across the region.
- **Zero Distraction:** No abrupt flashes, no bouncing notification bells, and no rapid strobing elements.

---

## 7. Accessibility & Mobile Optimization

1. **High Contrast:** All text meets or exceeds WCAG AA contrast standards (minimum 4.5:1 against card backgrounds).
2. **Accessible Coding:** Color is never the sole carrier of information — values, names, and icons accompany every status.
3. **Large Touch Targets:** Primary interactive elements (microphone button, horizon buttons, audio controls) are at least 48 × 48 px.
4. **Lightweight Assets:** Vector SVGs and CSS styling ensure immediate loading even on low-speed mobile networks.

---

## 8. Layout Structure

### 8.1 Desktop Dashboard (Command Deck)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  VAAYU • Atmospheric Forecasting & Health Intelligence        [Delhi NCR]    │
├────────────────────────────────┬─────────────────────────────────────────────┤
│  LEFT PANEL (38%)              │  RIGHT PANEL (62%)                          │
│                                │                                             │
│  [ Regional Overview Card ]    │  [ Wind Flow & Stubble Plume Map ]          │
│  • Current AQI: 362 (Severe)   │  • Flow lines + active fire plumes          │
│  • Key Pollutant: PM2.5        │  • Monitoring station status pins           │
│                                │                                             │
│  [ Atmospheric Inversion Card] │  [ 72-Hour Forecast Trajectory Chart ]      │
│  • Height cross-section        │  • PM2.5, O3, NOx multi-horizon curves      │
│  • Two-way coupling delta      │  • Horizon: [ 6h ] [ 24h ] [ 48h ] [ 72h ]  │
│                                │                                             │
│  [ Source Apportionment ]      │  [ GRAP Stage Compliance Module ]           │
│  • Stubble: 38% • Vehicles: 26%│  • Stage III mandate notice                 │
│  • Industry: 18% • Dust: 18%   │  • Auto-drafted action checklist            │
└────────────────────────────────┴─────────────────────────────────────────────┘
```

### 8.2 Mobile Citizen View

```
┌───────────────────────────────────┐
│  VAAYU                            │
│  Anand Vihar, New Delhi           │
├───────────────────────────────────┤
│                                   │
│            [ 384 ]                │
│            Severe                 │
│    PM2.5: 384 µg/m³ • Inversion   │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ ( • ) Tap to Speak          │  │
│  │ "Can I go outside today?"   │  │
│  └─────────────────────────────┘  │
│                                   │
│  [ Spoken Health Advisory ]       │
│  "Air quality is severe. Stay     │
│   indoors this morning..."        │
│  [ ▶ Play Audio ]                 │
│                                   │
│  [ 24-Hour Outlook ]              │
│  Noon: 340 • Eve: 395 • Night: 410│
└───────────────────────────────────┘
```

---

## 9. CSS Custom Properties (Design Tokens)

```css
:root {
  /* Surfaces */
  --color-canvas: #F7F5F0;
  --color-surface: #EFECE6;
  --color-surface-elevated: #E7E3DA;
  --color-border: #D5CEBF;

  /* Typography */
  --font-heading: 'Instrument Serif', Georgia, serif;
  --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-vernacular: 'Noto Sans Devanagari', sans-serif;
  --font-code: 'JetBrains Mono', monospace;

  /* Text Colors */
  --text-primary: #23211D;
  --text-secondary: #7C776D;
  --text-faint: #A8A398;

  /* AQI Category Colors (Standard Terminology) */
  --aqi-good: #3F5E4D;
  --aqi-satisfactory: #657849;
  --aqi-moderate: #B88B4A;
  --aqi-poor: #BA5D3F;
  --aqi-very-poor: #9E3B2F;
  --aqi-severe: #5A2C37;

  /* Atmospheric & Feature Accents */
  --accent-inversion: #A87948;
  --accent-plume: #C24D36;
  --accent-wind: #8DA399;
  --accent-health: #384D5E;

  /* Geometry & Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Transitions */
  --ease-natural: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-normal: 300ms;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-canvas: #151413;
    --color-surface: #1E1C1A;
    --color-surface-elevated: #282522;
    --color-border: #38332E;

    --text-primary: #EAE6DF;
    --text-secondary: #8F897F;
    --text-faint: #5C564D;

    --aqi-good: #527863;
    --aqi-satisfactory: #7D945B;
    --aqi-moderate: #CFA058;
    --aqi-poor: #D16E4E;
    --aqi-very-poor: #B84B3C;
    --aqi-severe: #7A3A49;
  }
}
```

---

*This specification establishes a tranquil, earthy Wabi-Sabi aesthetic with standard English and regional domain terminology for Vaayu.*
