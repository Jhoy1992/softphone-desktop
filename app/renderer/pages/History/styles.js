import styled from 'styled-components';

export const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  line-height: 1rem;
  min-height: 94vh;
`;

export const Search = styled.div`
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

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
`;

export const Calls = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  overflow-y: auto;
  max-height: 74vh;
  font-size: 13px;

  p {
    color: #007bff;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    margin-top: 5px;

    &:hover {
      text-decoration: underline;
    }
  }

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

export const Call = styled.div`
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
    justify-content: space-between;
    align-items: center;

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    svg:first-child {
      margin-right: 3px;
    }
  }

  div:last-child {
    margin-top: 3px;
  }
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
