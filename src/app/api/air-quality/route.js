import { NextResponse } from 'next/server';
import axios from 'axios';

// 1. Base Configuration
const WAQI_API_TOKEN = "aa4922ba6bcff090d06938447c5a5d5c2c407915";
const SINGAPORE_LAT = 1.3521;
const SINGAPORE_LNG = 103.8198;

// 2. Personalized Recommendation Configuration
// 2.1 Mapping of health conditions to sensitive pollutants
const SYMPTOM_SENSITIVE_POLLUTANTS = {
  asthma: ["PM2.5", "NO2", "O3"],
  bronchitis: ["PM2.5", "PM10"],
  copd: ["PM2.5", "PM10", "NO2", "O3"],
  pregnancy: ["PM2.5"],
  elderly: ["PM2.5", "PM10", "O3"]
};

// 2.2 AQI Risk Level to Base Advice Mapping
const AQI_RISK_ADVICE = [
  { min: 0, max: 50, level: "Low Risk", baseAdvice: "Good air quality, normal outdoor activities are safe" },
  { min: 51, max: 100, level: "Moderate Risk", baseAdvice: "Moderate air quality, sensitive groups should limit high-intensity outdoor activities" },
  { min: 101, max: 150, level: "Elevated Risk", baseAdvice: "Sensitive groups should avoid outdoor activities; others should minimize exposure" },
  { min: 151, max: 200, level: "High Risk", baseAdvice: "Everyone should reduce outdoor activities; sensitive groups should stay indoors" },
  { min: 201, max: 300, level: "Very High Risk", baseAdvice: "Avoid outdoor activities; use air purifiers indoors" },
  { min: 301, max: 10000, level: "Hazardous", baseAdvice: "Emergency level! Stay indoors and keep doors and windows closed" }
];

// 3. Personalized Recommendation Utility Functions

/** 
 * Calculate user age
 */
function calculateAge(birthYear) {
  if (!birthYear || isNaN(birthYear)) return 0;
  return new Date().getFullYear() - birthYear;
}

/**
 * Determine user risk group (e.g. “Asthma patient”, “Pregnant woman”)
 */
function getUserRiskGroup(userSettings) {
  const { hasAsthma, hasBronchitis, hasCopd, isPregnant, birthYear } = userSettings;
  const age = calculateAge(birthYear);

  if (hasCopd) return "COPD patient";
  if (hasAsthma && hasBronchitis) return "Multiple respiratory conditions";
  if (hasAsthma) return "Asthma patient";
  if (hasBronchitis) return "Bronchitis patient";
  if (isPregnant) return "Pregnant woman";
  if (age >= 65) return "Elderly (65+)";
  return "General population";
}

/**
 * Get list of pollutants the user is sensitive to
 */
function getSensitivePollutants(userSettings) {
  const { hasAsthma, hasBronchitis, hasCopd, isPregnant, birthYear } = userSettings;
  const age = calculateAge(birthYear);
  const sensitive = new Set();

  if (hasAsthma) sensitive.add(...SYMPTOM_SENSITIVE_POLLUTANTS.asthma);
  if (hasBronchitis) sensitive.add(...SYMPTOM_SENSITIVE_POLLUTANTS.bronchitis);
  if (hasCopd) sensitive.add(...SYMPTOM_SENSITIVE_POLLUTANTS.copd);
  if (isPregnant) sensitive.add(...SYMPTOM_SENSITIVE_POLLUTANTS.pregnancy);
  if (age >= 65) sensitive.add(...SYMPTOM_SENSITIVE_POLLUTANTS.elderly);

  return Array.from(sensitive);
}

/**
 * Generate personalized user actions (canDo / limit / avoid)
 */
function generateUserActions(userSettings, currentAQI, pollutantLevels) {
  const riskGroup = getUserRiskGroup(userSettings);
  const sensitivePollutants = getSensitivePollutants(userSettings);
  const [aqiRisk] = AQI_RISK_ADVICE.filter(item => currentAQI >= item.min && currentAQI <= item.max);
  const riskLevel = aqiRisk?.level || "Unknown";

  const actions = { canDo: [], limit: [], avoid: [] };

  // Low Risk
  if (riskLevel === "Low Risk") {
    actions.canDo.push("Outdoor activities such as walking or jogging", "Keep windows open for ventilation");
    if (riskGroup !== "General population") {
      actions.canDo.push(`No special precautions needed, just monitor ${sensitivePollutants.join(", ")} levels`);
    }
  }

  // Moderate Risk
  else if (riskLevel === "Moderate Risk") {
    actions.canDo.push("Short outdoor activities (under 1 hour)", "Light indoor exercises");
    actions.limit.push("Prolonged high-intensity workouts", "Staying in traffic-heavy areas");
    if (riskGroup !== "General population") {
      actions.limit.push(`Avoid going out when ${sensitivePollutants.join(", ")} levels are high (e.g. rush hours)`);
    }
  }

  // Elevated Risk
  else if (riskLevel === "Elevated Risk") {
    actions.canDo.push("Indoor activities (yoga, housework)", "Use air purifiers");
    actions.limit.push("Outdoor activities", "Ventilating during pollution peaks");
    actions.avoid.push("Exposure to smoke or dust", "Intense outdoor exercise");
    if (riskGroup !== "General population") {
      actions.avoid.push(`Wear N95 masks outdoors to minimize ${sensitivePollutants.join(", ")} inhalation`);
    }
  }

  // High Risk and above
  else {
    actions.canDo.push("Stay indoors, close doors and windows", "Use air purifiers", "Drink plenty of water");
    actions.limit.push("Go out only if necessary (e.g. medical visits)", "Indoor smoking or heavy cooking");
    actions.avoid.push("All non-essential outdoor activities", "Exposure to outdoor pollutants", "Strenuous exercise");
    if (riskGroup !== "General population") {
      actions.avoid.push("Monitor symptoms (e.g. coughing, chest tightness), seek medical help if necessary");
    }
  }

  return actions;
}

/**
 * Generate pollutant harm descriptions for user-sensitive pollutants
 */
function generatePollutantHarmTips(sensitivePollutants, pollutantLevels) {
  const pollutantHarm = {
    PM25: "PM2.5 can penetrate deep into the lungs and bloodstream, worsening asthma and heart conditions.",
    PM10: "PM10 irritates the respiratory tract and causes coughing and wheezing, especially in elderly individuals.",
    NO2: "Nitrogen dioxide (NO2) from traffic exhaust reduces lung function and can trigger asthma attacks.",
    O3: "Ground-level ozone (O3) irritates eyes and airways, causing throat pain and shortness of breath."
  };

  return sensitivePollutants.map(pollutant => {
    const pollutantKey = pollutant.replace(".", "");
    const levelData = pollutantLevels[pollutantKey.toLowerCase()] || { v: 0 };
    const unit = pollutant === "O3" || pollutant === "NO2" ? "ppm" : "μg/m³";
    return `${pollutant}: ${pollutantHarm[pollutantKey]}, current concentration ${levelData.v} ${unit}`;
  });
}

// 4. AQI Category Utility
function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// 5. Main API Endpoint (GET)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userSettings = {
      hasAsthma: searchParams.get("has_asthma") === "true",
      hasBronchitis: searchParams.get("has_bronchitis") === "true",
      hasCopd: searchParams.get("has_copd") === "true",
      isPregnant: searchParams.get("pregnancy_status") === "true",
      birthYear: searchParams.get("birth_year") ? parseInt(searchParams.get("birth_year")) : undefined,
      userId: searchParams.get("user_id") || "unknown"
    };

    // Fetch Real-Time Air Quality Data
    const waqiResponse = await axios.get(
      `https://api.waqi.info/feed/geo:${SINGAPORE_LAT};${SINGAPORE_LNG}/`,
      { params: { token: WAQI_API_TOKEN }, timeout: 10000 }
    );

    if (waqiResponse.data.status !== "ok") {
      throw new Error(`WAQI API error: ${waqiResponse.data.data || "Failed to fetch air quality data"}`);
    }

    const realTimeData = waqiResponse.data.data;
    const aqi = realTimeData.aqi !== "-" ? parseInt(realTimeData.aqi, 10) : 0;
    const pollutants = realTimeData.iaqi || {};
    const forecast = realTimeData.forecast?.daily;

    const responseData = {
      location: realTimeData.city?.name || "Singapore",
      AQI: aqi,
      PM25: pollutants?.pm25?.v || 0,
      O3: pollutants?.o3?.v ? (pollutants.o3.v / 1000).toFixed(3) : 0.0,
      temperature: pollutants?.t?.v || 0,
      humidity: pollutants?.h?.v || 0,
      wind: pollutants?.w?.v || 0,
      forecast: forecast
        ? `Tomorrow – ${getAQICategory(parseInt(forecast.pm25[1]?.avg || 0))}`
        : "Tomorrow – No forecast available",

      personalization: {
        userInfo: {
          userId: userSettings.userId,
          riskGroup: getUserRiskGroup(userSettings),
          age: calculateAge(userSettings.birthYear),
          sensitivePollutants: getSensitivePollutants(userSettings)
        },
        aqiRisk: AQI_RISK_ADVICE.find(item => aqi >= item.min && aqi <= item.max)?.level || "Unknown",
        pollutantHarmTips: generatePollutantHarmTips(getSensitivePollutants(userSettings), pollutants),
        actions: generateUserActions(userSettings, aqi, pollutants),
        shortAdvice: `${getUserRiskGroup(userSettings)} notice: ${
          AQI_RISK_ADVICE.find(item => aqi >= item.min && aqi <= item.max)?.baseAdvice || "No AQI data available"
        }`,
        updateTime: new Date().toISOString()
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Failed to fetch real AQI data:", error.message);
    const fallbackData = {
      location: "Singapore",
      AQI: Math.floor(Math.random() * 200),
      PM25: Math.floor(Math.random() * 150),
      O3: 0.042,
      temperature: 30,
      humidity: 70,
      wind: 12,
      forecast: "Tomorrow – Unhealthy for Sensitive Groups",
      personalization: {
        userInfo: {
          userId: "unknown",
          riskGroup: "General population",
          age: 0,
          sensitivePollutants: ["PM2.5", "O3"]
        },
        aqiRisk: "Unknown",
        pollutantHarmTips: ["PM2.5 may pose respiratory risks", "O3 may irritate airways"],
        actions: {
          canDo: ["Light indoor activity", "Check AQI updates"],
          limit: ["Extended outdoor activities"],
          avoid: ["Vigorous outdoor exercise"]
        },
        shortAdvice: "General population notice: Air quality data unavailable, limit outdoor activities",
        updateTime: new Date().toISOString()
      }
    };
    return NextResponse.json(fallbackData, { status: 200 });
  }
}