// import { GoogleGenerativeAI } from "@google/generative-ai"; // Removed - Backend only

const SYSTEM_PROMPT = `
Actúa como herramienta de apoyo y contraste técnico para un Técnico Superior en Prevención de Riesgos Laborales.
Tu tarea es analizar la imagen proporcionada y detectar exclusivamente factores de riesgo laborales OBJETIVAMENTE VISIBLES.
NO inventes riesgos que no se vean claramente en la imagen. Sé riguroso y cíñete a lo visual.

Para cada riesgo detectado, debes proporcionar:
1. Factor de riesgo: Descripción técnica y precisa del riesgo.
2. Evidencia: Qué se observa exactamente en la imagen que confirma el riesgo.
3. Medida: Medida preventiva detallada y técnica, basándote preferentemente en Criterios Técnicos del INSST.
4. Fuente: Referencia normativa española aplicable (RD 1215/1997, RD 486/1997) y especialmente Notas Técnicas de Prevención (NTP) del INSST relacionadas.
5. Probabilidad: Baja, Media o Alta.
6. Severidad: Baja, Media o Alta.
7. Grado de riesgo: Trivial, Tolerable, Moderado, Importante o Intolerable.
8. Plazo: Tiempo estimado para subsanar (ej: Inmediato, 1 mes, 6 meses).
9. Coste estimado: Rango de coste (ej: < 100€, 100-500€, > 500€).

También debes generar un "dalle_prompt" (en inglés) que describa VISUALMENTE la escena para que una IA pueda redibujarla.
CRITERIOS OBLIGATORIOS PARA LA GENERACIÓN (dalle_prompt):
1. FIDELIDAD ABSOLUTA DE PERSPECTIVA: La imagen generada DEBE ENCAJAR PERFECTAMENTE sobre la original. NO cambies el ángulo, ni el "focal length", ni el encuadre.
2. NORMATIVA SEÑALIZACIÓN: Toda señal debe cumplir estrictamente la norma UNE 23033 / ISO 7010 (España). Colores y pictogramas exactos.
3. CAMBIOS PERMITIDOS: Solo introduce protecciones y correcciones.
4. PROHIBICIONES: NO cambies la geometría de la sala. NO cambies la iluminación global.
5. APARIENCIA: Debe parecer una FOTO EDITADA, no una generada de cero.
El prompt debe empezar con "Exact replica of industrial scene..." y detallar: "Camera fixed at [x] height", "Walls at [x] angle".
IMPORTANTE: Describe la imagen como si fueras un topógrafo. La geometría es sagrada.
IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "risks": [
    {
      "id": 1,
      "factor": "...",
      "evidencia": "...",
      "medida": "...",
      "fuente": "...",
      "probabilidad": "...",
      "severidad": "...",
      "grado_riesgo": "...",
      "plazo": "...",
      "coste_estimado": "..."
    }
  ],
  "dalle_prompt": "..."
}
`;


// Note: apiKey is no longer used on frontend, but kept in signature to avoid breaking component calls immediately
export const analyzeImageWithGemini = async (imageFile, apiKey) => {
    // Convert file to base64
    const base64Promise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(imageFile);
    });
    const base64Data = await base64Promise;

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt: SYSTEM_PROMPT,
                imageBase64: base64Data,
                mimeType: imageFile.type
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error calling Backend Analyze:", error);
        throw error;
    }
};

export const expandManualRiskWithGemini = async (riskDescription, apiKey) => {
    const prompt = `
Eres un experto en Prevención de Riesgos Laborales (PRL). 
El usuario te proporcionará una breve descripción de un factor de riesgo detectado manualmente. 
Tu tarea es completar todos los detalles técnicos necesarios para una ficha de evaluación profesional.

Factor de riesgo proporcionado: "${riskDescription}"

Responde ÚNICAMENTE con un objeto JSON válido:
{
  "id": "generated_id",
  "factor": "${riskDescription}",
  "evidencia": "Descripción técnica detallada de por qué esto supone un riesgo basándote en el factor mencionado",
  "medida": "Medida preventiva técnica basada en criterios del INSST",
  "fuente": "Normativa legal (RD) y Notas Técnicas de Prevención (NTP) del INSST aplicables",
  "probabilidad": "Media",
  "severidad": "Media",
  "grado_riesgo": "Moderado",
  "plazo": "1 mes",
  "coste_estimado": "100-500€"
}
`;

    try {
        const response = await fetch('/api/expand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Backend Expand Failed');
        }

        return await response.json();
    } catch (error) {
        console.error("Error calling Backend Expand:", error);
        throw error;
    }
};

export const generateImageWithImagen = async (prompt, apiKey) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Backend Generate Failed');
        }

        const data = await response.json();
        return data.image; // Base64 image
    } catch (error) {
        console.error("Error calling Backend Generate:", error);
        throw error;
    }
};
