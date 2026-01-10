
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Enable CORS for frontend flexibility (optional but safe for Vercel)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

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
            throw new Error('Server misconfiguration: API Key not found');
        }

        const { systemPrompt, imageBase64, mimeType } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Missing image data' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg"
            }
        };

        const result = await model.generateContent([systemPrompt, imagePart]);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.status(200).json(JSON.parse(text));

    } catch (error) {
        console.error("Backend Analyze Error:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
