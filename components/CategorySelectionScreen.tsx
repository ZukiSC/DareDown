import React from 'react';
import { Category } from '../types';

interface CategorySelectionScreenProps {
  onSelectCategory: (category: Category) => void;
  onGoBack: () => void;
}

const CATEGORIES: { name: Category, description: string, emoji: string }[] = [
    { name: 'General', description: 'A mix of everything!', emoji: '🎲' },
    { name: 'Trivia', description: 'Test your knowledge.', emoji: '🧠' },
    { name: 'Speed/Reflex', description: 'Quick fingers win!', emoji: '⚡️' },
    { name: 'Wordplay', description: 'For the wordsmiths.', emoji: '✍️' },
    { name: 'Puzzles', description: 'Challenge your logic.', emoji: '🧩' },
    { name: 'Creative', description: 'Show your artistic side.', emoji: '🎨' },
    { name: 'Programming', description: 'For the tech geeks.', emoji: '💻' },
];

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ onSelectCategory, onGoBack }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-4 relative">
      <button onClick={onGoBack} className="absolute top-2 left-2 text-sm px-4 py-2 bg-gray-600/80 hover:bg-gray-600 rounded-full transition-colors transform active:scale-95 z-10 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg mb-4">Choose Your Challenge!</h1>
      <p className="text-lg text-gray-300 mb-8">Select a category for this game session.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {CATEGORIES.map((cat, index) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className="text-left p-4 sm:p-6 bg-gray-700/60 rounded-lg border-2 border-gray-600 hover:bg-purple-600/50 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-100 animate-slide-in opacity-0"
            style={{ animationDelay: `${100 + index * 50}ms` }}
          >
            <div className="text-3xl sm:text-4xl mb-2">{cat.emoji}</div>
            <h2 className="text-xl sm:text-2xl font-bold">{cat.name}</h2>
            <p className="text-gray-400 text-sm sm:text-base">{cat.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionScreen;