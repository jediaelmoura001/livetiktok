import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token armazenado ao inicializar
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.verify();
          setUser({
            username: response.data.username
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Token inválido, remover do localStorage
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username) => {
    try {
      setLoading(true);
      const response = await authService.login(username);
      setUser({
        username: response.username
      });
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

