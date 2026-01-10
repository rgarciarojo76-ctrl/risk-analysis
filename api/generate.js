
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Server misconfiguration: API Key not found');
        }

        const { prompt } = req.body;

        // Use Imagen 4 Ultra via Google Generative Language API (Requires Billing)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [{ prompt: `Photorealistic industrial safety visualization, high quality, 4k: ${prompt}` }],
                parameters: { sampleCount: 1 }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Imagen API failed');
        }

        const data = await response.json();

        if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
            const base64Image = `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
            res.status(200).json({ image: base64Image });
        } else {
            throw new Error('No image generated');
        }

    } catch (error) {
        console.error("Backend Generate Error:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
