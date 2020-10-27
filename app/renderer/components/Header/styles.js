import styled from 'styled-components';

export const Container = styled.div`
  -webkit-user-select: none;
  -webkit-app-region: drag;

  background-color: #323336;
  color: #fff;
  height: 34px;
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding-right: 8px;

  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div:first-child {
    justify-content: flex-start;
  }

  div:last-child {
    justify-content: flex-end;
  }

  svg {
    -webkit-app-region: no-drag;
    cursor: pointer;
  }

  svg:hover {
    opacity: 0.8;
    color: #ff6f00 !important;
  }

  svg:last-child {
    margin-left: 5px;
  }
`;
