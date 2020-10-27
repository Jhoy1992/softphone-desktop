import React from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';

import { Container } from './styles';

function Search({ value, onChange }) {
  return (
    <Container>
      <input value={value} onChange={onChange} type="text" placeholder="Pesquisar..." />
      <FiSearch size={26} />
    </Container>
  );
}

export default Search;
