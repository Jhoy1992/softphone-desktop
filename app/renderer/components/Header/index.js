import React from 'react';
import { Link } from 'react-router-dom';
import { remote } from 'electron';
import { AiFillCloseCircle, AiFillMinusCircle, AiOutlineMenu } from 'react-icons/ai';

import { Container } from './styles';

const Header = ({ title }) => {
  const closeWindow = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  };

  const minimizeWindow = () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.minimize();
  };

  return (
    <Container>
      <div>
        <Link to="/configurations">
          <AiOutlineMenu color="#fff" size={18} />
        </Link>
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
