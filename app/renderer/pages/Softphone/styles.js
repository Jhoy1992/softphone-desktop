import styled, { css } from 'styled-components';

export const Container = styled.div`
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100vh;
  line-height: 1.5;
  padding: 20px;
`;

export const Display = styled.div`
  background-color: #504e4e;
  background-image: url('./assets/logo.png');
  background-repeat: no-repeat;
  background-position-y: center;
  background-position-x: center;
  border: 1px solid #444242;
  border-radius: 3px;
  font-weight: bold;
  color: #f0f5ed;
  height: 90px;
  font-size: 9px;
  padding: 5px 10px 0 10px;

  display: flex;
  flex-direction: column;
`;

export const Duration = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 2px;
`;

export const Divisor = styled.hr`
  border: none;
  border-top: 1px solid #6c757d;
`;

export const CallNumber = styled.h1`
  color: #61f803;
  padding-top: 5px;
  user-select: none;
`;

export const CallerInfo = styled.div`
  color: #61f803;
  padding-top: 5px;
`;

export const PeerInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: auto;
  margin-bottom: 0;
  padding-bottom: 0;
  user-select: none;
`;

export const DialPad = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px 20px;
  padding: 10px;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;

    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

export const DialNumber = styled.div`
  border: 1px solid #e8e8e8;
  user-select: none;

  &:hover {
    background-color: #9c9898;
    color: #fff !important;
  }
`;

export const Microphone = styled.div`
  cursor: ${props => (props.disabled ? 'not-allowed !important' : 'pointer')};

  ${props =>
    !props.disabled &&
    css`
      &:hover {
        background-color: #9c9898;
        color: #fff !important;
      }
    `}

  svg {
    ${props =>
      props.disabled &&
      css`
        pointer-events: none;
        opacity: 50%;
        color: #9c9898;
      `}
  }
`;

export const Erase = styled.div`
  padding-right: 4px;

  &:hover {
    background-color: #9c9898;
    color: #fff !important;
  }
`;

export const HangupButton = styled.div`
  &:hover {
    background-color: #9c9898;

    svg {
      color: #fff !important;
    }
  }
`;

export const AnswerButton = styled.div`
  cursor: ${props => (props.disabled ? 'not-allowed !important' : 'pointer')};

  ${props =>
    !props.disabled &&
    css`
      &:hover {
        background-color: #9c9898;

        svg {
          color: #fff !important;
        }
      }
    `}

  svg {
    ${props =>
      props.disabled &&
      css`
        pointer-events: none;
        opacity: 50%;
        color: #9c9898;
      `}
  }
`;
