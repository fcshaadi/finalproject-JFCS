import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { getRoleFromToken, isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && !isTokenExpired(storedToken)) {
      const tokenRole = getRoleFromToken(storedToken);
      setToken(storedToken);
      setRole(tokenRole);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    } else {
      // Clear invalid/expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, role: userRole, user: userData } = response;

      setToken(newToken);
      setRole(userRole);
      setUser(userData);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };



  /*
  const register = async (registrationData) => {
    try {
      const response = await authAPI.register(registrationData);
      
      // After registration, automatically log in
      const loginResponse = await authAPI.login(
        registrationData.userEmail,
        registrationData.userPassword
      );

      const { token: newToken, role: userRole, user: userData } = loginResponse;

      setToken(newToken);
      setRole(userRole);
      setUser(userData);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };
*/
const register = async (registrationData) => {
  try {
    // Build backend DTO shape expected by RegisterDto
    const formattedData = {
      userFullName: registrationData.userFullName,
      userEmail: registrationData.userEmail,
      userPassword: registrationData.userPassword,
      beneficiaryFullName: registrationData.beneficiaryFullName,
      beneficiaryEmail: registrationData.beneficiaryEmail,
      beneficiaryPassword: registrationData.beneficiaryPassword,
    };
    const response = await authAPI.register(formattedData);

    // Login after registration
    const loginResponse = await authAPI.login(
      registrationData.userEmail,
      registrationData.userPassword
    );

    const { token: newToken, role: userRole, user: userData } = loginResponse;

    setToken(newToken);
    setRole(userRole);
    setUser(userData);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        'Registration failed. Please try again.',
    };
  }
};


  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return token !== null && !isTokenExpired(token);
  };

  const hasRole = (requiredRole) => {
    if (!role) return false;
    if (role === requiredRole) return true;
    if (role === 'both') return true; // 'both' has access to everything
    return false;
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

