
import { useState, useCallback, useReducer, Reducer } from 'react';

/**
 * A type-safe hook for managing component state with controlled updates
 * and validation
 */
export function useComponentState<T>(
  initialState: T,
  validator?: (state: T) => boolean
) {
  const [state, setState] = useState<T>(initialState);
  
  const updateState = useCallback((newState: Partial<T>) => {
    setState((prev) => {
      const updatedState = { ...prev, ...newState };
      
      // Validate state if validator is provided
      if (validator && !validator(updatedState)) {
        console.warn('Invalid state update rejected', newState);
        return prev;
      }
      
      return updatedState;
    });
  }, [validator]);
  
  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);
  
  return {
    state,
    updateState,
    resetState
  };
}

/**
 * A reducer-based hook for more complex state management with
 * type-safe actions and state transitions
 */
export function useTypedReducer<S, A extends { type: string }>(
  reducer: Reducer<S, A>,
  initialState: S
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Create a typed dispatcher that ensures type safety for actions
  const dispatchAction = useCallback((action: A) => {
    dispatch(action);
  }, []);
  
  return {
    state,
    dispatch: dispatchAction
  };
}

/**
 * A hook for managing loading/error/data states in components
 * with a convenient API
 */
export function useLoadingState<T>(initialData: T | null = null) {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    isLoading: false,
    error: null,
    data: initialData
  });
  
  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);
  
  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);
  
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, isLoading: false, error: null }));
  }, []);
  
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: initialData
    });
  }, [initialData]);
  
  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset
  };
}
