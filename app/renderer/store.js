import React, { createContext, useReducer } from 'react';

import loadLocalStorageDevices from './utils/loadLocalStorageDevices';
import loadLocalStorageUser from './utils/loadLocalStorageUser';
import loadLocalStoragePeer from './utils/loadLocalStoragePeer';
import { connectToMonitorSocket, disconnectFromMonitorSocket } from './utils/monitorSocket';

const initialState = {
  notifications: [],
  devices: loadLocalStorageDevices(),
  user: loadLocalStorageUser(),
  peer: loadLocalStoragePeer(),
  showMenu: false,
  tooltip: {},
  socket: connectToMonitorSocket(loadLocalStorageUser().api),
};

const store = createContext(initialState);
const { Provider } = store;

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'ADD_NOTIFICATION':
        return { ...state, notifications: [...state.notifications, action.payload] };
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.filter(
            notification => notification.id !== action.payload.id,
          ),
        };

      case 'SAVE_DEVICES':
        return {
          ...state,
          devices: action.payload,
        };

      case 'SAVE_USER':
        return {
          ...state,
          user: action.payload,
        };

      case 'SAVE_PEER':
        return {
          ...state,
          peer: action.payload,
        };

      case 'TOGGLE_MENU':
        return {
          ...state,
          showMenu: action.payload.visible,
        };

      case 'TOGGLE_TOOLTIP':
        return {
          ...state,
          tooltip: action.payload,
        };

      case 'CONNECT_SOCKET':
        return {
          ...state,
          socket: connectToMonitorSocket(action.payload.server),
        };

      case 'DISCONNECT_SOCKET':
        return {
          ...state,
          socket: disconnectFromMonitorSocket(action.payload.socket),
        };

      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StoreProvider };
