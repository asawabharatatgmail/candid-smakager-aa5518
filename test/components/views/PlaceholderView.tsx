import React from 'react';
import Card from '../ui/Card';

interface PlaceholderViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
  return (
    <div>
      <Card>
        <div className="text-center p-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          <p className="mt-4 text-gray-600 max-w-md mx-auto">
            This feature is currently under development. Please check back later to access the full functionality.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderView;
