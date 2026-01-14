import React from 'react';
import './AssessmentCard.css'; // Importa el CSS de arriba

const AssessmentCard = () => {

    const items = [
        { label: "Organización", text: "Tareas, jornada, funciones y carga." },
        { label: "Proceso", text: "Técnicas, fuentes de emisión y producción." },
        { label: "Entorno", text: "Distribución, orden y limpieza." },
        { label: "Medidas", text: "Ventilación, procedimientos y zonas." },
        { label: "Temporalidad", text: "Duración, frecuencia y variaciones." },
        { label: "Personal", text: "Comportamiento y hábitos de trabajo." }
    ];

    return (
        <div className="assessment-card">
            <header className="assess-header">
                <h2 className="assess-title">1. Caracterización básica</h2>
                <div className="assess-badge">
                    <span>📚</span> Norma UNE 689
                </div>
            </header>

            <div className="assess-content-box">
                <h3 className="assess-subtitle">
                    ℹ️ Criterios técnicos básicos (Factores de Exposición):
                </h3>

                <div className="assess-grid">
                    {items.map((item, index) => (
                        <div key={index} className="assess-item">
                            <span className="item-bullet">•</span>
                            <span className="item-label">{item.label}:</span>
                            <span className="item-text">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssessmentCard;
