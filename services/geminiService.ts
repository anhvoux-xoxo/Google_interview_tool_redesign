
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Fix: Initializing GoogleGenAI with a named parameter using process.env.API_KEY as per the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiSuggestion = async (question: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert interview coach. 
      The user is practicing for a job interview.
      
      Question: "${question}"
      
      Please provide a concise, structured "Ideal Answer" or a set of key "Talking Points" that the user should cover in their response. 
      Keep the tone professional and encouraging. 
      Limit the response to around 150 words.
      Format neatly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Sorry, I couldn't generate a suggestion at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AI service. Please try again later.";
  }
};

export const generateQuestions = async (jobDescription: string): Promise<{text: string, type: string}[]> => {
  try {
    const prompt = `
      Based on the following job description, generate exactly 5 interview questions.
      Categorize each question as either 'Background', 'Situational', or 'Technical'.
      Return ONLY a JSON array of objects with "text" and "type" keys.
      
      Job Description: "${jobDescription}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING, description: "One of: Background, Situational, Technical" }
            },
            required: ["text", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const questions = JSON.parse(text);
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Returning meaningful defaults on error
    return [
      { text: "Can you describe your relevant experience?", type: "Background" },
      { text: "Why are you interested in this role?", type: "Background" },
      { text: "How do you deal with pressure?", type: "Situational" },
      { text: "What are your technical strengths?", type: "Technical" },
      { text: "Where do you see yourself in 5 years?", type: "Background" }
    ];
  }
};

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Fix: Implemented manual decode function for base64 as suggested in the coding guidelines
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
