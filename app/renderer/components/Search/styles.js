import styled from 'styled-components';

export const Container = styled.div`
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;

  input {
    padding: 5px;
    font-size: 12px;
    border: 1px solid #ccc;
    border-radius: 3px 0 0 3px;
    border-right: none;
    width: 100%;
  }

  svg {
    background-color: #007bff;
    padding: 5px;
    width: 40px;
    border-radius: 0 3px 3px 0;
    border: 1px solid #007bff;
    color: #fff;
    border-left: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
`;
