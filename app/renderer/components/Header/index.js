import React, { useContext } from 'react';
import { remote } from 'electron';
import { AiFillCloseCircle, AiFillMinusCircle, AiOutlineMenu } from 'react-icons/ai';

import { store } from '../../store';
import { toggleMenu } from '../../actions/menuActions';

import { Container } from './styles';

const Header = ({ title }) => {
  const { dispatch, state } = useContext(store);

  const closeWindow = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  };

  const minimizeWindow = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.minimize();
  };

  const handleToggleMenu = () => {
    dispatch(toggleMenu(!state.showMenu));
  };

  return (
    <Container>
      <div>
        <AiOutlineMenu color="#fff" size={18} onClick={handleToggleMenu} />
      </div>

      <div>
        {title ? (
          <h4>{title}</h4>
        ) : (
          <img src="assets/logo_horizontal.png" alt="Logo native" height={18} />
        )}
      </div>

      <div>
        <AiFillMinusCircle color="#fff" size={18} onClick={minimizeWindow} />
        <AiFillCloseCircle color="#fff" size={18} onClick={closeWindow} />
      </div>
    </Container>
  );
};

export default Header;
