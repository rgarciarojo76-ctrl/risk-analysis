import React from 'react';
import ImageUploader from './ImageUploader';
import RiskTable from './RiskTable';
import ManualRiskEntry from './ManualRiskEntry';
import { Upload, SplitSquareHorizontal, FileText } from 'lucide-react';

const MainContent = ({
    uploadedImage,
    setUploadedImage,
    analysisResult,
    afterImage,
    onAnalysisComplete,
    onManualRiskAdd
}) => {
    return (
        <>
            <main className="dashboard-grid">
                {/* Left Panel: Upload (Before) - Red Border */}
                <section className="panel-left panel-border-red">
                    <div className="panel-header">
                        <Upload size={20} />
                        <h2>Imagen Original (Antes)</h2>
                    </div>
                    <ImageUploader
                        setUploadedImage={setUploadedImage}
                        onAnalysisComplete={onAnalysisComplete}
                        risks={analysisResult}
                    />
                </section>

                {/* Right Panel: After Image - Green Border */}
                <section className="panel-right panel-border-green">
                    <div className="panel-header">
                        <SplitSquareHorizontal size={20} />
                        <h2>Medidas Aplicadas (Después)</h2>
                    </div>
                    <div className="after-image-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
                        {afterImage ? (
                            <img src={afterImage} alt="Simulación Después" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                                <p>La simulación aparecerá aquí tras el análisis</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bottom Panel: Risk Table - Full Width */}
                <section className="panel-bottom">
                    <div className="panel-header">
                        <FileText size={20} />
                        <h2>Factores de Riesgo Identificados</h2>
                    </div>
                    <RiskTable risks={analysisResult} />
                </section>
            </main>

            <ManualRiskEntry onAddRisk={onManualRiskAdd} />
        </>
    );
};

export default MainContent;
