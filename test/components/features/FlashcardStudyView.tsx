﻿
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

const FlashcardStudyView: React.FC = () => {
  const { activeFlashcardSet, clearStudyView } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!activeFlashcardSet) {
    return (
      <Card>
        <p className="text-center">No flashcard set selected. Please go back to the dashboard.</p>
      </Card>
    );
  }

  const { title, flashcards } = activeFlashcardSet;
  const currentCard = flashcards[currentIndex];

  const goToNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const goToPrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .perspective { perspective: 1000px; }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .is-flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 2rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <Card>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button onClick={clearStudyView} className="text-sm text-indigo-400 hover:underline">
            &larr; Back to Dashboard
          </button>
        </div>
      </Card>
      
      <div className="flex items-center justify-center space-x-4">
        <button onClick={goToPrev} className="p-3 bg-slate-50 rounded-full shadow-md hover:bg-slate-100 disabled:opacity-50 border border-slate-200">
          <ArrowLeftIcon className="h-6 w-6 text-slate-800"/>
        </button>

        <div className="w-full max-w-2xl h-80 perspective">
            <div
                className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}
                onClick={handleFlip}
            >
                <div className="card-face card-front bg-slate-50" style={{'--border-color': 'rgba(71, 85, 105, 0.8)'} as React.CSSProperties}>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Front</p>
                    <p className="text-2xl text-center font-semibold text-slate-900 mt-2">{currentCard.front}</p>
                </div>
                <div className="card-face card-back bg-indigo-900/50" style={{'--border-color': 'rgba(99, 102, 241, 0.5)'} as React.CSSProperties}>
                    <p className="text-xs font-semibold text-indigo-700 uppercase">Back</p>
                    <p className="text-xl text-center text-slate-800 mt-2">{currentCard.back}</p>
                </div>
            </div>
        </div>

        <button onClick={goToNext} className="p-3 bg-slate-50 rounded-full shadow-md hover:bg-slate-100 border border-slate-200">
           <ArrowRightIcon className="h-6 w-6 text-slate-800"/>
        </button>
      </div>

      <div className="text-center">
        <p className="font-semibold text-slate-800">Card {currentIndex + 1} of {flashcards.length}</p>
        <p className="text-sm text-slate-500 mt-2">Click card to flip</p>
      </div>
    </div>
  );
};

export default FlashcardStudyView;
