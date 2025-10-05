"use client";

import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Tooltip, CircularProgress,
  Box, Paper, Divider, Chip, Alert,List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import {
  Air, Thermostat, WaterDrop, WindPower, Timeline, LocationOn,
  WarningAmber, CheckCircle, HealthAndSafety, InfoOutlined,DoNotDisturbOn, Person, AccessTime
} from "@mui/icons-material";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import axios from "axios";
import SideNavBar from "@/components/SideNavBar";
import Check from "@mui/icons-material/Check";

function Dashboard() {
  const [aqData, setAqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [user, setUser] = useState(null);

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
        const userRes = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data.user;

        // const res = await axios.get("/api/air-quality");
        const res = await axios.get("/api/air-quality", {
          params: {
            user_id: userData.user_id,
            city: userData.city,
            state: userData.state,
            country: userData.country,
            birth_month: userData.birth_month,
            birth_year: userData.birth_year,
            pregnancy_status: userData.pregnancy_status,
            has_asthma: userData.has_asthma,
            has_bronchitis: userData.has_bronchitis,
            has_copd: userData.has_copd,
          },
        });
        console.log("Fetched AQ data:", res.data);
        setAqData(res.data);
      } catch (err) {
        console.error("Error fetching air quality data:", err);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
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
          {aqData?.personalization && aqiDetails && (
            <Paper
              elevation={3}
              sx={{
                mb: 4, // Margin bottom for spacing from other sections
                p: { xs: 3, md: 4 }, // Responsive padding: smaller on mobile, larger on desktop
                borderRadius: 2, // Rounded corners for modern look
                borderLeft: `4px solid ${aqiDetails.color}`, // Accent border matching AQI status color
                backgroundColor: `${aqiDetails.color}5`, // Light tinted background (subtle & cohesive)
                display: "flex",
                flexDirection: { xs: "column", md: "row" }, // Mobile: vertical | Desktop: horizontal
                alignItems: { xs: "flex-start", md: "center" }, // Align for readability on all screens
                gap: { xs: 3, md: 4 }, // Spacing between icon and content
                boxShadow: 2, // Soft shadow for depth
                transition: "box-shadow 0.3s ease, transform 0.2s ease", // Smooth hover effects
                "&:hover": {
                  boxShadow: 6, // Enhance shadow on hover
                  transform: "translateY(-2px)", // Subtle lift for interactivity
                },
              }}
            >
              {/* Left: Visual Icon (Contextual to User Group) */}
              <Box
                sx={{
                  width: { xs: 56, md: 64 }, // Responsive icon size
                  height: { xs: 56, md: 64 },
                  borderRadius: "50%", // Circular shape for focus
                  backgroundColor: `${aqiDetails.color}15`, // Darker tint than background (contrast)
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0, // Prevent icon from shrinking on small screens
                  mt: { xs: 1, md: 0 }, // Adjust top margin for mobile alignment
                }}
              >
                {/* Contextual Icon: Matches User's Risk Group */}
                {aqData.personalization.userInfo.riskGroup === "General population" ? (
                  <CheckCircle
                    sx={{ fontSize: { xs: 26, md: 30 }, color: aqiDetails.color }}
                  />
                ) : aqData.personalization.userInfo.riskGroup.includes("asthma") ||
                  aqData.personalization.userInfo.riskGroup.includes("bronchitis") ||
                  aqData.personalization.userInfo.riskGroup.includes("COPD") ? (
                  <HealthAndSafety
                    sx={{ fontSize: { xs: 26, md: 30 }, color: aqiDetails.color }}
                  />
                ) : aqData.personalization.userInfo.riskGroup.includes("pregnancy") ? (
                  <Person
                    sx={{ fontSize: { xs: 26, md: 30 }, color: aqiDetails.color }}
                  />
                ) : aqData.personalization.userInfo.riskGroup.includes("elderly") ? (
                  <AccessTime
                    sx={{ fontSize: { xs: 26, md: 30 }, color: aqiDetails.color }}
                  />
                ) : (
                  <InfoOutlined
                    sx={{ fontSize: { xs: 26, md: 30 }, color: aqiDetails.color }}
                  />
                )}
              </Box>

              {/* Right: Personalized Content (Structured & Scannable) */}
              <Box sx={{ flex: 1, width: "100%" }}>
                {/* 1. Header: User Group + AQI Risk Level */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                  flexWrap="wrap" // Wrap on small screens
                  gap={2}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: aqiDetails.color, lineHeight: 1.3 }}
                  >
                    Personalized Health Advice
                    <Typography
                      component="span"
                      variant="body1"
                      fontWeight="normal"
                      sx={{ ml: 1, color: "#4a5568" }}
                    >
                      • {aqData.personalization.userInfo.riskGroup}
                    </Typography>
                  </Typography>

                  {/* AQI Risk Level Badge */}
                  <Chip
                    label={aqData.personalization.aqiRisk}
                    size="small"
                    sx={{
                      backgroundColor: `${aqiDetails.color}20`,
                      color: aqiDetails.color,
                      fontWeight: "medium",
                      textTransform: "capitalize", // Preserve "Moderate Risk" (not "MODERATE RISK")
                    }}
                  />
                </Box>

                {/* 2. Core Advice (Most Critical Information First) */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 1.5,
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ lineHeight: 1.7, color: "#2d3748", fontWeight: 500 }}
                  >
                    {aqData.personalization.shortAdvice}
                  </Typography>
                </Box>

                {/* 3. Actionable Guidelines (Can Do / Limit / Avoid) */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="medium"
                    sx={{ color: "#2d3748", mb: 2 }}
                  >
                    Today’s Activity Guidelines
                  </Typography>

                  <Grid container spacing={2.5}>
                    {/* "Can Do" Actions */}
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#e6fffa", // Soft teal for "safe" actions
                          height: "100%"
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                          <CheckCircle color="success" sx={{ fontSize: 18 }} />
                          <Typography variant="subtitle2" fontWeight="bold" color="#0d9488">
                            Can Do
                          </Typography>
                        </Box>
                        <List disablePadding sx={{ pl: 0 }}>
                          {aqData.personalization.actions.canDo.length > 0 ? (
                            aqData.personalization.actions.canDo.map((action, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 20, color: "#0d9488" }}>
                                  <Check fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={action}
                                  primaryTypographyProps={{ variant: "body2", color: "#0f766e" }}
                                />
                              </ListItem>
                            ))
                          ) : (
                            <Typography variant="body2" color="#64748b" sx={{ pl: 3 }}>
                              No specific restrictions—enjoy regular activities.
                            </Typography>
                          )}
                        </List>
                      </Box>
                    </Grid>

                    {/* "Limit" Actions */}
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#fff8e6", // Soft amber for "caution" actions
                          height: "100%"
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                          <PriorityHighOutlinedIcon color="warning" sx={{ fontSize: 18 }} />
                          <Typography variant="subtitle2" fontWeight="bold" color="#c2410c">
                            Limit
                          </Typography>
                        </Box>
                        <List disablePadding sx={{ pl: 0 }}>
                          {aqData.personalization.actions.limit.length > 0 ? (
                            aqData.personalization.actions.limit.map((action, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 20, color: "#c2410c" }}>
                                  <PriorityHighOutlinedIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={action}
                                  primaryTypographyProps={{ variant: "body2", color: "#9a3412" }}
                                />
                              </ListItem>
                            ))
                          ) : (
                            <Typography variant="body2" color="#64748b" sx={{ pl: 3 }}>
                              No activities need limiting today.
                            </Typography>
                          )}
                        </List>
                      </Box>
                    </Grid>

                    {/* "Avoid" Actions */}
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: "#fee2e2", // Soft red for "avoid" actions
                          height: "100%"
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                          <DoNotDisturbOn color="error" sx={{ fontSize: 18 }} />
                          <Typography variant="subtitle2" fontWeight="bold" color="#b91c1c">
                            Avoid
                          </Typography>
                        </Box>
                        <List disablePadding sx={{ pl: 0 }}>
                          {aqData.personalization.actions.avoid.length > 0 ? (
                            aqData.personalization.actions.avoid.map((action, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 20, color: "#b91c1c" }}>
                                  <DoNotDisturbOn fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={action}
                                  primaryTypographyProps={{ variant: "body2", color: "#991b1b" }}
                                />
                              </ListItem>
                            ))
                          ) : (
                            <Typography variant="body2" color="#64748b" sx={{ pl: 3 }}>
                              No activities need avoidance today.
                            </Typography>
                          )}
                        </List>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* 4. Sensitive Pollutants (If Available) */}
                {aqData.personalization.userInfo.sensitivePollutants.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="medium"
                      sx={{ color: "#4a5568", mb: 1.5 }}
                    >
                      Pollutants to Monitor
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1.5}>
                      {aqData.personalization.userInfo.sensitivePollutants.map((pollutant, idx) => (
                        <Chip
                          key={idx}
                          label={pollutant}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: aqiDetails.color,
                            color: aqiDetails.color,
                            "&:hover": {
                              backgroundColor: `${aqiDetails.color}10`,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 5. Pollutant Harm Tips (If Available) */}
                {aqData.personalization.pollutantHarmTips.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="medium"
                      sx={{ color: "#4a5568", mb: 1.5 }}
                    >
                      Why These Matter
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 120,
                        overflowY: "auto",
                        pr: 1,
                        borderRadius: 1,
                        p: 1,
                        backgroundColor: "#f8fafc"
                      }}
                    >
                      {aqData.personalization.pollutantHarmTips.map((tip, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{ color: "#4a5568", mb: 1.2, lineHeight: 1.6 }}
                        >
                          • {tip}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 6. Last Updated (Trust & Transparency) */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "#718096",
                    fontSize: "0.875rem"
                  }}
                >
                  <AccessTime fontSize="small" />
                  <Typography variant="body2">
                    Advice last updated: {new Date(aqData.personalization.updateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
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