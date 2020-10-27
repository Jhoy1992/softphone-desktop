import React, { useEffect, useContext } from 'react';
import {
  AiFillWarning,
  AiFillInfoCircle,
  AiFillCheckCircle,
  AiFillExclamationCircle,
  AiOutlineClose,
} from 'react-icons/ai';

import { store } from '../../store';
import { removeNotification } from '../../actions/notificationsActions';

import { Container, Image, Title, Message } from './styles';

const Toast = ({ data }) => {
  const { dispatch } = useContext(store);

  useEffect(() => {
    const removeTimeout = setTimeout(() => {
      handleRemoveNotification(data.id);
    }, 2500);

    return () => clearInterval(removeTimeout);
  }, [data]);

  const types = {
    warning: {
      title: 'Aviso',
      icon: <AiFillWarning size={20} />,
      color: '#ffb300',
    },
    error: {
      title: 'Erro',
      icon: <AiFillExclamationCircle size={20} />,
      color: '#d9534f',
    },
    success: {
      title: 'Sucesso',
      icon: <AiFillCheckCircle size={20} />,
      color: '#5cb85c',
    },
    info: {
      title: 'Informação',
      icon: <AiFillInfoCircle size={20} />,
      color: '#007bff',
    },
  };

  const handleRemoveNotification = id => {
    dispatch(removeNotification(id));
  };

  return (
    <Container color={types[data.type].color} onClick={() => handleRemoveNotification(data.id)}>
      <Image>{types[data.type].icon}</Image>

      <div>
        <Title>{types[data.type].title}</Title>
        <Message>{data.message}</Message>
      </div>

      <AiOutlineClose />
    </Container>
  );
};

export default Toast;
