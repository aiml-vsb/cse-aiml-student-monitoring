import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import endpoints from "../api/endpoints";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      const { data } = await api.get(endpoints.me);
      setUser(data.data);
    } catch (err) {
      console.error("Failed to fetch user:", err.response?.data || err.message);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const studentRegister = async (email, password) => {
    try {
      const { data } = await api.post(endpoints.register, { email, password, confirmPassword: password });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const studentLogin = async (email, password) => {
    try {
      const { data } = await api.post(endpoints.studentLogin, { email, password });
      localStorage.setItem("token", data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true, user: data.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid email or password",
      };
    }
  };

  const sendOtp = async (email) => {
    try {
      const { data } = await api.post(endpoints.sendOtp, { email });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post(endpoints.verifyOtp, { email, otp });
      localStorage.setItem("token", data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true, user: data.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid OTP",
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data } = await api.post(endpoints.adminLogin, { email, password });
      localStorage.setItem("token", data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true, user: data.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid admin credentials",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post(endpoints.logout);
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    token,
    studentRegister,
    studentLogin,
    sendOtp,
    verifyOtp,
    adminLogin,
    logout,
    updateUser,
    refreshUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}