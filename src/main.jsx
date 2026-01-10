import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hardcoded configuration removed for security.
// User must enter API Key in Settings Modal.
const savedKey = localStorage.getItem('google_gemini_api_key');
if (savedKey) {
    console.log("Using saved API Key from LocalStorage");
} else {
    console.warn("No API Key found. Please enter it in Settings.");
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
