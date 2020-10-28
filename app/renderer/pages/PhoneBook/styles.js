import styled from 'styled-components';

export const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  line-height: 1rem;
`;

export const Contacts = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  overflow-y: auto;
  max-height: 74vh;
  font-size: 13px;

  &::-webkit-scrollbar {
    width: 4px !important;
    height: 6px !important;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-track {
    background: hsla(0, 0%, 100%, 0.1);
  }
`;

export const Contact = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-bottom: 5px;
  margin-right: 3px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.15s;
  user-select: none;

  &:hover {
    background-color: #eee;
    color: #333;
  }

  div {
    display: flex;
    flex-direction: row;
    align-items: center;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    svg:first-child {
      margin-right: 3px;
    }

    strong + svg {
      margin-left: 3px;
    }
  }

  div:first-child {
    justify-content: space-between;

    div:first-child {
      color: #dc3545;
    }
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: row;

  button {
    padding: 8px;
    color: #fff;
    border: none;
    border-radius: 3px;
    transition: opacity 0.2s;
    background-color: #dc3545;
    width: 100%;

    &:hover {
      opacity: 0.9;
    }
  }
`;
