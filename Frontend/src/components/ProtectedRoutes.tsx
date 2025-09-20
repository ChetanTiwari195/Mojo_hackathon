// file: components/ProtectedRoutes.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DashboardNavbar } from "./ui/navbar";

const ProtectedRoutes = () => {
  const { user } = useAuth();

  // If the user is not logged in, redirect them to the login page.
  // The 'replace' prop is used to prevent the user from going back to the protected page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the shared navbar and the requested page content.
  return (
    <div>
      <DashboardNavbar />
      <main>
        <Outlet /> {/* Renders the child route element */}
      </main>
    </div>
  );
};

export default ProtectedRoutes;
