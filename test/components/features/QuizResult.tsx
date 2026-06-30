﻿
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';

const QuizResult: React.FC = () => {
    const { submission, clearSubmission } = useAppContext();

    if (!submission) {
        return <Card><p>No submission found.</p></Card>;
    }
    
    const { quiz, answers, score } = submission;
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const getOptionClass = (qIndex: number, oIndex: number): string => {
        const isCorrect = oIndex === quiz.questions[qIndex].correctAnswerIndex;
        const isSelected = oIndex === answers[qIndex];

        if (isCorrect) return 'bg-green-500/20 border border-green-500/30 text-green-700';
        if (isSelected && !isCorrect) return 'bg-red-500/20 border border-red-500/30 text-red-700';
        return 'bg-slate-100';
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Quiz Complete!</h2>
                    <p className="text-slate-600 mt-2">You have completed the quiz: <span className="font-semibold">{quiz.quizTitle}</span></p>
                    <div className="mt-4 bg-indigo-500/10 p-6 rounded-xl inline-block">
                        <p className="text-lg text-indigo-700">Your Score</p>
                        <p className="text-5xl font-extrabold text-indigo-400 my-2">{score} / {totalQuestions}</p>
                        <p className="text-xl font-semibold text-indigo-700">{percentage}%</p>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Review Your Answers</h3>
                <div className="space-y-6">
                    {quiz.questions.map((mcq, qIndex) => (
                        <div key={qIndex} className="p-4 border border-slate-200 rounded-lg">
                            <p className="font-semibold text-slate-800">{qIndex + 1}. {mcq.questionText}</p>
                            <div className="mt-3 space-y-2">
                                {mcq.options.map((option, oIndex) => (
                                    <div
                                        key={oIndex}
                                        className={`p-2 rounded-md ${getOptionClass(qIndex, oIndex)}`}
                                    >
                                        <span className="font-medium">
                                            {String.fromCharCode(65 + oIndex)}. {option}
                                            {oIndex === quiz.questions[qIndex].correctAnswerIndex && ' (Correct Answer)'}
                                            {oIndex === answers[qIndex] && oIndex !== quiz.questions[qIndex].correctAnswerIndex && ' (Your Answer)'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="text-center">
                <button
                    onClick={clearSubmission}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default QuizResult;
