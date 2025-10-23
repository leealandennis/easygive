import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE'; payload: User }
  | { type: 'AUTH_CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_UPDATE':
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const normalizeUser = (raw: any): User => {
    const role = (raw?.role || '').toString().toLowerCase();
    const company = raw?.company ? { ...raw.company, domain: raw.company?.domain || raw.company?.emailDomain } : raw?.company;
    return { ...raw, role, company } as User;
  };

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: normalizeUser(currentUser) });
        } catch (error) {
          // Token is invalid, clear auth data
          authService.clearAuthData();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { token, user } = await authService.login({ email, password });
      const normalized = normalizeUser(user);
      authService.setAuthData(token, normalized);
      dispatch({ type: 'AUTH_SUCCESS', payload: normalized });
      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { token, user } = await authService.register(userData);
      authService.setAuthData(token, user);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast.success('Registration successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    authService.clearAuthData();
    dispatch({ type: 'AUTH_LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      authService.setAuthData(authService.getToken()!, updatedUser);
      dispatch({ type: 'AUTH_UPDATE', payload: updatedUser });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
