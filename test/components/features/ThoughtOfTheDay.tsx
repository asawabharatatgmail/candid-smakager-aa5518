


import React, { useState, useEffect } from 'react';
import { generateQuote } from '../../services/apiClient';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const ThoughtOfTheDay: React.FC = () => {
    const { currentSubscription } = useAppContext();
    const [quote, setQuote] = useState<string>('Loading thought of the day...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoading(true);

            if (!currentSubscription.isAiEnabled) {
                setQuote("AI features are currently disabled by the administrator.");
                setIsLoading(false);
                return;
            }

            try {
                const newQuote = await generateQuote();
                setQuote(newQuote);
            } catch (error) {
                console.error(error);
                setQuote("The journey of a thousand miles begins with a single step. - Lao Tzu");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuote();
    }, [currentSubscription.isAiEnabled]);

    return (
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-slate-900 shadow-lg shadow-indigo-500/20">
            <h3 className="font-bold text-lg mb-2">Thought of the Day</h3>
            {isLoading ? (
                 <div className="h-12 bg-white/20 animate-pulse rounded-md"></div>
            ) : (
                <blockquote className="text-lg italic">
                    <p>"{quote.split(' - ')[0]}"</p>
                    <footer className="text-right not-italic font-semibold mt-2 opacity-80">- {quote.split(' - ')[1] || 'Unknown'}</footer>
                </blockquote>
            )}
        </Card>
    );
};

export default ThoughtOfTheDay;