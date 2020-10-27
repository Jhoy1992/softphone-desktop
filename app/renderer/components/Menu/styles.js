import styled from 'styled-components';

export const Container = styled.div`
  z-index: 100;
  position: absolute;
  top: 33px;
  left: 5px;
  width: 150px;
  margin: 0;
  padding: 0;

  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
  font-size: 12px;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background-color: #e3e3e3;
    color: #007bff;
  }

  svg {
    margin-right: 5px;
  }
`;
