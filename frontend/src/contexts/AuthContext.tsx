import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/AuthServices';
import type { AuthContextType, FrontendUser as User } from '../types/api_interfaces';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole') as 'user' | 'driver' | 'admin' | null;

        if (userId && userEmail && userName && userRole) {
          setUser({
            id: userId,
            email: userEmail,
            name: userName,
            role: userRole,
          });

          // Try to get current user from API to verify token
          try {
            const response = await authAPI.getCurrentUser();
            if (response.data.user) {
              const userData: any = response.data.user;
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role as 'user' | 'driver' | 'admin',
                phone: userData.phone,
                address: userData.address,
                city: userData.city,
                province: userData.province,
                postalCode: userData.postal_code,
                driverInfo: userData.driverInfo,
              });
            }
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('driverId');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data.user) {
        const userData: any = response.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as 'user' | 'driver' | 'admin',
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          province: userData.province,
          postalCode: userData.postalCode || userData.postal_code,
          driverInfo: userData.driverInfo,
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: 'rider' | 'driver';
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    licenseNumber?: string;
    insuranceProof?: string;
    carPhoto?: string;
    availableSeats?: number;
  }) => {
    try {
      const response = await authAPI.register(data);
      if (response.data.user) {
        const userData: any = response.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as 'user' | 'driver' | 'admin',
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          province: userData.province,
          postalCode: userData.postalCode || userData.postal_code,
          driverInfo: userData.driverInfo,
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear local storage even if API call fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.user) {
        const userData: any = response.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          province: userData.province,
          postalCode: userData.postalCode || userData.postal_code,
          role: userData.role as 'user' | 'driver' | 'admin',
          driverInfo: userData.driverInfo,
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };
  const updateUser = (partial: any) => {
    setUser((prev: any) => ({ ...prev, ...partial }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



