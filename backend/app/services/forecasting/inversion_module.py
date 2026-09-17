import math
from typing import Dict, Any

class InversionModule:
    """
    Atmospheric Inversion Severity Index (ISI) Module.
    Models the strength of the thermal capping lid that traps particulate matter
    close to the surface across the Delhi NCR airshed.
    Scale: 0.0 (Uncapped / turbulent free convection) to 1.0 (Severe inversion lock).
    """
    
    @staticmethod
    def compute_isi(
        pbl_height_m: float,
        wind_speed_ms: float,
        temperature_c: float,
        relative_humidity: float,
        is_nighttime: bool = None
    ) -> Dict[str, Any]:
        """
        Computes the Inversion Severity Index (ISI) using micrometeorological
        boundary layer turbulence & stability scaling:
        1. Boundary layer suppression (exponential decay: high PBL -> low capping)
        2. Wind shear & aerodynamic mixing (exponential decay: calm winds -> stagnation)
        3. Nocturnal radiative cooling & thermal gradient
        4. Aerosol hygroscopic growth factor (relative humidity)
        """
        # Auto-detect Indian Standard Time (IST = UTC + 5:30) if not specified
        if is_nighttime is None:
            try:
                from datetime import datetime, timezone, timedelta
                ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
                is_nighttime = ist_now.hour >= 19 or ist_now.hour < 6
            except Exception:
                is_nighttime = False

        # Physical nocturnal boundary layer capping:
        # After sunset (19:00-06:00 IST), solar thermal convection ceases and ground radiational cooling
        # caps the stable nocturnal boundary layer between 150m and 380m across Delhi NCR.
        if is_nighttime:
            eff_pbl = min(max(80.0, pbl_height_m), 380.0)
            temp_factor = 0.70 + 0.30 * max(0.0, min(1.0, (28.0 - temperature_c) / 12.0))
        else:
            eff_pbl = max(100.0, pbl_height_m)
            temp_factor = max(0.05, 0.25 * max(0.0, min(1.0, (28.0 - temperature_c) / 20.0)))

        # 1. Continuous PBL suppression factor: scale depth = 550m
        s_pbl = math.exp(-eff_pbl / 550.0)
        
        # 2. Aerodynamic wind mixing factor: scale velocity = 2.2 m/s
        eff_wind = max(0.2, wind_speed_ms)
        s_wind = math.exp(-eff_wind / 2.2)
        
        # 4. Humidity condensation / aerosol hygroscopic swelling
        rh_factor = max(0.05, min(1.0, relative_humidity / 100.0))
        
        # Weighted composite ISI (Scale: 0.0 to 1.0)
        isi = (
            0.45 * s_pbl +
            0.30 * s_wind +
            0.15 * temp_factor +
            0.10 * rh_factor
        )
        
        isi = round(float(isi), 3)
        
        # Physical Verbal Classification
        if isi < 0.20:
            status = "Uncapped / Convective Mixing"
            description = "Deep convective boundary layer allows free vertical ventilation of pollutants."
            gating_factor = 0.15
        elif isi < 0.40:
            status = "Mild Atmospheric Resistance"
            description = "Moderate thermal stability; minor vertical suppression."
            gating_factor = 0.35
        elif isi < 0.65:
            status = "Moderate Inversion Lid"
            description = "Nocturnal cooling has formed a capping inversion layer suppressing dispersion."
            gating_factor = 0.65
        else:
            status = "Severe Inversion Lock"
            description = "Intense thermal inversion layer trapping particulate matter at ground breathing level."
            gating_factor = 0.90
            
        return {
            "inversion_severity_index": isi,
            "status": status,
            "description": description,
            "pbl_height_m": round(pbl_height_m, 1),
            "trapping_efficiency_pct": round(isi * 100.0, 1),
            "gating_factor": gating_factor,
            "sub_factors": {
                "pbl_suppression": round(s_pbl, 2),
                "wind_stagnation": round(s_wind, 2),
                "thermal_gradient": round(temp_factor, 2),
                "hygroscopic_rh": round(rh_factor, 2)
            }
        }

inversion_module = InversionModule()
