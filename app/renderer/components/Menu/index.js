import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { remote } from 'electron';
import { FiUser, FiHeadphones, FiPhone } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import { GrHistory } from 'react-icons/gr';
import { FaRegAddressCard } from 'react-icons/fa';

import { store } from '../../store';
import { toggleMenu } from '../../actions/menuActions';

import { Container, Item } from './styles';

const Menu = () => {
  const history = useHistory();
  const { dispatch, state } = useContext(store);

  const handleToogleMenu = (visible = !state.showMenu) => {
    dispatch(toggleMenu(visible));
  };

  const handleNavigate = to => {
    history.push(to);
  };

  const closeWindow = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  };

  return (
    <>
      {state.showMenu && (
        <Container onClick={() => handleToogleMenu(false)}>
          <Item onClick={() => handleNavigate('/')}>
            <FiPhone /> Softphone
          </Item>
          <Item onClick={() => handleNavigate('/history')}>
            <GrHistory /> Histórico
          </Item>
          <Item onClick={() => handleNavigate('/phoneBook')}>
            <FaRegAddressCard /> Agenda
          </Item>
          <Item onClick={() => handleNavigate('/user')}>
            <FiUser /> Usuário
          </Item>
          <Item onClick={() => handleNavigate('/devices')}>
            <FiHeadphones /> Dispositivos
          </Item>
          <Item onClick={closeWindow}>
            <AiOutlineClose /> Sair
          </Item>
        </Container>
      )}
    </>
  );
};

export default Menu;
