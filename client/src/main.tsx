import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers for unhandled promises and errors
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser error handling
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
