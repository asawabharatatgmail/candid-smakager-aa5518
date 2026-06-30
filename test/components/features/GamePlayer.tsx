﻿import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import { MCQ } from '../../types';

const GamePlayer: React.FC = () => {
    const { activeGameChallenge, submitChallenge } = useAppContext();
    
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(activeGameChallenge?.durationMinutes ? activeGameChallenge.durationMinutes * 60 : 0);
    const [startTime] = useState(Date.now());
    
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerState, setAnswerState] = useState<'correct' | 'incorrect' | 'unanswered'>('unanswered');
    const [showLevelUp, setShowLevelUp] = useState(false);

    const currentLevel = activeGameChallenge?.levels[currentLevelIndex];
    const currentQuestion = currentLevel?.questions[currentQuestionIndex];
    const totalLevels = activeGameChallenge?.levels.length || 0;
    const totalQuestionsInLevel = currentLevel?.questions.length || 0;

    const handleGameEnd = () => {
        if (!activeGameChallenge) return;
        const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
        submitChallenge({
            challengeId: activeGameChallenge.id,
            score,
            timeTakenSeconds
        });
    };

    useEffect(() => {
        if (activeGameChallenge?.mode !== 'Time Attack' || !activeGameChallenge.durationMinutes) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleGameEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeGameChallenge]);


    const handleAnswer = (optionIndex: number) => {
        if (selectedAnswer !== null || !currentQuestion) return;

        setSelectedAnswer(optionIndex);
        if (optionIndex === currentQuestion.correctAnswerIndex) {
            setAnswerState('correct');
            setScore(prev => prev + 10 * (currentLevelIndex + 1)); // More points for higher levels
        } else {
            setAnswerState('incorrect');
        }

        setTimeout(() => {
            // Move to next question or level
            if (currentQuestionIndex < totalQuestionsInLevel - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else { // End of level
                if (currentLevelIndex < totalLevels - 1) {
                    setShowLevelUp(true);
                    setTimeout(() => {
                        setShowLevelUp(false);
                        setCurrentLevelIndex(prev => prev + 1);
                        setCurrentQuestionIndex(0);
                    }, 2000);
                } else {
                    handleGameEnd();
                }
            }
            setSelectedAnswer(null);
            setAnswerState('unanswered');
        }, 1500);
    };

    if (!activeGameChallenge || !currentQuestion) {
        return <Card><p>Loading challenge...</p></Card>;
    }
    
    const timeDisplay = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    return (
        <div className="max-w-4xl mx-auto">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                .fade-out { animation: fadeOut 0.5s ease-in forwards; }
            `}</style>
            
            <Card className="relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{activeGameChallenge.title}</h2>
                        <p className="text-slate-500">Level {currentLevelIndex + 1} / {totalLevels}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div>
                            <p className="text-sm text-slate-500">SCORE</p>
                            <p className="text-2xl font-bold text-green-600">{score}</p>
                        </div>
                        {activeGameChallenge.mode === 'Time Attack' && (
                             <div>
                                <p className="text-sm text-slate-500">TIME LEFT</p>
                                <p className="text-2xl font-bold text-red-600">{timeDisplay}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 my-4">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / totalQuestionsInLevel) * 100}%`, transition: 'width 0.5s' }}></div>
                </div>

                {/* Question Area */}
                <div className="mt-6 fade-in">
                    <p className="text-xl font-semibold text-slate-800 mb-4 text-center">
                        {currentQuestionIndex + 1}. {currentQuestion.questionText}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = 'bg-slate-100 hover:bg-slate-100';
                            if (selectedAnswer !== null) {
                                if (index === currentQuestion.correctAnswerIndex) {
                                    buttonClass = 'bg-green-500/80 text-white';
                                } else if (index === selectedAnswer) {
                                    buttonClass = 'bg-red-500/80 text-white';
                                } else {
                                     buttonClass = 'bg-slate-100 opacity-50';
                                }
                            }
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 transform ${selectedAnswer === null ? 'hover:scale-105' : ''} ${buttonClass}`}
                                >
                                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {showLevelUp && (
                     <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center fade-in">
                        <h2 className="text-4xl font-bold text-green-600">Level {currentLevelIndex + 1} Complete!</h2>
                        <p className="text-xl text-slate-600 mt-2">Next level coming up...</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GamePlayer;
