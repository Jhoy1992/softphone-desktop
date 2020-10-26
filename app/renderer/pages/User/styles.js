import styled from 'styled-components';

export const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  line-height: 1rem;
  min-height: 94vh;

  strong {
    text-align: center;
  }

  input {
    padding: 5px;
    font-size: 14px;
    margin: 5px 0;
    width: 100%;
  }

  hr {
    margin: 5px 0;
    border: none;
    border-top: 1px solid #ccc;
  }

  button {
    padding: 8px;
    color: #fff;
    border: none;
    border-radius: 3px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }

    &:focus {
      border: 1px solid #333;
    }
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 30vh;

  p {
    color: #bbb;
    letter-spacing: 0.1rem;
    font-size: 10px;
  }
`;

export const Native = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;

  div {
    display: flex;
    flex-direction: row;

    column-gap: 5px;
  }

  div > div {
    display: flex;
    flex-direction: column;
  }

  button {
    width: 100%;
    background-color: #5cb85c;
  }
`;

export const Asterisk = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 15px;

  div {
    display: flex;
    flex-direction: row;

    column-gap: 5px;
  }

  div > div {
    display: flex;
    flex-direction: column;
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
    &:first-child {
      background-color: #dc3545;
    }

    &:last-child {
      background-color: #007bff;
    }
  }
`;
