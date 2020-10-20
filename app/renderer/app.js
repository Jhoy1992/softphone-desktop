import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import Routes from './routes';

import GlobalStyle from './styles/global';

const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));

ReactDOM.render(
  <>
    <GlobalStyle />
    <HashRouter>
      <Routes />
    </HashRouter>
  </>,
  rootElement,
);
