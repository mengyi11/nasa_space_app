// lib/menuConfig.js
// 菜单配置：按「未登录(guest)」和「已登录(auth)」区分，移除层级父菜单
const menuConfig = {
  // 未登录状态：直接显示 Login/Register
  guest: [
    {
      title: "Login",
      icon: "LoginIcon",
      path: "/",
    },
    {
      title: "Register",
      icon: "PersonAddIcon",
      path: "/register",
    },
  ],

  // 已登录状态：直接显示所有功能菜单
  auth: [
    {
      title: "Dashboard",
      icon: "DashboardIcon",
      path: "/dashboard",
    },
    {
      title: "Map",
      icon: "MapIcon",
      path: "/map",
    },
    {
      title: "Forecast",
      icon: "WbSunnyIcon",
      path: "/forecast",
    },
    {
      title: "History",
      icon: "HistoryIcon",
      path: "/history",
    },
    {
      title: "Alerts",
      icon: "NotificationsIcon",
      path: "/alerts",
    },
    {
      title: "About",
      icon: "InfoIcon",
      path: "/about",
    },
    {
      title: "Logout",
      icon: "LogoutIcon",
      path: "/logout",
    },
  ],
};

export default menuConfig;