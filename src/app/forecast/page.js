"use client";

import React from "react";
import {
  Typography, Box, Card, CardContent, Grid, Paper,
  Chip, useTheme, Divider, Container
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { WarningAmber, CheckCircle, Info } from "@mui/icons-material";
import SideNavBar from "@/components/SideNavBar"; 


const forecastData = [
  { day: 'Mon', AQI: 70, status: "Moderate" },
  { day: 'Tue', AQI: 80, status: "Moderate" },
  { day: 'Wed', AQI: 90, status: "Moderate" },
  { day: 'Thu', AQI: 65, status: "Moderate" },
  { day: 'Fri', AQI: 75, status: "Moderate" },
  { day: 'Sat', AQI: 85, status: "Moderate" },
  { day: 'Sun', AQI: 60, status: "Good" },
];

// AQI color
const getAqiColor = (aqi) => {
  if (aqi <= 50) return "#4caf50"; 
  if (aqi <= 100) return "#ffc107"; 
  if (aqi <= 150) return "#ff9800"; 
  return "#f44336"; 
};


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 1,
          boxShadow: 3,
          borderLeft: `4px solid ${getAqiColor(data.AQI)}`
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {data.day}
        </Typography>
        <Typography variant="body1">
          AQI: <span style={{ color: getAqiColor(data.AQI) }}>{data.AQI}</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {data.status}
        </Typography>
      </Paper>
    );
  }
  return null;
};

function Forecast() {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
      <SideNavBar />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Container maxWidth="xl" sx={{ p: 4 }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              7-Day Air Quality Forecast
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
              <Chip icon={<CheckCircle />} label="Good (0-50)" sx={{ bgcolor: "#4caf5020", color: "#2e7d32" }} />
              <Chip icon={<Info />} label="Moderate (51-100)" sx={{ bgcolor: "#ffc10720", color: "#ff8f00" }} />
              <Chip icon={<WarningAmber />} label="Unhealthy (101+)" sx={{ bgcolor: "#f4433620", color: "#c62828" }} />
            </Box>
          </Box>

          <Card sx={{
            boxShadow: 4,
            borderRadius: 2,
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                AQI Trend Prediction (Next 7 Days)
              </Typography>

              <Box sx={{ height: 400, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.grey[200]}
                    />

                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                      tickLine={false}
                      domain={[0, 150]}
                    />

                    <ReferenceLine
                      y={50}
                      stroke="#4caf50"
                      strokeDasharray="3 3"
                      label={{ value: "Good", position: "right" }}
                    />
                    <ReferenceLine
                      y={100}
                      stroke="#ff9800"
                      strokeDasharray="3 3"
                      label={{ value: "Moderate", position: "right" }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="AQI"
                      stroke="#3f51b5"
                      strokeWidth={3}
                      dot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: "white",
                        stroke: ({ active }) => active ? "#303f9f" : "#3f51b5"
                      }}
                      activeDot={{ r: 8, strokeWidth: 2, stroke: "#303f9f" }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            {forecastData.map((item, index) => (
              <Grid item size={{ xs: 5, sm: 4, md: 1.7 }} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderRadius: 1,
                    boxShadow: 1,
                    borderTop: `4px solid ${getAqiColor(item.AQI)}`,
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 2
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {item.day}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      color: getAqiColor(item.AQI),
                      fontWeight: "bold"
                    }}
                  >
                    {item.AQI}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, textTransform: "capitalize" }}
                  >
                    {item.status}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Forecast;