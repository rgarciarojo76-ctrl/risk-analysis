import React, { useState } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import './ImageUploader.css';

// Mock function to simulate AI Analysis


const ImageUploader = ({ setUploadedImage, onAnalysisComplete, risks }) => { // Accepted 'risks' prop
    const [preview, setPreview] = useState(null);
    const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasConsented, setHasConsented] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true); // Toggle for overlay

    // ... existing handlers ...

    const renderOverlay = () => {
        if (!risks || !showOverlay || !preview) return null;

        return (
            <svg
                className="risk-overlay"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                {risks.map((risk) => {
                    if (!risk.coordinates) return null;
                    // Ensure numeric values to avoid string concatenation issues
                    const ymin = parseFloat(risk.coordinates[0]);
                    const xmin = parseFloat(risk.coordinates[1]);
                    const ymax = parseFloat(risk.coordinates[2]);
                    const xmax = parseFloat(risk.coordinates[3]);

                    const width = xmax - xmin;
                    const height = ymax - ymin;
                    const cx = xmin + width / 2;
                    const cy = ymin + height / 2;

                    // Clamp label position to be within image bounds (with padding)
                    // Radius is 40, so padding should be at least 45 to keep circle inside
                    const PADDING = 45;
                    const labelX = Math.max(PADDING, Math.min(1000 - PADDING, xmin));
                    const labelY = Math.max(PADDING, Math.min(1000 - PADDING, ymin));

                    return (
                        <g key={risk.id}>
                            {/* Risk Zone Ellipse */}
                            <ellipse
                                cx={cx}
                                cy={cy}
                                rx={width / 2}
                                ry={height / 2}
                                stroke="#ef4444"
                                strokeWidth="8"
                                fill="rgba(239, 68, 68, 0.1)"
                            />

                            {/* Connector Line (from Label to Center of Risk) */}
                            {/* Drawn behind the label badge */}
                            <line
                                x1={labelX}
                                y1={labelY}
                                x2={cx}
                                y2={cy}
                                stroke="#ef4444"
                                strokeWidth="4"
                                strokeDasharray="10,5"
                                opacity="0.7"
                            />

                            {/* Label Badge */}
                            <circle cx={labelX} cy={labelY} r="40" fill="#ef4444" />
                            <text
                                x={labelX}
                                y={labelY}
                                dy="12"
                                textAnchor="middle"
                                fill="white"
                                fontSize="40"
                                fontWeight="bold"
                            >
                                {risk.id}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    const handleFile = (file) => {
        if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            setUploadedImage(url);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!preview) return;
        setIsAnalyzeLoading(true);
        try {
            let resultRisks;
            let afterImageUrl = preview;

            // ALWAYS use Server-Side API (Key is in Vercel Env Vars)
            const response = await fetch(preview);
            const blob = await response.blob();

            // 1. Analyze Image with Gemini
            const { analyzeImageWithGemini } = await import('../services/googleAiService');
            // We pass 'null' for apiKey because it's handled on the backend now
            const analysisData = await analyzeImageWithGemini(blob, null);
            resultRisks = analysisData.risks;

            // 2. Image Generation: Real Imagen Check (Image-to-Image)
            if (analysisData.dalle_prompt) {
                const { generateImageWithImagen } = await import('../services/googleAiService');
                console.log("Generating buffer image with Imagen 4...", analysisData.dalle_prompt);

                // RESTORED: Base64 calculation
                const base64Promise = new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
                const imageBase64 = await base64Promise;

                try {
                    afterImageUrl = await generateImageWithImagen(analysisData.dalle_prompt, null, imageBase64);
                    // alert("Imagen 4 generada con éxito!"); // Debug success
                } catch (genError) {
                    console.error("Imagen generation failed:", genError);
                    alert("Error Generando Imagen: " + genError.message);
                    afterImageUrl = preview;
                }
            } else {
                console.warn("No dalle_prompt found in analysis data");
                alert("AVISO: Gemini no generó instrucciones para la imagen (dalle_prompt missing).");
                afterImageUrl = preview;
            }

            onAnalysisComplete({
                risks: resultRisks,
                afterImage: afterImageUrl
            });

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Error en el análisis: " + error.message);
        } finally {
            setIsAnalyzeLoading(false);
        }
    };

    return (
        <div className="uploader-container">
            {/* Header / Actions for Overlay */}
            {preview && risks && (
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20 }}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); // prevent file upload trigger
                            setShowOverlay(!showOverlay);
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                        }}
                    >
                        {showOverlay ? 'Ocultar Marcas' : 'Ver Marcas'}
                    </button>
                </div>
            )}

            <div
                className={`drop-zone ${dragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('img_subida').click()}
                style={{ position: 'relative' }} // Ensure overlay positioning context
            >
                {preview ? (
                    <div className="image-wrapper" style={{ position: 'relative', width: 'fit-content', height: 'fit-content', maxWidth: '100%', maxHeight: '100%', display: 'flex' }}>
                        <img
                            src={preview}
                            alt="Vista previa"
                            className="preview-image"
                            id="img_subida_preview"
                            style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                display: 'block'
                            }}
                        />
                        {renderOverlay()}
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <Upload size={48} className="upload-icon" />
                        <p>Arrastre imagen aquí o haga clic para subir</p>
                        <span className="file-types">JPG, PNG</span>

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'white',
                                    color: '#2563eb',
                                    border: '1px solid #2563eb',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    document.getElementById('img_subida').click();
                                }}
                            >
                                <Upload size={18} />
                                Subir Archivo
                            </button>

                            <button
                                type="button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    document.getElementById('camera_input').click();
                                }}
                            >
                                <Camera size={18} />
                                Usar Cámara
                            </button>
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    id="img_subida"
                    accept="image/png, image/jpeg"
                    onChange={handleChange}
                    className="file-input"
                />

                {/* Dedicated Camera Input */}
                <input
                    type="file"
                    id="camera_input"
                    accept="image/*"
                    capture="environment"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {preview && (
                    <button
                        className="change-image-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('img_subida').click();
                        }}
                    >
                        Cambiar imagen
                    </button>
                )}
            </div>

            {/* Assuming 'error' and 'hasConsented' are state variables defined elsewhere */}
            {/* {error && (
                <div className="error-message">
                    {error}
                </div>
            )} */}

            {/* LOPD COMPLIANCE SECTION */}
            <div className="lopd-consent-container" style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <label style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        // checked={hasConsented} // Assuming hasConsented state variable
                        // onChange={(e) => setHasConsented(e.target.checked)} // Assuming setHasConsented state setter
                        style={{ marginTop: '4px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#475569', textAlign: 'left' }}>
                        <strong>Declaración de Responsabilidad:</strong> Certifico que tengo autorización para captar estas imágenes y que su uso es estrictamente profesional/laboral. Acepto que serán procesadas por sistemas de IA externos (Google Cloud) únicamente para fines de prevención de riesgos.
                    </span>
                </label>
            </div>

            <button
                id="btn_analizar"
                onClick={handleAnalyze}
                // disabled={isAnalyzeLoading || !preview || !hasConsented} // Assuming hasConsented state variable
                className={`analyze-button ${isAnalyzeLoading || !preview /* || !hasConsented */ ? 'disabled' : ''}`}
            >
                {isAnalyzeLoading ? (
                    <>
                        <Loader2 className="spinner" size={18} />
                        Analizando...
                    </>
                ) : (
                    <>
                        <Camera size={18} />
                        Analizar Imagen
                    </>
                )}
            </button>
        </div>
    );
};

export default ImageUploader;
