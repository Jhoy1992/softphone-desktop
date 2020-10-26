import React, { useContext } from 'react';

import { store } from '../../store';
import Toast from '../Toast';
import { Container } from './styles';

const Notifications = () => {
  const { state } = useContext(store);
  const { notifications = [] } = state;

  return (
    <Container>
      {notifications.map(notification => (
        <Toast key={notification.id} data={notification} />
      ))}
    </Container>
  );
};

export default Notifications;
