import { Category } from '../types';

const PILINO_DARES = [
  "Sumayaw ng 'Spaghetti Song' with full feelings for 15 seconds.",
  "Mag-acting na parang si Tita na tinatanong ka kung kailan ka mag-aasawa.",
  "Mag-rap ng ingredients ng Adobo.",
  "Gayahin ang 'pabebe wave' at mag-hello sa lahat.",
  "Mag-'budots' dance sa loob ng 15 segundo.",
  "I-recite ang 'Panatang Makabayan' habang naka-pout.",
  "Umarte na parang tindera sa palengke na nag-aalok ng tinda.",
  "Ipaliwanag ang ending ng paborito mong teleserye gamit ang charades.",
  "Gayahin ang 'sharamdara' dance move ni Willie Revillame.",
  "Try to sell a ballpen to another player like you're a street vendor.",
  "Say 'Pasko na naman' in the saddest voice possible.",
  "Mag-dub ng isang sikat na commercial line in a monster voice.",
  "Gayahin ang boses ni Kris Aquino habang nagbabasa ng ingredients ng instant noodles.",
  "I-dramatize ang proseso ng pagbalat ng saging.",
  "Mag-monologue na parang kontrabida sa isang teleserye.",
  "Ipaliwanag kung bakit masarap ang kanin-lamig... with full conviction.",
  "Kumanta ng 'Bahay Kubo' in an opera voice.",
  "Gayahin ang tawa ng isang stereotypical na kontrabida.",
  "Mag-order sa Jollibee drive-thru... pero walang kotse. (Imagine it!)",
  "Show everyone your best 'Tito' dance moves.",
  "Try to balance a walis tingting on your chin for 10 seconds. (or a pen)",
  "Pretend to be a news reporter reporting on the most boring event in the room.",
  "Sing 'Happy Birthday' but replace every noun with the word 'lumpia'.",
  "Do a dramatic reading of a random text message on your phone.",
  "Give another player a 'sermon' for using their phone too much, Tita-style.",
  "Pretend your slippers are phones and have an intense, dramatic conversation.",
  "Re-enact the 'You're nothing but a second-rate, trying hard copycat!' scene.",
  "Do your best 'pabebe' walk from one end of your screen to the other.",
  "Announce the next round like you're a flight attendant.",
  "Hold a fork and spoon like weapons and strike a dramatic pose.",
  "Pretend to cross a busy Manila street, complete with sound effects.",
  "Explain why a tabo is the superior bathroom tool.",
  "Sing the chorus of 'Bebot' by the Black Eyed Peas.",
  "I chat si crush ng Hi.",
];

/**
 * Selects a random dare from a pre-defined list.
 * @param _loserName - The name of the player (no longer used but kept for signature consistency).
 * @param _categories - The game categories (no longer used).
 * @returns A unique, pre-defined dare string.
 */
export const generateDare = (_loserName: string, _categories: Category[]): string => {
  const randomIndex = Math.floor(Math.random() * PILINO_DARES.length);
  return PILINO_DARES[randomIndex];
};
