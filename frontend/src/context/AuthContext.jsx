import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const AuthProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [token, user]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Load user profile data from backend
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/profile`);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load user data");
    }
  };

  useEffect(() => {
    if (token) loadUserProfileData();
    else setUser(null);
  }, [token]);

  // Update user profile function
  const updateUser = async (updatedData) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/users/profile`, updatedData);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(data.message || "Profile updated successfully");
        return { success: true };
      } else {
        toast.error(data.message || "Failed to update profile");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/users/login`, credentials);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message || "Login successful");
        return { success: true };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/users/register`, userData);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message || "Registration successful");
        return { success: true };
      } else {
        toast.error(data.message || "Registration failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        setUser,
        loading,
        backendUrl,
        loadUserProfileData,
        updateUser,
        login,
        register,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;