"use client";

import { CssBaseline } from '@mui/material';
import Sidebar from '../components/SideNavBar';
import { ToastContainer } from 'react-toastify';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <ToastContainer position="top-center" />
          <CssBaseline />
          <main>{children}</main>
      </body>
    </html>
  );
}