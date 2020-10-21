import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { NotificationProvider } from './store';

import Routes from './routes';
import Notifications from './components/Notifications';
import GlobalStyle from './styles/global';

const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));

ReactDOM.render(
  <>
    <NotificationProvider>
      <Notifications />
      <GlobalStyle />

      <HashRouter>
        <Routes />
      </HashRouter>
    </NotificationProvider>
  </>,
  rootElement,
);
