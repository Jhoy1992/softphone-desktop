import styled from 'styled-components';

export const Container = styled.span`
  font-size: 14px;
  position: absolute;
  z-index: 9999999;
  color: #000;
  background-color: #a5f589;
  border-radius: 5px;
  padding: 5px 10px;
  max-width: 85%;
  pointer-events: none;
  font-size: 10px;
  opacity: 0.95;

  left: ${props => (props.position?.left ? props.position.left : 0)}px;
  top: ${props => (props.position?.top ? props.position.top : 0)}px;

  &:before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 0;
    border-bottom: 8px solid #a5f589;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
  }
`;
