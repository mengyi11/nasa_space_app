// /lib/recommendation.js

export const AQI_CATEGORIES = [
  [0, 50, "Good", "Green"],
  [51, 100, "Moderate", "Yellow"],
  [101, 150, "Unhealthy for Sensitive Groups", "Orange"],
  [151, 200, "Unhealthy", "Red"],
  [201, 300, "Very Unhealthy", "Purple"],
  [301, 10000, "Hazardous", "Maroon"],
];

export const POLLUTANT_SENSITIVITY = {
  asthma: ["PM2.5", "NO2", "O3"],
  bronchitis: ["PM2.5", "PM10"],
  copd: ["PM2.5", "PM10", "NO2", "O3"],
  pregnancy: ["PM2.5"],
  elderly: ["PM2.5", "PM10", "O3"],
};

// 计算年龄
export function computeAge(birth_month, birth_year) {
  if (!birth_month || !birth_year) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth_year;
  if (today.getMonth() + 1 < birth_month) age -= 1;
  return age;
}

// 根据 AQI 返回分类和颜色
export function aqiToCategory(aqi) {
  if (aqi == null) return { category: "Unknown", color: "Gray" };
  for (const [low, high, name, color] of AQI_CATEGORIES) {
    if (aqi >= low && aqi <= high) return { category: name, color };
  }
  return { category: "Unknown", color: "Gray" };
}

// 生成敏感污染物列表
export function determineSensitivePollutants(user) {
  const sens = new Set();
  if (user.has_copd) POLLUTANT_SENSITIVITY.copd.forEach(p => sens.add(p));
  if (user.has_asthma) POLLUTANT_SENSITIVITY.asthma.forEach(p => sens.add(p));
  if (user.has_bronchitis) POLLUTANT_SENSITIVITY.bronchitis.forEach(p => sens.add(p));
  if (user.pregnancy_status) POLLUTANT_SENSITIVITY.pregnancy.forEach(p => sens.add(p));
  const age = computeAge(user.birth_month || 1, user.birth_year || 2000);
  if (age >= 65) POLLUTANT_SENSITIVITY.elderly.forEach(p => sens.add(p));
  return Array.from(sens).sort();
}

// 预设人群类别
export function determinePresetBucket(user) {
  if (user.has_copd) return "COPD";
  const respCount = [user.has_asthma, user.has_bronchitis].filter(Boolean).length;
  if (respCount > 1) return "RespiratoryMultiple";
  if (user.has_asthma) return "Asthma";
  if (user.has_bronchitis) return "Bronchitis";
  if (user.pregnancy_status) return "Pregnant";
  const age = computeAge(user.birth_month || 1, user.birth_year || 2000);
  if (age >= 65) return "Elderly";
  return "General";
}

// 描述污染物危害
export function describePollutantHarm(p) {
  const d = {
    "PM2.5": "Fine particulate matter (PM2.5) penetrates deep into the lungs and can aggravate asthma, bronchitis, pregnancy-related risks, and cardiovascular disease.",
    "PM10": "Coarse particulate matter (PM10) can irritate the airways and aggravate respiratory conditions in older adults and those with lung disease.",
    "NO2": "Nitrogen dioxide (NO2) irritates airways and can worsen asthma and other respiratory conditions.",
    "O3": "Ground-level ozone (O3) can cause chest pain, coughing, throat irritation and worsen bronchitis, emphysema and asthma."
  };
  return d[p] || `${p} may affect sensitive people.`;
}

// 根据 AQI 和用户类型计算严重程度分数
export function computeSeverityScore(aqi, preset) {
  if (aqi == null) return 0.2;
  let s = 0;
  if (aqi <= 50) s = 0;
  else if (aqi <= 100) s = 0.25;
  else if (aqi <= 150) s = 0.5;
  else if (aqi <= 200) s = 0.75;
  else s = 0.95;
  if (["COPD", "Asthma", "Pregnant", "RespiratoryMultiple"].includes(preset)) {
    s = Math.min(1.0, s + 0.15);
  }
  return s;
}

// 核心生成推荐函数
export function generateRecommendation(user, aqiPayload) {
  let aqi = null, pollutant_levels = {}, dominant = null;
  if (aqiPayload) {
    aqi = aqiPayload.aqi;
    pollutant_levels = aqiPayload.pollutant_levels || {};
    dominant = aqiPayload.dominant_pollutant;
  }

  const category_info = aqiToCategory(aqi);
  const preset = determinePresetBucket(user);
  const sensitive_pollutants = determineSensitivePollutants(user);

  // 说明污染物危害
  const why_harmful = [];
  const rule_triggers = [];
  for (const p of sensitive_pollutants) {
    if (pollutant_levels[p]) {
      const lvl = pollutant_levels[p];
      why_harmful.push(`${p}: ${describePollutantHarm(p)} Observed conc=${lvl.conc} ${lvl.unit}; pollutant AQI=${lvl.aqi}.`);
      rule_triggers.push(`${p}_present`);
    } else {
      why_harmful.push(`${p}: ${describePollutantHarm(p)} (not measured locally).`);
    }
  }

  const severity_score = computeSeverityScore(aqi, preset);

  // 推荐文案
  let short = "";
  if (severity_score < 0.25) short = "Air quality is acceptable for most people. Routine outdoor activities are OK.";
  else if (severity_score < 0.5) short = "Air quality is moderate. Sensitive individuals should limit prolonged or intense outdoor activities.";
  else if (severity_score < 0.75) short = `Air quality may affect you. ${preset} individuals should avoid prolonged outdoor exertion today.`;
  else short = `Poor air quality — avoid outdoor exposure. ${preset} individuals should stay indoors with filtered air and follow medical plans.`;

  const actions = { can_do: [], limit: [], avoid: [] };
  if (severity_score < 0.25) actions.can_do.push("normal outdoor activities");
  else if (severity_score < 0.5) { actions.can_do.push("short walks"); actions.limit.push("long runs", "heavy outdoor work"); }
  else if (severity_score < 0.75) { actions.limit.push("open-window sleeping if indoor air not filtered"); actions.avoid.push("prolonged outdoor exertion", "strenuous outdoor exercise"); }
  else { actions.can_do.push("stay indoors with filtered air"); actions.avoid.push("going outdoors", "gardening", "outdoor sports"); }

  const advisory = `${short} Sensitive pollutants: ${sensitive_pollutants.join(", ") || "none"}. If symptoms occur (wheezing, chest tightness, severe cough), use medications and contact your clinician.`;

  const now = new Date().toISOString();

  return {
    user_id: user.user_id,
    user_conditions: {
      age: computeAge(user.birth_month || 1, user.birth_year || 2000),
      pregnant: !!user.pregnancy_status,
      has_asthma: !!user.has_asthma,
      has_bronchitis: !!user.has_bronchitis,
      has_copd: !!user.has_copd,
    },
    location: { city: user.city, state: user.state, country: user.country },
    current_aqi: aqi,
    aqi_category: category_info.category,
    aqi_color: category_info.color,
    dominant_pollutant: dominant,
    pollutant_levels,
    sensitive_pollutants,
    preset_bucket: preset,
    recommendation_short: short,
    recommendation_long: advisory,
    why_harmful,
    actions,
    rule_triggers,
    rule_version: "1.0.0",
    timestamp_utc: now,
    severity_score: Math.round(severity_score * 100) / 100,
    confidence_score: 0.9
  };
}