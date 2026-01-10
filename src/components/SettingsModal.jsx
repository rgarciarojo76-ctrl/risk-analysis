import React, { useState, useEffect } from 'react';
import { X, Save, Key } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const storedKey = localStorage.getItem('google_gemini_api_key');
        if (storedKey) setApiKey(storedKey);
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('google_gemini_api_key', apiKey);
        onClose();
        alert('Configuración guardada correctamente.');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Configuración API</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ background: '#ecfdf5', color: '#047857', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <strong>✅ API Gestionada por el Servidor</strong>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Por seguridad, la clave API ya no se guarda en el navegador.
                            <br /><br />
                            Está configurada en las <strong>Variables de Entorno</strong> de Vercel (`GOOGLE_GEMINI_API_KEY`).
                        </p>
                    </div>
                </div>
                <div className="modal-footer">
                    {/* No Save Action Needed */}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
