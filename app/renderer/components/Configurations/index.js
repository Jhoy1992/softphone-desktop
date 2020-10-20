import React, { useState, useEffect, useRef } from 'react';

import Header from '../../components/Header';

const Configurations = ({ history }) => {
  return (
    <>
      <Header title="Configurações" />
      <button onClick={() => history.goBack()}>Voltar</button>
      <h1>Teste de Configurações</h1>
    </>
  );
};

export default Configurations;
