"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Typography, Box, Card, CardContent, Chip, IconButton,
    Tooltip, Select, MenuItem, FormControl, InputLabel,
    Drawer, Divider, List, ListItem, ListItemText,
    useTheme, Snackbar, Alert
} from "@mui/material";
import {
    ZoomIn, ZoomOut, MyLocation, Layers, FilterList,
    Info as InfoIcon, CheckCircle, WarningAmber, Error
} from "@mui/icons-material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

import SideNavBar from "@/components/SideNavBar";

const monitoringStations = [
    {
        id: 1,
        name: "Marina Bay",
        position: [1.2831, 103.8603],
        aqi: 65,
        status: "Moderate",
        pm25: 28,
        pm10: 35,
        updated: "2025-10-05 09:30"
    },
    {
        id: 2,
        name: "Jurong West",
        position: [1.3521, 103.6950],
        aqi: 72,
        status: "Moderate",
        pm25: 33,
        pm10: 41,
        updated: "2025-10-05 09:15"
    },
    {
        id: 3,
        name: "Woodlands",
        position: [1.4380, 103.7880],
        aqi: 90,
        status: "Moderate",
        pm25: 40,
        pm10: 52,
        updated: "2025-10-05 09:45"
    },
    {
        id: 4,
        name: "Tampines",
        position: [1.3521, 103.9456],
        aqi: 105,
        status: "Unhealthy for Sensitive Groups",
        pm25: 55,
        pm10: 68,
        updated: "2025-10-05 09:00"
    },
    {
        id: 5,
        name: "Bukit Timah",
        position: [1.3294, 103.8021],
        aqi: 78,
        status: "Moderate",
        pm25: 35,
        pm10: 47,
        updated: "2025-10-05 09:20"
    }
];

const aqiConfig = [
    { range: [0, 50], status: "Good", color: "#4caf50", icon: <CheckCircle /> },
    { range: [51, 100], status: "Moderate", color: "#ffc107", icon: <InfoIcon /> },
    { range: [101, 150], status: "Unhealthy for Sensitive Groups", color: "#ff9800", icon: <WarningAmber /> },
    { range: [151, 200], status: "Unhealthy", color: "#f44336", icon: <Error /> },
    { range: [201, 300], status: "Very Unhealthy", color: "#9c27b0", icon: <Error /> },
    { range: [301, 500], status: "Hazardous", color: "#880e4f", icon: <Error /> }
];

const getAqiConfig = (aqi) => {
    return aqiConfig.find(config => aqi >= config.range[0] && aqi <= config.range[1]) || aqiConfig[5];
};

const createCustomMarker = (color) => {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 2px solid white; box-shadow: 0 0 0 2px ${color}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

function AirQualityMap() {
    const theme = useTheme();
    const mapRef = useRef(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [mapType, setMapType] = useState("standard");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: "", type: "info" });
    const [userLocation, setUserLocation] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                    setNotification({
                        open: true,
                        message: "Location found. Showing nearby stations.",
                        type: "success"
                    });
                },
                (error) => {
                    console.log("Error getting location:", error);
                    setUserLocation([1.3521, 103.8198]); // Singapore fallback
                    setNotification({
                        open: true,
                        message: "Could not access your location. Showing Singapore as default view.",
                        type: "warning"
                    });
                }
            );
        } else {
            // If geolocation is not supported
            setUserLocation([1.3521, 103.8198]); // Singapore fallback
        }
    }, []);

    const filteredStations = monitoringStations.filter(station => {
        if (filter === "all") return true;
        const stationConfig = getAqiConfig(station.aqi);
        return stationConfig.status === filter;
    });

    const handleZoomIn = () => {
        mapRef.current?.leafletElement?.zoomIn();
    };

    const handleZoomOut = () => {
        mapRef.current?.leafletElement?.zoomOut();
    };

    const handleLocate = () => {
        if (userLocation) {
            mapRef.current?.leafletElement?.setView(userLocation, 13);
        } else {
            setNotification({
                open: true,
                message: "Your location is not available.",
                type: "error"
            });
        }
    };

    const handleStationClick = (station) => {
        setSelectedStation(station);
        setDrawerOpen(true);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
            <SideNavBar />

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: theme.palette.divider, bgColor: "background.paper" }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Air Quality Map
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        <Box sx={{ display: "flex", gap: 1, bgcolor: theme.palette.grey[100], p: 1, borderRadius: 1 }}>
                            <Tooltip title="Zoom In">
                                <IconButton size="small" onClick={handleZoomIn} sx={{ color: theme.palette.text.primary }}>
                                    <ZoomIn fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Zoom Out">
                                <IconButton size="small" onClick={handleZoomOut} sx={{ color: theme.palette.text.primary }}>
                                    <ZoomOut fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="My Location">
                                <IconButton size="small" onClick={handleLocate} sx={{ color: theme.palette.text.primary }}>
                                    <MyLocation fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Map Type</InputLabel>
                            <Select value={mapType} label="Map Type" onChange={(e) => setMapType(e.target.value)}>
                                <MenuItem value="standard">Standard</MenuItem>
                                <MenuItem value="satellite">Satellite</MenuItem>
                                <MenuItem value="terrain">Terrain</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Status</InputLabel>
                            <Select value={filter} label="Filter by Status" onChange={(e) => setFilter(e.target.value)}>
                                <MenuItem value="all">All Stations</MenuItem>
                                {aqiConfig.map((config) => (
                                    <MenuItem key={config.status} value={config.status}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: config.color }} />
                                            {config.status}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Tooltip title="Show Legend">
                            <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ ml: "auto" }}>
                                <Layers fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, position: "relative" }}>
                    <MapContainer
                        ref={mapRef}
                        center={userLocation || [1.3521, 103.8198]} // default Singapore
                        zoom={12}
                        style={{ width: "100%", height: "100%" }}
                        attributionControl={false}
                    >
                        {mapType === "standard" && (
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        )}
                        {mapType === "satellite" && (
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        )}
                        {mapType === "terrain" && (
                            <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
                        )}

                        {/* Monitoring station markers */}
                        {filteredStations.map((station) => {
                            const config = getAqiConfig(station.aqi);
                            return (
                                <React.Fragment key={station.id}>
                                    {/* Circular area showing AQI impact */}
                                    <Circle
                                        center={station.position}
                                        radius={station.aqi * 100}
                                        color={config.color}
                                        fillColor={config.color}
                                        fillOpacity={0.2}
                                    />

                                    {/* Station marker */}
                                    <Marker
                                        position={station.position}
                                        icon={createCustomMarker(config.color)}
                                        eventHandlers={{ click: () => handleStationClick(station) }}
                                    >
                                        <Popup maxWidth="300px">
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{station.name}</Typography>
                                                <Typography>AQI: <span style={{ color: config.color, fontWeight: "bold" }}>{station.aqi}</span></Typography>
                                                <Typography>Status: <span style={{ color: config.color }}>{config.status}</span></Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                    Updated: {station.updated}
                                                </Typography>
                                            </Box>
                                        </Popup>
                                    </Marker>
                                </React.Fragment>
                            );
                        })}

                        {/* User location marker */}
                        {userLocation && (
                            <Marker
                                position={userLocation}
                                icon={L.divIcon({
                                    className: "user-marker",
                                    html: `<div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${theme.palette.primary.main}; border: 2px solid white; box-shadow: 0 0 0 2px ${theme.palette.primary.main}"></div>`,
                                    iconSize: [18, 18],
                                    iconAnchor: [9, 9]
                                })}
                            >
                                <Popup>
                                    <Typography>Your Location</Typography>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* Bottom info */}
                    <Box sx={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        bgcolor: "background.paper",
                        p: 1,
                        borderRadius: 1,
                        boxShadow: 1,
                        fontSize: "0.75rem",
                        color: "text.secondary"
                    }}>
                        Data updated: {new Date().toLocaleString()} | Click markers for details
                    </Box>
                </Box>
            </Box>

            {/* Side drawer - station details or legend */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ width: 320 }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: theme.palette.divider }}>
                    <Typography variant="h6" fontWeight="bold">
                        {selectedStation ? `${selectedStation.name} Details` : "Air Quality Legend"}
                    </Typography>
                </Box>

                {selectedStation ? (
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                            <Chip
                                icon={getAqiConfig(selectedStation.aqi).icon}
                                label={`AQI: ${selectedStation.aqi} (${selectedStation.status})`}
                                color={getAqiConfig(selectedStation.aqi).status === "Good" ? "success" :
                                    getAqiConfig(selectedStation.aqi).status === "Moderate" ? "warning" : "error"}
                                size="large"
                                sx={{ fontSize: "1rem", py: 1 }}
                            />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <List>
                            <ListItem>
                                <ListItemText primary="PM2.5" secondary={`${selectedStation.pm25} μg/m³`} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="PM10" secondary={`${selectedStation.pm10} μg/m³`} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Last Updated" secondary={selectedStation.updated} />
                            </ListItem>
                        </List>

                        <Box sx={{ mt: 4, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Health Advice</Typography>
                            <Typography variant="body2">
                                {getAqiConfig(selectedStation.aqi).status === "Good"
                                    ? "Air quality is satisfactory, and air pollution poses little or no risk."
                                    : getAqiConfig(selectedStation.aqi).status === "Moderate"
                                        ? "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."
                                        : "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
                                }
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    // Legend view
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>AQI Legend</Typography>
                        <List>
                            {aqiConfig.map((config, index) => (
                                <ListItem key={index} sx={{ paddingY: 1 }}>
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: "50%",
                                            backgroundColor: config.color,
                                            mr: 2,
                                            mt: 0.5
                                        }}
                                    />
                                    <ListItemText
                                        primary={`${config.status}`}
                                        secondary={`${config.range[0]} - ${config.range[1]}`}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Map Controls</Typography>
                        <List>
                            <ListItem>
                                <ZoomIn sx={{ mr: 2 }} fontSize="small" />
                                <ListItemText primary="Zoom In" />
                            </ListItem>
                            <ListItem>
                                <ZoomOut sx={{ mr: 2 }} fontSize="small" />
                                <ListItemText primary="Zoom Out" />
                            </ListItem>
                            <ListItem>
                                <MyLocation sx={{ mr: 2 }} fontSize="small" />
                                <ListItemText primary="Locate Me" />
                            </ListItem>
                        </List>
                    </Box>
                )}
            </Drawer>

            {/* Snackbar notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.type}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AirQualityMap;