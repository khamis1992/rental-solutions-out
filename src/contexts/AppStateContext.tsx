
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define app state types
interface AppState {
  currentUser: any | null;
  isAuthenticated: boolean;
  userRole: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  systemStatus: {
    online: boolean;
    lastSyncTime: string | null;
    pendingOperations: number;
  };
}

// Action types for state reducer
type AppAction =
  | { type: 'SET_USER'; payload: any }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'INCREMENT_PENDING' }
  | { type: 'DECREMENT_PENDING' }
  | { type: 'SYNC_COMPLETE' };

// Initial state
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  userRole: null,
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: true,
  },
  systemStatus: {
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: null,
    pendingOperations: 0,
  },
};

// State reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: !!action.payload,
        userRole: action.payload?.role || null,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        userRole: null,
      };
    case 'SET_THEME':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: action.payload,
        },
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          language: action.payload,
        },
      };
    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          notifications: !state.preferences.notifications,
        },
      };
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          online: action.payload,
        },
      };
    case 'INCREMENT_PENDING':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          pendingOperations: state.systemStatus.pendingOperations + 1,
        },
      };
    case 'DECREMENT_PENDING':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          pendingOperations: Math.max(0, state.systemStatus.pendingOperations - 1),
        },
      };
    case 'SYNC_COMPLETE':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          lastSyncTime: new Date().toISOString(),
        },
      };
    default:
      return state;
  }
}

// Create context
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          // Fetch user profile when authenticated
          const fetchUserProfile = async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) throw error;

              if (profile) {
                dispatch({
                  type: 'SET_USER',
                  payload: {
                    ...session.user,
                    ...profile,
                  },
                });
              } else {
                dispatch({ type: 'SET_USER', payload: session.user });
              }
            } catch (error: any) {
              console.error('Error fetching user profile:', error.message);
              toast.error('Failed to load your profile');
              dispatch({ type: 'SET_USER', payload: session.user });
            }
          };

          fetchUserProfile();
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    // Monitor online status
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
      
      if (!isOnline) {
        toast.warning('You are offline. Some features may be limited.', {
          duration: 4000,
        });
      } else {
        toast.success('You are back online!', {
          duration: 2000,
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Load user preferences from localStorage
    const loadPreferences = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      const savedLanguage = localStorage.getItem('language');

      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      }

      if (savedLanguage) {
        dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
      }
    };

    loadPreferences();

    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('theme', state.preferences.theme);
    localStorage.setItem('language', state.preferences.language);
  }, [state.preferences.theme, state.preferences.language]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook for using app state
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Utility hooks for specific state needs
export function useAuth() {
  const { state } = useAppState();
  return {
    user: state.currentUser,
    isAuthenticated: state.isAuthenticated,
    userRole: state.userRole,
  };
}

export function usePreferences() {
  const { state, dispatch } = useAppState();
  
  return {
    preferences: state.preferences,
    setTheme: (theme: 'light' | 'dark' | 'system') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    setLanguage: (language: string) => {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    },
    toggleNotifications: () => {
      dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
    }
  };
}

export function useSystemStatus() {
  const { state, dispatch } = useAppState();
  
  return {
    systemStatus: state.systemStatus,
    setOnlineStatus: (online: boolean) => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: online });
    },
    incrementPending: () => {
      dispatch({ type: 'INCREMENT_PENDING' });
    },
    decrementPending: () => {
      dispatch({ type: 'DECREMENT_PENDING' });
    },
    syncComplete: () => {
      dispatch({ type: 'SYNC_COMPLETE' });
    }
  };
}
