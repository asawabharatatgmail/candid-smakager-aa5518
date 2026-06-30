
import React from 'react';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';
import { StudyMaterial } from '../../types';

const StudyMaterialView: React.FC = () => {
  const { studyMaterials, setActiveView, viewStudyMaterial } = useAppContext();

  const teacherMaterials = studyMaterials.filter(m => m.createdBy === 'teacher');

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Study Materials</h2>
            <p className="text-gray-600 mt-1">Manage all the study content you've created.</p>
          </div>
          <button
            onClick={() => setActiveView('content-creator')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            + Create New
          </button>
        </div>
      </Card>
      
      <Card>
        {teacherMaterials.length > 0 ? (
          <ul className="space-y-3">
            {teacherMaterials.map((material: StudyMaterial) => (
              <li key={material.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{material.title}</p>
                  <p className="text-sm text-gray-500">Topic: {material.topic}</p>
                </div>
                <div className="space-x-2">
                    <button 
                        onClick={() => viewStudyMaterial(material)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                        View
                    </button>
                     <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300">
                        Delete
                    </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No study materials</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new study material.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyMaterialView;
