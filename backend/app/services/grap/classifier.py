import logging
from typing import Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class GrapStageEngine:
    """
    Commission for Air Quality Management (CAQM) Graded Response Action Plan Engine.
    Automates regulatory stage determination (Stage I to IV), threshold evaluation,
    and drafts statutory compliance notices with mandatory mitigation measures.
    """
    
    STAGE_DEFINITIONS = {
        "STAGE_I": {
            "name": "Stage I — 'Poor' Air Quality",
            "threshold_aqi": (201, 300),
            "severity_label": "Poor",
            "statutory_mandates": [
                "Strict enforcement of dust mitigation rules at all registered construction sites (>500 sqm)",
                "Intensify mechanized road sweeping and water washing on high-density traffic corridors",
                "Strict checking and penalization of non-compliant vehicular emission (PUC certificates)",
                "Total prohibition on open burning of municipal solid waste and biomass",
                "Ensure uninterrupted power supply to minimize diesel generator operations"
            ]
        },
        "STAGE_II": {
            "name": "Stage II — 'Very Poor' Air Quality",
            "threshold_aqi": (301, 400),
            "severity_label": "Very Poor",
            "statutory_mandates": [
                "Ban on operation of Diesel Generator sets across commercial and residential sectors (except emergency services)",
                "Enhance municipal parking fees to discourage personal four-wheeler vehicular usage",
                "Augment Delhi Metro and electric public bus fleet frequencies by 20% to accommodate commuter shift",
                "Daily water sprinkling with chemical dust suppressants along 13 identified NCR pollution hotspots",
                "Issue public advisories for vulnerable groups (elderly, children, respiratory patients) to restrict outdoor exertion"
            ]
        },
        "STAGE_III": {
            "name": "Stage III — 'Severe' Air Quality",
            "threshold_aqi": (401, 450),
            "severity_label": "Severe",
            "statutory_mandates": [
                "Strict and total ban on all non-essential construction and demolition activities across Delhi NCR",
                "Immediate closure of all stone crushers, brick kilns, and mining activities across NCR districts",
                "Strict prohibition on plying of BS-III Petrol and BS-IV Diesel Light Motor Vehicles (4-wheelers) in Delhi and adjoining NCR",
                "State governments to decide on discontinuing in-person classes for children up to Grade 5, shifting to hybrid/online mode",
                "Intensify public transit operations and deploy anti-smog guns continuously along arterial ring roads"
            ]
        },
        "STAGE_IV": {
            "name": "Stage IV — 'Severe+' Atmospheric Emergency",
            "threshold_aqi": (451, 999),
            "severity_label": "Severe+",
            "statutory_mandates": [
                "Prohibit entry of non-Delhi registered commercial trucks into NCT of Delhi (except essential commodities / LNG / CNG / Electric)",
                "Ban on construction and demolition activities in public linear infrastructure (highways, flyovers, power transmission, pipelines)",
                "State governments to mandate 50% Work-From-Home (WFH) capacity for public, municipal, and private corporate offices",
                "Discontinue physical classes for all school grades up to Grade 9 and Grade 11 (shifting strictly online)",
                "State and Central Governments to consider odd-even vehicle rationing and emergency commercial restrictions"
            ]
        },
        "NORMAL": {
            "name": "Standby / Normal — Air Quality Moderate to Good",
            "threshold_aqi": (0, 200),
            "severity_label": "Normal / Standby",
            "statutory_mandates": [
                "Continuous ambient monitoring across 40 CPCB/DPCC continuous telemetry stations",
                "Regular mechanized sweeping and water sprinkling on high-density corridors",
                "Pre-emptive meteorological boundary layer tracking for early inversion alerts",
                "Enforce standard industrial stack emissions compliance by DPCC/HSPCB/UPPCB"
            ]
        }
    }

    def evaluate_grap_stage(self, current_aqi: int, forecast_aqi_72h: List[int]) -> Dict[str, Any]:
        """
        Determines current active GRAP stage and predicts upcoming trigger stage
        based on the 72-hour coupled forecast trajectory.
        """
        current_stage = self._get_stage_for_aqi(current_aqi)
        
        # Check maximum forecast AQI within next 72 hours
        max_forecast_aqi = max(forecast_aqi_72h) if forecast_aqi_72h else current_aqi
        predicted_stage = self._get_stage_for_aqi(max_forecast_aqi)
        
        # Duration predicted above threshold
        hours_above_400 = sum(1 for a in forecast_aqi_72h if a >= 401)
        
        stage_key = predicted_stage or current_stage or "NORMAL"
        stage_info = self.STAGE_DEFINITIONS.get(stage_key, self.STAGE_DEFINITIONS["NORMAL"])
        
        compliance_notice = self._draft_compliance_notice(
            stage_key=stage_key,
            current_aqi=current_aqi,
            max_forecast_aqi=max_forecast_aqi,
            hours_above_threshold=hours_above_400
        )
        
        return {
            "current_aqi": current_aqi,
            "current_stage": current_stage,
            "predicted_stage_72h": predicted_stage,
            "escalation_warning": predicted_stage != current_stage and (max_forecast_aqi > current_aqi),
            "max_forecast_aqi": max_forecast_aqi,
            "hours_in_severe_tier": hours_above_400,
            "active_mandate_details": stage_info,
            "auto_drafted_notice": compliance_notice
        }

    def _get_stage_for_aqi(self, aqi: int) -> str:
        if aqi > 450:
            return "STAGE_IV"
        elif aqi >= 401:
            return "STAGE_III"
        elif aqi >= 301:
            return "STAGE_II"
        elif aqi >= 201:
            return "STAGE_I"
        else:
            return "NORMAL"

    def _draft_compliance_notice(
        self, stage_key: str, current_aqi: int, max_forecast_aqi: int, hours_above_threshold: int
    ) -> Dict[str, Any]:
        info = self.STAGE_DEFINITIONS.get(stage_key, self.STAGE_DEFINITIONS["STAGE_II"])
        now = datetime.now(timezone.utc)
        
        stage_code = stage_key.split('_')[-1] if 'STAGE_' in stage_key else "00"
        bulletin_number = f"CAQM/GRAP/NCR/{now.strftime('%Y%m%d')}/{stage_code}"
        
        return {
            "bulletin_id": bulletin_number,
            "issued_by": "Commission for Air Quality Management in NCR and Adjoining Areas (CAQM)",
            "timestamp": now.isoformat(),
            "mandate_title": f"OFFICIAL NOTIFICATION: ENFORCEMENT OF {info['name'].upper()}",
            "trigger_grounds": (
                f"Air Quality Index in Delhi NCR has recorded {current_aqi} and the coupled weather-chemistry "
                f"forecasting system indicates persistent severe trapping with peak AQI reaching {max_forecast_aqi} "
                f"under atmospheric inversion over the next {hours_above_threshold} hours."
            ),
            "action_checklist": info["statutory_mandates"],
            "statutory_authority": "Section 12 of CAQM Act, 2021",
            "dispatch_status": "Drafted — Pending Nodal Officer Sign-Off"
        }

grap_engine = GrapStageEngine()
