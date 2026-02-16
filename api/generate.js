// v2.0.0 — Gemini 2.0 Flash Image Generation — Replaces imagen-3.0-generate-001
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_PROMPT_LENGTH = 5000;
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Server: Missing API Key');
            throw new Error('Configuration Error');
        }

        const { prompt, imageBase64 } = req.body;

        // --- SECURITY VALIDATION ---
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid Prompt' });
        }
        if (prompt.length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({ error: `Prompt too long (Max ${MAX_PROMPT_LENGTH} chars)` });
        }
        if (imageBase64 && imageBase64.length > MAX_IMAGE_SIZE_BYTES) {
            return res.status(413).json({ error: 'Reference Image too large' });
        }
        // --- END VALIDATION ---

        // ========================================================
        // MIGRATION: Imagen 3.0 predict → Gemini generateContent
        // Using gemini-2.0-flash-preview-image-generation with responseModalities: ["image", "text"]
        // This model supports native image generation via generateContent.
        // ========================================================

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-preview-image-generation",
            generationConfig: {
                responseModalities: ["image", "text"],
            },
        });

        // Build the content parts
        const parts = [];

        // If we have a reference image, include it for Image-to-Image editing
        if (imageBase64) {
            parts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/jpeg"
                }
            });
            parts.push({
                text: `You are an industrial safety visualization expert. EDIT this photograph to apply the following safety measures. Keep the original scene structure (walls, doors, floor, camera angle) but VISIBLY ADD the safety equipment described. The result must look like a real photo with the safety measures installed.\n\nSafety measures to apply:\n${prompt}\n\nIMPORTANT: Generate ONE photorealistic image showing the scene AFTER the safety measures have been installed. The changes must be clearly visible.`
            });
        } else {
            // Text-to-Image fallback
            parts.push({
                text: `Generate a photorealistic industrial safety scene photograph. High quality, 4k resolution.\n\nScene description:\n${prompt}`
            });
        }

        console.log(`[Generate] Mode: ${imageBase64 ? 'Image-to-Image' : 'Text-to-Image'}, Prompt length: ${prompt.length}`);

        // --- ATTEMPT 1: Primary model (gemini-2.0-flash-preview-image-generation) ---
        let imageData = null;
        try {
            const result = await model.generateContent(parts);
            const response = result.response;

            // Extract image from response candidates
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        imageData = part.inlineData;
                        break;
                    }
                }
            }
        } catch (primaryError) {
            console.warn("[Generate] Primary model (gemini-2.0-flash-preview-image-generation) failed:", primaryError.message);

            // --- ATTEMPT 2: Retry with text-only if Image-to-Image failed ---
            if (imageBase64) {
                console.log("[Generate] Retrying as Text-to-Image (without reference image)...");
                const textOnlyParts = [{
                    text: `Generate a photorealistic industrial safety scene photograph showing: ${prompt}. High quality, 4k, professional safety standards.`
                }];

                try {
                    const retryResult = await model.generateContent(textOnlyParts);
                    const retryResponse = retryResult.response;

                    if (retryResponse.candidates && retryResponse.candidates[0]?.content?.parts) {
                        for (const part of retryResponse.candidates[0].content.parts) {
                            if (part.inlineData) {
                                imageData = part.inlineData;
                                break;
                            }
                        }
                    }
                } catch (retryError) {
                    console.error("[Generate] Text-to-Image retry also failed:", retryError.message);
                    throw new Error(`Image generation failed on both attempts: ${retryError.message}`);
                }
            } else {
                throw primaryError;
            }
        }

        // --- RETURN RESULT ---
        if (imageData) {
            const base64Image = `data:${imageData.mimeType || 'image/png'};base64,${imageData.data}`;
            console.log("[Generate] ✅ Image generated successfully");
            res.status(200).json({ image: base64Image });
        } else {
            throw new Error('Model returned no image data. The response may have been filtered by safety settings.');
        }

    } catch (error) {
        console.error("Backend Generate Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}
