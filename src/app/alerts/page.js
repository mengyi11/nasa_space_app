"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Button,
  useTheme,
  Paper,
} from "@mui/material";
import {
  WarningAmber,
  Notifications,
  NotificationsOff,
  Info,
  ChevronRight,
  CalendarToday,
  FilterList,
} from "@mui/icons-material";
import SideNavBar from "@/components/SideNavBar";

// 初始示例数据
const initialAlerts = [
  // {
  //   id: 0,
  //   date: new Date().toLocaleString(),
  //   title: "Loading...",
  //   message: "Fetching air quality data...",
  //   severity: "low",
  //   type: "current",
  //   isRead: true,
  // },
];

const severityConfig = {
  low: { color: "#4caf50", bgColor: "#e8f5e9", label: "Good", icon: <Info fontSize="small" /> },
  moderate: { color: "#ff9800", bgColor: "#fff3e0", label: "Moderate", icon: <WarningAmber fontSize="small" /> },
  high: { color: "#f44336", bgColor: "#ffebee", label: "Unhealthy", icon: <WarningAmber fontSize="small" /> },
  urgent: { color: "#d32f2f", bgColor: "#ffcdd2", label: "Urgent", icon: <WarningAmber fontSize="small" /> },
};

const typeConfig = {
  current: { label: "Current", color: "#2196f3" },
  upcoming: { label: "Upcoming", color: "#ffc107" },
  forecast: { label: "Forecast", color: "#9c27b0" },
};

function Alerts() {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(true);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState(initialAlerts);
  const [activeFilter, setActiveFilter] = useState("all");
  const [lastSmsSent, setLastSmsSent] = useState(0);

  const toggleNotifications = () => {
    setNotificationStatus(!notificationStatus);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const filterAlerts = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === "all") setFilteredAlerts(alerts);
    else if (filterType === "unread") setFilteredAlerts(alerts.filter(a => !a.isRead));
    else setFilteredAlerts(alerts.filter(a => a.severity === filterType));
  };

  const markAsRead = (id) => {
    const updated = alerts.map(a => (a.id === id ? { ...a, isRead: true } : a));
    setAlerts(updated);
    filterAlerts(activeFilter);
  };


  // --- Live data fetch & SMS ---
  useEffect(() => {
    const fetchAQ = async () => {
      try {
        const res = await axios.get("/api/air-quality");
        const data = res.data.data;
        console.log("Fetched AQ data:", data);

        const severity =
          data.aqi >= 301 ? "urgent" :
            data.aqi >= 151 ? "high" :
              data.aqi >= 51 ? "moderate" : "low";

        const newAlert = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          title: `Air Quality: ${data.status}`,
          message: `Current AQI: ${data.aqi}, PM2.5: ${data.pm25}, O3: ${data.o3}`,
          severity,
          type: "current",
          isRead: false,
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        filterAlerts(activeFilter);

        if (notificationStatus && (severity === "high" || severity === "urgent")) {
          alert("Preparing to send SMS alert...");
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

          try {
            const smsRes = await axios.post("/api/send-sms", {
              token: token,
              message: `⚠️ Air quality is unhealthy (AQI ${data.aqi}). Please stay indoors!`,
            });

            if (smsRes.data.success) {
              console.log("SMS sent successfully:", smsRes.data);
            } else {
              console.warn("SMS not sent:", smsRes.data.error);
            }
          } catch (smsErr) {
            console.error("SMS send failed:", smsErr.message || smsErr);
          }
        }

      } catch (err) {
        console.error("Error fetching AQ:", err);
      }
    };

    fetchAQ();

    const interval = setInterval(fetchAQ, 5 * 60 * 1000);
    return () => clearInterval(interval);

  }, [notificationStatus, activeFilter]);

  useEffect(() => {
    const button = document.createElement("button");
    button.innerText = "🔊 Read Page";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = "9999";
    button.style.padding = "8px 12px";
    button.style.background = "#333";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";

    const speakPage = () => {
      window.speechSynthesis.cancel();
      const text = document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    };

    button.onclick = speakPage;
    document.body.appendChild(button);

    return () => {
      button.remove();
    };
  }, []);
  // useEffect(() => {
  //   const triggerFakeAlert = async () => {
  //     // Fake AQI 数据
  //     const data = {
  //       aqi: 180,  // 高 AQI 触发 "high" 级别
  //       pm25: 75,
  //       o3: 50,
  //       status: "Unhealthy",
  //     };

  //     const newAlert = {
  //       id: Date.now(),
  //       date: new Date().toLocaleString(),
  //       title: `Air Quality: ${data.status}`,
  //       message: `Current AQI: ${data.aqi}, PM2.5: ${data.pm25}, O3: ${data.o3}`,
  //       severity: "high",
  //       type: "current",
  //       isRead: false,
  //     };

  //     setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);

  //     filterAlerts(activeFilter);
  //     try {
  //       const res = await axios.post("/api/send-sms", {
  //         to: "+6597976574",
  //         message: "⚠️ This is a test SMS from fake alert!",
  //       });

  //       if (res.data.success) {
  //         console.log("SMS sent successfully:", res.data);
  //       } else {
  //         console.warn("SMS not sent:", res.data.error);
  //       }
  //     } catch (err) {
  //       console.error("SMS send failed:", err.message || err);
  //     }
  //   };

  //   // 延迟 1 秒触发，模拟实时数据
  //   const timeout = setTimeout(triggerFakeAlert, 1000);

  //   return () => clearTimeout(timeout);
  // }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
      <SideNavBar />
      <Box sx={{ flex: 1, p: 4, overflow: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Air Quality Alerts</Typography>
            <Typography variant="body1" color="text.secondary">
              Stay informed about air quality changes and health recommendations
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color={notificationStatus ? "primary" : "default"}
              onClick={toggleNotifications}
              sx={{ borderRadius: "50%", bgcolor: notificationStatus ? theme.palette.primary.light : theme.palette.grey[100] }}
            >
              {notificationStatus ? <Notifications fontSize="small" /> : <NotificationsOff fontSize="small" />}
            </IconButton>
            <Typography variant="body2">{notificationStatus ? "Notifications enabled" : "Notifications disabled"}</Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList fontSize="small" /> Filter alerts:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {["all", "unread", "moderate", "high"].map(f => (
              <Chip
                key={f}
                label={f.charAt(0).toUpperCase() + f.slice(1)}
                onClick={() => filterAlerts(f)}
                sx={{
                  backgroundColor:
                    activeFilter === f
                      ? f === "moderate"
                        ? severityConfig.moderate.color
                        : f === "high"
                          ? severityConfig.high.color
                          : theme.palette.primary.main
                      : "inherit",
                  color: activeFilter === f ? "white" : "inherit",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </Paper>

        {filteredAlerts.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 8, bgcolor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Info fontSize="large" color="action" sx={{ mb: 2 }} />
            <Typography variant="h6">No alerts found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Try changing your filter criteria</Typography>
            <Button variant="outlined" size="small" sx={{ mt: 3 }} onClick={() => filterAlerts("all")}>View all alerts</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAlerts.map(alert => {
              const severity = severityConfig[alert.severity];
              const type = typeConfig[alert.type];
              return (
                <Grid item xs={12} md={6} key={alert.id}>
                  <Card sx={{ width: "100%", height: 280, borderLeft: `4px solid ${severity.color}`, boxShadow: alert.isRead ? 1 : 3, opacity: alert.isRead ? 0.9 : 1, transition: "transform 0.2s ease, box-shadow 0.2s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: 4 }, overflow: "hidden" }}>
                    <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", wordWrap: "break-word", whiteSpace: "normal" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="caption">{alert.date}</Typography>
                        </Box>
                        <Chip size="small" label={type.label} sx={{ backgroundColor: `${type.color}20`, color: type.color, borderColor: type.color, border: "1px solid" }} />
                      </Box>

                      <Typography variant="h6" fontWeight={alert.isRead ? 400 : 600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, wordWrap: "break-word" }}>
                        <Box sx={{ color: severity.color }}>{severity.icon}</Box>
                        {alert.title}
                      </Typography>

                      <Typography variant="body2" color="text.primary" sx={{ mb: 3, lineHeight: 1.6, wordWrap: "break-word", flexGrow: 1 }}>
                        {alert.message}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                        <Chip size="small" label={severity.label} sx={{ backgroundColor: severity.bgColor, color: severity.color, border: "none" }} />
                        {!alert.isRead && (
                          <Typography variant="caption" color="primary" sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5 }} onClick={() => markAsRead(alert.id)}>
                            Mark as read <ChevronRight fontSize="small" />
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={notificationStatus ? "success" : "info"} variant="filled" sx={{ width: "100%" }}>
          {notificationStatus ? "Notifications enabled - You'll receive air quality alerts" : "Notifications disabled - You won't receive air quality alerts"}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Alerts;