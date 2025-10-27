import React from 'react';
import { Category } from '../types';

interface CategorySelectionScreenProps {
  onSelectCategory: (category: Category) => void;
}

const CATEGORIES: { name: Category, description: string, emoji: string }[] = [
    { name: 'General', description: 'A mix of everything!', emoji: '🎲' },
    { name: 'Trivia', description: 'Test your knowledge.', emoji: '🧠' },
    { name: 'Programming', description: 'For the tech geeks.', emoji: '💻' },
    { name: 'Speed/Reflex', description: 'Quick fingers win!', emoji: '⚡️' },
];

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-4">
      <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg mb-4">Choose Your Challenge!</h1>
      <p className="text-lg text-gray-300 mb-8">Select a category for this game session.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className="text-left p-4 sm:p-6 bg-gray-700/60 rounded-lg border-2 border-gray-600 hover:bg-purple-600/50 hover:border-purple-500 transition-all duration-300 transform hover:scale-105"
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