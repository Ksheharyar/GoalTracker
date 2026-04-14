'use client';

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { fetchMe, login, logout, signup } from '@/lib/api/auth';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'setUser':
      return { ...state, user: action.user };
    case 'setLoading':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const response = await fetchMe();
        if (active) {
          dispatch({ type: 'setUser', user: response.user });
        }
      } catch (_error) {
        if (active) {
          dispatch({ type: 'setUser', user: null });
        }
      } finally {
        if (active) {
          dispatch({ type: 'setLoading', loading: false });
        }
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const actions = useMemo(
    () => ({
      async loginUser(credentials) {
        const response = await login(credentials);
        dispatch({ type: 'setUser', user: response.user });
        return response.user;
      },
      async signupUser(credentials) {
        const response = await signup(credentials);
        dispatch({ type: 'setUser', user: response.user });
        return response.user;
      },
      async logoutUser() {
        await logout();
        dispatch({ type: 'setUser', user: null });
      },
      setUser(user) {
        dispatch({ type: 'setUser', user });
      },
      setLoading(loading) {
        dispatch({ type: 'setLoading', loading });
      },
    }),
    []
  );

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      ...actions,
    }),
    [state.user, state.loading, actions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };