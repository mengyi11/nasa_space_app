"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TextField, Button, Typography, Box, Paper, Link, CircularProgress } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AirIcon from "@mui/icons-material/Air";

export default function RegisterPage() {
  const [form, setForm] = useState({ phone: "", birthYear: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const currentYear = new Date().getFullYear(); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!form.birthYear.trim() || isNaN(form.birthYear) || form.birthYear.length !== 4) {
      toast.error("Please enter a valid 4-digit birth year (e.g. 1990)");
      return;
    }
    if (Number(form.birthYear) < 1900 || Number(form.birthYear) > currentYear) {
      toast.error(`Birth year must be between 1900 and ${currentYear}`);
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth", {
        ...form,
        action: "register",
      });

      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed. Please try again later.";
      toast.error(errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        backgroundColor: (theme) => theme.palette.grey[50], 
      }}
    >
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} />

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <AirIcon
          sx={{
            fontSize: 48,
            color: (theme) => theme.palette.primary.main,
            mb: 2,
            opacity: 0.9,
          }}
        />
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          AirQuality App
        </Typography>
      </Box>

      <Paper
        elevation={6} 
        sx={{
          width: "100%",
          maxWidth: 420, 
          p: 5,
          borderRadius: 3, 
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: "2px solid transparent",
            borderRadius: "inherit",
            background: "linear-gradient(45deg, #4caf50, #2196f3) border-box", 
            "-webkit-mask": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            "-webkit-mask-composite": "xor",
            maskComposite: "exclude",
            pointerEvents: "none", 
          },
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, textAlign: "center" }}>
          Register
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5, textAlign: "center" }}>
          Create a new account to access all features
        </Typography>

        <Box>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            inputProps={{
              maxLength: 8, 
              placeholder: "e.g. 12345678",
              autoComplete: "tel", 
            }}
            disabled={loading}
            variant="outlined"
            size="medium"
          />

          <TextField
            fullWidth
            label="Birth Year"
            name="birthYear"
            type="number"
            value={form.birthYear}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            inputProps={{
              min: 1900,
              max: currentYear,
              placeholder: `e.g. ${currentYear - 20}`, 
              autoComplete: "bday-year",
            }}
            disabled={loading}
            variant="outlined"
            size="medium"
          />

        
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 5 }}
            // inputProps={{
            //   minLength: 6, // 密码最小长度限制
            //   placeholder: "At least 6 characters (letters/numbers)",
            //   autoComplete: "new-password", // 避免浏览器自动填充旧密码
            // }}
            disabled={loading}
            variant="outlined"
            size="medium"
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(45deg, #4caf50 30%, #2196f3 90%)",
              boxShadow: "0 3px 5px 2px rgba(76, 175, 80, 0.3)", 
              "&:hover": {
                background: "linear-gradient(45deg, #388e3c 30%, #1976d2 90%)", 
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 2 }} />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                href="/"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 600, cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}