import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure the API key is available
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chatWithAI(message: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are a friendly and helpful AI assistant in a chat app. Keep your responses concise but engaging. You can tell jokes and be entertaining, but keep everything family-friendly and appropriate." }],
                },
                {
                    role: "model",
                    parts: [{ text: "I'll be friendly, helpful, and concise in our chat. I'll keep everything appropriate and family-friendly. How can I assist you today?" }],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 200,
            },
            safetySettings: [

            ],
        });

        const result = await chat.sendMessage([{ text: message }]);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('Error chatting with AI:', error);
        if (error.message?.includes('SAFETY')) {
            return "Lo siento, no puedo generar ese tipo de contenido. ¿Podrías preguntarme algo diferente?";
        }
        return "Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?";
    }
}
