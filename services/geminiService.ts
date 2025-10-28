import { GoogleGenAI } from "@google/genai";
import { Category } from '../types';

// It's crucial that process.env.API_KEY is available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a fun, short, and safe-for-work dare using the Gemini API.
 * @param loserName - The name of the player who will perform the dare.
 * @param categories - The game categories to add context to the dare.
 * @returns A promise that resolves to a dare string.
 */
export const generateDare = async (loserName: string, categories: Category[]): Promise<string> => {
  try {
    const categoryList = categories.join(', ') || 'general fun';
    const prompt = `You are a wild and funny Pinoy Gen Z party game host. Create a short, creative, and makulit af dare for a player named ${loserName}. The dare must be safe to do at home on live cam, and should sound like something barkadas would actually do on a chaotic video call. The game categories were: ${categoryList}. Make it only one sentence.Example: “Magpanggap kang TikToker na baliw sa crush mo habang nag-lalive,” or “Gayahin mo si teacher mo habang nag-rerecite ka pero may ulam sa bibig.”`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const dareText = response.text.trim();
    // Basic check to ensure the response is not empty or malformed
    if (dareText) {
        return dareText;
    } else {
        throw new Error("Received empty response from Gemini API.");
    }

  } catch (error) {
    console.error("Error generating dare with Gemini:", error);
    // Fallback to a simple dare if the API fails
    return `Tell a funny joke, ${loserName}!`;
  }
};
