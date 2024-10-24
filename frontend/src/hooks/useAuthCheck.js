import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api", {
        method: "GET",
        credentials: "include", // Important for sending cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUserId(data.userId || null);
      } else if (data.redirect) {
        setIsAuthenticated(false);
        navigate("/auth");
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Failed to check authentication status");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, userId, loading, error, checkAuth };
};
