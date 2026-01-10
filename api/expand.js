
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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.status(200).json(JSON.parse(text));

    } catch (error) {
        console.error("Backend Expand Error:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
