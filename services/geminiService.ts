import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAiSuggestion = async (question: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sorry, I couldn't generate a suggestion at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AI service. Please try again later.";
  }
};

export const generateQuestions = async (jobDescription: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key missing, returning mock questions");
    return [
      "Tell me about a time you handled a difficult stakeholder.",
      "How do you prioritize your tasks?",
      "Describe a project where you had to learn a new technology.",
      "What is your greatest professional achievement?",
      "How do you handle feedback?"
    ];
  }

  try {
    const prompt = `
      Based on the following job description, generate exactly 5 interview questions.
      Return ONLY a JSON array of strings. Do not include markdown formatting or "json" tags.
      
      Job Description: "${jobDescription}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Parse the JSON array
    const questions = JSON.parse(text);
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      "Can you describe your relevant experience?",
      "Why are you interested in this role?",
      "How do you deal with pressure?",
      "What are your technical strengths?",
      "Where do you see yourself in 5 years?"
    ];
  }
};

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  if (!apiKey) return null;
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

    // Decode base64 to Uint8Array
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
