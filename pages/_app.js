// File: pages/_app.js

import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css'; // Your global stylesheet

function MyApp({ Component, pageProps }) {
  return (
    // Wrap the entire application with the ThemeProvider
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;