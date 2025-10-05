"use client";

import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Divider,
    useTheme,
    Tooltip,
} from "@mui/material";
import {
    Info,
    Code,
    Cloud,
    Satellite,
    // Users,
    Link as LinkIcon,
    Twitter,
} from "@mui/icons-material";
import ErrorIcon from '@mui/icons-material/Error';
import GitHubIcon from '@mui/icons-material/GitHub';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import SideNavBar from "@/components/SideNavBar";


const teamMembers = [
    {
        id: 1,
        name: "xxxxx",
        role: "Frontend Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        skills: ["React", "MUI", "PWA"],
    },
    {
        id: 2,
        name: "xxxxx",
        role: "Data Scientist",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
        skills: ["Data Visualization", "TEMPO API", "Forecasting"],
    },
    {
        id: 3,
        name: "xxxxx",
        role: "UX Designer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamie",
        skills: ["UI/UX", "Responsive Design", "Accessibility"],
    },
    {
        id: 4,
        name: "xxxxx",
        role: "Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
        skills: ["API Integration", "Database", "Cloud Deployment"],
    },
     {
        id: 5,
        name: "xxxxx",
        role: "Backend Developer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
        skills: ["API Integration", "Database", "Cloud Deployment"],
    },
];

// 核心功能数据
const coreFeatures = [
    {
        id: 1,
        title: "Real-Time TEMPO Data",
        description: "Integrates satellite data from NASA's TEMPO mission for hyperlocal air quality monitoring.",
        icon: <Satellite color="primary" />,
    },
    {
        id: 2,
        title: "Ground-Level Validation",
        description: "Combines satellite data with ground-based sensor measurements for higher accuracy.",
        icon: <Cloud color="secondary" />,
    },
    {
        id: 3,
        title: "Predictive Forecasting",
        description: "Uses machine learning to forecast air quality up to 3 days in advance.",
        icon: <ErrorIcon color="warning" />,
    },
    {
        id: 4,
        title: "Accessibility Focused",
        description: "Designed with WCAG 2.1 standards to ensure usability for all users.",
        icon: <PeopleIcon color="info" />,
    },
];

const techStack = [
    { category: "Frontend", items: ["React.js", "Material-UI", "Recharts", "React Router"] },
    { category: "Data", items: ["TEMPO API", "OpenAQ API", "Chart.js", "ML Forecasting"] },
    { category: "Deployment", items: ["PWA", "Vercel", "GitHub Pages", "Cloudflare"] },
];

function About() {
    const theme = useTheme();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.grey[50] }}>
            <SideNavBar />

            <Box
                sx={{
                    flex: 1,
                    p: { xs: 3, md: 6 },
                    overflow: "auto",
                    maxWidth: "100vw",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        mb: 6,
                        borderRadius: 3,
                        bgColor: theme.palette.background.paper,
                        textAlign: "center",
                        boxShadow: 1,
                        transition: "transform 0.5s ease",
                        transform: animate ? "translateY(0)" : "translateY(20px)",
                        opacity: animate ? 1 : 0,
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                bgColor: theme.palette.primary.light,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white"
                            }}
                        >
                            <Satellite fontSize="large" />
                        </Box>
                    </Box>

                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Air Quality Insights
                    </Typography>

                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, maxWidth: "800px", margin: "0 auto" }}>
                        A NASA Space Apps Challenge 2025 Project — Empowering communities with real-time air quality data and forecasts
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                        <Chip
                            label="NASA TEMPO"
                            variant="outlined"
                            size="small"
                            icon={<Satellite fontSize="small" />}
                        />
                        <Chip
                            label="2025 Space Apps"
                            variant="outlined"
                            size="small"
                            icon={<PublicIcon fontSize="small" />}
                        />
                        <Chip
                            label="Open Data"
                            variant="outlined"
                            size="small"
                            icon={<Cloud fontSize="small" />}
                        />
                    </Box>
                </Paper>

                <Box
                    sx={{
                        mb: 8,
                        transition: "transform 0.5s ease 0.2s",
                        transform: animate ? "translateY(0)" : "translateY(20px)",
                        opacity: animate ? 1 : 0,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2}>
                        <Info /> About the Project
                    </Typography>

                    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
                        <Typography paragraph sx={{ lineHeight: 1.8, color: theme.palette.text.primary }}>
                            This web application was developed for the 2025 NASA Space Apps Challenge, with a mission to make satellite-derived air quality data accessible and actionable for the public.
                            By integrating real-time data from NASA's Tropospheric Emissions: Monitoring of Pollution (TEMPO) satellite mission with ground-based sensor networks,
                            we provide hyperlocal air quality insights, forecasts, and health alerts.
                        </Typography>

                        <Typography paragraph sx={{ lineHeight: 1.8, color: theme.palette.text.primary }}>
                            Our goal is to bridge the gap between scientific data and community health by delivering user-friendly tools that help individuals,
                            families, and organizations make informed decisions about outdoor activities, especially for vulnerable groups like children,
                            the elderly, and those with respiratory conditions.
                        </Typography>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" fontWeight="medium" mb={3} display="flex" alignItems="center" gap={1.5}>
                            <Code fontSize="medium" /> Technology Stack
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 2 }}>
                            {techStack.map((category) => (
                                <Grid item size={{ xs: 12, sm: 6 }} key={category.category}>
                                    <Box sx={{ bgColor: theme.palette.grey[50], p: 2, borderRadius: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2}>
                                            {category.category}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            {category.items.map((item) => (
                                                <Chip key={item} label={item} size="small" sx={{ bgcolor: "white" }} />
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>

                <Box
                    sx={{
                        mb: 8,
                        transition: "transform 0.5s ease 0.4s",
                        transform: animate ? "translateY(0)" : "translateY(20px)",
                        opacity: animate ? 1 : 0,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2}>
                        <ErrorIcon /> Core Features
                    </Typography>

                    <Grid container spacing={3}>
                        {coreFeatures.map((feature) => (
                            <Grid item size={{ xs: 12, sm: 6 }} key={feature.id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: 3,
                                        },
                                        borderTop: `3px solid ${theme.palette.primary.main}`,
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ mb: 2, color: theme.palette.primary.main }}>
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" mb={2}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box
                    sx={{
                        mb: 6,
                        transition: "transform 0.5s ease 0.6s",
                        transform: animate ? "translateY(0)" : "translateY(20px)",
                        opacity: animate ? 1 : 0,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2}>
                        <PeopleIcon /> Our Team
                    </Typography>

                    <Grid container spacing={3}>
                        {teamMembers.map((member) => (
                            <Grid item size={{ xs: 12, sm: 6, md: 2.4 }} key={member.id}>
                                <Card sx={{ height: "100%", textAlign: "center" }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Avatar
                                            src={member.avatar}
                                            alt={member.name}
                                            sx={{ width: 80, height: 80, margin: "0 auto 20px" }}
                                        />
                                        <Typography variant="h6" fontWeight="bold" mb={1}>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary" mb={3}>
                                            {member.role}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                            {member.skills.map((skill) => (
                                                <Chip key={skill} label={skill} size="small" sx={{ bgcolor: theme.palette.grey[100] }} />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        bgColor: theme.palette.grey[50],
                        textAlign: "center",
                        transition: "transform 0.5s ease 0.8s",
                        transform: animate ? "translateY(0)" : "translateY(20px)",
                        opacity: animate ? 1 : 0,
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        © 2025 Air Quality Insights | NASA Space Apps Challenge
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Tooltip title="GitHub Repository">
                            <IconButton size="small" color="text.secondary">
                                <GitHubIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Twitter">
                            <IconButton size="small" color="text.secondary">
                                <Twitter fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Project Website">
                            <IconButton size="small" color="text.secondary">
                                <PublicIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Data Sources">
                            <IconButton size="small" color="text.secondary">
                                <LinkIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default About;