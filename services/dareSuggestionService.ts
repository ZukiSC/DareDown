
import { Category } from '../types';

// A curated list of dare templates categorized.
const DARE_TEMPLATES: Record<Category, string[]> = {
  'General': [
    "Do your best impression of a chicken until your next turn.",
    "Speak in a robot voice for the next 3 minutes.",
    "Tell a joke. If no one laughs, you lose 5 points.",
    "Let the other players post a silly status on one of your social media accounts.",
    "Wear a sock on one hand for the rest of the game.",
  ],
  'Trivia': [
    "Name 5 countries in Africa in 15 seconds. Fail, and you lose 5 points.",
    "Recite the first 5 digits of Pi. Stumble, and you must sing the Pi song.",
    "For the next round, you must answer any question with another question.",
    "Explain a complex historical event incorrectly to the group.",
  ],
  'Programming': [
    "Explain what a 'race condition' is using only interpretive dance.",
    "Write a 'Hello, World!' program on paper in a language you've never used.",
    "For the next 5 minutes, speak only in pseudocode.",
    "Describe the plot of your favorite movie as if it were a git commit history.",
  ],
  'Speed/Reflex': [
    "Do 10 jumping jacks while patting your head and rubbing your stomach.",
    "Try to juggle three items of the group's choosing.",
    "For the next round, you must clap twice before you're allowed to speak.",
    "The next time you drink something, you have to do it with your non-dominant hand.",
  ],
};


/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 */
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Gets a specified number of unique, randomized dare suggestions based on player categories.
 * @param loserName The name of the player who will perform the dare.
 * @param categories The categories of players in the room.
 * @param count The number of suggestions to return (default: 3).
 * @returns An array of personalized dare strings.
 */
export const getDareSuggestions = (loserName: string, categories: Category[], count: number = 3): string[] => {
  const darePool: string[] = [];
  
  // If no categories, default to General
  if (!categories || categories.length === 0) {
      categories = ['General'];
  }
  
  // Create a pool of dares from the relevant categories
  categories.forEach(cat => {
      darePool.push(...(DARE_TEMPLATES[cat] || DARE_TEMPLATES['General']));
  });

  const uniqueDares = [...new Set(darePool)];
  const shuffledTemplates = shuffleArray(uniqueDares);
  
  return shuffledTemplates
    .slice(0, count)
    .map(template => template.replace(/{loserName}/g, loserName));
};
