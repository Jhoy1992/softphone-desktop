import styled from 'styled-components';

export const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  line-height: 1rem;
  min-height: 94vh;
`;

export const ListDevices = styled.div`
  display: flex;
  flex-direction: column;

  select {
    padding: 5px;
    font-size: 14px;
    margin: 5px 0;
  }
`;

export const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 5px;
  border-top: 1px solid #ccc;
  padding-top: 5px;
  margin-top: 5px;

  button {
    padding: 8px;
    color: #fff;
    border: none;
    border-radius: 3px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &:first-child {
      background-color: #dc3545;
    }

    &:last-child {
      background-color: #007bff;
    }
  }
`;
