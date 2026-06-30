﻿
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Note } from '../../types';
import Card from '../ui/Card';
import { formatDistanceToNow } from 'date-fns';

const MyNotesView: React.FC = () => {
  const { currentUser, notes, startNewNote, editNote, deleteNote } = useAppContext();

  const myNotes = notes
    .filter(n => n.studentId === currentUser?.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleDelete = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the note "${noteTitle}"?`)) {
      deleteNote(noteId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">My Notes</h2>
            <p className="text-slate-600 mt-1">Create, edit, and manage your personal notes and study guides.</p>
          </div>
          <button
            onClick={startNewNote}
            className="px-4 py-2 w-full sm:w-auto bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Create New Note
          </button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myNotes.length > 0 ? (
          myNotes.map((note: Note) => (
            <Card key={note.id} className="flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-slate-900 truncate">{note.title}</h3>
                <p className="text-sm text-slate-500 mt-2 h-20 overflow-hidden text-ellipsis">
                  {note.content.substring(0, 150) || "This note is empty."}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                      Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                    <div className="space-x-2">
                        <button 
                            onClick={() => editNote(note)}
                            className="px-3 py-1 bg-slate-200/50 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-200"
                        >
                            Edit
                        </button>
                         <button 
                            onClick={() => handleDelete(note.id, note.title)}
                            className="px-3 py-1 bg-red-500/20 text-red-700 rounded-md text-xs font-semibold hover:bg-red-500/40"
                         >
                            Delete
                        </button>
                    </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354A1.76 1.76 0 016.583 9.42l5.518-2.09a1.76 1.76 0 012.228 1.054l2.147 6.354a1.76 1.76 0 01-3.417-.592V5.882z" /></svg>
                <h3 className="mt-2 text-lg font-medium text-slate-800">No notes yet</h3>
                <p className="mt-1 text-sm text-slate-500">Click "Create New Note" to get started.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyNotesView;
