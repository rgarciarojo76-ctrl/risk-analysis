
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_IMAGE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
            // Log generic error to client, details to server logs
            console.error('Server misconfiguration: API Key not found');
            throw new Error('Internal Server Configuration Error');
        }

        const { systemPrompt, imageBase64, mimeType } = req.body;

        // --- SECURITY VALIDATION ---

        // 1. Data Presence
        if (!imageBase64 || !systemPrompt) {
            return res.status(400).json({ error: 'Missing required data (image or prompt)' });
        }

        // 2. MIME Type Validation
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            return res.status(400).json({ error: 'Invalid MIME type. Allowed: JPEG, PNG, WEBP' });
        }

        // 3. Payload Size Check (Approximate via Base64 length)
        // Base64 is ~1.33x larger. 10MB limit -> ~13.3MB Base64 string
        const sizeInBytes = (imageBase64.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        if (sizeInMB > MAX_IMAGE_SIZE_MB) {
            return res.status(413).json({ error: `Image too large. Max ${MAX_IMAGE_SIZE_MB}MB allowed.` });
        }

        // 4. Input Sanitization (Basic)
        if (typeof systemPrompt !== 'string' || systemPrompt.length > 10000) {
            return res.status(400).json({ error: 'Invalid or too long system prompt.' });
        }

        // --- END VALIDATION ---

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };

        const MAX_RETRIES = 3;
        let attempt = 0;
        let result;

        while (attempt < MAX_RETRIES) {
            try {
                result = await model.generateContent([systemPrompt, imagePart]);
                break; // Success, exit loop
            } catch (error) {
                attempt++;
                // Check for 503 (Service Unavailable) or 429 (Too Many Requests)
                if ((error.message.includes('503') || error.message.includes('429')) && attempt < MAX_RETRIES) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
                    console.log(`Attempt ${attempt} failed with ${error.message}. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error; // Rethrow if not a retryable error or max retries reached
                }
            }
        }

        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.status(200).json(JSON.parse(text));

    } catch (error) {
        console.error("Backend Analyze Error:", error);
        // SECURITY: Do not leak stack traces to client
        res.status(500).json({
            error: 'Analysis Failed',
            details: error.message // Safe to expose error.message if handled correctly, avoid error.stack
        });
    }
}
