import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MainContent from '../components/MainContent';
import SettingsModal from '../components/SettingsModal';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [uploadedImage, setUploadedImage] = React.useState(null);
    const [analysisResult, setAnalysisResult] = React.useState(null);
    const [afterImage, setAfterImage] = React.useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    const handleAnalysisComplete = (data) => {
        setAnalysisResult(data.risks);
        setAfterImage(data.afterImage);
    };

    const handleManualRiskAdd = (newRisk) => {
        setAnalysisResult(prev => [...(prev || []), newRisk]);
    };

    const handleExport = async () => {
        // Dynamic import to avoid SSR issues if any, though standard import is fine in Vite
        const { generatePDFReport } = await import('../utils/pdfExport');
        generatePDFReport(analysisResult, uploadedImage, afterImage);
    };

    return (
        <div className="dashboard-container">
            <Header
                onOpenSettings={() => setIsSettingsOpen(true)}
                onExport={handleExport}
            />

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <MainContent
                uploadedImage={uploadedImage}
                setUploadedImage={setUploadedImage}
                analysisResult={analysisResult}
                afterImage={afterImage}
                onAnalysisComplete={handleAnalysisComplete}
                onManualRiskAdd={handleManualRiskAdd}
            />

            <Footer />
        </div>
    );
};

export default DashboardLayout;
