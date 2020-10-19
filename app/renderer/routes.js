import React from 'react';

import { Switch, Route } from 'react-router-dom';

import Home from './components/Home';
// import LoggedInPage from './components/LoggedIn';

const Routes = () => (
  <Switch>
    <Route path="/" component={Home} />
    {/* <Route exact path="/loggedin" component={LoggedInPage} /> */}
  </Switch>
);

export default Routes;
