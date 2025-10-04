"use client";

import React, { useState } from "react";
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
  FilterList, // 补充导入FilterList图标
} from "@mui/icons-material";
import SideNavBar from "@/components/SideNavBar";

// 扩展警报数据（全部改为英文，保持结构不变）
const alertsData = [
  {
    id: 1,
    date: "Today, 10:30 AM",
    title: "Moderate Air Quality",
    message: "AQI is currently moderate (78). Sensitive groups should reduce prolonged outdoor activity.",
    severity: "moderate", // Severity: low/moderate/high/urgent
    type: "current", // Type: current/upcoming/forecast
    isRead: false,
  },
  {
    id: 2,
    date: "Tomorrow, 6:00 AM",
    title: "Unhealthy for Sensitive Groups",
    message: "AQI expected to reach 115 tomorrow morning. Elderly and children should avoid outdoor exercise.",
    severity: "high",
    type: "upcoming",
    isRead: false,
  },
  {
    id: 3,
    date: "Oct 8-10",
    title: "Persistent Moderate Pollution",
    message: "Next 3 days will see persistent moderate pollution due to temperature inversion. Consider using air purifiers indoors.",
    severity: "moderate",
    type: "forecast",
    isRead: true,
  },
  {
    id: 4,
    date: "Oct 5, 8:00 AM",
    title: "Air Quality Improvement",
    message: "Air quality improved to 'Good' (AQI 42) after overnight rain. Enjoy outdoor activities safely.",
    severity: "low",
    type: "current",
    isRead: true,
  },
];


const severityConfig = {
  low: {
    color: "#4caf50",
    bgColor: "#e8f5e9",
    label: "Good",
    icon: <Info fontSize="small" />,
  },
  moderate: {
    color: "#ff9800",
    bgColor: "#fff3e0",
    label: "Moderate",
    icon: <WarningAmber fontSize="small" />,
  },
  high: {
    color: "#f44336",
    bgColor: "#ffebee",
    label: "Unhealthy",
    icon: <WarningAmber fontSize="small" />,
  },
  urgent: {
    color: "#d32f2f",
    bgColor: "#ffcdd2",
    label: "Urgent",
    icon: <WarningAmber fontSize="small" />,
  },
};

const typeConfig = {
  current: { label: "Current", color: "#2196f3" },
  upcoming: { label: "Upcoming", color: "#ffc107" },
  forecast: { label: "Forecast", color: "#9c27b0" },
};

function Alerts() {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(true); // Notification toggle status
  const [filteredAlerts, setFilteredAlerts] = useState(alertsData);
  const [activeFilter, setActiveFilter] = useState("all");

  const toggleNotifications = () => {
    setNotificationStatus(!notificationStatus);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const filterAlerts = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === "all") {
      setFilteredAlerts(alertsData);
    } else if (filterType === "unread") {
      setFilteredAlerts(alertsData.filter(alert => !alert.isRead));
    } else {
      setFilteredAlerts(alertsData.filter(alert => alert.severity === filterType));
    }
  };

  const markAsRead = (id) => {
    setFilteredAlerts(
      filteredAlerts.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
      <SideNavBar />

      <Box sx={{ flex: 1, p: 4, overflow: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Air Quality Alerts
            </Typography>
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
            <Typography variant="body2">
              {notificationStatus ? "Notifications enabled" : "Notifications disabled"}
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList fontSize="small" /> Filter alerts:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label="All Alerts"
              onClick={() => filterAlerts("all")}
              sx={{
                backgroundColor: activeFilter === "all" ? theme.palette.primary.main : "inherit",
                color: activeFilter === "all" ? "white" : "inherit",
                cursor: "pointer",
              }}
            />
            <Chip
              label="Unread"
              onClick={() => filterAlerts("unread")}
              sx={{
                backgroundColor: activeFilter === "unread" ? theme.palette.primary.main : "inherit",
                color: activeFilter === "unread" ? "white" : "inherit",
                cursor: "pointer",
              }}
            />
            <Chip
              label="Moderate"
              onClick={() => filterAlerts("moderate")}
              sx={{
                backgroundColor: activeFilter === "moderate" ? severityConfig.moderate.color : "inherit",
                color: activeFilter === "moderate" ? "white" : "inherit",
                cursor: "pointer",
              }}
            />
            <Chip
              label="Unhealthy"
              onClick={() => filterAlerts("high")}
              sx={{
                backgroundColor: activeFilter === "high" ? severityConfig.high.color : "inherit",
                color: activeFilter === "high" ? "white" : "inherit",
                cursor: "pointer",
              }}
            />
          </Box>
        </Paper>

        {filteredAlerts.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 8, bgcolor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
            <Info fontSize="large" color="action" sx={{ mb: 2 }} />
            <Typography variant="h6">No alerts found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try changing your filter criteria
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 3 }}
              onClick={() => filterAlerts("all")}
            >
              View all alerts
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAlerts.map((alert) => {
              const severity = severityConfig[alert.severity];
              const type = typeConfig[alert.type];
              
              return (
                <Grid item size={{ xs: 12, md: 6 }}  key={alert.id}>
                  {/* 固定尺寸卡片：宽高固定 + 文字自动换行 */}
                  <Card
                    sx={{
                      // 固定尺寸：宽度100%（继承Grid列宽），高度固定280px
                      width: "100%",
                      height: 280,
                      borderLeft: `4px solid ${severity.color}`,
                      boxShadow: alert.isRead ? 1 : 3,
                      opacity: alert.isRead ? 0.9 : 1,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                      overflow: "hidden", // 防止内容溢出卡片
                    }}
                  >
                    <CardContent sx={{ 
                      p: 3, 
                      height: "100%", 
                      display: "flex", 
                      flexDirection: "column",
                      // 文字自动换行：强制换行+防止文字溢出
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}>
                      {/* 警报头部（日期和类型） */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                          <CalendarToday fontSize="small" />
                          <Typography variant="caption">{alert.date}</Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={type.label}
                          sx={{
                            backgroundColor: `${type.color}20`,
                            color: type.color,
                            borderColor: type.color,
                            border: "1px solid",
                          }}
                        />
                      </Box>

                      {/* 警报标题：文字自动换行 */}
                      <Typography
                        variant="h6"
                        fontWeight={alert.isRead ? 400 : 600}
                        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, wordWrap: "break-word" }}
                      >
                        <Box sx={{ color: severity.color }}>{severity.icon}</Box>
                        {alert.title}
                      </Typography>

                      {/* 警报内容：文字自动换行 + 占据剩余空间 */}
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          mb: 3,
                          lineHeight: 1.6,
                          wordWrap: "break-word", // 强制文字换行
                          flexGrow: 1, // 占据中间剩余空间，防止底部内容上移
                        }}
                      >
                        {alert.message}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      {/* 底部操作区：固定在卡片底部 */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                        <Chip
                          size="small"
                          label={severity.label}
                          sx={{
                            backgroundColor: severity.bgColor,
                            color: severity.color,
                            border: "none",
                          }}
                        />
                        {!alert.isRead && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5 }}
                            onClick={() => markAsRead(alert.id)}
                          >
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

      {/* 通知状态提示（文案改为英文） */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={notificationStatus ? "success" : "info"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notificationStatus 
            ? "Notifications enabled - You'll receive air quality alerts" 
            : "Notifications disabled - You won't receive air quality alerts"}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Alerts;