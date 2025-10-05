"use client";
import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Paper,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Tooltip as MuiTooltip,
    Divider,
    useTheme,
} from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from "recharts";
import {
    Info as InfoIcon,
    CalendarToday,
    FilterList,
    WarningAmber,
} from "@mui/icons-material";
import SideNavBar from "@/components/SideNavBar";
import {
    Cloud, CloudQueue, Thermostat, WaterDrop, WindPower,
    WbTwilight, ArrowUpward, ArrowDownward, InfoOutlined, Sunny
} from "@mui/icons-material";

const historyData = [
    {
        day: "Mon",
        date: "Oct 1",
        PM25: 30,
        PM10: 55,
        O3: 0.04,
        CO: 0.8,
        SO2: 6,
        NO2: 25,
    },
    {
        day: "Tue",
        date: "Oct 2",
        PM25: 35,
        PM10: 62,
        O3: 0.045,
        CO: 0.9,
        SO2: 7,
        NO2: 28,
    },
    {
        day: "Wed",
        date: "Oct 3",
        PM25: 40,
        PM10: 68,
        O3: 0.05,
        CO: 1.0,
        SO2: 8,
        NO2: 32,
    },
    {
        day: "Thu",
        date: "Oct 4",
        PM25: 32,
        PM10: 58,
        O3: 0.042,
        CO: 0.85,
        SO2: 6.5,
        NO2: 26,
    },
    {
        day: "Fri",
        date: "Oct 5",
        PM25: 38,
        PM10: 65,
        O3: 0.048,
        CO: 0.95,
        SO2: 7.5,
        NO2: 30,
    },
    {
        day: "Sat",
        date: "Oct 6",
        PM25: 41,
        PM10: 70,
        O3: 0.052,
        CO: 1.05,
        SO2: 9,
        NO2: 35,
    },
    {
        day: "Sun",
        date: "Oct 7",
        PM25: 30,
        PM10: 55,
        O3: 0.04,
        CO: 0.8,
        SO2: 6,
        NO2: 25,
    },
];


const pollutantConfig = {
    PM25: {
        name: "PM2.5",
        unit: "μg/m³",
        safeLevel: 25,
        color: "#ff5722",
        description: "Fine particulate matter, harmful when inhaled deeply into lungs",
    },
    PM10: {
        name: "PM10",
        unit: "μg/m³",
        safeLevel: 50,
        color: "#795548",
        description: "Coarse particulate matter, affects upper respiratory tract",
    },
    O3: {
        name: "Ozone",
        unit: "ppm",
        safeLevel: 0.05,
        color: "#3f51b5",
        description: "Ground-level ozone, irritates eyes and respiratory system",
    },
    CO: {
        name: "Carbon Monoxide",
        unit: "ppm",
        safeLevel: 9,
        color: "#f44336",
        description: "Toxic gas that reduces oxygen delivery in the blood",
    },
    SO2: {
        name: "Sulfur Dioxide",
        unit: "ppb",
        safeLevel: 75,
        color: "#9c27b0",
        description: "Irritates respiratory system, forms acid rain",
    },
    NO2: {
        name: "Nitrogen Dioxide",
        unit: "ppb",
        safeLevel: 100,
        color: "#ff9800",
        description: "Causes respiratory problems, contributes to smog",
    },
};

// 时间范围选项
const timeRanges = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 3 Months" },
];

// 自定义Tooltip组件
const CustomRechartsTooltip = ({ active, payload, label, pollutant }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const config = pollutantConfig[pollutant];
        const isOverSafe = data[pollutant] > config.safeLevel;

        return (
            <Paper sx={{ p: 2, borderRadius: 1, boxShadow: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    {data.day}, {data.date}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    {config.name}:{" "}
                    <span style={{ color: config.color, fontWeight: "bold" }}>
                        {data[pollutant]} {config.unit}
                    </span>
                </Typography>
                {isOverSafe && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, color: "#f44336" }}>
                        <WarningAmber fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption">Above safe level ({config.safeLevel} {config.unit})</Typography>
                    </Box>
                )}
            </Paper>
        );
    }
    return null;
};

function History() {
    const theme = useTheme();
    const [selectedPollutant, setSelectedPollutant] = useState("PM25");
    const [timeRange, setTimeRange] = useState("7days");
    const [tabValue, setTabValue] = useState(0);
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
    const handlePollutantChange = (event) => {
        setSelectedPollutant(event.target.value);
    };

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
            <SideNavBar />

            <Box sx={{ flex: 1, p: 4, overflow: "auto" }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Historical Air Quality Data
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track air pollutant levels over time to identify trends and patterns
                    </Typography>
                </Box>

                <Paper sx={{ p: 2, mb: 4, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Time Range:
                        </Typography>
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={handleTimeRangeChange}
                            displayEmpty
                        >
                            {timeRanges.map((range) => (
                                <MenuItem key={range.value} value={range.value}>
                                    {range.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 30 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FilterList fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                            Pollutant:
                        </Typography>
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                            value={selectedPollutant}
                            label="Pollutant"
                            onChange={handlePollutantChange}
                            displayEmpty
                        >
                            {Object.entries(pollutantConfig).map(([key, config]) => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                backgroundColor: config.color,
                                            }}
                                        />
                                        {config.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <MuiTooltip
                        title={
                            <Box sx={{ maxWidth: 250 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {pollutantConfig[selectedPollutant].name}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {pollutantConfig[selectedPollutant].description}
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 1, color: "text.secondary" }}>
                                    Safe level: {pollutantConfig[selectedPollutant].safeLevel}{" "}
                                    {pollutantConfig[selectedPollutant].unit}
                                </Typography>
                            </Box>
                        }
                        placement="top"
                    >
                        <InfoIcon fontSize="small" color="action" sx={{ cursor: "help", ml: "auto" }} />
                    </MuiTooltip>
                </Paper>

                <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
                    <CardContent sx={{ p: 0 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
                            <Tab label="Trend Chart" sx={{ py: 2 }} />
                            <Tab label="Detailed Data" sx={{ py: 2 }} />
                        </Tabs>

                        {tabValue === 0 && (
                            <Box sx={{ p: 4 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                                    {pollutantConfig[selectedPollutant].name} Trends ({timeRanges.find(r => r.value === timeRange)?.label})
                                </Typography>

                                <Box sx={{ height: 450, width: "100%" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={historyData}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[200]} />

                                            <XAxis
                                                dataKey="day"
                                                tick={{ fontSize: 12 }}
                                                axisLine={{ stroke: theme.palette.grey[300] }}
                                                tickLine={false}
                                                label={{
                                                    value: "Day of Week",
                                                    position: "bottom",
                                                    offset: 15,
                                                    fontSize: 12,
                                                    color: theme.palette.text.secondary,
                                                }}
                                            />

                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                axisLine={{ stroke: theme.palette.grey[300] }}
                                                tickLine={false}
                                                label={{
                                                    value: `${pollutantConfig[selectedPollutant].name} (${pollutantConfig[selectedPollutant].unit})`,
                                                    angle: -90,
                                                    position: "left",
                                                    offset: -5,
                                                    fontSize: 12,
                                                    color: theme.palette.text.secondary,
                                                    style: { textAnchor: "middle" },
                                                }}
                                            />

                                            <ReferenceLine
                                                y={pollutantConfig[selectedPollutant].safeLevel}
                                                stroke="#f44336"
                                                strokeDasharray="3 3"
                                                label={{
                                                    value: `Safe Level: ${pollutantConfig[selectedPollutant].safeLevel}`,
                                                    position: "right",
                                                    fontSize: 12,
                                                }}
                                            />

                                            <RechartsTooltip
                                                content={<CustomRechartsTooltip pollutant={selectedPollutant} />}
                                                cursor={{ strokeDasharray: "3 3" }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey={selectedPollutant}
                                                name={pollutantConfig[selectedPollutant].name}
                                                stroke={pollutantConfig[selectedPollutant].color}
                                                strokeWidth={3}
                                                dot={{
                                                    r: 6,
                                                    strokeWidth: 2,
                                                    fill: "white",
                                                    stroke: pollutantConfig[selectedPollutant].color,
                                                }}
                                                activeDot={{ r: 8, strokeWidth: 2 }}
                                                animationDuration={1500}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        )}

                        {tabValue === 1 && (
                            <Box sx={{ p: 4, overflowX: "auto" }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                                    Daily Air Quality Measurements
                                </Typography>

                                <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "100px 100px repeat(6, 1fr)",
                                            bgColor: theme.palette.grey[50],
                                            p: 2,
                                            fontWeight: "bold",
                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Box>Day</Box>
                                        <Box>Date</Box>
                                        {Object.entries(pollutantConfig).map(([key, config]) => (
                                            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        backgroundColor: config.color,
                                                    }}
                                                />
                                                <Box sx={{ fontSize: "0.85rem" }}>{config.name}</Box>
                                            </Box>
                                        ))}
                                    </Box>

                                    {historyData.map((item, index) => (
                                        <Box
                                            key={index}
                                            display="grid"
                                            gridTemplateColumns="100px 100px repeat(6, 1fr)"
                                            p={2}
                                            borderBottom={`1px solid ${theme.palette.divider}`}
                                            sx={{
                                                "&:last-child": { borderBottom: "none" },
                                                "&:nth-of-type(even)": { backgroundColor: theme.palette.grey[50] },
                                            }}
                                        >
                                            <Box fontWeight="500">{item.day}</Box>
                                            <Box color="text.secondary">{item.date}</Box>

                                            {Object.keys(pollutantConfig).map((key) => {
                                                const config = pollutantConfig[key];
                                                const isOverSafe = item[key] > config.safeLevel;
                                                return (
                                                    <Box
                                                        key={key}
                                                        sx={{
                                                            color: isOverSafe ? "#f44336" : "inherit",
                                                            fontWeight: isOverSafe ? "bold" : "normal",
                                                        }}
                                                    >
                                                        {item[key]} {config.unit}
                                                        {isOverSafe && (
                                                            <WarningAmber fontSize="small" sx={{ verticalAlign: "middle", ml: 0.5 }} />
                                                        )}
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Grid container spacing={3} sx={{ mt: 4 }}>
                    {Object.entries(pollutantConfig).map(([key, config]) => {
                        const avgValue = historyData.reduce((sum, item) => sum + item[key], 0) / historyData.length;
                        const isOverSafe = avgValue > config.safeLevel;

                        return (
                            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={key}>
                                <Card
                                    sx={{
                                        borderLeft: `4px solid ${config.color}`,
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            boxShadow: 3
                                        },
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        boxShadow: 1
                                    }}
                                >
                                    <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 0.5
                                        }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                                {config.name}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="h7"
                                            sx={{
                                                mt: 1,
                                                mb: 1,
                                                fontWeight: "bold",
                                                lineHeight: 1.3,
                                                flexGrow: 1,
                                                display: "flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            {avgValue.toFixed(1)} {config.unit}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: "auto", lineHeight: 1 }}
                                        >
                                            7-day average
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}

export default History;