// file: context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import axios, { AxiosError } from "axios";

// Define the types needed for our context
// You can move these to a separate types file (e.g., types.ts)
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type ApiLoginResponse = {
  message: string;
  token: string;
  user: User;
};

// Define the shape of the context value
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<any>; // Return promise for toast.promise
  logout: () => void;
};

// 1. Create the context with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Create the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  // On initial load, check localStorage to keep the user logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        // If parsing fails, clear out the stored data
        logout();
      }
    }
  }, []);

  // Login function now handles the API call
  const login = async (credentials: LoginCredentials) => {
    // The function returns the axios promise so that
    // react-sonner's toast.promise can handle it directly.
    return axios
      .post<ApiLoginResponse>("http://localhost:8000/api/v1/login", credentials)
      .then((response) => {
        const { token, user } = response.data;

        // --- This is the key part ---
        // 1. Store token and user in localStorage
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // 2. Update the state
        setToken(token);
        setUser(user);

        return response; // Forward the response to the caller
      })
      .catch((error) => {
        // If login fails, ensure state is cleared
        logout();
        // Re-throw the error so toast.promise's error handler catches it
        throw error;
      });
  };

  // Logout function clears everything
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
  };

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
