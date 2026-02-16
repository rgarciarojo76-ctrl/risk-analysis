// TEMPORARY: List available models — DELETE after debugging
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('No API Key');
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.models) {
            const relevant = data.models
                .filter(m => 
                    m.name.includes('gemini') || 
                    m.name.includes('imagen') || 
                    m.name.includes('image')
                )
                .map(m => ({
                    name: m.name,
                    methods: m.supportedGenerationMethods,
                    description: m.description?.substring(0, 80)
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            res.status(200).json({ count: relevant.length, models: relevant });
        } else {
            res.status(200).json({ error: data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
