// app/api/stations/route.js
export async function GET() {
  try {
    // 调用 OpenAQ API 获取新加坡的空气质量站点
    const res = await fetch('https://api.openaq.org/v2/latest?country=SG&limit=50');
    const data = await res.json();

    // 格式化为 monitoringStations 结构
    const monitoringStations = data.results.map((station, index) => {
      // 取 PM2.5 和 PM10，如果不存在就设为 null
      const pm25Obj = station.measurements.find(m => m.parameter === 'pm25');
      const pm10Obj = station.measurements.find(m => m.parameter === 'pm10');

      // 简单计算 AQI（这里用 PM2.5 作为示例）
      const aqi = pm25Obj ? Math.round(pm25Obj.value * 2) : null; // 简单转换，可用更准确公式

      // 根据 AQI 简单分级
      let status = "Unknown";
      if (aqi !== null) {
        if (aqi <= 50) status = "Good";
        else if (aqi <= 100) status = "Moderate";
        else if (aqi <= 150) status = "Unhealthy for Sensitive Groups";
        else if (aqi <= 200) status = "Unhealthy";
        else if (aqi <= 300) status = "Very Unhealthy";
        else status = "Hazardous";
      }

      return {
        id: index + 1,
        name: station.location,
        position: [station.coordinates.latitude, station.coordinates.longitude],
        aqi,
        status,
        pm25: pm25Obj ? pm25Obj.value : null,
        pm10: pm10Obj ? pm10Obj.value : null,
        updated: pm25Obj ? pm25Obj.lastUpdated : null
      };
    });

    return new Response(JSON.stringify({ monitoringStations }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch stations" }), { status: 500 });
  }
}