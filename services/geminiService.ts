import { GoogleGenAI } from '@google/genai';
import { Category } from '../types';

// Assuming process.env.API_KEY is available as per the instructions.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY not found. Gemini service will be disabled.");
}

const FALLBACK_DARES = [
  "Do 10 jumping jacks.",
  "Sing the alphabet backwards.",
  "Talk in a robot voice for the next 2 minutes.",
  "Try to lick your elbow.",
  "Do your best impression of a celebrity."
];

/**
 * Generates a dare using the Gemini API.
 * @param loserName The name of the player who will perform the dare.
 * @param categories The categories of the game for context.
 * @returns A unique, AI-generated dare string.
 */
export const generateDare = async (loserName: string, categories: Category[]): Promise<string> => {
  if (!ai) {
    console.log("Using fallback dare because Gemini API is not initialized.");
    const randomDare = FALLBACK_DARES[Math.floor(Math.random() * FALLBACK_DARES.length)];
    return `${randomDare}`;
  }

  const categoryContext = categories.length > 0 ? `The game categories were: ${categories.join(', ')}.` : '';

  const prompt = `You are a dare generator for a fun and silly party game called "DareDown".
Generate a single, creative, and funny dare for a player.
The dare must be:
1.  Safe to perform indoors.
2.  Completable in under 30 seconds.
3.  Appropriate for all ages (no offensive, dangerous, or embarrassing content).
4.  Not require special equipment.
${categoryContext}

Example: "Balance a shoe on your head for 10 seconds."
Example: "Explain the plot of your favorite movie using only animal sounds."

The dare should be a direct command. Do not address the player by name in the response.

Generate the dare now:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text.trim();
    // Basic cleanup to remove potential markdown or quotes
    text = text.replace(/["*]/g, '');
    // Ensure the player's name is not in the response from the model
    const nameRegex = new RegExp(loserName + ",?\\s*", "gi");
    text = text.replace(nameRegex, '');

    return text;
  } catch (error) {
    console.error("Error generating dare with Gemini:", error);
    console.log("Using fallback dare due to API error.");
    const randomDare = FALLBACK_DARES[Math.floor(Math.random() * FALLBACK_DARES.length)];
    return `${randomDare}`;
  }
};