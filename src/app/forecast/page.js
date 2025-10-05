"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import SideNavBar from "@/components/SideNavBar";

const pollutantConfig = {
  PM25: { name: "PM2.5", unit: "μg/m³", safeLevel: 25 },
};

const getAqiColor = (aqi) => {
  if (aqi <= 50) return "#4caf50"; // Good
  if (aqi <= 100) return "#ffc107"; // Moderate
  if (aqi <= 150) return "#ff9800"; // Unhealthy for Sensitive Groups
  return "#f44336"; // Unhealthy
};

const getAqiStatus = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  return "Unhealthy";
};

function Forecast() {
  const theme = useTheme();
  const [forecastData, setForecastData] = useState([]);

  // Fetch forecast from backend
  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();

        const formatted = data.forecast.map((aqi, idx) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx % 7],
          PM25: aqi,
          color: getAqiColor(aqi),
          status: getAqiStatus(aqi),
        }));

        setForecastData(formatted);
      } catch (err) {
        console.error("Failed to fetch forecast:", err);
      }
    }
    fetchForecast();
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
      <SideNavBar />
      <Box sx={{ flex: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          7-Day AQI Forecast
        </Typography>

        <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>

            <Box sx={{ p: 4 }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[200]} />
                  <XAxis dataKey="day" />
                  <YAxis
                    label={{ value: `PM2.5 (${pollutantConfig.PM25.unit})`, angle: -90, position: "insideLeft" }}
                  />
                  <ReferenceLine y={pollutantConfig.PM25.safeLevel} stroke="#f44336" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="PM25"
                    stroke="#ff5722"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ p: 4 }}>
              <Grid container spacing={2}>
                {forecastData.map((item, idx) => (
                  <Grid item size={{ xs: 5, sm: 4, md: 1.7 }} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        boxShadow: 1,
                        borderTop: `4px solid ${item.color}`,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": { transform: "scale(1.05)", boxShadow: 3 },
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        {item.day}
                      </Typography>
                      <Typography variant="h5" sx={{ color: item.color, fontWeight: 600, lineHeight: 1.2 }}>
                        {item.PM25} μg/m³
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.status}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Forecast;