﻿

import React, { useState, useCallback } from 'react';
import { generateMcqQuiz } from '../../services/apiClient';
import { Quiz, QuizType } from '../../types';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const McqCreator: React.FC = () => {
  const [topic, setTopic] = useState('The Solar System');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [quizType, setQuizType] = useState<QuizType>(QuizType.MCQ);
  const [generatedQuiz, setGeneratedQuiz] = useState<Omit<Quiz, 'id' | 'ownerId' | 'classId' | 'subjectId'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addQuiz, currentSubscription } = useAppContext();

  const handleGenerateQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedQuiz(null);
    setSuccessMessage(null);

    if (!currentSubscription.isAiEnabled) {
      setError("AI features are disabled based on the current subscription. Please contact the administrator.");
      setIsLoading(false);
      return;
    }

    try {
      const quizData = await generateMcqQuiz(topic, numQuestions, difficulty, quizType);
      if (quizData) {
        setGeneratedQuiz({ ...quizData, quizType, topic });
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, numQuestions, difficulty, quizType, currentSubscription.isAiEnabled]);

  const handleSaveQuiz = () => {
    if (generatedQuiz) {
      addQuiz(generatedQuiz);
      setSuccessMessage(`Quiz "${generatedQuiz.quizTitle}" has been saved and is available in the library.`);
      setGeneratedQuiz(null);
      setTopic('');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">AI-Powered Quiz Creator</h2>
      <p className="mt-2 text-slate-600">Enter a topic and let our AI generate a complete quiz for your students in seconds.</p>
      
      {successMessage && !generatedQuiz && (
        <Card className="bg-green-900/20 border-green-500/30">
          <p className="text-green-700 font-medium">{successMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-600">Topic</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
            <label htmlFor="quizType" className="block text-sm font-medium text-slate-600">Quiz Type</label>
            <select
              id="quizType"
              value={quizType}
              onChange={(e) => setQuizType(e.target.value as QuizType)}
              className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Object.values(QuizType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-600">Number of Questions</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            min="1"
            max="20"
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-slate-600">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </div>
      
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <p className="text-red-700 font-medium">Error: {error}</p>
        </Card>
      )}

      {generatedQuiz && (
        <Card>
          <h3 className="text-xl font-bold text-slate-900 mb-4">{generatedQuiz.quizTitle}</h3>
          <div className="space-y-6">
            {generatedQuiz.questions.map((mcq, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-800">{index + 1}. {mcq.questionText}</p>
                <div className="mt-3 space-y-2">
                  {mcq.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded-md ${
                        optionIndex === mcq.correctAnswerIndex ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-100'
                      }`}
                    >
                      <span className={`font-medium ${optionIndex === mcq.correctAnswerIndex ? 'text-green-700' : 'text-slate-800'}`}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
              <button onClick={handleSaveQuiz} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Save to Library</button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default McqCreator;