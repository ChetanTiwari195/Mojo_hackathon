// file: components/AdminRoutes.js

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  // This logic checks for the presence of a user and their role.
  // It's better to abstract this into a custom hook (useAuth)
  // so you can easily change from localStorage to another method later.
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("user.role");

  if (user && role === "admin") {
    return true; // User is an authenticated admin
  }

  return false; // User is not an admin
};

const AdminRoutes = () => {
  const isAdmin = useAuth();

  // If the user is an admin, render the child routes using <Outlet />.
  // Otherwise, redirect them to the login page.
  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoutes;
