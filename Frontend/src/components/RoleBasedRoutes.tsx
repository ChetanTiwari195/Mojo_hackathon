// file: components/RoleBasedRoutes.js
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { DashboardNavbar } from "./ui/navbar";

const RoleBasedRoutes = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && !allowedRoles.includes(user.role)) {
      toast.error("Unauthorized Access", {
        description:
          "You do not have the necessary permissions to view this page.",
      });
    }
  }, [user, loading, allowedRoles, location]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // 1. If the user is authorized, show the navbar and the page content.
  if (user && allowedRoles.includes(user.role)) {
    // ✨ CHANGE IS HERE
    return (
      <>
        <DashboardNavbar />
        <main className="p-4">
          <Outlet />
        </main>
      </>
    );
  }

  // 2. If the user exists but their role is NOT allowed, redirect to the home page.
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. If no user is logged in, redirect to the login page.
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RoleBasedRoutes;
