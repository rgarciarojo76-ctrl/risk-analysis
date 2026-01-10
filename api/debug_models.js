
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API Key not found in env" });
        }

        // Fetch models directly from REST API to verify visibility
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json(err);
        }

        const data = await response.json();
        res.status(200).json({
            key_preview: apiKey.substring(0, 5) + "...",
            available_models: data.models?.map(m => m.name) || []
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
