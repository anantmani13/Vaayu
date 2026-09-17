import math
from typing import Dict, Any

class SourceApportionmentClassifier:
    """
    Source Apportionment Model.
    Calculates percentage contribution of emission sources to Delhi NCR's ambient PM2.5.
    Combines NASA FIRMS fire proximity, wind vector alignment, NO2/SO2 chemical ratios,
    and coarse-to-fine particulate fractions (PM10 vs PM2.5).
    """
    
    def calculate_apportionment(
        self,
        pm25: float,
        pm10: float,
        no2: float,
        so2: float,
        wind_direction_deg: float,
        fire_count: int,
        isi: float
    ) -> Dict[str, Any]:
        """
        Computes dynamic source apportionment percentages that sum to 100%.
        """
        # 1. Stubble Burning Weight
        # Dependent on active fire counts in Punjab/Haryana and wind direction alignment from North-West (315 deg corridor)
        # Smoke only reaches Delhi if wind is coming from the NW sector (~280° to 345°).
        angle_diff_from_nw = abs((wind_direction_deg - 315.0 + 180.0) % 360.0 - 180.0)
        if angle_diff_from_nw <= 30.0:
            wind_alignment_nw = math.cos(math.radians(angle_diff_from_nw))
        elif angle_diff_from_nw <= 55.0:
            wind_alignment_nw = 0.35 * math.cos(math.radians(angle_diff_from_nw))
        else:
            wind_alignment_nw = 0.0  # Wind carrying smoke away from Delhi NCR (e.g. into Pakistan or Thar)

        # Realistic stubble loading: if wind is blowing away, regional stubble reaches near 0 (trace background only)
        if wind_alignment_nw > 0 and fire_count > 0:
            stubble_raw = (fire_count * 0.55) * (0.15 + 0.85 * wind_alignment_nw) * (1.0 + isi * 0.4)
            stubble_raw = max(1.5, min(95.0, stubble_raw))
        else:
            stubble_raw = 1.0 if fire_count > 0 else 0.2  # Negligible regional stubble under non-NW winds
        
        # 2. Vehicular Exhaust Weight (Correlated with NO2 and urban traffic activity)
        vehicular_raw = max(15.0, min(50.0, (no2 / 70.0) * 28.0))
        
        # 3. Industrial & Power Plant Emissions (Correlated with SO2 & secondary sulfates)
        industrial_raw = max(10.0, min(35.0, (so2 / 20.0) * 18.0))
        
        # 4. Road & Construction Dust (Correlated with (PM10 - PM2.5) coarse fraction)
        coarse_fraction = max(10.0, pm10 - pm25)
        dust_raw = max(10.0, min(35.0, (coarse_fraction / 150.0) * 20.0))
        
        # 5. Secondary Inorganic Aerosols & Waste Burning
        secondary_raw = 12.0
        
        total = stubble_raw + vehicular_raw + industrial_raw + dust_raw + secondary_raw
        
        pct_stubble = round((stubble_raw / total) * 100.0, 1)
        pct_vehicular = round((vehicular_raw / total) * 100.0, 1)
        pct_industrial = round((industrial_raw / total) * 100.0, 1)
        pct_dust = round((dust_raw / total) * 100.0, 1)
        pct_secondary = round(100.0 - (pct_stubble + pct_vehicular + pct_industrial + pct_dust), 1)
        
        primary_source = max(
            [("Stubble Burning (Regional)", pct_stubble),
             ("Vehicular Emissions", pct_vehicular),
             ("Industrial & Power Plants", pct_industrial),
             ("Road & Construction Dust", pct_dust),
             ("Secondary Aerosols & Waste", pct_secondary)],
            key=lambda x: x[1]
        )
        
        return {
            "breakdown_percentages": {
                "stubble_burning": pct_stubble,
                "vehicular": pct_vehicular,
                "industrial": pct_industrial,
                "construction_dust": pct_dust,
                "secondary_aerosols": pct_secondary
            },
            "primary_contributor": {
                "source": primary_source[0],
                "percentage": primary_source[1]
            },
            "wind_alignment_nw_factor": round(wind_alignment_nw, 2),
            "fire_hotspot_intensity": "High" if fire_count > 30 else "Moderate"
        }

source_classifier = SourceApportionmentClassifier()
