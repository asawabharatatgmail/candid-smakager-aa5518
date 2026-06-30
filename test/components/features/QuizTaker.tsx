﻿import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const QuizTaker: React.FC = () => {
    const { activeQuiz, submitQuiz } = useAppContext();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);

    useEffect(() => {
        if (activeQuiz) {
            setAnswers(new Array(activeQuiz.questions.length).fill(-1));
        }
    }, [activeQuiz]);

    if (!activeQuiz) {
        return (
            <Card>
                <p>Error: No active quiz selected.</p>
            </Card>
        );
    }
    
    const handleSelectOption = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < activeQuiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    
    const handleSubmit = () => {
        let score = 0;
        activeQuiz.questions.forEach((q, index) => {
            if (q.correctAnswerIndex === answers[index]) {
                score++;
            }
        });
        
        submitQuiz({
            quiz: activeQuiz,
            answers: answers,
            score: score
        });
    };

    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestionIndex];

    return (
        <Card>
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{activeQuiz.quizTitle}</h2>
                <p className="text-slate-600 mt-1">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</p>
            </div>
            
            <div className="p-4 border border-slate-200 rounded-lg bg-white/40">
                <p className="font-semibold text-lg text-slate-800 mb-4">{currentQuestion.questionText}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectOption(index)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                selectedAnswer === index 
                                ? 'bg-indigo-500/30 border-indigo-500 text-indigo-700'
                                : 'bg-slate-100 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={answers.includes(-1)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswer === -1}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                )}
            </div>
             {currentQuestionIndex === activeQuiz.questions.length - 1 && answers.includes(-1) &&
                <p className="text-center text-sm text-red-600 mt-2">Please answer all questions before submitting.</p>
             }
        </Card>
    );
};

export default QuizTaker;