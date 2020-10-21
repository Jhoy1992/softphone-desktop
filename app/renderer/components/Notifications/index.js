import React, { useContext } from 'react';

import { store } from '../../store';
import Toast from '../Toast';
import { Container } from './styles';

const Notifications = () => {
  const { state } = useContext(store);

  return (
    <Container>
      {state.map(notification => (
        <Toast key={notification.id} data={notification} />
      ))}
    </Container>
  );
};

export default Notifications;
