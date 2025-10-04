"use client";

import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Tooltip, CircularProgress,
  Box, Paper, Divider, Chip, Alert
} from "@mui/material";
import {
  Air, Thermostat, WaterDrop, WindPower, Timeline, LocationOn,
  WarningAmber, CheckCircle, HealthAndSafety, InfoOutlined
} from "@mui/icons-material";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import axios from "axios";
import SideNavBar from "@/components/SideNavBar";

function Dashboard() {
  const [aqData, setAqData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data descriptions
  const descriptions = {
    AQI: "Air Quality Index (0–50 good, 51–100 moderate, >100 may cause health issues).",
    PM25: "Fine particles (PM2.5) can enter lungs and bloodstream. Lower is healthier.",
    O3: "Ground-level ozone can irritate eyes and lungs. High levels are harmful.",
    temperature: "Extreme temperatures stress the body. 20–25°C is generally comfortable.",
    humidity: "Comfortable range is 30–60%. High humidity feels muggy, low feels dry.",
    wind: "Wind helps disperse pollutants. Strong winds may stir up dust.",
    forecast: "Predicted air quality trend for the coming period.",
    location: "Location of current measurements.",
  };

  // Get AQI status, color coding and corresponding health recommendation
  const getAqiDetails = (aqi) => {
    if (aqi <= 50) {
      return {
        status: "Good",
        color: "#4caf50",
        icon: <CheckCircle />,
        recommendation: "Air quality is excellent! All groups can safely enjoy outdoor activities like hiking, running, or picnics."
      };
    } else if (aqi <= 100) {
      return {
        status: "Moderate",
        color: "#ffc107",
        icon: <PriorityHighOutlinedIcon />,
        recommendation: "Air quality is acceptable. Only extremely sensitive individuals (e.g., those with severe asthma) should consider reducing prolonged outdoor exertion."
      };
    } else if (aqi <= 150) {
      return {
        status: "Unhealthy for Sensitive Groups",
        color: "#ff9800",
        icon: <WarningAmber />,
        recommendation: "Sensitive groups (children, elderly, pregnant people, those with respiratory/heart conditions) should limit outdoor activity. Others can continue normal activities but avoid heavy exertion."
      };
    } else if (aqi <= 200) {
      return {
        status: "Unhealthy",
        color: "#f44336",
        icon: <WarningAmber />,
        recommendation: "All groups should reduce outdoor activity. Sensitive groups should avoid outdoor exertion entirely. Keep windows closed and use air purifiers indoors if available."
      };
    } else if (aqi <= 300) {
      return {
        status: "Very Unhealthy",
        color: "#9c27b0",
        icon: <WarningAmber />,
        recommendation: "All groups should avoid outdoor activity. Sensitive groups should stay indoors. Use N95/KN95 masks if outdoor exposure is unavoidable. Check local air quality updates frequently."
      };
    } else {
      return {
        status: "Hazardous",
        color: "#795548",
        icon: <WarningAmber />,
        recommendation: "Emergency situation! All groups should stay indoors. Avoid any outdoor exposure. Follow local health authority guidelines (e.g., school closures, work-from-home advice)."
      };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/air-quality");
        setAqData(res.data);
      } catch (err) {
        console.error("Error fetching air quality data:", err);
        // Fallback data (for demo when API is unavailable)
        setAqData({
          location: "Singapore, Central Area",
          AQI: 68,
          PM25: 28,
          O3: 0.045,
          temperature: 28,
          humidity: 75,
          wind: 12,
          forecast: "AQI is expected to remain moderate (65–75) throughout the day. A slight drop to 'Good' (45–55) is predicted by evening as light rain moves in."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" backgroundColor="#f5f5f5">
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }

  const aqiDetails = aqData.AQI ? getAqiDetails(aqData.AQI) : null;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Side Navigation */}
      <SideNavBar />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>
        <Box sx={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* 1. Top Most: Health Recommendation (Most Prominent) */}
          {aqiDetails && (
            <Paper
              elevation={3}
              sx={{
                mb: 4,
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                borderLeft: `4px solid ${aqiDetails.color}`,
                backgroundColor: `${aqiDetails.color}5`, // Light background matching AQI color
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: { xs: 2, md: 3 },
                boxShadow: 2,
              }}
            >
              {/* Recommendation Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: `${aqiDetails.color}15`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <HealthAndSafety
                  sx={{
                    fontSize: { xs: 28, md: 32 },
                    color: aqiDetails.color,
                  }}
                />
              </Box>

              {/* Recommendation Content */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: aqiDetails.color, mb: 1 }}>
                  Health Recommendation
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6, color: "#333" }}>
                  {aqiDetails.recommendation}
                </Typography>

                {/* Additional Tip (Optional but Useful) */}
                <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <InfoOutlined fontSize="small" sx={{ color: aqiDetails.color }} />
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* 2. Header Section (Location & AQI Status) */}
          <Box mb={4}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" color="#2d3748">
              Today's Air Quality Monitoring
            </Typography>

            <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <LocationOn color="action" />
                <Typography variant="h7" color="#4a5568">
                  {aqData.location || "Unknown Location"}
                </Typography>
              </Box>

              {aqiDetails && (
                <Chip
                  icon={React.cloneElement(aqiDetails.icon, { sx: { color: "white" } })}
                  label={`AQI Status: ${aqiDetails.status} (${aqData.AQI})`}
                  sx={{
                    backgroundColor: aqiDetails.color,
                    color: "white",
                    fontWeight: "medium",
                    fontSize: "0.875rem",
                    px: 2,
                  }}
                  variant="filled"
                />
              )}
            </Box>

            <Divider sx={{ mt: 2, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Based on real-time data from local monitoring stations and satellite feeds
            </Typography>
          </Box>



          {/* 3. Main Data Grid */}
          <Grid container spacing={3}>
            {/* AQI Highlight Card - 2 columns */}
            {aqiDetails && (
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Tooltip title={descriptions.AQI} arrow placement="top">
                  <Card
                    sx={{
                      height: "100%",
                      borderLeft: `4px solid ${aqiDetails.color}`,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                      backgroundColor: "white",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" color="text.secondary">
                            Air Quality Index
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, color: "#2d3748" }}>
                            {aqData.AQI}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            backgroundColor: `${aqiDetails.color}10`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Air sx={{ fontSize: 32, color: aqiDetails.color }} />
                        </Box>
                      </Box>
                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        {aqiDetails.status} - {
                          aqiDetails.status === "Good"
                            ? "Ideal for all outdoor activities"
                            : aqiDetails.status === "Moderate"
                              ? "Acceptable for most people"
                              : "Monitor exposure if outdoors"
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* PM2.5 Card */}
            {aqData.PM25 && (
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <Tooltip title={descriptions.PM25} arrow placement="top">
                  <Card
                    sx={{
                      height: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                      backgroundColor: "white",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" color="text.secondary">
                          PM2.5
                        </Typography>
                        <Air sx={{ color: "#64b5f6", fontSize: 20 }} />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, color: "#2d3748" }}>
                        {aqData.PM25}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          μg/m³
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* Ozone Card */}
            {aqData.O3 && (
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <Tooltip title={descriptions.O3} arrow placement="top">
                  <Card
                    sx={{
                      height: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                      backgroundColor: "white",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" color="text.secondary">
                          Ozone (O₃)
                        </Typography>
                        <PriorityHighOutlinedIcon sx={{ color: "#ef5350", fontSize: 20 }} />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, color: "#2d3748" }}>
                        {aqData.O3}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ppm
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* Temperature Card */}
            {aqData.temperature && (
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <Tooltip title={descriptions.temperature} arrow placement="top">
                  <Card
                    sx={{
                      height: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                      backgroundColor: "white",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" color="text.secondary">
                          Temperature
                        </Typography>
                        <Thermostat sx={{ color: "#ff9800", fontSize: 20 }} />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, color: "#2d3748" }}>
                        {aqData.temperature}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          °C
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* Humidity Card */}
            {aqData.humidity && (
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <Tooltip title={descriptions.humidity} arrow placement="top">
                  <Card
                    sx={{
                      height: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 4,
                      },
                      backgroundColor: "white",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" color="text.secondary">
                          Humidity
                        </Typography>
                        <WaterDrop sx={{ color: "#4fc3f7", fontSize: 20 }} />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2, color: "#2d3748" }}>
                        {aqData.humidity}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          %
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* Wind Card */}
            {aqData.wind && (
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <Tooltip title={descriptions.wind} arrow>
                  <Card
                    sx={{
                      height: "100%",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <WindPower sx={{ color: "#90caf9" }} />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                        {aqData.wind}
                        <Typography component="span" variant="body1" color="text.secondary">
                          km/h
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            )}

            {/* Forecast Card - 3 columns */}
            {aqData.forecast && (
              <Grid item size={{ xs: 12, md: 9 }} >
                <Tooltip title={descriptions.forecast} arrow>
                  <Paper
                    sx={{
                      p: 3,
                      borderLeft: "4px solid #2196f3",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Timeline sx={{ color: "#2196f3" }} />
                      <Typography variant="h6" fontWeight="medium">
                        Air Quality Forecast
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 5, mt: 2, }}>
                      {aqData.forecast}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, ml: 5 }}>
                      Recommendation: Monitor outdoor activities for sensitive groups and adjust plans based on air quality changes
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
export default Dashboard;