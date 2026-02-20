import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        /* font-size: 62.5%; */
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f5f5f5;
        color: #333;
    }
`;