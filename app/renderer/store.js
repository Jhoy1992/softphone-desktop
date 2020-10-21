import React, { createContext, useReducer } from 'react';

const initialState = [];
const store = createContext(initialState);
const { Provider } = store;

const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'ADD_NOTIFICATION':
        return [...state, action.payload];
      case 'REMOVE_NOTIFICATION':
        return state.filter(notification => notification.id !== action.payload.id);
      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, NotificationProvider };
