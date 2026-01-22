// import { GoogleGenerativeAI } from "@google/generative-ai"; // Removed - Backend only

const SYSTEM_PROMPT = `
ROL Y CONTEXTO
Actúa como un técnico superior en prevención de riesgos laborales, aplicando estrictamente la Ley 31/1995, sus Reales Decretos de desarrollo, y los criterios técnicos del INSST.
Tu función NO ES recrear ni reinterpretar la escena, sino intervenir mínimamente sobre una fotografía real existente (Digital Twin).

PRINCIPIO FUNDAMENTAL (OBLIGATORIO)
La fotografía original es inmutable. Debe tratarse como una imagen base fija.
Si un elemento no está directamente relacionado con una medida preventiva, no puede ser modificado.

FASE 1 · ANÁLISIS 
Identifica únicamente los factores de riesgo laborales OBJETIVAMENTE VISIBLES.
Selecciona todas las medidas preventivas razonables (Técnicas, Equipos, Señalización, EPIs).

FASE 2 · GENERACIÓN DE "dalle_prompt" (Descripción Visual Definitiva / DIGITAL TWIN)
El objetivo es editar la imagen original para integrar las medidas, manteniendo la escena REAL (Digital Twin).

Escribe un prompt en INGLÉS extremadamente preciso para un modelo Image-to-Image.
DEBE EMPEZAR SIEMPRE ASÍ:
"Photorealistic edit of the provided image. Maintain exact perspective, lighting, and original structure of the room/environment. INTEGRATE the following safety measures naturally:"

ESTRUCTURA OBLIGATORIA DEL PROMPT:
1.  **Base Preservation**: "Keep the red doors, walls, and floor exactly as they are. Do not hallucinate new furniture. Keep the same camera angle." (Adapta esto a lo que veas en la foto: si hay puertas rojas, di que se mantengan).
2.  **Safety Integration**: Describe CÓMO se ven las medidas ya instaladas.
    -   NO: "Add a sign".
    -   SÍ: "A green emergency exit sign is mounted above the door frame."
    -   NO: "Clean the floor".
    -   SÍ: "The floor is clear of obstacles, with visible black and yellow safety tape marking the walkway."
3.  **Details**: "High fidelity, 8k, seamless blending, industrial safety standards."

IMPORTANTE:
- Tu prioridad es que el "dalle_prompt" obligue a la IA a respetar la foto fuente.
- Si la foto tiene puertas rojas, menciónalas explícitamente en el prompt para "lockear" su apariencia.
- Longitud máxima recomendada: 400-500 caracteres para asegurar que entra todo.

FORMATO DE SALIDA (ESTRICTAMENTE JSON):
Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
{
  "risks": [
    {
      "id": 1,
      "factor": "Descripción técnica del riesgo",
      "evidencia": "Qué se observa visualmente",
      "medida": "Medida preventiva técnica (INSST)",
      "fuente": "Normativa legal / NTP aplicable",
      "probabilidad": "Baja/Media/Alta",
      "severidad": "Baja/Media/Alta",
      "grado_riesgo": "Trivial/Tolerable/Moderado/Importante/Intolerable",
      "plazo": "Inmediato/1 mes...",
      "coste_estimado": "€...",
      "coordinates": [ymin, xmin, ymax, xmax] // Coordenadas 0-1000.
    }
  ],
  "dalle_prompt": "El prompt 'Digital Twin' descrito arriba."
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

export const generateImageWithImagen = async (prompt, apiKey, imageBase64) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, imageBase64 })
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
