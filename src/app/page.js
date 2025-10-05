"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TextField, Button, Typography, Box, Paper, Link, CircularProgress } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AirIcon from "@mui/icons-material/Air"; // 应用图标

export default function LoginPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 表单输入处理
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 登录提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 基础表单验证
    if (!form.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth", {
        action: "login",
        phone: form.phone,
        password: form.password,
      });

      // 登录成功：存储token + 触发状态更新 + 跳转仪表盘
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 全屏容器：居中展示卡片
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        backgroundColor: theme => theme.palette.grey[50], 
      }}
    >
      <ToastContainer position="top-center" autoClose={2000} />

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <AirIcon sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          JustBreathe
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
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
          },
        }}
      >

        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, textAlign: "center" }}>
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5, textAlign: "center" }}>
          Enter your credentials to access your account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            inputProps={{
              maxLength: 11, 
              placeholder: "e.g. 12312312",
            }}
            disabled={loading}
            variant="outlined"
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
            //   minLength: 6, // 密码最小长度
            //   placeholder: "At least 6 characters",
            // }}
            disabled={loading}
            variant="outlined"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(45deg, #2196f3 30%, #4caf50 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976d2 30%, #388e3c 90%)",
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 2 }} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                href="/register"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 600, cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/register");
                }}
              >
                Register now
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}