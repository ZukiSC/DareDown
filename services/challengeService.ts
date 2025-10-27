
import { Category, Challenge, QuizQuestion } from '../types';

// This acts as a mock database for all possible challenges in the game.
// In a real application, this would be stored in Firestore.
const CHALLENGE_DATABASE: Challenge[] = [
    // Trivia
    { id: 't1', type: 'QUICK_QUIZ', category: 'Trivia', content: { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswer: "Paris" } as QuizQuestion },
    { id: 't2', type: 'QUICK_QUIZ', category: 'Trivia', content: { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctAnswer: "Mars" } as QuizQuestion },
    { id: 't3', type: 'QUICK_QUIZ', category: 'Trivia', content: { question: "Who wrote 'Hamlet'?", options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Mark Twain"], correctAnswer: "William Shakespeare" } as QuizQuestion },
    
    // Programming
    { id: 'p1', type: 'QUICK_QUIZ', category: 'Programming', content: { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correctAnswer: "Cascading Style Sheets" } as QuizQuestion },
    { id: 'p2', type: 'QUICK_QUIZ', category: 'Programming', content: { question: "Which symbol is used for comments in JavaScript?", options: ["//", "/* */", "#", "Both // and /* */"], correctAnswer: "Both // and /* */" } as QuizQuestion },
    { id: 'p3', type: 'QUICK_QUIZ', category: 'Programming', content: { question: "What is the correct HTML for inserting an image?", options: ["<img src='url'>", "<image href='url'>", "<img>url</img>", "<pic src='url'>"], correctAnswer: "<img src='url'>" } as QuizQuestion },

    // General (can include any type)
    { id: 'g1', type: 'QUICK_QUIZ', category: 'General', content: { question: "What is 2 + 2 * 2?", options: ["8", "6", "4", "2"], correctAnswer: "6" } as QuizQuestion },
    { id: 'g2', type: 'TAP_SPEED', category: 'General', content: {} },
    { id: 'g3', type: 'NUMBER_RACE', category: 'General', content: {} },
    { id: 'g4', type: 'MEMORY_MATCH', category: 'General', content: { pairCount: 6 } }, // 6 pairs = 12 cards
    
    // Speed/Reflex
    { id: 's1', type: 'TAP_SPEED', category: 'Speed/Reflex', content: {} },
    { id: 's2', type: 'NUMBER_RACE', category: 'Speed/Reflex', content: {} },
    { id: 's3', type: 'MEMORY_MATCH', category: 'Speed/Reflex', content: { pairCount: 8 } }, // 8 pairs = 16 cards
];


/**
 * Selects a random challenge for the room based on the players' chosen categories.
 * @param roomCategories - A unique list of categories present in the room.
 * @returns A single Challenge object.
 */
export const getChallengeForRoom = (roomCategories: Category[]): Challenge => {
    // Create a pool of challenges based on the categories in the room
    let challengePool = CHALLENGE_DATABASE.filter(challenge => 
        roomCategories.includes(challenge.category)
    );

    // If the pool is empty (e.g., a new category with no challenges yet), default to General
    if (challengePool.length === 0) {
        challengePool = CHALLENGE_DATABASE.filter(challenge => challenge.category === 'General');
    }
    
    // Pick a random challenge from the pool
    const randomIndex = Math.floor(Math.random() * challengePool.length);
    return challengePool[randomIndex];
};