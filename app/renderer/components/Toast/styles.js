import styled, { keyframes } from 'styled-components';

const slide = keyframes`
 	from {
	  transform: translateX(100%);
	}
	to {
	  transform: translateX(0);
	}
`;
export const Container = styled.div`
  display: flex;
  flex-direction: row;
  transition: 0.3s ease;
  position: relative;
  pointer-events: auto;
  overflow: hidden;
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 3px 3px 3px 3px;
  box-shadow: 0 0 3px #000;
  background-color: ${props => (props.color ? props.color : '#007bff')};
  animation: ${slide} 0.7s;
  height: 50;

  &:hover {
    box-shadow: 0 0 6px #000;
    cursor: pointer;
  }

  div + svg {
    position: absolute;
    right: 0.2rem;
    top: 0.2em;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }
  }
`;

export const Image = styled.div`
  margin-right: 5px;
`;

export const Title = styled.p`
  font-weight: 700;
  font-size: 14px;
  margin-top: 0;
`;

export const Message = styled.p`
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  max-width: 200px;
`;
