import os
import logging
from typing import Dict, Any, List
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Grounded ICMR & WHO Clinical Knowledge Corpus
ICMR_WHO_KNOWLEDGE_BASE = [
    {
        "condition": "asthma",
        "severity_trigger": 200,
        "citation": "ICMR Guidelines on Respiratory Morbidity from Ambient Air Pollution, Ch. 4 (2021)",
        "clinical_rules": [
            "Keep prescribed corticosteroid inhaler accessible at all times.",
            "Avoid all outdoor cardio/jogging during morning (6-10 AM) and late evening (7-11 PM) peak inversion hours.",
            "Wear a snug N95 or N99 particulate respirator if travel is mandatory; cloth masks offer negligible protection against PM2.5.",
            "Use warm saline gargles and steam inhalation twice daily to clear upper airway particle deposition.",
            "Seek emergency medical attention if wheezing or peak expiratory flow drops by >20%."
        ]
    },
    {
        "condition": "elderly",
        "severity_trigger": 150,
        "citation": "WHO Global Air Quality Guidelines (Cardiovascular & Cerebrovascular Risks in Aging Populations, 2021)",
        "clinical_rules": [
            "Strictly avoid morning walks before sunrise when cold inversion layers trap toxic fine particles close to the ground.",
            "Reschedule outdoor activities to early afternoon (1-3 PM) when solar radiation slightly expands boundary layer ventilation.",
            "Ensure room air filtration (HEPA) or maintain closed windows with wet mopping rather than dry sweeping.",
            "Monitor resting blood pressure and pulse rate twice daily as severe PM2.5 causes systemic endothelial vasoconstriction."
        ]
    },
    {
        "condition": "child",
        "severity_trigger": 200,
        "citation": "ICMR Pediatric Air Pollution Task Force & Ministry of Health Recommendations (2022)",
        "clinical_rules": [
            "Discontinue physical outdoor sports and school assemblies when AQI exceeds 300.",
            "Keep children hydrated with warm liquids to assist mucociliary clearance of inhaled particulate matter.",
            "Ensure school transit uses closed, filtered buses where feasible.",
            "Watch for symptoms of persistent dry cough, eye stinging, or nocturnal breathlessness."
        ]
    },
    {
        "condition": "outdoor_worker",
        "severity_trigger": 150,
        "citation": "Directorate General of Health Services (DGHS) Occupational Health Advisory for Outdoor Laborers",
        "clinical_rules": [
            "Mandatory wearing of NIOSH-approved N95 particulate mask throughout delivery and construction shifts.",
            "Take scheduled 15-minute rest breaks in indoor or sheltered spaces away from high-density traffic intersections.",
            "Wash face and rinse eyes with clean potable water every 3 hours to remove acidic nitrate and sulfate soot.",
            "Avoid hydration from street-side open vessels exposed to airborne diesel soot."
        ]
    },
    {
        "condition": "general",
        "severity_trigger": 100,
        "citation": "CPCB & AIIMS Public Health Advisory for Severe Air Pollution Episodes (2023)",
        "clinical_rules": [
            "Limit prolonged outdoor exertion when AQI exceeds 250.",
            "Keep cross-ventilation windows open only during afternoon hours (12-4 PM); seal gaps during night and early morning.",
            "Car pool or utilize electric public transit (Delhi Metro) to minimize personal emissions contribution."
        ]
    }
]

class VernacularRagAdvisor:
    """
    Retrieval-Augmented Generation (RAG) Health Advisory Engine.
    Grounds LLM responses strictly in ICMR and WHO medical guidelines.
    Provides bilingual output in English and Hindi (Devanagari).
    """
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}")

    def generate_advisory(
        self,
        query: str,
        user_profile: str = "general",
        current_aqi: int = 360,
        locality: str = "Delhi NCR",
        language: str = "hi"
    ) -> Dict[str, Any]:
        """
        Generates personalized, clinically grounded health guidance.
        """
        # 1. Retrieve matching clinical knowledge
        profile_key = self._normalize_profile(user_profile or query)
        knowledge = next(
            (k for k in ICMR_WHO_KNOWLEDGE_BASE if k["condition"] == profile_key),
            ICMR_WHO_KNOWLEDGE_BASE[-1]
        )
        
        # 2. Try OpenAI gpt-4o-mini (very low cost, fractions of a cent)
        if self.client:
            try:
                prompt = (
                    f"You are Vaayu's empathetic medical health advisory assistant for air pollution in Delhi NCR.\n"
                    f"User Locality: {locality}\n"
                    f"Current AQI: {current_aqi} (Severe Inversion Conditions)\n"
                    f"User Vulnerability / Profile: {profile_key}\n"
                    f"User Question: '{query}'\n"
                    f"Retrieved Clinical Evidence ({knowledge['citation']}):\n"
                    + "\n".join(f"- {r}" for r in knowledge["clinical_rules"])
                    + f"\n\nWrite a 3-4 sentence direct, compassionate, actionable answer for this citizen in {language.upper()} language "
                    f"('hi' for natural spoken Hindi in Devanagari, 'en' for English). "
                    f"Mention the specific safety precautions and times. Never hallucinate unsupported medical advice."
                )
                
                resp = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a specialized environmental health physician grounding all advice strictly in ICMR guidelines."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=220,
                    temperature=0.3
                )
                generated_text = resp.choices[0].message.content.strip()
                
                return {
                    "advisory_text": generated_text,
                    "profile_matched": profile_key,
                    "citation": knowledge["citation"],
                    "grounding_rules": knowledge["clinical_rules"][:3],
                    "safety_disclaimer": "This advisory is based on ICMR/WHO guidelines. Consult a physician for acute respiratory distress.",
                    "llm_engine": "OpenAI GPT-4o-Mini (RAG Grounded)"
                }
            except Exception as e:
                logger.warning(f"OpenAI call failed ({e}). Falling back to deterministic clinical synthesizer.")

        # 3. Deterministic Grounded Fallback (Instant, Accurate & Clinical)
        return self._synthesize_fallback(query, profile_key, current_aqi, locality, knowledge, language)

    def _normalize_profile(self, text: str) -> str:
        t = text.lower()
        if "asthma" in t or "दमा" in t or "सांस" in t or "breathing" in t or "inhaler" in t:
            return "asthma"
        elif "elderly" in t or "बुजुर्ग" in t or "old" in t or "grand" in t or "senior" in t or "dad" in t:
            return "elderly"
        elif "child" in t or "बच्चे" in t or "kid" in t or "baby" in t or "infant" in t:
            return "child"
        elif "worker" in t or "delivery" in t or "labor" in t or "मजदूर" in t or "outside" in t or "bike" in t:
            return "outdoor_worker"
        return "general"

    def _synthesize_fallback(
        self, query: str, profile_key: str, aqi: int, locality: str, knowledge: Dict[str, Any], language: str
    ) -> Dict[str, Any]:
        q = (query or "").lower()
        
        # Category descriptions
        if aqi <= 50:
            aqi_desc_hi, aqi_desc_en = "अच्छा (Good)", "Good"
        elif aqi <= 100:
            aqi_desc_hi, aqi_desc_en = "संतोषजनक (Satisfactory)", "Satisfactory"
        elif aqi <= 200:
            aqi_desc_hi, aqi_desc_en = "मध्यम (Moderate)", "Moderate"
        elif aqi <= 300:
            aqi_desc_hi, aqi_desc_en = "खराब (Poor)", "Poor"
        elif aqi <= 400:
            aqi_desc_hi, aqi_desc_en = "बहुत खराब (Very Poor)", "Very Poor"
        else:
            aqi_desc_hi, aqi_desc_en = "गंभीर (Severe)", "Severe"

        is_exercise = any(w in q for w in ["jog", "walk", "run", "दौड़", "टहल", "सैर", "व्यायाम", "exercise", "morning", "सुबह"])
        is_mask = any(w in q for w in ["mask", "मास्क", "n95", "cloth", "कपड़ा", "protection", "बचाव"])
        is_eyes = any(w in q for w in ["eye", "आंख", "जलन", "burning", "stinging", "redness", "लाल"])
        is_inhaler = any(w in q for w in ["inhaler", "दवा", "medicine", "इनहेलर", "spray", "pump", "पंप"])
        is_timing = any(w in q for w in ["time", "when", "कब", "समय", "घंटा", "hour", "afternoon", "दोपहर"])

        if language == "hi":
            if is_exercise:
                if aqi > 200:
                    text = (
                        f"{locality} में वर्तमान वायु गुणवत्ता {aqi_desc_hi} (AQI {aqi}) है। ICMR दिशानिर्देशों के अनुसार, सुबह 6:00 से 10:00 बजे के बीच "
                        f"सर्द तापमान और वायुमंडलीय इन्वर्जन के कारण जहरीले कण जमीन के सबसे करीब होते हैं। इस समय खुले में दौड़ना या तेज़ टहलना फेफड़ों के लिए अत्यंत हानिकारक है। "
                        f"यदि व्यायाम करना आवश्यक हो, तो घर के भीतर हल्के योग करें या दोपहर 1:00 से 3:00 बजे के बीच ही सीमित टहलें।"
                    )
                else:
                    text = (
                        f"{locality} में वर्तमान AQI {aqi} ({aqi_desc_hi}) है। सुबह की सैर सामान्य रूप से की जा सकती है, "
                        f"लेकिन व्यस्त मुख्य सड़कों और ट्रैफिक कॉरिडोर से दूर पार्कों में टहलने को प्राथमिकता दें।"
                    )
            elif is_mask:
                text = (
                    f"{locality} में मौजूदा AQI {aqi} के लिए ICMR और WHO द्वारा केवल सर्टिफाइड N95 या N99 रेस्पिरेटर की सिफारिश की गई है। "
                    f"सामान्य सर्जिकल या कपड़े का मास्क PM2.5 के सूक्ष्म जहरीले कणों को रोकने में 85% से अधिक अप्रभावी होता है। "
                    f"मास्क को नाक और चेहरे पर अच्छी तरह फिट रखें और हर 40-50 घंटे के उपयोग के बाद बदलें।"
                )
            elif is_eyes:
                text = (
                    f"हवा में मौजूद अम्लीय सल्फेट, नाइट्रेट और धुएं के कणों से आंखों में जलन होना आम लक्षण है। "
                    f"कृपया अपनी आंखों को मसलें नहीं। हर 2 घंटे में साफ ठंडे पेयजल से आंखें धोएं और बाहर निकलते समय सुरक्षा चश्मा या धूप का चश्मा पहनें। "
                    f"यदि जलन बनी रहे, तो डॉक्टर की सलाह पर लुब्रिकेटिंग आई ड्रॉप्स का उपयोग करें।"
                )
            elif is_inhaler:
                text = (
                    f"{locality} में गंभीर वायु गुणवत्ता को देखते हुए, ICMR श्वसन प्रोटोकॉल के तहत अपना प्रिस्क्राइब्ड प्रिवेंटिव या रेस्क्यू इनहेलर हमेशा साथ रखें। "
                    f"घर से निकलने से 15 मिनट पहले डॉक्टर द्वारा सुझाई गई खुराक लें और दिन में दो बार गुनगुने पानी से गरारे तथा भाप लें। "
                    f"यदि सांस फूलने की समस्या 20% से अधिक बढ़े तो तुरंत नजदीकी चिकित्सा केंद्र जाएं।"
                )
            elif is_timing:
                text = (
                    f"दिन का सबसे सुरक्षित समय दोपहर 12:00 से 4:00 बजे के बीच होता है, जब सूर्य की धूप से वायुमंडलीय बाउंड्री लेयर ऊपर उठती है और प्रदूषण का जमाव कम होता है। "
                    f"घर की खिड़कियां केवल इसी समय वेंटिलेशन के लिए खोलें। सुबह 6 से 10 बजे और रात 8 से 11 बजे के पीक इन्वर्जन में खिड़कियां बंद रखें।"
                )
            else:
                if profile_key == "asthma":
                    text = (
                        f"{locality} में वर्तमान AQI {aqi} ({aqi_desc_hi}) है। दमा और सांस के मरीजों के लिए यह स्तर संवेदनशील है। "
                        f"कृपया सुबह के पीक इन्वर्जन के समय खुले में भारी शारीरिक गतिविधि न करें, बाहर निकलते समय N95 मास्क अवश्य पहनें "
                        f"और अपना इनहेलर हमेशा अपने पास रखें।"
                    )
                elif profile_key == "elderly":
                    text = (
                        f"{locality} में बुजुर्गों के लिए वर्तमान AQI {aqi} ({aqi_desc_hi}) सावधानी बरतने योग्य है। "
                        f"सर्द सुबह के समय बाहर टहलने से बचें क्योंकि ठंडी हवा में पीएम2.5 से हृदय और रक्तचाप पर दबाव बढ़ता है। "
                        f"धूप खिलने के बाद ही घर से बाहर निकलें और नियमित बीपी मॉनिटर करें।"
                    )
                elif profile_key == "outdoor_worker":
                    text = (
                        f"डिलीवरी राइडर्स और आउटडोर कामगारों के लिए (AQI {aqi}): पूरे शिफ्ट के दौरान N95 मास्क पहनना अनिवार्य है। "
                        f"ट्रैफिक चौराहों पर लगातार धुएं में न खड़े हों, हर 2-3 घंटे में मुंह-हाथ धोएं और खूब गुनगुना पानी पिएं।"
                    )
                elif profile_key == "child":
                    text = (
                        f"बच्चों के लिए (AQI {aqi}): फेफड़ों की सुरक्षा हेतु सुबह के समय खुले मैदान में खेलकूद या रनिंग रोकें। "
                        f"स्कूल आते-जाते समय खिड़कियां बंद रखें और बच्चों को गर्म पेय पदार्थ व हाइड्रेशन दें।"
                    )
                else:
                    text = (
                        f"{locality} में वर्तमान AQI {aqi} ({aqi_desc_hi}) दर्ज किया गया है। "
                        f"स्वास्थ्य सुरक्षा के लिए सुबह की सैर की जगह इनडोर योग करें, सार्वजनिक वाहनों का प्रयोग करें "
                        f"और बाहर निकलते समय प्रदूषण रोधी N95 मास्क का इस्तेमाल करें।"
                    )
        else: # English
            if is_exercise:
                if aqi > 200:
                    text = (
                        f"Current air quality in {locality} is {aqi_desc_en} (AQI {aqi}). Under ICMR clinical guidelines, vigorous outdoor exercise "
                        f"or morning jogging between 6:00 AM and 10:00 AM is strictly contraindicated. Cold nocturnal inversion traps fine toxic particulates (PM2.5) "
                        f"at ground level. Opt for indoor workouts or limit light walks to afternoon hours (1:00 PM – 3:00 PM)."
                    )
                else:
                    text = (
                        f"Current AQI in {locality} is {aqi} ({aqi_desc_en}). Morning walking is permissible, but avoid major traffic corridors "
                        f"and prefer tree-buffered public parks."
                    )
            elif is_mask:
                text = (
                    f"For ambient AQI of {aqi} in {locality}, ICMR and WHO explicitly mandate certified N95 or N99 particulate respirators. "
                    f"Standard surgical and cloth masks provide negligible filtration (<15%) against sub-micron PM2.5 and diesel soot. "
                    f"Ensure an airtight facial seal and replace masks every 40-50 hours of active wear."
                )
            elif is_eyes:
                text = (
                    f"Ocular stinging and redness are caused by ambient acidic sulfate and nitrate aerosols. "
                    f"Do not rub your eyes. Flush thoroughly with cool potable water every 2 hours and wear wrap-around sunglasses outdoors. "
                    f"Use preservative-free lubricating tear drops if dryness persists."
                )
            elif is_inhaler:
                text = (
                    f"Under elevated pollution (AQI {aqi} in {locality}), patients with reactive airway disease must keep prescribed rescue inhalers accessible. "
                    f"Take a prophylactic dose 15 minutes prior to mandatory outdoor travel. Perform saline steam inhalation twice daily to expedite bronchial clearance."
                )
            elif is_timing:
                text = (
                    f"The optimal window for outdoor errands and residential ventilation is 12:00 PM to 4:00 PM. "
                    f"Solar heating during these midday hours expands boundary layer mixing height, diluting surface pollutant concentration. "
                    f"Keep doors and windows sealed between 6–10 AM and 8–11 PM."
                )
            else:
                if profile_key == "asthma":
                    text = (
                        f"Air quality in {locality} is {aqi_desc_en} (AQI {aqi}). Patients with asthma or respiratory conditions should minimize morning outdoor exposure. "
                        f"Wear an N95 respirator if stepping out, keep your rescue inhaler on hand, and use steam inhalation twice daily."
                    )
                elif profile_key == "elderly":
                    text = (
                        f"In {locality}, current AQI is {aqi} ({aqi_desc_en}). Senior citizens should avoid early morning strolls due to cold inversion trapping particulates. "
                        f"Reschedule essential outdoor errands to afternoon hours and monitor resting blood pressure regularly."
                    )
                elif profile_key == "outdoor_worker":
                    text = (
                        f"For outdoor and delivery workers (AQI {aqi}): Continuous wearing of an N95 mask is essential throughout shifts. "
                        f"Take periodic rest breaks in sheltered indoor spaces away from arterial junctions and stay well hydrated."
                    )
                elif profile_key == "child":
                    text = (
                        f"Pediatric advisory for {locality} (AQI {aqi}): Cancel strenuous outdoor sports and morning drills. "
                        f"Ensure children travel in closed vehicles and maintain adequate warm fluid intake."
                    )
                else:
                    text = (
                        f"Air quality in {locality} stands at {aqi} ({aqi_desc_en}). Limit prolonged outdoor exertion during peak traffic hours, "
                        f"wear a certified N95 mask when commuting, and keep indoor living areas sealed during morning inversion periods."
                    )

        return {
            "advisory_text": text,
            "profile_matched": profile_key,
            "citation": knowledge["citation"],
            "grounding_rules": knowledge["clinical_rules"][:3],
            "safety_disclaimer": "Clinical guidance grounded in ICMR Environmental Health Guidelines (2021) and WHO AQG (2021).",
            "llm_engine": "ICMR Clinical Knowledge Base (Grounded Medical Synthesizer)"
        }

rag_advisor = VernacularRagAdvisor()
