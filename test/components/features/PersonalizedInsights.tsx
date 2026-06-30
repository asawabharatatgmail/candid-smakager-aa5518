

import React, { useState, useEffect } from 'react';
import { generatePersonalizedInsight } from '../../services/apiClient';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 8A6 6 0 0 0 6 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
);


interface PersonalizedInsightsProps {
  role: UserRole;
}

const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({ role }) => {
    const { currentSubscription } = useAppContext();
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoading(true);
            if (!currentSubscription.isAiEnabled) {
                setInsight("AI features are disabled based on the current subscription.");
                setIsLoading(false);
                return;
            }

            try {
                const newInsight = await generatePersonalizedInsight(role);
                setInsight(newInsight);
            } catch (error) {
                console.error(error);
                setInsight("Could not load AI insight. Please check your connection or API key.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsight();
    }, [role, currentSubscription.isAiEnabled]);

    return (
        <Card className="bg-amber-50 border-amber-100">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LightbulbIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-amber-800">AI-Powered Insight</h3>
                    {isLoading ? (
                        <div className="mt-2 space-y-2">
                            <div className="h-3 bg-amber-200 rounded animate-pulse w-full" />
                            <div className="h-3 bg-amber-200 rounded animate-pulse w-3/4" />
                        </div>
                    ) : (
                        <p className="text-sm text-amber-700 mt-1 leading-relaxed">{insight}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default PersonalizedInsights;