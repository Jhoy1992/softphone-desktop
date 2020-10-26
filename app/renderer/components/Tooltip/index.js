import React, { useContext } from 'react';

import { store } from '../../store';
import { Container } from './styles';

const Tooltip = () => {
  const { state } = useContext(store);
  const { tooltip } = state;

  return (
    <>
      {tooltip?.message && tooltip.position && (
        <Container position={tooltip.position}>{tooltip.message}</Container>
      )}
    </>
  );
};

export default Tooltip;
