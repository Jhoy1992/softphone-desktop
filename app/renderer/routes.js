import React from 'react';

import { Switch, Route } from 'react-router-dom';

import Softphone from './pages/Softphone';
import Devices from './pages/Devices';
import User from './pages/User';
import History from './pages/History';

const Routes = () => (
  <Switch>
    <Route path="/" exact component={Softphone} />
    <Route path="/devices" component={Devices} />
    <Route path="/user" component={User} />
    <Route path="/history" component={History} />
  </Switch>
);

export default Routes;
