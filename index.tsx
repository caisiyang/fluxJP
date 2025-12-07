import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Unregister Service Worker to clear cache issues during dev
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker Unregistered');
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
console.log("FluxJP Mounting...");
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("FluxJP Mounted.");
