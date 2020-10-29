import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { StoreProvider } from './store';
import { SocketProvider } from './contexts/socketContext';

import Routes from './routes';
import Notifications from './components/Notifications';
import Tooltip from './components/Tooltip';
import GlobalStyle from './styles/global';

const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));

ReactDOM.render(
  <>
    <StoreProvider>
      <Notifications />
      <Tooltip />
      <GlobalStyle />

      <HashRouter>
        <Routes />
      </HashRouter>
    </StoreProvider>
  </>,
  rootElement,
);
