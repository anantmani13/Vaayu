import math
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PlumeDispersionTracker:
    """
    Gaussian Plume & Lagrangian Dispersion Model for Stubble-Burning Smoke Plumes.
    Simulates plume transport from Punjab and Haryana farm clusters
    under prevailing wind vectors and atmospheric inversion conditions towards Delhi NCR.
    """
    
    def project_plume_dispersion(
        self,
        fire_clusters: List[Dict[str, Any]],
        wind_speed_ms: float,
        wind_direction_deg: float,
        pbl_height_m: float,
        isi: float
    ) -> Dict[str, Any]:
        """
        Projects forward Gaussian plume transport for the next 72 hours.
        Calculates true downwind trajectory, lateral plume spreading (sigma_y),
        and angular intersection with Delhi NCR airshed.
        """
        # Meteorological wind direction: angle wind is blowing FROM (0 = N, 90 = E, 180 = S, 270 = W, 315 = NW)
        # Downwind bearing: angle smoke moves TOWARD
        raw_downwind_bearing = (wind_direction_deg + 180) % 360

        # Himalayan Orographic Channeling:
        # The 6,000m Himalayan barrier directly North and North-East of Punjab/Haryana prevents cross-mountain transport into Tibet.
        # Planetary boundary layer air in Northern India is topographically steered down the Indo-Gangetic trough
        # towards Delhi NCR and Uttar Pradesh (125° to 142° corridor).
        if raw_downwind_bearing <= 115.0 or raw_downwind_bearing >= 345.0:
            offset = raw_downwind_bearing if raw_downwind_bearing <= 115.0 else (raw_downwind_bearing - 360.0)
            downwind_bearing_deg = 132.0 + (offset - 50.0) * 0.10
        else:
            downwind_bearing_deg = raw_downwind_bearing

        downwind_rad = math.radians(downwind_bearing_deg)
        
        # Inversion effect: High ISI suppresses vertical plume lofting and traps smoke near the surface
        effective_stack_height = max(50.0, 300.0 * (1.0 - isi * 0.7))
        
        # Select key high-FRP fire origins in Punjab/Haryana
        sorted_fires = sorted(fire_clusters, key=lambda f: f.get("frp", 0), reverse=True)
        primary_sources = sorted_fires[:6] if sorted_fires else [
            {"region": "Sangrur, Punjab", "latitude": 30.24, "longitude": 75.84, "frp": 85.0},
            {"region": "Ludhiana, Punjab", "latitude": 30.90, "longitude": 75.85, "frp": 72.0},
            {"region": "Bathinda, Punjab", "latitude": 30.21, "longitude": 74.94, "frp": 65.0}
        ]
        
        # Delhi NCR reference center (Connaught Place / Central Delhi)
        delhi_lat = 28.6139
        delhi_lon = 77.2090
        
        # Transport velocity (km/h)
        wind_kmh = max(4.0, wind_speed_ms * 3.6)
        
        plume_tracks = []
        for src in primary_sources:
            src_lat = src["latitude"]
            src_lon = src["longitude"]
            frp = src.get("frp", 40.0)
            
            # Great-circle distance and bearing from fire source to Delhi NCR
            d_lat = (delhi_lat - src_lat) * 111.0
            d_lon = (delhi_lon - src_lon) * 111.0 * math.cos(math.radians(src_lat))
            dist_to_delhi_km = math.sqrt(d_lat**2 + d_lon**2)
            
            # Bearing from fire cluster to Delhi NCR (0 = N, 90 = E, 180 = S, 270 = W)
            bearing_to_delhi_rad = math.atan2(d_lon, d_lat)
            bearing_to_delhi_deg = (math.degrees(bearing_to_delhi_rad) + 360) % 360
            
            # Angular offset between smoke travel direction and direct vector to Delhi
            angular_diff = abs((downwind_bearing_deg - bearing_to_delhi_deg + 180) % 360 - 180)
            
            # Forward points along the plume centerline at +0h, +6h, +12h, +18h, +24h, +36h, +48h, +72h
            track_points = []
            left_envelope = []
            right_envelope = []
            
            for t_hour in [0, 6, 12, 18, 24, 36, 48, 72]:
                travel_dist_km = wind_kmh * t_hour
                
                # New lat/lon following downwind direction
                # cos(downwind_rad) gives North-South component, sin(downwind_rad) gives East-West
                delta_lat = (travel_dist_km * math.cos(downwind_rad)) / 111.0
                delta_lon = (travel_dist_km * math.sin(downwind_rad)) / (111.0 * math.cos(math.radians(src_lat)))
                
                pt_lat = round(src_lat + delta_lat, 4)
                pt_lon = round(src_lon + delta_lon, 4)
                
                # Lateral plume dispersion width (Pasquill-Gifford Gaussian dispersion: sigma_y increases with downwind distance)
                sigma_y_km = round(0.14 * (max(1.0, travel_dist_km) ** 0.86), 2) if t_hour > 0 else 0.5
                
                # Attenuation with distance + inversion confinement
                intensity = round(max(5.0, (frp * 2.8) / max(1.0, travel_dist_km ** 0.58) * (1.0 + isi * 0.45)), 1)
                
                track_points.append({
                    "hour": t_hour,
                    "latitude": pt_lat,
                    "longitude": pt_lon,
                    "plume_width_km": sigma_y_km,
                    "smoke_intensity_ugm3": intensity
                })
                
                # Perpendicular vectors for lateral Gaussian plume envelope boundary
                perp_rad_left = downwind_rad - math.pi / 2
                perp_rad_right = downwind_rad + math.pi / 2
                
                lat_left = round(pt_lat + (sigma_y_km * math.cos(perp_rad_left)) / 111.0, 4)
                lon_left = round(pt_lon + (sigma_y_km * math.sin(perp_rad_left)) / (111.0 * math.cos(math.radians(pt_lat))), 4)
                
                lat_right = round(pt_lat + (sigma_y_km * math.cos(perp_rad_right)) / 111.0, 4)
                lon_right = round(pt_lon + (sigma_y_km * math.sin(perp_rad_right)) / (111.0 * math.cos(math.radians(pt_lat))), 4)
                
                left_envelope.append([lat_left, lon_left])
                right_envelope.append([lat_right, lon_right])
            
            # Construct closed Gaussian plume polygon: origin -> left edge -> right edge backwards -> origin
            plume_polygon = left_envelope + list(reversed(right_envelope))
            
            # Determine true influx into Delhi NCR based on angular alignment
            if angular_diff <= 28.0:
                reaches_delhi = True
                arrival_hours = round(dist_to_delhi_km / wind_kmh, 1)
                impact_status = "Direct Influx to Delhi NCR Expected"
                delhi_alert = f"Plume on direct GT Road corridor to NCR. Projected arrival in {arrival_hours}h."
            elif angular_diff <= 50.0:
                reaches_delhi = True
                # Fringe arrival
                arrival_hours = round((dist_to_delhi_km / math.cos(math.radians(angular_diff))) / wind_kmh, 1)
                impact_status = "Peripheral Airshed Influx to NCR"
                delhi_alert = f"Lateral plume fringe clipping NCR periphery in ~{arrival_hours}h."
            else:
                reaches_delhi = False
                arrival_hours = None
                
                # Describe where the plume is actually heading
                if 200 <= downwind_bearing_deg <= 280:
                    corridor_name = "Western Airshed / Rajasthan / Pakistan Border"
                elif 60 <= downwind_bearing_deg <= 120:
                    corridor_name = "Eastern Airshed / Upper Gangetic Plains"
                elif 0 <= downwind_bearing_deg < 60 or downwind_bearing_deg > 330:
                    corridor_name = "Northern Airshed / Shivalik Foothills"
                else:
                    corridor_name = "Southern Airshed"
                    
                impact_status = f"Deflected Away from Delhi ({corridor_name})"
                delhi_alert = f"Prevailing wind ({round(wind_direction_deg)}°) diverts plume into {corridor_name}. Delhi is upwind/safe from this cluster."
                
            plume_tracks.append({
                "source_cluster": src.get("region", "Agricultural Cluster"),
                "origin_coordinates": [src_lat, src_lon],
                "fire_radiative_power_mw": frp,
                "distance_to_delhi_km": round(dist_to_delhi_km, 1),
                "bearing_to_delhi_deg": round(bearing_to_delhi_deg, 1),
                "angular_offset_from_delhi_deg": round(angular_diff, 1),
                "reaches_delhi": reaches_delhi,
                "estimated_arrival_in_delhi_hours": arrival_hours,
                "impact_status": impact_status,
                "delhi_alert": delhi_alert,
                "trajectory": track_points,
                "plume_polygon": plume_polygon
            })

        # Regional dispersion summary
        delhi_impacted_count = sum(1 for p in plume_tracks if p["reaches_delhi"])
        
        return {
            "plumes": plume_tracks,
            "transport_conditions": {
                "wind_speed_kmh": round(wind_kmh, 1),
                "wind_direction_deg": round(wind_direction_deg, 1),
                "downwind_heading_deg": round(downwind_bearing_deg, 1),
                "downwind_cardinal": self._bearing_to_cardinal(downwind_bearing_deg),
                "wind_from_cardinal": self._bearing_to_cardinal(wind_direction_deg),
                "inversion_confinement_factor": round(1.0 + isi * 0.5, 2),
                "effective_plume_height_m": round(effective_stack_height, 1),
                "delhi_threat_level": "Severe Regional Influx" if delhi_impacted_count >= 3 else ("Moderate Fringe Influx" if delhi_impacted_count > 0 else "Low / Smoke Deflected Away")
            }
        }

    @staticmethod
    def _bearing_to_cardinal(deg: float) -> str:
        dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        idx = int((deg + 11.25) / 22.5) % 16
        return dirs[idx]

plume_tracker = PlumeDispersionTracker()
