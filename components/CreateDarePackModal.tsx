import React, { useState } from 'react';
import { DarePack } from '../types';

interface CreateDarePackModalProps {
  onClose: () => void;
  onCreate: (packData: Omit<DarePack, 'id' | 'votes' | 'creatorId' | 'creatorName'>) => void;
}

const MAX_DARES = 20;

const CreateDarePackModal: React.FC<CreateDarePackModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dares, setDares] = useState<string[]>(['']);

  const handleDareChange = (index: number, value: string) => {
    const newDares = [...dares];
    newDares[index] = value;
    setDares(newDares);
  };

  const addDareField = () => {
    if (dares.length < MAX_DARES) {
      setDares([...dares, '']);
    }
  };

  const removeDareField = (index: number) => {
    if (dares.length > 1) {
      setDares(dares.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredDares = dares.map(d => d.trim()).filter(d => d);
    if (name.trim() && description.trim() && filteredDares.length > 0) {
      onCreate({ name, description, dares: filteredDares });
      onClose();
    }
  };
  
  const isFormValid = name.trim() && description.trim() && dares.some(d => d.trim());

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div 
        className="w-full max-w-lg h-[90vh] bg-gray-800 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col p-6 animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-blue-400">Create Dare Pack</h2>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="mb-4">
                    <label htmlFor="pack-name" className="block text-sm font-medium text-gray-300 mb-1">Pack Name</label>
                    <input type="text" id="pack-name" value={name} onChange={e => setName(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={50} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="pack-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea id="pack-desc" value={description} onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3} maxLength={150} required />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Dares ({dares.length}/{MAX_DARES})</h3>
                    <div className="space-y-2">
                        {dares.map((dare, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={dare} onChange={e => handleDareChange(index, e.target.value)}
                                    placeholder={`Dare #${index + 1}`}
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                    maxLength={120} />
                                <button type="button" onClick={() => removeDareField(index)} disabled={dares.length <= 1}
                                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed">
                                    -
                                </button>
                            </div>
                        ))}
                    </div>
                     {dares.length < MAX_DARES && (
                        <button type="button" onClick={addDareField} className="mt-2 w-full text-sm py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg">
                           + Add Dare
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="py-2 px-5 bg-gray-600 hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" disabled={!isFormValid}
                    className="py-2 px-5 bg-green-500 hover:bg-green-600 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Save Pack
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDarePackModal;
