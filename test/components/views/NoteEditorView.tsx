import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { summarizeNote, generateQuestionsFromNote, explainText } from '../../services/apiClient';

const ExplanationModal: React.FC<{ explanation: string; onClose: () => void }> = ({ explanation, onClose }) => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-slate-50 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">AI Explanation</h3>
            <div className="prose prose-sm md:prose-base prose-invert max-w-none p-4 border border-slate-200 rounded-lg bg-white/40 max-h-[60vh] overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Close</button>
            </div>
        </div>
    </div>
);


const NoteEditorView: React.FC = () => {
  const { editingNote, addNote, updateNote, closeNoteEditor, currentSubscription } = useAppContext();
  const isEditing = !!editingNote;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    if (isEditing) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    }
  }, [editingNote, isEditing]);

  const handleSelection = () => {
    const text = window.getSelection()?.toString() || '';
    if (contentRef.current && contentRef.current.contains(window.getSelection()?.anchorNode as Node)) {
        setSelectedText(text);
    } else {
        setSelectedText('');
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleAiAction = useCallback(async (action: 'summarize' | 'questions' | 'explain') => {
    if (!currentSubscription.isAiEnabled) {
        alert("AI features are disabled by your current subscription.");
        return;
    }
    const textToProcess = action === 'explain' ? selectedText : content;
    if (!textToProcess) return;

    setIsAiLoading(action);
    try {
        if (action === 'summarize') {
            const summary = await summarizeNote(textToProcess);
            setContent(summary);
        } else if (action === 'questions') {
            const questions = await generateQuestionsFromNote(textToProcess);
            setContent(prev => `${prev}\n\n---\n\n## Study Questions\n\n${questions}`);
        } else if (action === 'explain') {
            const explainer = await explainText(textToProcess);
            setExplanation(explainer);
        }
    } catch (error) {
        console.error(`AI Action (${action}) failed:`, error);
        alert(`An error occurred while trying to ${action} the text.`);
    } finally {
        setIsAiLoading(null);
    }
  }, [content, selectedText, currentSubscription.isAiEnabled]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    if (isEditing) {
      updateNote(editingNote.id, { title, content });
    } else {
      addNote({ title, content });
    }
    closeNoteEditor();
  };

  const AiActionButton: React.FC<{ action: 'summarize' | 'questions' | 'explain'; icon: string; label: string; disabled?: boolean; }> = ({ action, icon, label, disabled }) => (
      <button
          type="button"
          onClick={() => handleAiAction(action)}
          disabled={isAiLoading !== null || disabled}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={label}
      >
          {isAiLoading === action ? <i className="ri-loader-4-line animate-spin"></i> : <i className={icon}></i>}
          {label}
      </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
            <div className='flex items-center gap-2'>
                 <button onClick={closeNoteEditor} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-500">
                    Cancel
                </button>
                 <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
                    Save Note
                </button>
            </div>
        </div>
      </Card>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="note-title" className="sr-only">Title</label>
                <input
                    type="text"
                    id="note-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    required
                    className="w-full text-2xl font-bold bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none border-b-2 border-slate-200 focus:border-indigo-500 transition-colors pb-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[55vh]">
                <div>
                     <label htmlFor="note-content" className="block text-sm font-medium text-slate-600 mb-2">Content (Markdown supported)</label>
                    <textarea
                        ref={contentRef}
                        id="note-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your note here..."
                        className="w-full h-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono resize-none"
                    />
                </div>
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-600">Live Preview</label>
                        <div className="flex items-center gap-2">
                           <AiActionButton action="summarize" icon="ri-sparkling-2-line" label="Summarize" disabled={!content} />
                           <AiActionButton action="questions" icon="ri-question-line" label="Generate Questions" disabled={!content} />
                           <AiActionButton action="explain" icon="ri-lightbulb-flash-line" label="Explain This" disabled={!selectedText} />
                        </div>
                     </div>
                     <div className="w-full h-full p-3 bg-slate-50 border border-slate-200 rounded-md prose prose-sm md:prose-base prose-invert max-w-none overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Preview will appear here..."}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </form>
      </Card>

      {explanation && <ExplanationModal explanation={explanation} onClose={() => setExplanation(null)} />}
    </div>
  );
};

export default NoteEditorView;