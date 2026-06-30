import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { format } from 'date-fns';

interface ScheduledClass {
  id: string;
  title: string;
  roomName: string;
  date: string;
  duration: number;
  host: string;
  participants: number;
  status: 'upcoming' | 'live' | 'ended';
}

const generateRoomName = (name: string) => {
  const safe = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const rand = Math.random().toString(36).substring(2, 7);
  return `system4learn-${safe}-${rand}`;
};

const VideoConferenceView: React.FC = () => {
  const { currentUser, currentRole, filteredClasses } = useAppContext();
  const isTeacher = currentRole === UserRole.Teacher;
  const isAdmin = currentRole === UserRole.ClassAdmin || currentRole === UserRole.BranchAdmin;

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomInput, setRoomInput] = useState('');
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [showScheduler, setShowScheduler] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const storedKey = `videoClasses_${currentUser?.id || 'anon'}`;
  const [scheduled, setScheduled] = useState<ScheduledClass[]>(() => {
    try { return JSON.parse(localStorage.getItem(storedKey) || '[]'); } catch { return []; }
  });

  const [newClass, setNewClass] = useState({ title: '', date: new Date().toISOString().slice(0, 16), duration: 60 });

  useEffect(() => {
    localStorage.setItem(storedKey, JSON.stringify(scheduled));
  }, [scheduled, storedKey]);

  const jitsiUrl = activeRoom
    ? `https://meet.jit.si/${activeRoom}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false`
    : null;

  const joinLink = activeRoom ? `https://meet.jit.si/${activeRoom}` : '';

  const handleStart = () => {
    const room = roomInput.trim() || generateRoomName(currentUser?.name || 'class');
    setRoomInput(room);
    setActiveRoom(room);
  };

  const handleJoin = (room: string) => {
    setRoomInput(room);
    setActiveRoom(room);
  };

  const handleEnd = () => setActiveRoom(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSchedule = () => {
    if (!newClass.title || !newClass.date) return;
    const room = generateRoomName(newClass.title);
    const entry: ScheduledClass = {
      id: `vc_${Date.now()}`,
      title: newClass.title,
      roomName: room,
      date: newClass.date,
      duration: newClass.duration,
      host: currentUser?.name || 'Teacher',
      participants: 0,
      status: 'upcoming',
    };
    setScheduled(prev => [entry, ...prev]);
    setNewClass({ title: '', date: new Date().toISOString().slice(0, 16), duration: 60 });
    setShowScheduler(false);
  };

  const handleDelete = (id: string) => setScheduled(prev => prev.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <i className="ri-video-chat-line text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Video Conferencing</h1>
            <p className="text-sm text-blue-600 flex items-center gap-1.5 mt-0.5">
              <i className="ri-sparkling-fill text-green-500" />
              Powered by Jitsi Meet — 100% Free · No account required · HD video
            </p>
          </div>
        </div>
        {(isTeacher || isAdmin) && !activeRoom && (
          <div className="flex gap-2">
            <button onClick={() => setShowScheduler(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-slate-100 text-blue-700 rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors">
              <i className="ri-calendar-schedule-line" /> Schedule Class
            </button>
            <button onClick={handleStart} className="btn-primary">
              <i className="ri-video-add-line" /> Start New Class
            </button>
          </div>
        )}
        {activeRoom && (
          <button onClick={handleEnd} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
            <i className="ri-close-circle-line" /> End / Leave Class
          </button>
        )}
      </div>

      {/* Active Meeting */}
      {activeRoom ? (
        <div className="space-y-3">
          {/* Room info bar */}
          <div className="bg-blue-600 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" /> LIVE
              </span>
              <p className="text-sm font-semibold text-white truncate">{activeRoom}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-blue-200 hidden sm:block">{joinLink}</p>
              <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'} />
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </button>
              <a href={joinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                <i className="ri-external-link-line" /> Open in New Tab
              </a>
            </div>
          </div>

          {/* Jitsi iframe */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl" style={{ height: '72vh' }}>
            <iframe
              ref={iframeRef}
              src={jitsiUrl!}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Jitsi Meeting"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Start Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="ri-play-circle-line text-blue-600" /> Quick Start
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Your Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="form-label">Room Name <span className="text-xs font-normal text-slate-400">(leave blank for auto)</span></label>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={e => setRoomInput(e.target.value)}
                    className="input-field"
                    placeholder="e.g. physics-class-10a"
                  />
                </div>
                <button onClick={handleStart} className="btn-primary w-full justify-center mt-2">
                  <i className="ri-video-add-line" />
                  {isTeacher || isAdmin ? 'Start Class Now' : 'Join Meeting'}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="text-sm font-bold text-blue-900 mb-3">✨ Free Features Included</h3>
              <ul className="space-y-2 text-xs text-blue-800">
                {[
                  'HD Video & Audio',
                  'Screen Sharing',
                  'Chat & Reactions',
                  'Virtual Backgrounds',
                  'Recording (local)',
                  'Raise Hand feature',
                  'Lobby / Waiting Room',
                  'No time limit',
                  'No signup required',
                  'Works on all devices',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scheduled Classes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <i className="ri-calendar-2-line text-blue-600" /> Scheduled Classes
                </h3>
                {(isTeacher || isAdmin) && (
                  <button onClick={() => setShowScheduler(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <i className="ri-add-circle-line" /> Schedule New
                  </button>
                )}
              </div>

              {scheduled.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <i className="ri-video-chat-line text-blue-400 text-2xl" />
                  </div>
                  <p className="font-semibold text-slate-800">No classes scheduled</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {isTeacher ? 'Schedule your first online class to get a shareable link.' : 'Your teacher has not scheduled any online classes yet.'}
                  </p>
                  {isTeacher && (
                    <button onClick={() => setShowScheduler(true)} className="btn-primary mt-4">
                      <i className="ri-calendar-schedule-line" /> Schedule First Class
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {scheduled.map(cls => (
                    <div key={cls.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <i className="ri-video-line text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{cls.title}</p>
                          <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1.5">
                            <i className="ri-calendar-line" />
                            {format(new Date(cls.date), 'dd MMM yyyy, h:mm a')}
                            <span className="text-slate-400">·</span>
                            <i className="ri-time-line" /> {cls.duration} min
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{cls.roomName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleJoin(cls.roomName)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <i className="ri-video-add-fill" />
                          {isTeacher ? 'Start' : 'Join'}
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`https://meet.jit.si/${cls.roomName}`); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Copy join link"
                        >
                          <i className="ri-share-line" />
                        </button>
                        {(isTeacher || isAdmin) && (
                          <button onClick={() => handleDelete(cls.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors p-1.5">
                            <i className="ri-delete-bin-line" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduler && (
        <div className="modal-overlay" onClick={() => setShowScheduler(false)}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Schedule Online Class</h2>
                <p className="modal-subtitle">A unique room link will be auto-generated</p>
              </div>
              <button onClick={() => setShowScheduler(false)} className="btn-icon text-slate-400 hover:text-slate-600">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Class Title *</label>
                <input
                  type="text"
                  value={newClass.title}
                  onChange={e => setNewClass(p => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Physics — Chapter 5 Review"
                />
              </div>
              <div className="modal-grid-2">
                <div>
                  <label className="form-label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newClass.date}
                    onChange={e => setNewClass(p => ({ ...p, date: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Duration (minutes)</label>
                  <select
                    value={newClass.duration}
                    onChange={e => setNewClass(p => ({ ...p, duration: Number(e.target.value) }))}
                    className="input-field"
                  >
                    {[30, 45, 60, 90, 120].map(d => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowScheduler(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleSchedule} disabled={!newClass.title} className="btn-primary disabled:opacity-50">
                <i className="ri-calendar-check-line" /> Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConferenceView;
