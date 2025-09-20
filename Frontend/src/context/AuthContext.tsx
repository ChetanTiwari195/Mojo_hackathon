// file: context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// --- Types are unchanged ---
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

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchUser = async () => {
     // If there's no token, we can stop loading immediately.
     if (!token) {
       setLoading(false);
       return;
     }

     // If there IS a token, we must wait for the API call to finish.
     try {
       const response = await axios.get(
         "http://localhost:8000/api/v1/profile",
         {
           headers: { Authorization: `Bearer ${token}` },
         }
       );
       setUser(response.data.user);
     } catch (error) {
       console.error("Token validation failed, logging out:", error);
       // Using logout() here will clear the invalid token
       logout();
     } finally {
       // ✨ FIX: This now runs ONLY after the try/catch block is complete.
       setLoading(false);
     }
   };

   fetchUser();
 }, [token]); 

  const login = async (credentials: LoginCredentials) => {
    return axios
      .post<ApiLoginResponse>("http://localhost:8000/api/v1/login", credentials)
      .then((response) => {
        const { token, user } = response.data;

        // 1. Store ONLY the token in localStorage
        localStorage.setItem("accessToken", token);

        // 2. Update state for token and user
        setToken(token);
        setUser(user);

        return response;
      })
      .catch((error) => {
        logout(); // Ensure everything is cleared on failure
        throw error;
      });
  };

  const logout = () => {
    // 1. Remove ONLY the token from localStorage
    localStorage.removeItem("accessToken");

    // 2. Clear state
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- useAuth hook is unchanged ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
