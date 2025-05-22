import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Kode Mono', monospace;
    background-color: #000000;
    color: white;
    line-height: 1.6;
    overflow-x: hidden;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    letter-spacing: -0.5px;
  }

  h1 {
    font-size: 5rem;
    text-shadow: 0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d;
    color: white;
  }

  h2 {
    font-size: 2.5rem;
  }

  p {
    margin-bottom: 1rem;
    opacity: 0.9;
  }

  button {
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
  }

  input, textarea, select {
    font-family: 'Kode Mono', monospace;
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(0, 255, 157, 0.2);
    color: white;
    font-size: 1rem;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #00ff9d;
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #141414;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Neon text effect class */
  .neon-text {
    text-shadow: 0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d;
    color: white;
  }
`;

export default GlobalStyles;