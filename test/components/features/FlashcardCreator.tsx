﻿

import React, { useState, useCallback } from 'react';
import { generateFlashcards } from '../../services/apiClient';
import { FlashcardSet } from '../../types';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const FlashcardCreator: React.FC = () => {
  const [topic, setTopic] = useState('Key Events of World War II');
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [generatedSet, setGeneratedSet] = useState<Omit<FlashcardSet, 'id' | 'ownerId' | 'classId' | 'subjectId'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addFlashcardSet, currentSubscription } = useAppContext();

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedSet(null);
    setSuccessMessage(null);

    if (!currentSubscription.isAiEnabled) {
      setError("AI features are disabled based on the current subscription. Please contact the administrator.");
      setIsLoading(false);
      return;
    }

    try {
      const setData = await generateFlashcards(topic, numFlashcards);
      if (setData) {
        setGeneratedSet({...setData, topic});
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, numFlashcards, currentSubscription.isAiEnabled]);

  const handleSave = () => {
    if (generatedSet) {
      addFlashcardSet(generatedSet);
      setSuccessMessage(`Flashcard set "${generatedSet.title}" has been saved to the library.`);
      setGeneratedSet(null);
      setTopic('');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">AI-Powered Flashcard Creator</h2>
      <p className="mt-2 text-slate-600">Enter a topic and our AI will generate a set of flashcards for studying.</p>
      
      {successMessage && !generatedSet && (
        <Card className="bg-green-900/20 border-green-500/30">
          <p className="text-green-700 font-medium">{successMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="topic-fc" className="block text-sm font-medium text-slate-600">Topic</label>
          <input
            type="text"
            id="topic-fc"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="numFlashcards" className="block text-sm font-medium text-slate-600">Number of Flashcards</label>
          <input
            type="number"
            id="numFlashcards"
            value={numFlashcards}
            min="1"
            max="50"
            onChange={(e) => setNumFlashcards(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating Flashcards...' : 'Generate Flashcards'}
        </button>
      </div>
      
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <p className="text-red-700 font-medium">Error: {error}</p>
        </Card>
      )}

      {generatedSet && (
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-4">{generatedSet.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedSet.flashcards.map((card, index) => (
              <div key={index} className="border border-slate-200 rounded-lg bg-white/40">
                <div className="p-3 border-b border-slate-200">
                    <p className="text-xs font-semibold text-slate-500">FRONT</p>
                    <p className="font-semibold text-slate-800 mt-1">{card.front}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-b-lg">
                    <p className="text-xs font-semibold text-slate-500">BACK</p>
                    <p className="text-sm text-slate-600 mt-1">{card.back}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">Save to Library</button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FlashcardCreator;