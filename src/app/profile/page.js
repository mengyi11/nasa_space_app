"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Typography,
    FormControlLabel,
    Checkbox,
    Divider,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    Save as SaveIcon,
    Lock as LockIcon,
    Edit as EditIcon,
    Check as CheckIcon,
} from "@mui/icons-material";
import SideNavBar from "@/components/SideNavBar";

const themeColors = {
    primary: "#2196f3", 
    secondary: "#4caf50", 
    neutral: "#f5f7fa",
    textPrimary: "#2d3748", 
    textSecondary: "#718096", 
    border: "#e2e8f0", 
    success: "#38a169", 
    error: "#e53e3e", 
};

export default function MyProfile() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        type: "success", // success/error/info
    });
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

    const [isFormDirty, setIsFormDirty] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then((data) => {
                setUser(data.user);
                setForm(data.user);
            })
            .catch((err) => {
                showNotification(err.message, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    const showNotification = (message, type = "success") => {
        setNotification({ open: true, message, type });
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
        setIsFormDirty(true);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({
            ...passwordForm,
            [name]: value,
        });
    };

    const handleSaveProfile = async () => {
        if (!isFormDirty) {
            showNotification("No changes to save", "info");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save profile");
            showNotification(data.message || "Profile saved successfully");
            setIsFormDirty(false); 
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.oldPassword.trim()) {
            showNotification("Please enter your old password", "error");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showNotification("New password must be at least 6 characters", "error");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showNotification("New passwords do not match", "error");
            return;
        }

        setChangingPw(true);
        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update password");
            showNotification(data.message || "Password updated successfully");
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setChangingPw(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: themeColors.neutral,
                    p: 4,
                }}
            >
                <CircularProgress
                    color="primary"
                    size={48}
                    sx={{ mb: 3, color: themeColors.primary }}
                />
                <Typography variant="h6" color={themeColors.textSecondary}>
                    Loading your profile...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: themeColors.neutral,
                p: { xs: 2, md: 4 }, 
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 3, md: 4 },
                py: 6, 
            }}
        >
            <SideNavBar />
            <Box sx={{ width: "100%", maxWidth: 600 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={themeColors.textPrimary}
                    sx={{ textAlign: "center", mb: 1 }}
                >
                    My Profile
                </Typography>
                <Typography
                    variant="body1"
                    color={themeColors.textSecondary}
                    sx={{ textAlign: "center" }}
                >
                    Manage your personal information and preferences
                </Typography>
            </Box>

          
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "flex-start", 
                    alignItems: "flex-start",
                    gap: 4,
                    ml: { xs: 0, md: "240px" }, 
                    p: { xs: 2, md: 4 }, 
                    width: "100%",
                    maxWidth: "calc(100% - 240px)", 
                    transition: "margin 0.3s ease",
                }}
            >
              
                <Paper
                    elevation={3}
                    sx={{
                        flex: 1,
                        minWidth: 300,
                        p: { xs: 3, md: 4 },
                        borderRadius: "12px",
                        backgroundColor: "white",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: "1px solid transparent",
                            borderRadius: "12px",
                            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}) border-box`,
                            WebkitMask:
                                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            pointerEvents: "none",
                        },
                        transition: "box-shadow 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                        },
                    }}
                >

                  
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <EditIcon color="primary" sx={{ color: themeColors.primary }} />
                            <Typography variant="h5" fontWeight="600" color={themeColors.textPrimary}>
                                Personal Information
                            </Typography>
                        </Box>
                        
                        <Typography variant="body2" color={themeColors.textSecondary}>
                            Click to edit fields
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3, backgroundColor: themeColors.border }} />

                   
                    <Box display="flex" flexDirection="column" gap={3}>
                       
                        <TextField
                            label="Phone Number"
                            name="phone"
                            value={form.phone || ""}
                            fullWidth
                            disabled
                            sx={{
                                backgroundColor: themeColors.neutral,
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    borderRadius: "8px",
                                    color: themeColors.textSecondary,
                                },
                            }}
                            InputProps={{
                                readOnly: true,
                                sx: {
                                    "& fieldset": { border: "none" },
                                },
                            }}
                        />

                        <TextField
                            label="Birth Year"
                            name="birth_year"
                            value={form.birth_year || ""}
                            fullWidth
                            disabled
                            sx={{
                                backgroundColor: themeColors.neutral,
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    borderRadius: "8px",
                                    color: themeColors.textSecondary,
                                },
                            }}
                            InputProps={{
                                readOnly: true,
                                sx: {
                                    "& fieldset": { border: "none" },
                                },
                            }}
                        />

                   
                        <TextField
                            label="City"
                            name="city"
                            value={form.city || ""}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary, 
                                },
                            }}
                            placeholder="Enter your city"
                        />

                        <TextField
                            label="State"
                            name="state"
                            value={form.state || ""}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary,
                                },
                            }}
                            placeholder="Enter your state"
                        />

                        <TextField
                            label="Country"
                            name="country"
                            value={form.country || ""}
                            onChange={handleFormChange}
                            fullWidth
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary,
                                },
                            }}
                            placeholder="Enter your country"
                        />

                        <Typography
                            variant="subtitle1"
                            fontWeight="500"
                            color={themeColors.textPrimary}
                            sx={{ mt: 2, mb: 1 }}
                        >
                            Health Conditions
                        </Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, 
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!form.pregnancy_status}
                                        onChange={handleFormChange}
                                        name="pregnancy_status"
                                        color="primary"
                                        sx={{
                                            "&.Mui-checked": { color: themeColors.primary }, 
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                }
                                label={
                                    <Typography color={themeColors.textPrimary} variant="body1">
                                        Pregnancy status
                                    </Typography>
                                }
                                sx={{ cursor: "pointer" }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!form.has_asthma}
                                        onChange={handleFormChange}
                                        name="has_asthma"
                                        color="primary"
                                        sx={{
                                            "&.Mui-checked": { color: themeColors.primary },
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                }
                                label={
                                    <Typography color={themeColors.textPrimary} variant="body1">
                                        Has asthma
                                    </Typography>
                                }
                                sx={{ cursor: "pointer" }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!form.has_bronchitis}
                                        onChange={handleFormChange}
                                        name="has_bronchitis"
                                        color="primary"
                                        sx={{
                                            "&.Mui-checked": { color: themeColors.primary },
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                }
                                label={
                                    <Typography color={themeColors.textPrimary} variant="body1">
                                        Has bronchitis
                                    </Typography>
                                }
                                sx={{ cursor: "pointer" }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!form.has_copd}
                                        onChange={handleFormChange}
                                        name="has_copd"
                                        color="primary"
                                        sx={{
                                            "&.Mui-checked": { color: themeColors.primary },
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                }
                                label={
                                    <Typography color={themeColors.textPrimary} variant="body1">
                                        Has COPD
                                    </Typography>
                                }
                                sx={{ cursor: "pointer" }}
                            />
                        </Box>

                     
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSaveProfile}
                            disabled={saving || !isFormDirty}
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            sx={{
                                py: 1.2,
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: `linear-gradient(135deg, #1976d2 0%, #388e3c 100%)`, 
                                    boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                                },
                                "&:disabled": {
                                    background: themeColors.neutral,
                                    color: themeColors.textSecondary,
                                    boxShadow: "none",
                                    cursor: "not-allowed",
                                },
                            }}
                        >
                            {saving ? "Saving..." : "Save Profile"}</Button>
                    </Box>
                </Paper>
                <Paper
                    elevation={3}
                    sx={{
                        flex: 1,
                        minWidth: 300,
                        p: { xs: 3, md: 4 },
                        borderRadius: "12px",
                        backgroundColor: "white",
                        transition: "box-shadow 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                        },
                    }}
                >
                    
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <LockIcon color="primary" sx={{ color: themeColors.primary }} />
                            <Typography
                                variant="h5"
                                fontWeight="600"
                                color={themeColors.textPrimary}
                            >
                                Change Password
                            </Typography>
                        </Box>

                        <Tooltip title="Secure password required">
                            <IconButton size="small" sx={{ color: themeColors.textSecondary }}>
                                <CheckIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Divider sx={{ mb: 3, backgroundColor: themeColors.border }} />

                
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label="Old Password"
                            name="oldPassword"
                            type="password"
                            value={passwordForm.oldPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary,
                                },
                            }}
                            placeholder="Enter your current password"
                            disabled={changingPw}
                        />

                        <TextField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary,
                                },
                            }}
                            placeholder="At least 6 characters"
                            helperText="Must be at least 6 characters long"
                            disabled={changingPw}
                            error={passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6}
                        />

                        <TextField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            sx={{
                                borderRadius: "8px",
                                "& .MuiInputBase-root": { borderRadius: "8px" },
                                "& .MuiOutlinedInput-root:hover fieldset": {
                                    borderColor: themeColors.primary,
                                },
                            }}
                            placeholder="Re-enter your new password"
                            helperText={
                                passwordForm.newPassword && passwordForm.confirmPassword
                                    ? passwordForm.newPassword === passwordForm.confirmPassword
                                        ? "Passwords match"
                                        : "Passwords do not match"
                                    : ""
                            }
                            disabled={changingPw}
                            error={
                                passwordForm.newPassword &&
                                passwordForm.confirmPassword &&
                                passwordForm.newPassword !== passwordForm.confirmPassword
                            }
                        />

                    
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleChangePassword}
                            disabled={changingPw}
                            startIcon={changingPw ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                py: 1.2,
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                background: "linear-gradient(135deg, #4caf50 30%, #2196f3 90%)",
                                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #388e3c 30%, #1976d2 90%)",
                                    boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                                },
                                "&:disabled": {
                                    background: themeColors.neutral,
                                    color: themeColors.textSecondary,
                                    boxShadow: "none",
                                    cursor: "not-allowed",
                                },
                            }}
                        >
                            {changingPw ? "Updating..." : "Update Password"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.type}
                    sx={{
                        width: "100%",
                        maxWidth: 400,
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>);
}