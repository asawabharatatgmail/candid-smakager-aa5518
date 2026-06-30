import React, { useState, useMemo } from 'react';
import {
  INDIAN_BOARDS_MASTER, SUBJECT_CATEGORIES, COMMON_SUBJECTS,
  IndianBoard, BoardGrade, BoardSubject, BoardType,
} from '../../data/indianBoardsMaster';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, className = 'w-5 h-5' }: { path: string; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
const SearchIcon  = () => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />;
const PlusIcon    = () => <Icon path="M12 4v16m8-8H4" />;
const ChevronDown = () => <Icon path="M19 9l-7 7-7-7" className="w-4 h-4" />;
const ChevronRight = () => <Icon path="M9 5l7 7-7 7" className="w-4 h-4" />;
const TrashIcon   = () => <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4" />;
const EditIcon    = () => <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-4 h-4" />;
const BookIcon    = () => <Icon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" className="w-4 h-4" />;

// ─── Type badge colours ───────────────────────────────────────────────────────
const TYPE_BADGE: Record<BoardType, string> = {
  National:      'bg-blue-100 text-blue-800',
  State:         'bg-green-100 text-green-800',
  International: 'bg-purple-100 text-purple-800',
};

// ─── Level badge colours ──────────────────────────────────────────────────────
const LEVEL_COLOURS: Record<string, string> = {
  'Pre-Primary':       'bg-pink-100 text-pink-700',
  'Primary':           'bg-yellow-100 text-yellow-700',
  'Middle':            'bg-orange-100 text-orange-700',
  'Secondary':         'bg-blue-100 text-blue-700',
  'Senior Secondary':  'bg-indigo-100 text-indigo-700',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Add-Board Modal
// ─────────────────────────────────────────────────────────────────────────────
interface AddBoardModalProps { onSave: (b: IndianBoard) => void; onClose: () => void; }
const AddBoardModal: React.FC<AddBoardModalProps> = ({ onSave, onClose }) => {
  const [form, setForm] = useState({
    shortName: '', fullName: '', type: 'State' as BoardType, state: '', website: '', description: '',
  });
  const handleSave = () => {
    if (!form.shortName.trim() || !form.fullName.trim()) return;
    const newBoard: IndianBoard = {
      id: `custom_${Date.now()}`,
      shortName: form.shortName.trim(),
      fullName: form.fullName.trim(),
      type: form.type,
      state: form.state.trim() || undefined,
      website: form.website.trim() || undefined,
      description: form.description.trim(),
      isCustom: true,
      grades: [],
    };
    onSave(newBoard);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Add Custom Board</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Short Name *</label>
            <input className="input-field w-full" placeholder="e.g. JKBOSE" value={form.shortName} onChange={e => setForm(p => ({...p, shortName: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input className="input-field w-full" placeholder="e.g. Jammu & Kashmir Board of…" value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select className="input-field w-full" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value as BoardType}))}>
              <option>National</option><option>State</option><option>International</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">State (if State board)</label>
            <input className="input-field w-full" placeholder="e.g. Rajasthan" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Website (optional)</label>
            <input className="input-field w-full" placeholder="https://..." value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea className="input-field w-full" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Board</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Add-Grade Modal
// ─────────────────────────────────────────────────────────────────────────────
interface AddGradeModalProps { onSave: (g: BoardGrade) => void; onClose: () => void; }
const AddGradeModal: React.FC<AddGradeModalProps> = ({ onSave, onClose }) => {
  const [grade, setGrade] = useState('');
  const [level, setLevel] = useState<BoardGrade['level']>('Secondary');
  const [hasStreams, setHasStreams] = useState(false);
  const handleSave = () => {
    if (!grade.trim()) return;
    onSave({ grade: grade.trim(), level, hasStreams, subjects: [] });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Add Grade / Class</h3>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Grade / Class Name *</label>
          <input className="input-field w-full" placeholder="e.g. Class 10 or KG" value={grade} onChange={e => setGrade(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Level</label>
          <select className="input-field w-full" value={level} onChange={e => setLevel(e.target.value as BoardGrade['level'])}>
            {['Pre-Primary','Primary','Middle','Secondary','Senior Secondary'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={hasStreams} onChange={e => setHasStreams(e.target.checked)} className="rounded" />
          This grade has Science / Commerce / Arts streams
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Add Grade</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Add-Subject Modal
// ─────────────────────────────────────────────────────────────────────────────
interface AddSubjectModalProps { hasStreams: boolean; onSave: (s: BoardSubject) => void; onClose: () => void; }
const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ hasStreams, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isCompulsory, setIsCompulsory] = useState(false);
  const [streams, setStreams] = useState<string[]>([]);
  const [useQuick, setUseQuick] = useState(false);

  const toggleStream = (s: string) => setStreams(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), code: code.trim() || undefined, isCompulsory, streams: streams as any });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Add Subject</h3>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button onClick={() => setUseQuick(false)} className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${!useQuick ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Custom</button>
          <button onClick={() => setUseQuick(true)}  className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${useQuick  ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Quick Pick</button>
        </div>
        {useQuick ? (
          <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
            {COMMON_SUBJECTS.map(s => (
              <button key={s} onClick={() => { setName(s); setUseQuick(false); }}
                className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                {s}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Name *</label>
              <input className="input-field w-full" placeholder="e.g. Physics" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject Code (optional)</label>
              <input className="input-field w-full" placeholder="e.g. PH" value={code} onChange={e => setCode(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={isCompulsory} onChange={e => setIsCompulsory(e.target.checked)} className="rounded" />
              Compulsory subject
            </label>
            {hasStreams && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Available in streams (leave blank for all)</p>
                <div className="flex flex-wrap gap-2">
                  {(['Science','Commerce','Arts/Humanities','Vocational','General'] as const).map(s => (
                    <button key={s} onClick={() => toggleStream(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${streams.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-600 hover:border-indigo-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          {!useQuick && <button onClick={handleSave} className="btn-primary">Add Subject</button>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Grade Row (expandable)
// ─────────────────────────────────────────────────────────────────────────────
interface GradeRowProps {
  grade: BoardGrade;
  isCustomBoard: boolean;
  onAddSubject: () => void;
  onDeleteSubject: (idx: number) => void;
}
const GradeRow: React.FC<GradeRowProps> = ({ grade, isCustomBoard, onAddSubject, onDeleteSubject }) => {
  const [open, setOpen] = useState(false);

  const streamGroups = useMemo(() => {
    if (!grade.hasStreams) return null;
    const map: Record<string, BoardSubject[]> = { 'All Streams': [] };
    grade.subjects.forEach(s => {
      if (!s.streams || s.streams.length === 0) { map['All Streams'].push(s); }
      else {
        s.streams.forEach(st => {
          if (!map[st]) map[st] = [];
          map[st].push(s);
        });
      }
    });
    return map;
  }, [grade]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOURS[grade.level] || 'bg-slate-100 text-slate-600'}`}>{grade.level}</span>
          <span className="font-medium text-slate-800">{grade.grade}</span>
          {grade.hasStreams && <span className="text-xs text-slate-500">(Streamed)</span>}
          <span className="text-xs text-slate-400">{grade.subjects.length} subjects</span>
        </div>
        {open ? <ChevronDown /> : <ChevronRight />}
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {!grade.hasStreams ? (
            <div className="flex flex-wrap gap-2">
              {grade.subjects.map((s, idx) => (
                <div key={idx} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${s.isCompulsory ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                  {s.isCompulsory && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                  {s.name}
                  {s.code && <span className="text-slate-400 ml-1">({s.code})</span>}
                  {isCustomBoard && (
                    <button onClick={() => onDeleteSubject(idx)} className="ml-1 text-red-400 hover:text-red-600"><TrashIcon /></button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {streamGroups && Object.entries(streamGroups).map(([stream, subs]) => subs.length > 0 && (
                <div key={stream}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{stream}</p>
                  <div className="flex flex-wrap gap-2">
                    {subs.map((s, idx) => (
                      <div key={idx} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${s.isCompulsory ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                        {s.isCompulsory && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                        {s.name}
                        {s.code && <span className="text-slate-400 ml-1">({s.code})</span>}
                        {isCustomBoard && <button onClick={() => onDeleteSubject(grade.subjects.indexOf(s))} className="ml-1 text-red-400 hover:text-red-600"><TrashIcon /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onAddSubject}
            className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            <PlusIcon /> Add Subject
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Board Card
// ─────────────────────────────────────────────────────────────────────────────
interface BoardCardProps {
  board: IndianBoard;
  onAddGrade: () => void;
  onDeleteBoard: () => void;
  onAddSubjectToGrade: (gradeIdx: number, subject: BoardSubject) => void;
  onDeleteSubjectFromGrade: (gradeIdx: number, subjectIdx: number) => void;
}
const BoardCard: React.FC<BoardCardProps> = ({ board, onAddGrade, onDeleteBoard, onAddSubjectToGrade, onDeleteSubjectFromGrade }) => {
  const [open, setOpen] = useState(false);
  const [addingSubjectGradeIdx, setAddingSubjectGradeIdx] = useState<number | null>(null);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 cursor-pointer ${open ? 'bg-indigo-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50'}`}
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <BookIcon />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">{board.shortName}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[board.type]}`}>{board.type}</span>
              {board.state && <span className="text-xs text-slate-500">{board.state}</span>}
              {board.isCustom && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Custom</span>}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{board.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className="text-xs text-slate-400 hidden sm:block">{board.grades.length} grades</span>
          {board.isCustom && (
            <button onClick={e => { e.stopPropagation(); onDeleteBoard(); }}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <TrashIcon />
            </button>
          )}
          <span className="text-slate-400">{open ? <ChevronDown /> : <ChevronRight />}</span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="p-5 space-y-4 bg-white">
          {board.description && (
            <p className="text-sm text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl">{board.description}</p>
          )}
          {board.website && (
            <a href={board.website} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
              🌐 {board.website}
            </a>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" /> Compulsory</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white border border-slate-300 inline-block" /> Optional</span>
          </div>

          {/* Grades */}
          <div className="space-y-2">
            {board.grades.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-4">No grades added yet. Add one below.</p>
            )}
            {board.grades.map((grade, gi) => (
              <GradeRow
                key={gi}
                grade={grade}
                isCustomBoard={true}
                onAddSubject={() => setAddingSubjectGradeIdx(gi)}
                onDeleteSubject={(si) => onDeleteSubjectFromGrade(gi, si)}
              />
            ))}
          </div>

          <button onClick={onAddGrade}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
            <PlusIcon /> Add Grade / Class
          </button>
        </div>
      )}

      {addingSubjectGradeIdx !== null && (
        <AddSubjectModal
          hasStreams={board.grades[addingSubjectGradeIdx]?.hasStreams ?? false}
          onSave={s => onAddSubjectToGrade(addingSubjectGradeIdx!, s)}
          onClose={() => setAddingSubjectGradeIdx(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main View
// ─────────────────────────────────────────────────────────────────────────────
const BoardsMasterView: React.FC = () => {
  const [boards, setBoards] = useState<IndianBoard[]>(INDIAN_BOARDS_MASTER);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | BoardType>('All');
  const [filterState, setFilterState] = useState('All');
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [addGradeBoardId, setAddGradeBoardId] = useState<string | null>(null);

  // Derived
  const states = useMemo(() => {
    const s = new Set<string>();
    boards.forEach(b => { if (b.state) s.add(b.state); });
    return ['All', ...Array.from(s).sort()];
  }, [boards]);

  const filtered = useMemo(() => boards.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.shortName.toLowerCase().includes(q) || b.fullName.toLowerCase().includes(q) || (b.state?.toLowerCase().includes(q) ?? false);
    const matchType  = filterType === 'All' || b.type === filterType;
    const matchState = filterState === 'All' || b.state === filterState;
    return matchSearch && matchType && matchState;
  }), [boards, search, filterType, filterState]);

  // Counts
  const counts = useMemo(() => ({
    total: boards.length,
    national: boards.filter(b => b.type === 'National').length,
    state: boards.filter(b => b.type === 'State').length,
    international: boards.filter(b => b.type === 'International').length,
    custom: boards.filter(b => b.isCustom).length,
  }), [boards]);

  // Mutations
  const addBoard = (b: IndianBoard) => setBoards(prev => [...prev, b]);
  const deleteBoard = (id: string) => setBoards(prev => prev.filter(b => b.id !== id));
  const addGrade = (boardId: string, grade: BoardGrade) =>
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, grades: [...b.grades, grade] } : b));
  const addSubjectToGrade = (boardId: string, gradeIdx: number, subject: BoardSubject) =>
    setBoards(prev => prev.map(b => {
      if (b.id !== boardId) return b;
      const grades = [...b.grades];
      grades[gradeIdx] = { ...grades[gradeIdx], subjects: [...grades[gradeIdx].subjects, subject] };
      return { ...b, grades };
    }));
  const deleteSubjectFromGrade = (boardId: string, gradeIdx: number, subjectIdx: number) =>
    setBoards(prev => prev.map(b => {
      if (b.id !== boardId) return b;
      const grades = [...b.grades];
      const subjects = grades[gradeIdx].subjects.filter((_, i) => i !== subjectIdx);
      grades[gradeIdx] = { ...grades[gradeIdx], subjects };
      return { ...b, grades };
    }));

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Boards', value: counts.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'National',     value: counts.national, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'State',        value: counts.state, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'International',value: counts.international, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Custom Added', value: counts.custom, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-200 rounded-xl px-4 py-3 text-center`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
          <input
            className="input-field pl-10 w-full"
            placeholder="Search boards by name, state…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All','National','State','International'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filterType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400'}`}>
              {t}
            </button>
          ))}
          <select className="input-field text-xs py-1.5 px-3" value={filterState} onChange={e => setFilterState(e.target.value)}>
            {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
          </select>
        </div>
        <button onClick={() => setShowAddBoard(true)}
          className="btn-primary flex items-center gap-2 flex-shrink-0">
          <PlusIcon /> Add Board
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {boards.length} boards
      </p>

      {/* Board list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">No boards found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a custom board.</p>
          </div>
        )}
        {filtered.map(board => (
          <BoardCard
            key={board.id}
            board={board}
            onAddGrade={() => setAddGradeBoardId(board.id)}
            onDeleteBoard={() => deleteBoard(board.id)}
            onAddSubjectToGrade={(gi, s) => addSubjectToGrade(board.id, gi, s)}
            onDeleteSubjectFromGrade={(gi, si) => deleteSubjectFromGrade(board.id, gi, si)}
          />
        ))}
      </div>

      {/* Modals */}
      {showAddBoard && <AddBoardModal onSave={addBoard} onClose={() => setShowAddBoard(false)} />}
      {addGradeBoardId && (
        <AddGradeModal
          onSave={g => addGrade(addGradeBoardId, g)}
          onClose={() => setAddGradeBoardId(null)}
        />
      )}
    </div>
  );
};

export default BoardsMasterView;
