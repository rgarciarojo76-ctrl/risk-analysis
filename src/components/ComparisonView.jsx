import React, { useState } from 'react';
import { ZoomIn, RotateCcw } from 'lucide-react';
import './ComparisonView.css';

const ComparisonView = ({ beforeImage, afterImage }) => {
    const [sliderValue, setSliderValue] = useState(50);
    const [zoomLevel, setZoomLevel] = useState(1);

    // If we only have before image or nothing, show simple view
    if (!beforeImage) {
        return <div className="comparison-placeholder">Suba una imagen para ver la comparación</div>;
    }

    const handleSliderChange = (e) => {
        setSliderValue(e.target.value);
    };

    const handleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2 : 1);
    };

    // If 'after' image is not ready, just show 'before'
    const showComparison = !!afterImage;

    const [showOverlay, setShowOverlay] = useState(true);

    const renderOverlay = (imageType) => { // Modified to accept imageType
        // Only render overlay for originalImage (before)
        if (imageType !== 'original' || !risks || !showOverlay) return null;

        return (
            <svg className="risk-overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                {risks.map((risk) => {
                    if (!risk.coordinates) return null;
                    const [ymin, xmin, ymax, xmax] = risk.coordinates;
                    const width = xmax - xmin;
                    const height = ymax - ymin;
                    const cx = xmin + width / 2;
                    const cy = ymin + height / 2;

                    return (
                        <g key={risk.id}>
                            {/* Bounding Box / Ellipse */}
                            <ellipse
                                cx={cx}
                                cy={cy}
                                rx={width / 2}
                                ry={height / 2}
                                stroke="#ef4444"
                                strokeWidth="8"
                                fill="rgba(239, 68, 68, 0.1)" // Light red fill
                            />
                            {/* Number Badge */}
                            <circle cx={xmin} cy={ymin} r="40" fill="#ef4444" />
                            <text
                                x={xmin}
                                y={ymin}
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

    return (
                 */}

{
    showComparison ? (
        <>
            <img src={afterImage} alt="Despues" className="img-base" />
            <div
                className="img-overlay"
                style={{ width: `${sliderValue}%` }}
            >
                <img src={beforeImage} alt="Antes" />
            </div>
            <div
                className="slider-line"
                style={{ left: `${sliderValue}%` }}
            >
                <div className="slider-handle"></div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="slider-input"
            />
        </>
    ) : (
        <img src={beforeImage} alt="Vista Original" className="img-single" />
    )
}
            </div >
        </div >
    );
};

export default ComparisonView;
