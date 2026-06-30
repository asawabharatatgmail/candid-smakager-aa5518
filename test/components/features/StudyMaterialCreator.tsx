﻿

import React, { useState, useCallback } from 'react';
import { generateStudyMaterial } from '../../services/apiClient';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserRole } from '../../types';

const StudyMaterialCreator: React.FC = () => {
  const [topic, setTopic] = useState('Photosynthesis');
  const [gradeLevel, setGradeLevel] = useState('10th Grade');
  const [difficulty, setDifficulty] = useState('Medium');
  
  const [generatedMaterial, setGeneratedMaterial] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addStudyMaterial, addNote, currentSubscription, currentRole } = useAppContext();

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedMaterial(null);
    setSuccessMessage(null);

    if (!currentSubscription.isAiEnabled) {
      setError("AI features are disabled based on the current subscription. Please contact the administrator.");
      setIsLoading(false);
      return;
    }

    try {
      const materialData = await generateStudyMaterial(topic, gradeLevel, difficulty);
      if (materialData) {
        setGeneratedMaterial(materialData);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, gradeLevel, difficulty, currentSubscription.isAiEnabled]);

  const handleSave = () => {
    if (generatedMaterial) {
        if (currentRole === UserRole.Student) {
            addNote({
                title: generatedMaterial.title,
                content: generatedMaterial.content,
            });
            setSuccessMessage(`Study guide "${generatedMaterial.title}" has been saved to your 'My Notes'.`);
        } else {
            addStudyMaterial({
                ...generatedMaterial,
                topic: topic,
            });
            setSuccessMessage(`Study material "${generatedMaterial.title}" has been saved to the library.`);
        }
      
      setGeneratedMaterial(null);
      setTopic('');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">AI Study Material Generator</h2>
      <p className="mt-2 text-slate-600">Enter a topic, subject, grade, and difficulty to generate a comprehensive study guide.</p>
      
      {successMessage && !generatedMaterial && (
        <Card className="bg-green-900/20 border-green-500/30">
          <p className="text-green-700 font-medium">{successMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sm-topic" className="block text-sm font-medium text-slate-600">Topic</label>
          <input type="text" id="sm-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="sm-grade" className="block text-sm font-medium text-slate-600">Class / Grade Level</label>
          <input type="text" id="sm-grade" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="sm-difficulty" className="block text-sm font-medium text-slate-600">Difficulty</label>
          <select id="sm-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Study Material'}
        </button>
      </div>
      
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <p className="text-red-700 font-medium">Error: {error}</p>
        </Card>
      )}

      {generatedMaterial && (
        <Card>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">{generatedMaterial.title}</h3>
          <div className="prose prose-sm md:prose-base prose-invert max-w-none p-4 border border-slate-200 rounded-lg bg-white/40">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedMaterial.content}</ReactMarkdown>
          </div>
          <div className="mt-6 flex justify-end">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Save Material</button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudyMaterialCreator;