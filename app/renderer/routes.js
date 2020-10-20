import React from 'react';

import { Switch, Route } from 'react-router-dom';

import Home from './components/Home';
import Configurations from './components/Configurations';

const Routes = () => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/configurations" component={Configurations} />
  </Switch>
);

export default Routes;
