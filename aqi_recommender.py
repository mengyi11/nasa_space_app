# What this code does:
#   - Implements a FastAPI service that produces personalized AQI recommendations.
#   - Supports:
#       GET /recommendation?user_id=...  (reads user from MySQL if DB env vars present)
#       POST /recommendation            (accepts user JSON payload and returns recommendation)
#   - Fetches live AQI/pollutant data from AirNow (requires AIRNOW_API_KEY env var).
#   - Geocodes city/state/country -> lat/lon using OpenStreetMap Nominatim (no API key).
#   - Produces structured JSON showing user conditions, sensitive pollutants, why harmful,
#     actions, rule_triggers, rule_version, timestamp_utc, confidence_score.
#   - Gracefully handles missing API data.


import os
import requests
import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error as MySQLError
from dotenv import load_dotenv 

load_dotenv()

APP_VERSION = "1.0.0"
RULE_VERSION = "1.0.0"

AIRNOW_API_KEY = os.getenv("AIRNOW_API_KEY")  # required to fetch AirNow
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

app = FastAPI(title="AQI Recommender", version=APP_VERSION)

# Allow CORS from local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserPayload(BaseModel):
    user_id: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    birth_month: Optional[int] = None
    birth_year: Optional[int] = None
    pregnancy_status: Optional[bool] = False
    has_asthma: Optional[bool] = False
    has_bronchitis: Optional[bool] = False
    has_copd: Optional[bool] = False

# AQI categories and pollutant sensitivity by health condition (which pollutants need special care)
AQI_CATEGORIES = [
    (0, 50, "Good", "Green"),
    (51, 100, "Moderate", "Yellow"),
    (101, 150, "Unhealthy for Sensitive Groups", "Orange"),
    (151, 200, "Unhealthy", "Red"),
    (201, 300, "Very Unhealthy", "Purple"),
    (301, 10000, "Hazardous", "Maroon"),
]

POLLUTANT_SENSITIVITY = {
    "asthma": ["PM2.5", "NO2", "O3"],
    "bronchitis": ["PM2.5", "PM10"],
    "copd": ["PM2.5", "PM10", "NO2", "O3"],
    "pregnancy": ["PM2.5"],
    "elderly": ["PM2.5", "PM10", "O3"],
}

def compute_age(birth_month: int, birth_year: int, today: Optional[datetime.date]=None) -> int:
    '''
    Calculates the user's current age based on their birth month and year.    
    ''' 
    if birth_month is None or birth_year is None:
        return 0
    if today is None:
        today = datetime.date.today()
    age = today.year - birth_year - (1 if (today.month < birth_month) else 0)
    return age

def aqi_to_category(aqi: Optional[int]) -> Dict[str,str]:
    '''
    Converts a numeric AQI score (e.g., 68) into a text category (e.g., "Moderate") and color
    ''' 
    if aqi is None:
        return {"category":"Unknown", "color":"Gray"}
    for low, high, name, color in AQI_CATEGORIES:
        if low <= aqi <= high:
            return {"category": name, "color": color}
    return {"category": "Unknown", "color":"Gray"}

# Geocoding with Nominatim)
def geocode_location(city: str, state: str, country: str) -> Optional[Dict[str, float]]:
    """
    Uses OSM Nominatim to fetch lat/lon for city/state/country. No API key required.
    Converts a location (city, state, country) into geographical coordinates (latitude, longitude) using OpenStreetMap.
    """
    if not (city or state or country):
        return None
    q = ", ".join([p for p in [city or "", state or "", country or ""] if p])
    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "aqi-recommender/1.0 (+https://example.com)"}  # identify your app
    params = {"q": q, "format": "json", "limit": 1}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        results = resp.json()
        if not results:
            return None
        first = results[0]
        return {"lat": float(first["lat"]), "lon": float(first["lon"])}
    except Exception as e:
        print("Geocode error:", e)
        return None

# AirNow AQI data fetch 
def fetch_airnow(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """
    - Fetch live observations from AirNow (requires AIRNOW_API_KEY).
    Returns structure:
    {
      "aqi": 135,
      "dominant_pollutant": "PM2.5",
      "pollutant_levels": {"PM2.5": {"aqi": 135, "conc": 55.0, "unit":"µg/m3"}, ...},
      "raw_observations": [...]
    }
    - Fetches the primary live air quality data (AQI, PM2.5, O3, etc.) from the AirNow API using coordinates.
    """
    if not AIRNOW_API_KEY:
        return None

    url = "https://www.airnowapi.org/aq/observation/latLong/current/"
    params = {
        "format": "application/json",
        "latitude": lat,
        "longitude": lon,
        "distance": 25,  # in km 
        "API_KEY": AIRNOW_API_KEY
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, list) or len(data) == 0:
            return None
        pollutant_levels = {}
        highest_aqi = None
        dominant = None
        for obs in data:
            pname = obs.get("ParameterName")  # like "PM2.5", "O3", "PM10", "NO2"
            aqi = obs.get("AQI")
            conc = obs.get("Concentration")
            unit = obs.get("Unit")
            pollutant_levels[pname] = {"aqi": aqi, "conc": conc, "unit": unit}
            if aqi is not None:
                if highest_aqi is None or aqi > highest_aqi:
                    highest_aqi = aqi
                    dominant = pname
        return {
            "aqi": highest_aqi,
            "dominant_pollutant": dominant,
            "pollutant_levels": pollutant_levels,
            "raw_observations": data
        }
    except Exception as e:
        print("AirNow fetch error:", e)
        return None

# NASA TEMPO NO2

def fetch_tempo_no2(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    '''
    Fetches supplemental NO2 (Nitrogen Dioxide) concentration data using the EPA TEMPO API.
    '''
    try:
        url = f"https://api.epa.gov/tempo/no2?lat={lat}&lon={lon}&format=json"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return {
            "NO2": {"aqi": data.get("aqi_estimate"), "conc": data.get("no2_ppb"), "unit": "ppb"}
        }
    except Exception as e:
        print("TEMPO NO2 fetch error:", e)
        return None

# Getting user data from MySQL 

def get_user_from_mysql(user_id: str) -> Optional[Dict[str, Any]]:
    '''
     Reads a user's full health profile directly from the MySQL database using a user_id. (Used only by the /recommendation GET endpoint).
     '''
    if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
        print("Error: Database configuration is incomplete or failed to load from .env.")
        return None

    conn = None 

    print("Connecting to MySQL database...")

    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=int(DB_PORT),
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connection_timeout=5
        )
        with conn.cursor(dictionary=True) as cursor:
            query = """
            SELECT user_id, city, state, country, birth_month, birth_year, pregnancy_status, has_asthma, has_bronchitis, has_copd 
            FROM user
            WHERE user_id = %s LIMIT 1
            """
            cursor.execute(query, (user_id,))
            row = cursor.fetchone()
            return row
            
    except MySQLError as e:
        print(f"MySQL error: {e}")
        return None
    except ValueError:
        print("Configuration error: DB_PORT value is not a valid integer.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            conn.close()

# The whole fetching user health data and getting severity code + recommendation thing
def determine_sensitive_pollutants(user: Dict[str,Any]) -> List[str]:
    '''
Determines which pollutants (e.g., PM2.5, O3) the user is highly sensitive to based on their health profile (e.g., asthma, pregnancy).
'''
    sens = set()
    if user.get("has_copd"):
        sens.update(POLLUTANT_SENSITIVITY["copd"])
    if user.get("has_asthma"):
        sens.update(POLLUTANT_SENSITIVITY["asthma"])
    if user.get("has_bronchitis"):
        sens.update(POLLUTANT_SENSITIVITY["bronchitis"])
    if user.get("pregnancy_status"):
        sens.update(POLLUTANT_SENSITIVITY["pregnancy"])
    age = compute_age(user.get("birth_month") or 1, user.get("birth_year") or 2000)
    if age >= 65:
        sens.update(POLLUTANT_SENSITIVITY["elderly"])
    return sorted(list(sens))

def determine_preset_bucket(user: Dict[str,Any]) -> str: #Assigns the user to a high-level risk group, like "COPD," "Asthma," or "General," to customize recommendations.
    if user.get("has_copd"):
        return "COPD"
    resp_count = sum([bool(user.get("has_asthma")), bool(user.get("has_bronchitis"))])
    if resp_count > 1:
        return "RespiratoryMultiple"
    if user.get("has_asthma"):
        return "Asthma"
    if user.get("has_bronchitis"):
        return "Bronchitis"
    if user.get("pregnancy_status"):
        return "Pregnant"
    age = compute_age(user.get("birth_month") or 1, user.get("birth_year") or 2000)
    if age >= 65:
        return "Elderly"
    return "General"

def describe_pollutant_harm(pollutant: str) -> str: #Provides explanation of how a specific pollutant can harm health.
    d = {
        "PM2.5": "Fine particulate matter (PM2.5) penetrates deep into the lungs and can aggravate asthma, bronchitis, pregnancy-related risks, and cardiovascular disease.",
        "PM10": "Coarse particulate matter (PM10) can irritate the airways and aggravate respiratory conditions in older adults and those with lung disease.",
        "NO2": "Nitrogen dioxide (NO2) irritates airways and can worsen asthma and other respiratory conditions.",
        "O3": "Ground-level ozone (O3) can cause chest pain, coughing, throat irritation and worsen bronchitis, emphysema and asthma."
    }
    return d.get(pollutant, f"{pollutant} may affect sensitive people.")

def compute_severity_score(aqi: Optional[int], preset: str) -> float:
    '''
Generates a single numerical risk score (0.0 to 1.0) based on the current AQI and the user's preset health bucket.
'''
    if aqi is None:
        return 0.2
    if aqi <= 50:
        s = 0.0
    elif aqi <= 100:
        s = 0.25
    elif aqi <= 150:
        s = 0.5
    elif aqi <= 200:
        s = 0.75
    else:
        s = 0.95
    if preset in ("COPD","Asthma","Pregnant","RespiratoryMultiple"):
        s = min(1.0, s + 0.15)
    return s

def generate_recommendation(user: Dict[str,Any], aqi_payload: Optional[Dict[str,Any]]) -> Dict[str,Any]:
    '''
    - Main Logic
    - Takes the user's health data and the raw AQI data, runs them through the health rules, and outputs the final, structured recommendation and action plan.
''' 
    aqi = None
    pollutant_levels = {}
    dominant = None
    if aqi_payload:
        aqi = aqi_payload.get("aqi")
        pollutant_levels = aqi_payload.get("pollutant_levels", {})
        dominant = aqi_payload.get("dominant_pollutant")

    category_info = aqi_to_category(aqi)
    preset = determine_preset_bucket(user)
    sensitive_pollutants = determine_sensitive_pollutants(user)

    # Why it's harmful statements to educate the users
    why_harmful = []
    rule_triggers = []
    for p in sensitive_pollutants:
        if p in pollutant_levels:
            lvl = pollutant_levels[p]
            why_harmful.append(f"{p}: {describe_pollutant_harm(p)} Observed conc={lvl.get('conc')} {lvl.get('unit')}; pollutant AQI={lvl.get('aqi')}.")
            rule_triggers.append(f"{p}_present")
        else:
            why_harmful.append(f"{p}: {describe_pollutant_harm(p)} (not measured locally in this sample).")

    severity_score = compute_severity_score(aqi, preset)

    # Short recommendations - use to trigger SMS sending?
    if severity_score < 0.25:
        short = "Air quality is acceptable for most people. Routine outdoor activities are OK."
    elif severity_score < 0.5:
        short = "Air quality is moderate. Sensitive individuals should limit prolonged or intense outdoor activities."
    elif severity_score < 0.75:
        short = f"Air quality may affect you. {preset} individuals should avoid prolonged outdoor exertion today."
    else:
        short = f"Poor air quality — avoid outdoor exposure. {preset} individuals should stay indoors with filtered air and follow medical plans."

    # Action from user to stay safe and healthy
    actions = {"can_do": [], "limit": [], "avoid": []}
    if severity_score < 0.25:
        actions["can_do"].append("normal outdoor activities")
    elif severity_score < 0.5:
        actions["limit"].extend(["long runs", "heavy outdoor work"])
        actions["can_do"].append("short walks")
    elif severity_score < 0.75:
        actions["avoid"].extend(["prolonged outdoor exertion", "strenuous outdoor exercise"])
        actions["limit"].append("open-window sleeping if indoor air not filtered")
    else:
        actions["avoid"].extend(["going outdoors", "gardening", "outdoor sports"])
        actions["can_do"].append("stay indoors with filtered air")

    advisory = f"{short} Sensitive pollutants: {', '.join(sensitive_pollutants) or 'none'}. If symptoms occur (wheezing, chest tightness, severe cough), use medications and contact your clinician."

    now = datetime.datetime.utcnow().isoformat() + "Z"
    return {
        "user_id": user.get("user_id"),
        "user_conditions": {
            "age": compute_age(user.get("birth_month") or 1, user.get("birth_year") or 2000),
            "pregnant": bool(user.get("pregnancy_status")),
            "has_asthma": bool(user.get("has_asthma")),
            "has_bronchitis": bool(user.get("has_bronchitis")),
            "has_copd": bool(user.get("has_copd"))
        },
        "location": {"city": user.get("city"), "state": user.get("state"), "country": user.get("country")},
        "current_aqi": aqi,
        "aqi_category": category_info["category"],
        "aqi_color": category_info["color"],
        "dominant_pollutant": dominant,
        "pollutant_levels": pollutant_levels,
        "sensitive_pollutants": sensitive_pollutants,
        "preset_bucket": preset,
        "recommendation_short": short,
        "recommendation_long": advisory,
        "why_harmful": why_harmful,
        "actions": actions,
        "rule_triggers": rule_triggers,
        "rule_version": RULE_VERSION,
        "timestamp_utc": now,
        "severity_score": round(compute_severity_score(aqi, preset), 2),
        "confidence_score": 0.9
    }

# FastAPI endpoints 
@app.get("/health") #to confirm the Python service is running and responsive.
def health():
    return {"status": "ok", "version": APP_VERSION, "rule_version": RULE_VERSION}

@app.get("/recommendation") #DB Direct: Reads user_id from query parameter, fetches user from its own DB connection, then runs the logic. Not used by the Next.js frontend.
def get_recommendation(user_id: Optional[str] = None):
    """
    GET mode: if DB env vars exist and user_id provided, read user from DB.
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required for GET (or use POST with full user payload).")
    db_user = get_user_from_mysql(user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in DB or DB not configured.")
    user = {
        "user_id": db_user.get("user_id"),
        "city": db_user.get("city"),
        "state": db_user.get("state"),
        "country": db_user.get("country"),
        "birth_month": db_user.get("birth_month"),
        "birth_year": db_user.get("birth_year"),
        "pregnancy_status": bool(db_user.get("pregnancy_status")),
        "has_asthma": bool(db_user.get("has_asthma")),
        "has_bronchitis": bool(db_user.get("has_bronchitis")),
        "has_copd": bool(db_user.get("has_copd")),
    }
    coords = geocode_location(user.get("city"), user.get("state"), user.get("country"))
    aqi_payload = None
    if coords:
        aqi_payload = fetch_airnow(coords["lat"], coords["lon"])
    rec = generate_recommendation(user, aqi_payload)
    return rec

@app.post("/recommendation") #Primary Endpoint: Receives the fully authenticated user JSON payload from the Next.js backend, fetches all air quality data, generates the personalized recommendation, and returns the result. This is the endpoint the Next.js frontend uses.
async def post_recommendation(payload: UserPayload):
    """
    POST mode: accept a full user JSON and return recommendation.
    """
    user = payload.dict()
    
    # 1. Geocode to get coordinates
    coords = geocode_location(user.get("city"), user.get("state"), user.get("country"))
    aqi_payload = None
    
    if coords:
        # 2. Fetch primary AQI data
        aqi_payload = fetch_airnow(coords["lat"], coords["lon"])
        
        # 3. TEMPO Fallback Logic (if NO2 is missing)
        if not aqi_payload or "NO2" not in aqi_payload.get("pollutant_levels", {}):
            tempo_data = fetch_tempo_no2(coords["lat"], coords["lon"])
            if tempo_data:
                # Initialize payload if AirNow returned None but TEMPO succeeded
                if not aqi_payload:
                    aqi_payload = {"pollutant_levels": {}}
                aqi_payload["pollutant_levels"].update(tempo_data)

    # 4. Generate and return recommendation
    rec = generate_recommendation(user, aqi_payload)
    return rec
