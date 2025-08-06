import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Checking for existing token...");
    const token = localStorage.getItem("token");
    console.log("AuthContext: Token found:", token ? "Yes" : "No");
  
    if (token) {
      try {
        // Decode token to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("AuthContext: Decoded token payload:", payload);
  
        const userData = {
          id: payload.id,
          email: payload.email,
          firstName: payload.first_name || payload.firstName || "",
          lastName: payload.last_name || payload.lastName || "",
          username: payload.username || payload.email,
        };
  
        console.log("AuthContext: Setting user data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
    console.log("AuthContext: Initialization complete");
  }, []);

  const login = async (credentials) => {
    try {
      console.log("Attempting login with:", credentials);
      const response = await authAPI.login(credentials);
      console.log("Full login response:", response);
      console.log("Response data:", response.data);

      let token, userData;

      if (response.data.token) {
        token = response.data.token;
        userData = response.data.user || response.data;
      } else if (response.data.data && response.data.data.token) {
        token = response.data.data.token;
        userData = response.data.data.user;
      } else if (
        response.data.message &&
        response.data.message.includes("successfully")
      ) {
        token = response.data.token || response.data.accessToken;
        userData = response.data.user;
      } else {
        console.error("No token found in response:", response.data);
        throw new Error("Invalid response format: no token found");
      }

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      console.log("Token received:", token);
      console.log("User data from response:", userData);

      localStorage.setItem("token", token);

      let tokenUserData = null;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token payload:", payload);
        tokenUserData = payload;
      } catch (error) {
        console.error("Error decoding token:", error);
      }

      const finalUserData = {
        id: userData?.id || tokenUserData?.id || null,
        username:
          userData?.username || tokenUserData?.username || credentials.username,
        firstName:
          userData?.firstName ||
          userData?.first_name ||
          tokenUserData?.first_name ||
          tokenUserData?.firstName ||
          "",
        lastName:
          userData?.lastName ||
          userData?.last_name ||
          tokenUserData?.last_name ||
          tokenUserData?.lastName ||
          "",
        email: userData?.email || tokenUserData?.email || credentials.username,
      };

      console.log("Setting final user data:", finalUserData);
      setUser(finalUserData);

      return { success: true };
    } catch (error) {
      console.error("Login error details:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Login failed - please check your credentials",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log("Register response:", response.data);

      const responseData = response.data;
      const token = responseData.token || responseData.data?.token;
      const newUser = responseData.user || responseData.data?.user;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      setUser(
        newUser || {
          id: null,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }
      );

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
