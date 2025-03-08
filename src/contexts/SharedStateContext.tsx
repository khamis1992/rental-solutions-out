
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Define the shared state structure
export interface SharedState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    enabled: boolean;
    count: number;
  };
  preferences: {
    dateFormat: string;
    currencyFormat: string;
  };
}

// Define action types for state updates
type SharedStateAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_NOTIFICATION_COUNT'; payload: number }
  | { type: 'SET_DATE_FORMAT'; payload: string }
  | { type: 'SET_CURRENCY_FORMAT'; payload: string }
  | { type: 'RESET_PREFERENCES' };

// Initial state
const initialState: SharedState = {
  theme: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    count: 0,
  },
  preferences: {
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD',
  },
};

// Reducer function
function sharedStateReducer(state: SharedState, action: SharedStateAction): SharedState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          enabled: !state.notifications.enabled,
        },
      };
    case 'SET_NOTIFICATION_COUNT':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          count: action.payload,
        },
      };
    case 'SET_DATE_FORMAT':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          dateFormat: action.payload,
        },
      };
    case 'SET_CURRENCY_FORMAT':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          currencyFormat: action.payload,
        },
      };
    case 'RESET_PREFERENCES':
      return {
        ...state,
        preferences: initialState.preferences,
      };
    default:
      return state;
  }
}

// Create context
const SharedStateContext = createContext<{
  state: SharedState;
  dispatch: Dispatch<SharedStateAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export function SharedStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sharedStateReducer, initialState);

  // Load saved preferences from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
    
    if (savedLanguage) {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    }
  }, []);
  
  // Save preferences to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('theme', state.theme);
    localStorage.setItem('language', state.language);
  }, [state.theme, state.language]);

  return (
    <SharedStateContext.Provider value={{ state, dispatch }}>
      {children}
    </SharedStateContext.Provider>
  );
}

// Custom hook for using the shared state
export function useSharedState() {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
}

// Utility hooks for specific state needs
export function useTheme() {
  const { state, dispatch } = useSharedState();
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };
  
  return {
    theme: state.theme,
    setTheme,
  };
}

export function useLanguage() {
  const { state, dispatch } = useSharedState();
  const setLanguage = (language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };
  
  return {
    language: state.language,
    setLanguage,
  };
}

export function useNotifications() {
  const { state, dispatch } = useSharedState();
  
  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  };
  
  const setNotificationCount = (count: number) => {
    dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: count });
  };
  
  return {
    enabled: state.notifications.enabled,
    count: state.notifications.count,
    toggleNotifications,
    setNotificationCount,
  };
}

export function useUserPreferences() {
  const { state, dispatch } = useSharedState();
  
  const setDateFormat = (format: string) => {
    dispatch({ type: 'SET_DATE_FORMAT', payload: format });
  };
  
  const setCurrencyFormat = (format: string) => {
    dispatch({ type: 'SET_CURRENCY_FORMAT', payload: format });
  };
  
  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' });
  };
  
  return {
    preferences: state.preferences,
    setDateFormat,
    setCurrencyFormat,
    resetPreferences,
  };
}
