// styles/iconMap.js
// 导入 MUI 图标并映射为键值对，方便菜单配置调用
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AirIcon from "@mui/icons-material/Air";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
// import DatabaseIcon from "@mui/icons-material/Database";
import StorageIcon from '@mui/icons-material/Storage';
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";

// 图标映射表：键名需与 menuConfig 中的 icon 字段一致
const iconMap = {
  LoginIcon,
  PersonAddIcon,
  AirIcon,
  DashboardIcon,
  MapIcon,
  WbSunnyIcon,
  StorageIcon,
  HistoryIcon,
  NotificationsIcon,
  InfoIcon,
  LogoutIcon,
};

export default iconMap;