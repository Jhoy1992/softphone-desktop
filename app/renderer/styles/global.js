import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  body {
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  body, input, button {
    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    color: #212529;
  }

  button {
    cursor: pointer;
  }
`;
