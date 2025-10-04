"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import menuConfig from "../lib/menuConfig";
import iconMap from "../lib/iconMap";
import { useRouter } from "next/navigation";

export default function SideNavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState("");
  const [userRole, setUserRole] = useState("guest");

  // 监听登录状态变化
  useEffect(() => {
    const handlePathChange = () => setCurrentPath(window.location.pathname);
    handlePathChange();
    window.addEventListener("popstate", handlePathChange);

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setUserRole(token ? "auth" : "guest");
      // 未登录时强制跳转登录页
      if (!token && !currentPath.includes("login") && !currentPath.includes("register")) {
        router.push("/");
      }
    };
    checkAuth();
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("popstate", handlePathChange);
      window.removeEventListener("authChange", checkAuth);
    };
  }, [currentPath, router]);

  // 登出逻辑
  const handleClick = useCallback(
    (item) => {
      if (item.title === "Logout") {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        router.push("/");
        return;
      }
      if (item.path) router.push(item.path);
    },
    [router]
  );

  // 渲染菜单
  const renderMenu = useCallback(
    (menuItems) =>
      menuItems.map((item) => {
        const IconComponent = iconMap[item.icon];
        const isActive = item.path ? currentPath.startsWith(item.path) : false;

        return (
          <ListItemButton
            key={item.title}
            onClick={() => handleClick(item)}
            selected={isActive}
            sx={{
              pl: 3,
              py: 1.2,
              color: isActive ? theme.palette.primary.main : "inherit",
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            {IconComponent && (
              <ListItemIcon sx={{ mr: 2, fontSize: "1.1rem" }}>
                <IconComponent />
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 400 }}
            />
          </ListItemButton>
        );
      }),
    [handleClick, currentPath, theme, iconMap]
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={!isMobile && userRole === "auth"} // 仅登录后显示
      onClose={() => {}}
      sx={{
        width: isMobile ? "70%" : 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isMobile ? "70%" : 240,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: isMobile ? theme.shadows[3] : "none",
        },
      }}
    >
      {/* 侧边栏头部 */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <iconMap.AirIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        <Typography variant="h6" fontWeight={600}>
          AirQuality App
        </Typography>
      </Box>

      {/* 角色标签 */}
      <Box
        sx={{ p: 1.5, pl: 3, fontSize: "0.75rem", color: theme.palette.text.secondary, fontWeight: 500 }}
      >
        Logged In
      </Box>

      {/* 菜单列表 */}
      <Box sx={{ overflow: "auto", height: `calc(100vh - 120px)` }}>
        <List disablePadding>{renderMenu(menuConfig.auth || [])}</List>
      </Box>
    </Drawer>
  );
}