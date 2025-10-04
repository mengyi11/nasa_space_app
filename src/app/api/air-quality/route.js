// app/api/air-quality/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  // 模拟数据，可以替换成真实 API 请求
  const data = {
    // city: "Singapore",
    // pm25: Math.floor(Math.random() * 150),
    // ozone: Math.floor(Math.random() * 120),
    // no2: Math.floor(Math.random() * 80),
    // aqi: Math.floor(Math.random() * 200),
    location: "Singapore",
    AQI: Math.floor(Math.random() * 200),
    PM25: Math.floor(Math.random() * 150),
    O3: 0.042,
    temperature: 30,
    humidity: 70,
    wind: 12,
    forecast: "Tomorrow – Unhealthy for sensitive groups",
  };

  return NextResponse.json(data);

}