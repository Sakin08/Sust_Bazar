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
  const currencySymbol = "Tk";

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [loading, setLoading] = useState(true);

  // Setup axios interceptor for better error handling
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
          toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Handle token and user state changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          
          // Verify token is still valid by fetching user profile
          await loadUserProfileData();
        } catch (error) {
          // Token is invalid, clear auth state
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Load user profile data from backend
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/profile`);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        toast.error(data.message || "Failed to load user data");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      const message = error.response?.data?.message || "Failed to load user data";
      toast.error(message);
      return { success: false, message };
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
        return { success: true, user: data.user };
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
        return { success: true, user: data.user };
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

  // Update profile function
  
  // Update profile function - FIXED VERSION
const updateProfile = async (formData) => {
  if (!user || !user.id) {
    toast.error("User not found. Please login again.");
    return { success: false, message: "User not found" };
  }

  try {
    const { data } = await axios.put(
      `${backendUrl}/api/users/update-profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          // Don't override Authorization header - let the interceptor handle it
          // OR explicitly include it:
          // "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message || "Profile updated successfully");
      return { success: true, user: data.user };
    } else {
      toast.error(data.message || "Failed to update profile");
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Profile update error:", error);
    const msg = error.response?.data?.message || "Update failed";
    toast.error(msg);
    return { success: false, message: msg };
  }
};
  // Alternative update profile function using the /profile route
  

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
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
        currencySymbol,
        loadUserProfileData,
        updateProfile,
      
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;