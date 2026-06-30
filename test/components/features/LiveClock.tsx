﻿import React, { useState, useEffect } from 'react';

const LiveClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata' };

    const date = currentTime.toLocaleDateString('en-IN', {
        ...options,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const day = currentTime.toLocaleDateString('en-IN', {
        ...options,
        weekday: 'long',
    });

    const time = currentTime.toLocaleTimeString('en-IN', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return (
        <div className="hidden lg:flex items-center space-x-4 text-slate-600 pr-4 border-r border-slate-200 mr-4">
             <i className="ri-time-line text-xl text-indigo-400"></i>
            <div className="text-right">
                <p className="font-semibold text-sm">{time.toUpperCase()}</p>
                <p className="text-xs text-slate-500">{day}, {date}</p>
            </div>
        </div>
    );
};

export default LiveClock;
